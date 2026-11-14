import { describe, expect, it } from 'vitest';
import { GLOSSARY, GLOSSARY_UPDATED, term } from '../src/content/glossary';
import { country, shareSpread } from '../src/cities/world';

describe('the glossary', () => {
  it('has a good number of entries, each with an id of its own', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(25);
    expect(new Set(GLOSSARY.map((entry) => entry.id)).size).toBe(GLOSSARY.length);
    for (const entry of GLOSSARY) expect(entry.id).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it('is in alphabetical order', () => {
    const terms = GLOSSARY.map((entry) => entry.term);
    expect(terms).toEqual([...terms].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' })));
  });

  it('every definition is a plain sentence or three', () => {
    for (const entry of GLOSSARY) {
      expect(entry.definition, entry.id).toMatch(/^[A-Z].*\.$/s);
      expect(entry.definition, entry.id).not.toMatch(/[<>{}\[\]]|https?:/);
      expect(entry.definition.length, entry.id).toBeGreaterThan(60);
      expect(entry.definition.length, entry.id).toBeLessThan(420);
    }
  });

  it('every cross-reference leads somewhere, and never back to itself', () => {
    for (const entry of GLOSSARY) {
      for (const id of entry.see ?? []) {
        expect(term(id), `${entry.id} → ${id}`).toBeDefined();
        expect(id).not.toBe(entry.id);
      }
    }
  });

  it('covers the words the calculator itself uses', () => {
    for (const id of ['rank-size-rule', 'zipfs-law', 'primate-city', 'urbanisation', 'urban-population', 'largest-city-share', 'rank-size-exponent', 'capital', 'city-state']) {
      expect(term(id), id).toBeDefined();
    }
  });

  it('is written in British English, with typographic apostrophes', () => {
    for (const entry of GLOSSARY) {
      expect(entry.definition, entry.id).not.toMatch(/\b(urbaniz|color|center|neighbor|organiz)/i);
      expect(entry.definition, entry.id).not.toMatch(/'/);
    }
  });

  it('says when it was last updated', () => {
    expect(GLOSSARY_UPDATED).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('agrees with the data where it quotes it', () => {
    // "from about 3% (China) to 100% (Singapore), with the middle near 30%"
    expect(country('CHN')!.largestShare).toBeLessThan(5);
    expect(country('SGP')!.largestShare).toBe(100);
    expect(Math.abs(shareSpread().median - 30)).toBeLessThan(4);
  });
});

// ————— The guide and the era table —————

import { readFileSync } from 'node:fs';
import { calculate } from '../src/cities/calc';
import { example } from '../src/cities/examples';
import { exampleState } from '../src/cities/model';
import { SHARE_PRESETS } from '../src/cities/presets';
import { COUNTRIES, shareBySize, sizeBand, SIZE_BANDS } from '../src/cities/world';
import { ERAS, erasFor } from '../src/content/eras';
import { guideHeadings, guideSources, headingId, parseGuide } from '../src/content/guide';

const { meta, body } = parseGuide(readFileSync(new URL('../src/content/guide.md', import.meta.url), 'utf8'));
const text = body.slice(0, body.indexOf('\n## Sources'));

describe('the guide', () => {
  it('has a title, a description and the day it was last updated', () => {
    expect(meta.title.length).toBeGreaterThan(20);
    expect(meta.description.length).toBeGreaterThan(80);
    expect(meta.description.length).toBeLessThanOrEqual(300);
    expect(meta.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('covers what the brief asks for', () => {
    const headings = guideHeadings(body).map((heading) => heading.text);
    for (const wanted of ['The rank-size rule and Zipf’s law'.replace('’', "'"), 'Primate cities', 'Urbanisation by era', 'Urbanisation by region today', 'When real countries break the pattern', 'Sources']) {
      expect(headings, wanted).toContain(wanted);
    }
    expect(text).toMatch(/Orioni's city population calculator/);
  });

  it('headings are in sentence case, each with an address of its own', () => {
    const headings = guideHeadings(body);
    expect(new Set(headings.map((heading) => heading.id)).size).toBe(headings.length);
    for (const heading of headings) {
      expect(heading.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      // Sentence case: after the first word, only names keep a capital.
      const capitals = heading.text.split(' ').slice(1).filter((word) => /^[A-Z]/.test(word));
      expect(capitals.every((word) => ['Zipf\'s'].includes(word)), heading.text).toBe(true);
    }
    expect(headingId("The rank-size rule and Zipf's law")).toBe('the-rank-size-rule-and-zipfs-law');
  });

  it('every source is cited, and every citation has a source', () => {
    const sources = guideSources(body);
    expect(sources.length).toBeGreaterThanOrEqual(15);
    const cited = new Set([...text.matchAll(/\[(\d+)\](?!\()/g)].map((found) => Number(found[1])));
    for (let n = 1; n <= sources.length; n++) expect(cited.has(n), `source ${n} is never cited`).toBe(true);
    for (const n of cited) expect(n, `citation [${n}] has no source`).toBeLessThanOrEqual(sources.length);
  });

  it('links only to https addresses', () => {
    const links = [...body.matchAll(/\]\(([^)]+)\)/g)].map((found) => found[1] as string);
    expect(links.length).toBeGreaterThan(15);
    for (const link of links) expect(link).toMatch(/^https:\/\/[^\s]+$/);
  });

  it('is written in British English', () => {
    // "Urbanization" appears only in the titles of other people's works: the sources, and the UN's report by name.
    expect(text.replaceAll('World Urbanization Prospects', '')).not.toMatch(/\b(urbaniz|color|center|neighbor|organiz|program\b)/i);
  });

  it('quotes the sheet’s example correctly', () => {
    const result = calculate(exampleState());
    for (const figure of ['18,361,225', '8,629,776', '2,416,337', '1,208,169', '805,446', '241,634']) expect(text).toContain(figure);
    expect(Math.round(result.listedShare * 100)).toBe(82);
    expect(text).toContain('hold 82% of');
    expect(result.restPopulation).toBe(1_552_401);
    expect(result.fits).toBe(19);
    expect(text).toContain('the first nineteen cities');
    expect(Math.round(calculate({ ...exampleState(), largestShare: 40 }).listedShare * 100)).toBe(117);
    expect(text).toContain('add up to 117%');
  });

  it('quotes its worked example correctly', () => {
    const corwald = calculate(example('corwald')!.state);
    expect(corwald.urbanPopulation).toBe(207_000);
    expect(corwald.cities[0]!.population).toBe(45_540);
    expect(corwald.cities[7]!.population).toBeLessThan(6000);
  });

  it('quotes the World Bank snapshot correctly', () => {
    const share = (name: string): number => COUNTRIES.find((c) => c.name === name)!.largestShare;
    expect(text).toContain(`for ${COUNTRIES.length} countries`);
    expect(shareBySize().map((row) => row.median)).toEqual([47, 31, 23, 18]);
    for (const row of shareBySize()) expect(text.toLowerCase()).toContain(`| ${row.band.label} | ${row.median}% |`);
    const quoted: [string, number][] = [
      ['Chile', 40], ['Peru', 39], ['Greece', 38], ['Portugal', 46], ['Colombia', 28], ['Ecuador', 28], ['Belarus', 29],
      ['South Africa', 16], ['Kazakhstan', 16], ['Spain', 17], ['United States', 7], ['India', 7], ['Germany', 5],
      ['Egypt, Arab Rep.', 45], ['Thailand', 25], ['France', 21], ['United Kingdom', 17], ['Netherlands', 7],
      ['Uruguay', 55], ['Mongolia', 68], ['China', 3], ['Singapore', 100],
    ];
    for (const [name, percent] of quoted) expect(Math.round(share(name)), name).toBe(percent);
    for (const preset of SHARE_PRESETS) expect(text).toContain(`| ${preset.name} | ${preset.largestShare}% |`);
  });
});

describe('the era table', () => {
  it('is the table the guide prints', () => {
    for (const era of ERAS) {
      const range = era.from === era.to ? `${era.from}%` : `${era.from} to ${era.to}%`;
      expect(text, era.id).toContain(`| ${era.label} | ${range} |`);
    }
  });

  it('every era has a sensible range, a typical value inside it and an anchor', () => {
    expect(new Set(ERAS.map((era) => era.id)).size).toBe(ERAS.length);
    for (const era of ERAS) {
      expect(era.from).toBeLessThanOrEqual(era.to);
      expect(era.typical).toBeGreaterThanOrEqual(era.from);
      expect(era.typical).toBeLessThanOrEqual(era.to);
      expect(era.from).toBeGreaterThan(0);
      expect(era.to).toBeLessThanOrEqual(100);
      expect(era.anchor).toMatch(/\.$/);
    }
  });

  it('finds the eras an urbanisation fits', () => {
    expect(erasFor(8).map((era) => era.id)).toEqual(['ancient', 'medieval', 'early-modern']);
    expect(erasFor(47).map((era) => era.id)).toEqual(['industrialising', 'industrial', 'modern']);
    expect(erasFor(100).map((era) => era.id)).toEqual(['city-state']);
    expect(erasFor(2)).toEqual([]);
  });
});

describe('countries by size', () => {
  it('every country falls in one band', () => {
    expect(shareBySize().reduce((sum, row) => sum + row.count, 0)).toBe(COUNTRIES.length);
    expect(sizeBand(18_361_225).id).toBe('middling');
    expect(sizeBand(0).id).toBe('small');
    expect(sizeBand(5_000_000).id).toBe('middling');
    expect(sizeBand(1e12).id).toBe('giant');
    expect(SIZE_BANDS).toHaveLength(4);
  });

  it('the bigger the country, the smaller its largest city’s share', () => {
    const medians = shareBySize().map((row) => row.median);
    expect(medians).toEqual([...medians].sort((a, b) => b - a));
  });
});
