import { describe as group, expect, it } from 'vitest';
import { calculate } from '../src/cities/calc';
import { CITY_STATE, describe, listedSentence, notes, ruleSentence, summary } from '../src/cities/describe';
import { exampleState, type CitiesState } from '../src/cities/model';

const state = (changes: Partial<CitiesState> = {}): CitiesState => ({ ...exampleState(), ...changes });
const told = (s: CitiesState): string => describe(s, calculate(s));

group('Copy description', () => {
  it('the example, word for word', () => {
    expect(told(state())).toBe(
      "Teland's ten largest cities: Selunna 2,416,337, Tavelin 1,208,169, Korrasu 805,446, Mirevad 604,084, Ostaril 483,267, Venmarra 402,723, Lukeholm 345,191, Tessavin 302,042, Avandra 268,482, Delmaris 241,634. The capital is Selunna.",
    );
  });

  it('opens as the brief asks', () => {
    expect(told(state())).toMatch(/^Teland's ten largest cities: Selunna 2,416,337, /);
  });

  it('without a nation', () => {
    expect(told(state({ nation: '', count: 2 }))).toBe('The two largest cities: Selunna 2,416,337, Tavelin 1,208,169. The capital is Selunna.');
  });

  it('one city', () => {
    expect(told(state({ count: 1 }))).toBe("Teland's largest city: Selunna 2,416,337. The capital is Selunna.");
  });

  it('more than twenty cities are counted in figures', () => {
    expect(told(state({ count: 32, largestShare: 15 }))).toMatch(/^Teland's 32 largest cities: /);
  });

  it('unnamed cities go by their rank, and the capital can be any of them', () => {
    expect(told(state({ names: ['Selunna'], count: 3, capital: 3 }))).toBe(
      "Teland's three largest cities: Selunna 2,416,337, City 2 1,208,169, City 3 805,446. The capital is City 3.",
    );
  });
});

group('the summary', () => {
  it('the example, word for word', () => {
    const s = state();
    expect(summary(s, calculate(s))).toBe(
      "Of Teland's 18,361,225 people, 47% (8,629,776) live in towns and cities. The largest city, Selunna, has 2,416,337 people, 28% of the urban population. The ten largest cities hold 82% of the urban population. The capital is Selunna.",
    );
  });

  it('gives the capital its population when it is not the largest city', () => {
    const s = state({ capital: 3 });
    expect(summary(s, calculate(s))).toMatch(/The capital is Korrasu, with 805,446 people\.$/);
  });

  it('fits the profile, even with fifty long names', () => {
    const s = state({ count: 50, names: Array.from({ length: 50 }, (_, i) => `${'Long'.repeat(19)}${i}`), nation: 'N'.repeat(80) });
    expect(summary(s, calculate(s)).length).toBeLessThanOrEqual(600);
  });
});

group('sentences beside the table', () => {
  it('how much the listed cities hold', () => {
    expect(listedSentence(calculate(state()))).toBe('The ten largest cities hold 82% of the urban population.');
    expect(listedSentence(calculate(state({ count: 1 })))).toBe('The largest city holds 28% of the urban population.');
    expect(listedSentence(calculate(state({ count: 25 })))).toMatch(/^The 25 largest cities hold 107% /);
  });

  it('never says 100% of an overfull list', () => {
    // 34.2% x (1 + 1/2 + … + 1/10) = 100.2%
    const result = calculate(state({ largestShare: 34.2 }));
    expect(result.overfull).toBe(true);
    expect(listedSentence(result)).toBe('The ten largest cities hold 100.2% of the urban population.');
  });

  it('the rule in force', () => {
    expect(ruleSentence(state())).toBe('The largest city holds 28% of the urban population; the second is half its size, the third a third, and so on (the rank-size rule).');
    expect(ruleSentence(state({ exponent: 1.07, largestShare: 33.5 }))).toBe('The largest city holds 33.5% of the urban population; city n is the largest divided by n to the power 1.07 (the rank-size rule).');
    expect(ruleSentence(state({ exponent: 0 }))).toMatch(/all the same size/);
  });
});

group('notes', () => {
  const found = (s: CitiesState) => notes(s, calculate(s));

  it('the easter egg: an urbanisation of 100%', () => {
    expect(CITY_STATE).toBe('A city-state. Ambitious.');
    const all = found(state({ urbanisation: 100 }));
    expect(all[0]).toEqual({ id: 'city-state', kind: 'aside', text: 'A city-state. Ambitious.' });
    expect(found(state({ urbanisation: 99.99 })).some((note) => note.id === 'city-state')).toBe(false);
  });

  it('where the other town dwellers live', () => {
    expect(found(state())).toEqual([{ id: 'rest', kind: 'fact', text: 'The other 1,552,401 town dwellers live in smaller cities and towns.' }]);
  });

  it('an overfull list is a problem, said plainly, with a way out', () => {
    const all = found(state({ largestShare: 40 }));
    expect(all).toHaveLength(1);
    expect(all[0]?.kind).toBe('problem');
    expect(all[0]?.text).toBe(
      "These cities would hold 117% of the urban population, more people than live in towns at all. List six cities or fewer, lower the largest city's share, or raise the rank-size number.",
    );
  });

  it('nothing to size', () => {
    expect(found(state({ population: 0 }))).toEqual([{ id: 'no-people', kind: 'problem', text: 'Enter a total population to size the cities.' }]);
    expect(found(state({ urbanisation: 0 }))[0]?.id).toBe('no-towns');
  });

  it('a full city-state has only the aside', () => {
    expect(found(state({ urbanisation: 100, largestShare: 100, count: 1 })).map((note) => note.id)).toEqual(['city-state']);
  });

  it('no jokes in problems', () => {
    for (const s of [state({ population: 0 }), state({ urbanisation: 0 }), state({ largestShare: 40 })]) {
      for (const note of found(s)) if (note.kind === 'problem') expect(note.text).not.toMatch(/Ambitious/);
    }
  });
});
