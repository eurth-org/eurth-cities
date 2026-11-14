import { describe, expect, it } from 'vitest';
import { calculate } from '../src/cities/calc';
import { fromLink } from '../src/cities/link';
import { exampleState, type CitiesState } from '../src/cities/model';
import { fromProfile, MAX_LINK_LENGTH, MAX_SUMMARY_LENGTH, toSection } from '../src/cities/profile';

const state = (changes: Partial<CitiesState> = {}): CitiesState => ({ ...exampleState(), ...changes });
const now = new Date('2026-12-13T09:30:00.000Z');

// The shape of an example profile from eurth-profile (examples/calderwyn.eurth.json), cut down.
const calderwyn = () => ({
  meta: { schema: 1, nation: 'Calderwyn', updated: '2026-11-13T21:05:44.000Z' },
  identity: { commonName: 'Calderwyn', officialName: 'Kingdom of Calderwyn', capital: 'Haldermouth' },
  names: { language: 'Calderwynian', places: ['Haldermouth', 'Wynmere', 'Tarrowby', 'Eskerholt', 'Corvane', 'Larkenfold', 'Dunmarrow'] },
  stats: { population: 12_480_000, areaKm2: 148_300 },
  cities: {
    link: 'https://cities.eurth.org/#example-calderwyn',
    summary: 'Seven in ten Calderwynians live in towns; one in five of those lives in Haldermouth.',
    updated: '2026-11-12T12:00:00.000Z',
    urbanisation: 71,
    list: [
      { name: 'Haldermouth', population: 1_840_000, capital: true },
      { name: 'Wynmere', population: 920_000 },
      { name: 'Tarrowby', population: 613_000 },
      { name: 'Eskerholt', population: 460_000 },
      { name: 'Corvane', population: 368_000 },
      { name: 'Larkenfold', population: 307_000 },
    ],
  },
});

describe('writing the "cities" section', () => {
  const section = toSection(state(), { now });

  it('the example, in full', () => {
    expect(section).toEqual({
      link: 'https://cities.eurth.org/?v=1&pop=18361225&urban=47&top=28&exp=1&n=10&cap=1&nation=Teland&names=Selunna~Tavelin~Korrasu~Mirevad~Ostaril~Venmarra~Lukeholm~Tessavin~Avandra~Delmaris',
      summary:
        "Of Teland's 18,361,225 people, 47% (8,629,776) live in towns and cities. The largest city, Selunna, has 2,416,337 people, 28% of the urban population. The ten largest cities hold 82% of the urban population. The capital is Selunna.",
      updated: '2026-12-13T09:30:00.000Z',
      population: 18_361_225,
      urbanisation: 47,
      largestShare: 28,
      exponent: 1,
      list: [
        { name: 'Selunna', population: 2_416_337, capital: true },
        { name: 'Tavelin', population: 1_208_169 },
        { name: 'Korrasu', population: 805_446 },
        { name: 'Mirevad', population: 604_084 },
        { name: 'Ostaril', population: 483_267 },
        { name: 'Venmarra', population: 402_723 },
        { name: 'Lukeholm', population: 345_191 },
        { name: 'Tessavin', population: 302_042 },
        { name: 'Avandra', population: 268_482 },
        { name: 'Delmaris', population: 241_634 },
      ],
    });
  });

  it('holds the inputs, the settings and the named cities, and the link brings it all back', () => {
    expect(fromLink(section.link)).toEqual(state());
  });

  it('marks one capital, and only when true', () => {
    const moved = toSection(state({ capital: 3 }), { now });
    expect(moved.list?.filter((city) => city.capital).map((city) => city.name)).toEqual(['Korrasu']);
    expect(moved.list?.[0]).toEqual({ name: 'Selunna', population: 2_416_337 });
  });

  it('keeps to the limits of the profile schema', () => {
    const worst = toSection(
      state({
        nation: 'Ж'.repeat(80),
        count: 50,
        largestShare: 15,
        names: Array.from({ length: 50 }, (_, i) => `${'Ж'.repeat(77)}${String(i).padStart(3, '0')}`),
      }),
      { now },
    );
    // link: https, printable ASCII, at most 4000 characters; when the names don't fit, they are left out of it.
    expect(worst.link).toMatch(/^https:\/\/[!-~]+$/);
    expect(worst.link!.length).toBeLessThanOrEqual(MAX_LINK_LENGTH);
    expect(worst.link).not.toContain('names=');
    expect(worst.summary!.length).toBeLessThanOrEqual(MAX_SUMMARY_LENGTH);
    expect(worst.updated).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,9})?Z$/);
    expect(worst.list).toHaveLength(50);
    for (const city of worst.list ?? []) {
      expect(city.name.length).toBeGreaterThanOrEqual(1);
      expect(city.name.length).toBeLessThanOrEqual(80);
      expect(Number.isInteger(city.population)).toBe(true);
      expect(city.population).toBeGreaterThanOrEqual(0);
    }
    expect(worst.urbanisation).toBeGreaterThanOrEqual(0);
    expect(worst.urbanisation).toBeLessThanOrEqual(100);
  });

  it('gives unnamed cities their placeholder, since the schema wants a name', () => {
    expect(toSection(state({ names: [], count: 2 }), { now }).list?.map((city) => city.name)).toEqual(['City 1', 'City 2']);
  });

  it('is plain JSON', () => {
    expect(JSON.parse(JSON.stringify(section))).toEqual(section);
  });
});

