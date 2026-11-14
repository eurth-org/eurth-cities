import { describe, expect, it } from 'vitest';
import { calculate } from '../src/cities/calc';
import { LIMITS } from '../src/cities/model';
import { presetFor, SHARE_PRESETS } from '../src/cities/presets';
import { COUNTRIES, country, nearestByShare, quantile, shareSpread, shareStanding, stateFromCountry, WORLD_SOURCE } from '../src/cities/world';

describe('the World Bank snapshot', () => {
  it('says where it is from', () => {
    expect(WORLD_SOURCE.name).toMatch(/World Bank/);
    expect(WORLD_SOURCE.licence).toBe('CC BY 4.0');
    expect(WORLD_SOURCE.url).toMatch(/^https:\/\/data\.worldbank\.org\//);
    expect(WORLD_SOURCE.fetched).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('holds well over a hundred countries, each once, in order of name', () => {
    expect(COUNTRIES.length).toBeGreaterThan(120);
    expect(new Set(COUNTRIES.map((c) => c.iso3)).size).toBe(COUNTRIES.length);
    const names = COUNTRIES.map((c) => c.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')));
  });

  it('every figure is within the calculator’s limits', () => {
    for (const c of COUNTRIES) {
      expect(c.iso3).toMatch(/^[A-Z]{3}$/);
      expect(c.name.length).toBeGreaterThan(0);
      expect(Number.isInteger(c.population)).toBe(true);
      expect(c.population).toBeGreaterThan(0);
      expect(c.population).toBeLessThanOrEqual(LIMITS.population.max);
      expect(c.urbanisation).toBeGreaterThan(0);
      expect(c.urbanisation).toBeLessThanOrEqual(100);
      expect(c.largestShare).toBeGreaterThan(0);
      expect(c.largestShare).toBeLessThanOrEqual(100);
      expect(c.year).toBeGreaterThanOrEqual(2015);
    }
  });

  it('holds no regions or income groups, only countries', () => {
    for (const name of ['World', 'Arab World', 'European Union', 'High income', 'Sub-Saharan Africa']) expect(country(name)).toBeUndefined();
  });

  it('finds a country by code or name', () => {
    expect(country('PRT')?.name).toBe('Portugal');
    expect(country(' portugal ')?.iso3).toBe('PRT');
    expect(country('Atlantis')).toBeUndefined();
  });
});

describe('where the settings sit in the real world', () => {
  it('quantile', () => {
    expect(quantile([1, 2, 3, 4, 5], 0.5)).toBe(3);
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(quantile([10, 20], 0.25)).toBe(12.5);
    expect(quantile([7], 0.9)).toBe(7);
    expect(quantile([1, 2, 3], -1)).toBe(1);
    expect(quantile([1, 2, 3], 2)).toBe(3);
    expect(quantile([], 0.5)).toBeNaN();
  });

  it("Orioni's 28% is close to the world's median", () => {
    const spread = shareSpread();
    expect(spread.count).toBe(COUNTRIES.length);
    expect(Math.abs(spread.median - 28)).toBeLessThan(5);
    expect(spread.lowerQuartile).toBeLessThan(spread.median);
    expect(spread.median).toBeLessThan(spread.upperQuartile);
  });

  it('the three presets are a low, a middling and a high country', () => {
    const [primate, typical, balanced] = SHARE_PRESETS.map((preset) => shareStanding(preset.largestShare));
    expect(balanced!).toBeLessThan(0.3);
    expect(typical!).toBeGreaterThan(0.35);
    expect(typical!).toBeLessThan(0.65);
    expect(primate!).toBeGreaterThan(0.7);
  });

  it('the countries the presets name are as close to them as the blurbs say', () => {
    const within = { primate: 6, default: 1, balanced: 3 };
    const named: Record<string, string[]> = {
      primate: ['Portugal', 'Greece', 'Chile', 'Peru'],
      default: ['Colombia', 'Ecuador', 'Belarus'],
      balanced: ['South Africa', 'Kazakhstan', 'Spain'],
    };
    for (const preset of SHARE_PRESETS) {
      for (const name of named[preset.id] ?? []) {
        const found = country(name);
        expect(found, name).toBeDefined();
        expect(Math.abs(found!.largestShare - preset.largestShare), name).toBeLessThanOrEqual(within[preset.id]);
      }
    }
  });

  it('nearestByShare gives the closest countries, nearest first, skipping the smallest', () => {
    const near = nearestByShare(28, 5);
    expect(near).toHaveLength(5);
    const away = near.map((c) => Math.abs(c.largestShare - 28));
    expect(away).toEqual([...away].sort((a, b) => a - b));
    expect(near.every((c) => c.population >= 3_000_000)).toBe(true);
    expect(nearestByShare(100, 1, { minPopulation: 0 })[0]?.largestShare).toBe(100);
  });
});

describe('presets', () => {
  it('are the three the brief names', () => {
    expect(SHARE_PRESETS.map((preset) => [preset.id, preset.largestShare])).toEqual([
      ['primate', 40],
      ['default', 28],
      ['balanced', 15],
    ]);
    for (const preset of SHARE_PRESETS) {
      expect(preset.name.length).toBeGreaterThan(0);
      expect(preset.blurb).toMatch(/\.$/);
    }
  });

  it('presetFor finds the preset a share matches', () => {
    expect(presetFor(28)?.id).toBe('default');
    expect(presetFor(40)?.id).toBe('primate');
    expect(presetFor(15)?.id).toBe('balanced');
    expect(presetFor(27.9)).toBeUndefined();
  });
});

describe('starting from a real country', () => {
  it('sets the three numbers and keeps the sheet’s rule', () => {
    const portugal = country('PRT')!;
    const state = stateFromCountry(portugal);
    expect(state).toMatchObject({ nation: 'Portugal', population: portugal.population, urbanisation: portugal.urbanisation, largestShare: portugal.largestShare, exponent: 1, count: 10, names: [], capital: 1 });
    // The largest city comes out as the World Bank has it, to within the rounding of the percentages.
    const city = calculate(state).cities[0]!.population;
    expect(Math.abs(city - portugal.largestCity!) / portugal.largestCity!).toBeLessThan(0.01);
  });

  it('works for every country in the snapshot', () => {
    for (const c of COUNTRIES) {
      const result = calculate(stateFromCountry(c));
      expect(result.cities).toHaveLength(10);
      expect(result.urbanPopulation).toBeGreaterThan(0);
    }
  });
});
