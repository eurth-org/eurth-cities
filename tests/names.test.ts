import { describe, expect, it } from 'vitest';
import { exampleState, type CitiesState } from '../src/cities/model';
import { fillNames, MAX_POOL, parseNameList, uniqueNames, unnamedCount } from '../src/cities/names';

const state = (changes: Partial<CitiesState> = {}): CitiesState => ({ ...exampleState(), ...changes });

describe('a pasted list of names', () => {
  it('one to a line', () => {
    expect(parseNameList('Selunna\nTavelin\r\nKorrasu\n')).toEqual(['Selunna', 'Tavelin', 'Korrasu']);
  });

  it('or separated by commas, semicolons or tabs', () => {
    expect(parseNameList('Selunna, Tavelin; Korrasu\tMirevad')).toEqual(['Selunna', 'Tavelin', 'Korrasu', 'Mirevad']);
  });

  it('drops list marks and numbers, but not numbers that belong to a name', () => {
    expect(parseNameList('1. Selunna\n2) Tavelin\n- Korrasu\n* Mirevad\n• Ostaril\n12 Mile Creek\nDistrict 9')).toEqual([
      'Selunna',
      'Tavelin',
      'Korrasu',
      'Mirevad',
      'Ostaril',
      '12 Mile Creek',
      'District 9',
    ]);
  });

  it('drops empties and repeats, whatever their capitals', () => {
    expect(parseNameList('Selunna,, selunna ,SELUNNA,\n\nTavelin')).toEqual(['Selunna', 'Tavelin']);
  });

  it('keeps accents apart', () => {
    expect(parseNameList('Sao, São')).toEqual(['Sao', 'São']);
  });

  it('keeps at most 200 names, each clean', () => {
    expect(parseNameList(Array.from({ length: 500 }, (_, i) => `Town ${i}`).join('\n'))).toHaveLength(MAX_POOL);
    expect(parseNameList('<b>Selunna</b>')[0]).not.toMatch(/[<>]/);
    expect(parseNameList(42 as unknown as string)).toEqual([]);
  });

  it('uniqueNames takes anything', () => {
    expect(uniqueNames(['A', 7, null, ' a ', 'B', {}])).toEqual(['A', 'B']);
  });
});

describe('filling in names', () => {
  it('names the unnamed, in order', () => {
    const filled = fillNames(state({ names: ['Selunna', '', 'Korrasu'], count: 5 }), ['Wynmere', 'Tarrowby', 'Eskerholt', 'Corvane']);
    expect(filled.names).toEqual(['Selunna', 'Wynmere', 'Korrasu', 'Tarrowby', 'Eskerholt']);
  });

  it('never overwrites a name someone gave', () => {
    expect(fillNames(state(), ['Wynmere', 'Tarrowby']).names).toEqual(exampleState().names);
  });

  it('never uses a name twice', () => {
    const filled = fillNames(state({ names: ['Selunna'], count: 4 }), ['selunna', 'Wynmere', 'Wynmere', 'Tarrowby']);
    expect(filled.names).toEqual(['Selunna', 'Wynmere', 'Tarrowby']);
  });

  it('fills only the listed cities', () => {
    expect(fillNames(state({ names: [], count: 2 }), ['A', 'B', 'C', 'D']).names).toEqual(['A', 'B']);
  });

  it('runs out gracefully', () => {
    expect(fillNames(state({ names: [], count: 5 }), ['A', 'B']).names).toEqual(['A', 'B']);
    expect(fillNames(state({ names: [], count: 5 }), []).names).toEqual([]);
  });

  it('with "replace", renames every listed city and keeps the hidden ones', () => {
    const filled = fillNames(state({ count: 3 }), ['Wynmere', 'Tarrowby'], { replace: true });
    expect(filled.names.slice(0, 3)).toEqual(['Wynmere', 'Tarrowby', '']);
    expect(filled.names[3]).toBe('Mirevad');
  });

  it('changes nothing else, and not the state it was given', () => {
    const before = state({ names: [], count: 3 });
    const filled = fillNames(before, ['A', 'B', 'C']);
    expect(before.names).toEqual([]);
    expect({ ...filled, names: [] }).toEqual(before);
  });

  it('counts the unnamed', () => {
    expect(unnamedCount(state())).toBe(0);
    expect(unnamedCount(state({ names: ['Selunna', '', 'Korrasu'], count: 5 }))).toBe(3);
    expect(unnamedCount(state({ names: [], count: 50 }))).toBe(50);
  });
});