describe('reading a profile', () => {
  it('what Cities wrote comes back exactly', () => {
    const cases = [state(), state({ capital: 4 }), state({ names: ['Selunna', '', 'Korrasu'], count: 5, nation: 'Teland' }), state({ largestShare: 15, exponent: 0.8, count: 50, names: [] })];
    for (const made of cases) {
      const profile = { meta: { schema: 1, nation: made.nation, updated: now.toISOString() }, cities: toSection(made, { now }) };
      const read = fromProfile(JSON.parse(JSON.stringify(profile)), exampleState());
      expect(read?.hadSection).toBe(true);
      expect(read?.state).toEqual({ ...made, names: made.names.slice(0, made.count) });
    }
  });

  it('a section without settings is measured from its list (the example profile from eurth-profile)', () => {
    const read = fromProfile(calderwyn(), exampleState());
    expect(read?.hadSection).toBe(true);
    expect(read?.state).toMatchObject({
      nation: 'Calderwyn',
      population: 12_480_000,
      urbanisation: 71,
      count: 6,
      capital: 1,
      names: ['Haldermouth', 'Wynmere', 'Tarrowby', 'Eskerholt', 'Corvane', 'Larkenfold'],
    });
    expect(read?.state.largestShare).toBeCloseTo(20.77, 1);
    expect(read?.state.exponent).toBeCloseTo(1, 1);
    // …and the cities it works out are the ones the profile had, to within the rounding its author did by hand.
    const cities = calculate(read!.state).cities.map((city) => city.population);
    calderwyn().cities.list.forEach((city, i) => expect(Math.abs(cities[i]! - city.population) / city.population).toBeLessThan(0.01));
  });

  it('settings in the section win over the link, the link over measuring', () => {
    const profile = calderwyn();
    Object.assign(profile.cities, { link: 'https://cities.eurth.org/?v=1&pop=5&urban=10&top=40&exp=2&n=3&cap=2', largestShare: 33 });
    const read = fromProfile(profile, exampleState());
    expect(read?.state.largestShare).toBe(33);
    expect(read?.state.exponent).toBe(2);
    expect(read?.state.urbanisation).toBe(71);
    expect(read?.state.population).toBe(5);
    expect(read?.state.count).toBe(6);
  });

  it('finds the capital by its mark, then by its name in "identity"', () => {
    const marked = calderwyn();
    marked.cities.list[0]!.capital = false;
    marked.cities.list[2]!.capital = true;
    expect(fromProfile(marked, exampleState())?.state.capital).toBe(3);
    const named = calderwyn();
    delete named.cities.list[0]!.capital;
    named.identity.capital = 'eskerholt';
    expect(fromProfile(named, exampleState())?.state.capital).toBe(4);
    const neither = calderwyn();
    delete neither.cities.list[0]!.capital;
    neither.identity.capital = 'Elsewhere';
    expect(fromProfile(neither, exampleState())?.state.capital).toBe(1);
  });

  it('a profile with no "cities" yet: population from Stats, names from Names, the capital first', () => {
    const profile = calderwyn() as Record<string, unknown>;
    delete profile.cities;
    const read = fromProfile(profile, state({ largestShare: 40, exponent: 1.2, count: 5, urbanisation: 60 }));
    expect(read?.hadSection).toBe(false);
    expect(read?.namesFilled).toBe(5);
    expect(read?.state).toEqual({
      nation: 'Calderwyn',
      population: 12_480_000,
      urbanisation: 60,
      largestShare: 40,
      exponent: 1.2,
      count: 5,
      names: ['Haldermouth', 'Wynmere', 'Tarrowby', 'Eskerholt', 'Corvane'],
      capital: 1,
    });
  });

  it('keeps the names already given when the profile is for the same nation', () => {
    const profile = { meta: { schema: 1, nation: 'teland', updated: now.toISOString() }, names: { places: ['Wynmere', 'Tarrowby'] } };
    const read = fromProfile(profile, state({ names: ['Selunna', '', 'Korrasu'], count: 4, capital: 3 }));
    expect(read?.state.names).toEqual(['Selunna', 'Wynmere', 'Korrasu', 'Tarrowby']);
    expect(read?.state.capital).toBe(3);
    expect(read?.namesFilled).toBe(2);
    expect(read?.state.population).toBe(18_361_225);
  });

  it('a profile with only "meta" changes the nation and clears the names of the last one', () => {
    const read = fromProfile({ meta: { schema: 1, nation: 'Vantmoor', updated: now.toISOString() } }, exampleState());
    expect(read?.state).toEqual({ ...exampleState(), nation: 'Vantmoor', names: [] });
    expect(read?.namesFilled).toBe(0);
  });

  it('is not fooled by what is not a profile', () => {
    for (const value of [null, undefined, 7, 'profile', [], {}, { cities: {} }, { meta: 'x' }, { meta: [] }]) {
      expect(fromProfile(value, exampleState())).toBeNull();
    }
  });

  it('cleans and clamps whatever a file holds', () => {
    const profile = {
      meta: { schema: 1, nation: '<b>Bad</b>', updated: 'x' },
      stats: { population: 'many' },
      names: { places: 'not a list' },
      cities: {
        link: 'javascript:alert(1)',
        population: 1e99,
        urbanisation: -5,
        largestShare: 'big',
        exponent: 99,
        list: [{ name: '<script>x</script>', population: -1, capital: 'yes' }, 'city', null, { name: 7 }],
      },
    };
    const read = fromProfile(profile, exampleState());
    expect(read?.state.nation).not.toMatch(/[<>]/);
    expect(read?.state.population).toBe(1_000_000_000_000);
    expect(read?.state.urbanisation).toBe(0);
    expect(read?.state.largestShare).toBe(28);
    expect(read?.state.exponent).toBe(3);
    expect(read?.state.count).toBe(4);
    expect(read?.state.capital).toBe(1);
    expect(read?.state.names.join('')).not.toMatch(/[<>]/);
  });

  it('reads at most 50 cities', () => {
    const profile = { meta: { schema: 1, nation: 'Big', updated: now.toISOString() }, cities: { list: Array.from({ length: 200 }, (_, i) => ({ name: `Town ${i}`, population: 1000 - i })) } };
    const read = fromProfile(profile, exampleState());
    expect(read?.state.count).toBe(50);
    expect(read?.state.names).toHaveLength(50);
  });

  it('never changes the profile it reads', () => {
    const profile = calderwyn();
    const copy = JSON.parse(JSON.stringify(profile));
    fromProfile(profile, exampleState());
    expect(profile).toEqual(copy);
  });
});
