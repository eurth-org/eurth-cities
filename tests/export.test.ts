import { describe, expect, it } from 'vitest';
import { calculate } from '../src/cities/calc';
import { CSV_HEADER, csvCell, csvFileName, toCsv } from '../src/cities/csv';
import { exampleState, type CitiesState } from '../src/cities/model';
import { citiesWikitable, largestCitiesTemplate, TEMPLATE_MAX, wikiSafe } from '../src/cities/wikitext';

const state = (changes: Partial<CitiesState> = {}): CitiesState => ({ ...exampleState(), ...changes });

describe('wikitext: {{Largest cities}}', () => {
  it('three cities, in full', () => {
    const s = state({ count: 3 });
    expect(largestCitiesTemplate(s, calculate(s), { link: 'https://cities.eurth.org/?v=1' })).toBe(
      [
        '{{Largest cities',
        '| name        = Largest cities of Teland',
        '| country     = Teland',
        '| stat_ref    = [https://cities.eurth.org/?v=1 Cities by Eurth], a rank-size estimate',
        '| list_by_pop = ',
        '| class       = nav',
        '| div_name    = ',
        '| div_link    = ',
        '',
        '| city_1 = Selunna | div_1 = | pop_1 = 2,416,337 | img_1 = ',
        '| city_2 = Tavelin | div_2 = | pop_2 = 1,208,169 | img_2 = ',
        '| city_3 = Korrasu | div_3 = | pop_3 = 805,446 | img_3 = ',
        '}}',
      ].join('\n'),
    );
  });

  it('lines up one- and two-figure ranks', () => {
    const s = state();
    const text = largestCitiesTemplate(s, calculate(s));
    expect(text).toContain('| city_1  = Selunna | div_1  = | pop_1  = 2,416,337 | img_1  = ');
    expect(text).toContain('| city_10 = Delmaris | div_10 = | pop_10 = 241,634 | img_10 = ');
    expect(text).toContain('| stat_ref    = Cities by Eurth, a rank-size estimate');
  });

  it('shows 20 cities at most, as the template does', () => {
    const s = state({ count: 50, largestShare: 15 });
    const text = largestCitiesTemplate(s, calculate(s));
    expect(TEMPLATE_MAX).toBe(20);
    expect(text).toContain('| city_20 = City 20 ');
    expect(text).not.toContain('city_21');
  });

  it('a name cannot break out of the template', () => {
    const s = state({ nation: 'Te}}land|x=[[y]]', names: ['Sel{{unna}}', 'Tav|elin', "''Bold''", '~~~~'], count: 4 });
    const text = largestCitiesTemplate(s, calculate(s));
    expect(text.match(/\{\{/g)).toHaveLength(1);
    expect(text.match(/\}\}/g)).toHaveLength(1);
    expect(text).toContain('| country     = Te land x= y');
    expect(text).toContain('| city_2 = Tav elin |');
    expect(text).toContain("| city_3 = 'Bold' |");
    expect(text).toContain('| city_4 = ~ |');
  });

  it('wikiSafe leaves ordinary names alone', () => {
    for (const name of ["Saint-Étienne-d'Orioni", "N'Djamena", 'São Tomé', 'Port Selunna (Old Town)', '東京']) expect(wikiSafe(name)).toBe(name);
  });
});

describe('wikitext: a plain table', () => {
  it('two cities, in full', () => {
    const s = state({ count: 2, capital: 2 });
    expect(citiesWikitable(s, calculate(s))).toBe(
      [
        '{| class="wikitable sortable" style="text-align:right"',
        '|+ Largest cities of Teland',
        '! scope="col" | Rank',
        '! scope="col" | City',
        '! scope="col" | Population',
        '! scope="col" | Share of urban population',
        '|-',
        '| 1',
        '| style="text-align:left" | [[Selunna]]',
        '| 2,416,337',
        '| 28.0%',
        '|-',
        '| 2',
        '| style="text-align:left" | [[Tavelin]] (capital)',
        '| 1,208,169',
        '| 14.0%',
        '|}',
        '<small>Source: Cities by Eurth, a rank-size estimate.</small>',
      ].join('\n'),
    );
  });

  it('holds every listed city', () => {
    const s = state({ count: 50, largestShare: 15, nation: '' });
    const text = citiesWikitable(s, calculate(s));
    expect(text.match(/^\|-$/gm)).toHaveLength(50);
    expect(text).toContain('|+ Largest cities\n');
  });
});

describe('CSV', () => {
  it('the example, in full', () => {
    const s = state({ count: 3 });
    expect(toCsv(s, calculate(s))).toBe(
      'Rank,City,Population,Share of urban population (%),Capital\r\n1,Selunna,2416337,28,yes\r\n2,Tavelin,1208169,14,\r\n3,Korrasu,805446,9.33,\r\n',
    );
  });

  it('one header and one row per city', () => {
    const s = state({ count: 50, largestShare: 15 });
    const rows = toCsv(s, calculate(s)).trimEnd().split('\r\n');
    expect(rows).toHaveLength(51);
    expect(rows[0]).toBe(CSV_HEADER.join(','));
    for (const row of rows) expect(row.split(',')).toHaveLength(5);
  });

  it('quotes what needs quoting', () => {
    expect(csvCell('Selunna')).toBe('Selunna');
    expect(csvCell('Selunna, Old Town')).toBe('"Selunna, Old Town"');
    expect(csvCell('The "Big" One')).toBe('"The ""Big"" One"');
    expect(csvCell('two\nlines')).toBe('"two\nlines"');
    expect(csvCell(2416337)).toBe('2416337');
  });

  it('defuses names a spreadsheet would run as a formula', () => {
    expect(csvCell('=SUM(A1:A9)')).toBe("'=SUM(A1:A9)");
    expect(csvCell('+1')).toBe("'+1");
    expect(csvCell('-Ville')).toBe("'-Ville");
    expect(csvCell('@home')).toBe("'@home");
    expect(csvCell('=1,2')).toBe('"\'=1,2"');
    expect(csvCell(-5)).toBe('-5');
  });

  it('names the file after the nation', () => {
    expect(csvFileName(state())).toBe('teland-cities.csv');
    expect(csvFileName(state({ nation: "Côte d'Orioni" }))).toBe('cote-d-orioni-cities.csv');
    expect(csvFileName(state({ nation: '' }))).toBe('cities.csv');
    expect(csvFileName(state({ nation: '東京' }))).toBe('cities.csv');
    expect(csvFileName(state({ nation: '../../etc/passwd' }))).toBe('etc-passwd-cities.csv');
  });
});
