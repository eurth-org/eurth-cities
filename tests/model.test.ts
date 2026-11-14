import { describe, expect, it } from 'vitest';
import { cityLabel, clamp, cleanName, cleanNames, cleanState, EXAMPLE, exampleState, isPlaceholder, LIMITS, renameCity, roundTo, SHEET } from '../src/cities/model';

describe('the defaults', () => {
  it("are Orioni's sheet", () => {
    expect(SHEET).toEqual({ largestShare: 28, exponent: 1, count: 10 });
    expect(EXAMPLE.population).toBe(18_361_225);
    expect(EXAMPLE.urbanisation).toBe(47);
    expect(EXAMPLE.capital).toBe(1);
    expect(EXAMPLE.names).toHaveLength(10);
  });

  it('exampleState is a copy that can be changed', () => {
    const copy = exampleState();
    copy.names[0] = 'Elsewhere';
    copy.population = 1;
    expect(EXAMPLE.names[0]).toBe('Selunna');
    expect(EXAMPLE.population).toBe(18_361_225);
  });

  it('the example passes its own cleaning unchanged', () => {
    expect(cleanState(exampleState())).toEqual(exampleState());
  });
});

describe('clamp and roundTo', () => {
  it('keeps numbers within limits', () => {
    expect(clamp(5, 0, 10, 1)).toBe(5);
    expect(clamp(-5, 0, 10, 1)).toBe(0);
    expect(clamp(50, 0, 10, 1)).toBe(10);
    expect(clamp('7', 0, 10, 1)).toBe(7);
  });

  it('falls back for anything that is not a number', () => {
    for (const value of [NaN, Infinity, -Infinity, '', '  ', 'ten', null, undefined, {}, [], true]) {
      expect(clamp(value, 0, 10, 3)).toBe(3);
    }
  });

  it('rounds without binary tails', () => {
    expect(roundTo(1.005, 2)).toBe(1.01);
    expect(roundTo(47.499999, 2)).toBe(47.5);
    expect(roundTo(28, 2)).toBe(28);
    expect(roundTo(0.1 + 0.2, 2)).toBe(0.3);
  });
});

describe('names', () => {
  it('are plain text on one line', () => {
    expect(cleanName('  Port   Selunna \n')).toBe('Port Selunna');
    expect(cleanName('<b>Selunna</b>')).toBe('b Selunna /b');
    expect(cleanName('Sel\u0000un\tna')).toBe('Sel un na');
    expect(cleanName(42)).toBe('');
    expect(cleanName(null)).toBe('');
  });

  it('keep their letters, whatever the alphabet', () => {
    for (const name of ["Saint-Étienne-d'Orioni", 'Ürümqi', 'Санкт-Петербург', '東京', "N'Djamena", 'Xi’an']) {
      expect(cleanName(name)).toBe(name);
    }
  });

  it('are at most 80 characters, with no space left at the cut', () => {
    expect(cleanName('a'.repeat(200))).toHaveLength(80);
    expect(cleanName(`${'a'.repeat(79)} bcd`)).toBe('a'.repeat(79));
  });

  it('a placeholder in its own place is no name', () => {
    expect(isPlaceholder('City 4', 4)).toBe(true);
    expect(isPlaceholder('city 4', 4)).toBe(true);
    expect(isPlaceholder('City 4', 5)).toBe(false);
    expect(cleanNames(['Selunna', 'City 2', 'City 9'])).toEqual(['Selunna', '', 'City 9']);
  });

  it('lists are trimmed at the end and capped at 50', () => {
    expect(cleanNames(['A', '', 'C', '', ''])).toEqual(['A', '', 'C']);
    expect(cleanNames(Array.from({ length: 80 }, (_, i) => `N${i}`))).toHaveLength(50);
    expect(cleanNames('Selunna')).toEqual([]);
    expect(cleanNames(undefined)).toEqual([]);
  });

  it('cityLabel falls back to the placeholder', () => {
    expect(cityLabel({ names: ['Selunna', ''] }, 1)).toBe('Selunna');
    expect(cityLabel({ names: ['Selunna', ''] }, 2)).toBe('City 2');
    expect(cityLabel({ names: [] }, 7)).toBe('City 7');
  });

  it('renameCity renames one city and leaves the rest', () => {
    const renamed = renameCity(exampleState(), 3, '  New Korrasu ');
    expect(renamed.names[2]).toBe('New Korrasu');
    expect(renamed.names[0]).toBe('Selunna');
    expect(renameCity({ ...exampleState(), names: [] }, 3, 'Third').names).toEqual(['', '', 'Third']);
    expect(renameCity(exampleState(), 10, '').names).toHaveLength(9);
    expect(renameCity(exampleState(), 0, 'Nowhere')).toEqual(exampleState());
    expect(renameCity(exampleState(), 51, 'Nowhere')).toEqual(exampleState());
  });
});

describe('cleanState', () => {
  it('gives the example for nothing', () => {
    for (const value of [null, undefined, 'x', 7, [], {}]) expect(cleanState(value)).toEqual(exampleState());
  });

  it('clamps every number', () => {
    const cleaned = cleanState({ population: -5, urbanisation: 250, largestShare: 0, exponent: 99, count: 500, capital: -3 });
    expect(cleaned.population).toBe(0);
    expect(cleaned.urbanisation).toBe(100);
    expect(cleaned.largestShare).toBe(LIMITS.largestShare.min);
    expect(cleaned.exponent).toBe(3);
    expect(cleaned.count).toBe(50);
    expect(cleaned.capital).toBe(1);
  });

  it('rounds people and counts to whole numbers, settings to two decimals', () => {
    const cleaned = cleanState({ population: 1234.6, urbanisation: 47.4567, largestShare: 28.005, exponent: 1.0749, count: 9.6, capital: 2.2 });
    expect(cleaned.population).toBe(1235);
    expect(cleaned.urbanisation).toBe(47.46);
    expect(cleaned.largestShare).toBe(28.01);
    expect(cleaned.exponent).toBe(1.07);
    expect(cleaned.count).toBe(10);
    expect(cleaned.capital).toBe(2);
  });

  it('a capital outside the list goes back to the largest city', () => {
    expect(cleanState({ count: 5, capital: 8 }).capital).toBe(1);
    expect(cleanState({ count: 8, capital: 8 }).capital).toBe(8);
  });

  it('keeps names beyond the list, so shortening and lengthening it loses nothing', () => {
    expect(cleanState({ ...exampleState(), count: 3 }).names).toHaveLength(10);
  });

  it('takes an empty nation and empty names when they are given', () => {
    const cleaned = cleanState({ nation: '', names: [] });
    expect(cleaned.nation).toBe('');
    expect(cleaned.names).toEqual([]);
  });

  it('reads numbers given as text, as a link gives them', () => {
    expect(cleanState({ population: '12480000', urbanisation: '71', count: '6' })).toMatchObject({ population: 12_480_000, urbanisation: 71, count: 6 });
  });

  it('never returns the example itself', () => {
    const cleaned = cleanState({});
    cleaned.names.push('Extra');
    expect(EXAMPLE.names).toHaveLength(10);
  });
});
