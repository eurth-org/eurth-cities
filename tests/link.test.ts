import { describe, expect, it } from 'vitest';
import { fromLink, fromQuery, LINK_VERSION, MAX_QUERY_LENGTH, SITE, toLink, toQuery } from '../src/cities/link';
import { exampleState, type CitiesState } from '../src/cities/model';

const state = (changes: Partial<CitiesState> = {}): CitiesState => ({ ...exampleState(), ...changes });

describe('writing a link', () => {
  it('the example, in full', () => {
    expect(toQuery(state())).toBe(
      'v=1&pop=18361225&urban=47&top=28&exp=1&n=10&cap=1&nation=Teland&names=Selunna~Tavelin~Korrasu~Mirevad~Ostaril~Venmarra~Lukeholm~Tessavin~Avandra~Delmaris',
    );
    expect(toLink(state())).toBe(`${SITE}?${toQuery(state())}`);
  });

  it('always carries the version and every number', () => {
    const query = toQuery(state({ nation: '', names: [] }));
    expect(query).toBe(`v=${LINK_VERSION}&pop=18361225&urban=47&top=28&exp=1&n=10&cap=1`);
  });

  it('writes decimals plainly', () => {
    expect(toQuery(state({ urbanisation: 47.5, largestShare: 33.33, exponent: 1.07, nation: '', names: [] }))).toBe('v=1&pop=18361225&urban=47.5&top=33.33&exp=1.07&n=10&cap=1');
  });

  it('carries only the listed names, without empty places at the end', () => {
    expect(toQuery(state({ count: 3, nation: '' }))).toContain('names=Selunna~Tavelin~Korrasu');
    expect(toQuery(state({ count: 3, nation: '' }))).not.toContain('Mirevad');
    expect(toQuery(state({ names: ['A', '', 'C', '', ''], nation: '' }))).toMatch(/names=A~~C$/);
  });

  it('can leave the names out', () => {
    expect(toQuery(state(), { names: false })).toBe('v=1&pop=18361225&urban=47&top=28&exp=1&n=10&cap=1&nation=Teland');
  });

  it('is plain ASCII that survives being pasted anywhere, as the profile asks of a link', () => {
    const awkward = state({
      nation: "Côte d'Orioni & Sons (1)",
      names: ["N'Djamena", 'Санкт-Петербург', '東京', 'A~B', 'x=y&z', 'São Tomé + Príncipe', 'What?', '#1', '50%', 'a/b', 'Wow!', '*'],
      count: 12,
    });
    const link = toLink(awkward);
    expect(link).toMatch(/^https:\/\/[!-~]+$/);
    expect(link.split('?')[1]).toMatch(/^[A-Za-z0-9\-_.%=&~]+$/);
    expect(fromLink(link)).toEqual(awkward);
  });

  it('takes another base, for previews', () => {
    expect(toLink(state({ nation: '', names: [] }), { base: 'http://localhost:8787/?old=1#x' })).toBe('http://localhost:8787/?v=1&pop=18361225&urban=47&top=28&exp=1&n=10&cap=1');
  });
});

describe('reading a link', () => {
  it('brings back exactly what was written', () => {
    const cases: CitiesState[] = [
      state(),
      state({ nation: '', names: [] }),
      state({ capital: 4, count: 7, names: exampleState().names.slice(0, 7), largestShare: 15, exponent: 0.8, urbanisation: 82.5, population: 1_250_000 }),
      state({ names: ['', '', 'Third'], nation: 'Nowhere-on-Sea' }),
      state({ population: 0, urbanisation: 0, count: 1 }),
      state({ population: 1_000_000_000_000, urbanisation: 100, largestShare: 100, exponent: 3, count: 50, capital: 50 }),
    ];
    // Only the listed cities travel: names beyond the list stay behind.
    for (const made of cases) expect(fromQuery(toQuery(made))).toEqual({ ...made, names: made.names.slice(0, made.count) });
  });

  it('leaves names beyond the list behind', () => {
    expect(fromQuery(toQuery(state({ count: 2 })))?.names).toEqual(['Selunna', 'Tavelin']);
  });

  it('reads with or without the question mark', () => {
    expect(fromQuery(`?${toQuery(state())}`)).toEqual(state());
    expect(fromQuery(toQuery(state()))).toEqual(state());
  });

  it('nothing of ours in the query: null, so the page opens with its example', () => {
    for (const query of ['', '?', '?utm_source=forum', '?d=1.eyJ9', '?v=1', 'ref=eurth&x=1']) expect(fromQuery(query)).toBeNull();
    expect(fromQuery(null)).toBeNull();
    expect(fromQuery(undefined)).toBeNull();
  });

  it('a link with only some values gets the example numbers, and no names it did not bring', () => {
    expect(fromQuery('?pop=12480000&nation=Calderwyn')).toEqual({
      nation: 'Calderwyn',
      population: 12_480_000,
      urbanisation: 47,
      largestShare: 28,
      exponent: 1,
      count: 10,
      names: [],
      capital: 1,
    });
  });

  it('clamps what it is given', () => {
    const read = fromQuery('?pop=-4&urban=900&top=0&exp=77&n=5000&cap=99');
    expect(read).toMatchObject({ population: 0, urbanisation: 100, largestShare: 0.1, exponent: 3, count: 50, capital: 1 });
  });

  it('shrugs off nonsense', () => {
    const read = fromQuery('?pop=lots&urban=&top=NaN&exp=Infinity&n=ten&cap=x&names=%E0%A4%A~%ZZ~Fine');
    expect(read).toMatchObject({ population: 18_361_225, urbanisation: 47, largestShare: 28, exponent: 1, count: 10, capital: 1 });
    expect(read?.names).toEqual(['', '', 'Fine']);
  });

  it('never lets markup through', () => {
    const read = fromQuery('?pop=1000&nation=%3Cscript%3Ealert(1)%3C%2Fscript%3E&names=%3Cimg%20src%3Dx%3E');
    expect(read?.nation).not.toMatch(/[<>]/);
    expect(read?.names[0]).not.toMatch(/[<>]/);
  });

  it('reads plus signs as spaces, as forms write them', () => {
    expect(fromQuery('?pop=1000&nation=New+Teland&names=Port+Selunna~Old+Town')).toMatchObject({ nation: 'New Teland', names: ['Port Selunna', 'Old Town'] });
  });

  it('takes the first of a repeated key and ignores keys it does not know', () => {
    expect(fromQuery('?pop=1000&pop=2000&utm_source=forum&x')).toMatchObject({ population: 1000 });
  });

  it('reads a link from a later version as well as it can', () => {
    expect(fromQuery('?v=2&pop=1000&urban=50&shape=star')).toMatchObject({ population: 1000, urbanisation: 50 });
  });

  it('takes at most 50 names', () => {
    const names = Array.from({ length: 80 }, (_, i) => `N${i}`).join('~');
    expect(fromQuery(`?pop=1000&n=50&names=${names}`)?.names).toHaveLength(50);
  });

  it('refuses a query too long to be ours', () => {
    expect(fromQuery(`?pop=1000&names=${'a'.repeat(MAX_QUERY_LENGTH)}`)).toBeNull();
  });

  it('fromLink reads whole links and refuses what is not one', () => {
    expect(fromLink(toLink(state()))).toEqual(state());
    expect(fromLink('https://cities.eurth.org/#example-calderwyn')).toBeNull();
    expect(fromLink('not a link')).toBeNull();
    expect(fromLink(null)).toBeNull();
  });
});
