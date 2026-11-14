/**
 * Names for the cities. They come from three places: typed into the table, picked in Names
 * (names.eurth.org) and carried over in the profile's "names" section, or pasted as a list.
 * Filling never overwrites a name someone gave a city, and never uses a name twice.
 */
import { cleanName, cleanNames, LIMITS, type CitiesState } from './model';

/** The most names kept from a pasted list or a profile: the profile's own limit. */
export const MAX_POOL = 200;

const sameName = (a: string, b: string): boolean => a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;

/** A list of names with the empty ones and the repeats taken out, in the order given. */
export function uniqueNames(values: readonly unknown[]): string[] {
  const names: string[] = [];
  for (const value of values) {
    const name = cleanName(value);
    if (name && !names.some((known) => sameName(known, name))) names.push(name);
    if (names.length >= MAX_POOL) break;
  }
  return names;
}

/**
 * A pasted list of names: one to a line, or separated by commas, semicolons or tabs. Leading
 * list marks and numbers ("1. Selunna", "- Tavelin", "* Korrasu") are dropped.
 */
export function parseNameList(text: string): string[] {
  if (typeof text !== 'string') return [];
  return uniqueNames(
    text
      .slice(0, 40_000)
      .split(/[\n\r,;\t]+/)
      .map((line) => line.replace(/^\s*(?:[-*•–]|\d{1,3}[.)])\s+/, '')),
  );
}

/**
 * The state with its unnamed cities named from a pool, in order, skipping names already in use.
 * With "replace", every listed city is renamed from the pool instead.
 */
export function fillNames(state: CitiesState, pool: readonly string[], { replace = false }: { replace?: boolean } = {}): CitiesState {
  const names = [...state.names];
  while (names.length < state.count) names.push('');
  if (replace) for (let i = 0; i < state.count; i++) names[i] = '';
  const available = uniqueNames(pool).filter((name) => !names.some((used) => used && sameName(used, name)));
  for (let i = 0; i < state.count && available.length > 0; i++) {
    if (!names[i]) names[i] = available.shift() ?? '';
  }
  return { ...state, names: cleanNames(names) };
}

/** How many of the listed cities still have no name. */
export function unnamedCount(state: CitiesState): number {
  let unnamed = 0;
  for (let i = 0; i < Math.min(state.count, LIMITS.count.max); i++) if (!state.names[i]) unnamed++;
  return unnamed;
}
