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
