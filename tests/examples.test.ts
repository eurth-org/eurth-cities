import { describe, expect, it } from 'vitest';
import { calculate } from '../src/cities/calc';
import { notes } from '../src/cities/describe';
import { example, EXAMPLES } from '../src/cities/examples';
import { fromLink, toLink } from '../src/cities/link';
import { cleanState, exampleState } from '../src/cities/model';
import { toSection } from '../src/cities/profile';

describe('the example countries', () => {
  it('start with the one the calculator opens with', () => {
    expect(EXAMPLES[0]?.state).toEqual(exampleState());
    expect(new Set(EXAMPLES.map((entry) => entry.id)).size).toBe(EXAMPLES.length);
  });

  it('are clean as written: nothing is clamped or cut', () => {
    for (const entry of EXAMPLES) expect(cleanState(entry.state), entry.id).toEqual(entry.state);
  });

  it('name every listed city, each name once', () => {
    for (const entry of EXAMPLES) {
      expect(entry.state.names, entry.id).toHaveLength(entry.state.count);
      expect(new Set(entry.state.names).size, entry.id).toBe(entry.state.count);
    }
  });

  it('never hold more people in cities than live in towns', () => {
    for (const entry of EXAMPLES) {
      const result = calculate(entry.state);
      expect(result.overfull, entry.id).toBe(false);
      expect(notes(entry.state, result).some((note) => note.kind === 'problem'), entry.id).toBe(false);
    }
  });

  it('survive their own link and fit the profile', () => {
    for (const entry of EXAMPLES) {
      expect(fromLink(toLink(entry.state)), entry.id).toEqual(entry.state);
      expect(toSection(entry.state).link, entry.id).toBe(toLink(entry.state));
    }
  });

  it('show what they say they show', () => {
    const varesh = calculate(example('varesh')!.state);
    expect(varesh.cities[0]!.population / varesh.cities[1]!.population).toBeGreaterThan(2);
    const halvern = calculate(example('halvern')!.state);
    expect(halvern.cities[0]!.population / halvern.cities[1]!.population).toBeLessThan(2);
    expect(halvern.cities[0]!.capital).toBe(false);
    const corwald = calculate(example('corwald')!.state);
    expect(corwald.cities[0]!.population).toBeGreaterThan(40_000);
    expect(corwald.cities[0]!.population).toBeLessThan(50_000);
    const ysmere = calculate(example('ysmere')!.state);
    expect(ysmere.cities.find((city) => city.capital)?.rank).toBe(8);
    const lanterne = example('lanterne')!.state;
    expect(calculate(lanterne).cities[0]!.population).toBe(640_000);
    expect(notes(lanterne, calculate(lanterne)).map((note) => note.text)).toEqual(['A city-state. Ambitious.']);
  });

  it('have a title and a one-line blurb', () => {
    for (const entry of EXAMPLES) {
      expect(entry.title).toContain(entry.state.nation);
      expect(entry.blurb).toMatch(/^[A-Z].*\.$/);
    }
    expect(example('nowhere')).toBeUndefined();
  });
});
