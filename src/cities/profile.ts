/**
 * Cities and the Eurth profile (<nation>.eurth.json, see github.com/eurth-org/eurth-profile).
 *
 * Cities owns one section, "cities", and writes nothing else. It reads three others and never
 * changes them: "stats" for the population, "names" for place names, "identity" for the
 * capital's name.
 *
 * The section, as Cities writes it:
 *
 *   "cities": {
 *     "link": "https://cities.eurth.org/?v=1&pop=…",   brings the whole calculation back
 *     "summary": "Of Teland's 18,361,225 people, …",    one paragraph, plain text
 *     "updated": "2026-12-13T09:30:00.000Z",
 *     "population": 18361225,      the total population the cities were sized for
 *     "urbanisation": 47,          per cent
 *     "largestShare": 28,          the largest city's share of the urban population, per cent
 *     "exponent": 1,               the rank-size exponent
 *     "list": [                    the cities, largest first
 *       { "name": "Selunna", "population": 2416337, "capital": true },
 *       { "name": "Tavelin", "population": 1208169 }
 *     ]
 *   }
 *
 * Stats and Wiki read "list" (the capital's population, the largest cities). "population",
 * "largestShare" and "exponent" are proposed additions to version 1 of the profile's schema;
 * until they are in it they are still valid, since a section may carry keys the schema doesn't
 * name.
 *
 * This file is plain data in and out: picking, merging and downloading the file is done with
 * @eurth/profile once the site is built.
 */
import { calculate, fitSettings, urbanPopulation } from './calc';
import { summary } from './describe';
import { fromLink, toLink } from './link';
import { cleanName, cleanNames, cleanState, LIMITS, SHEET, type CitiesState } from './model';
import { fillNames } from './names';

export interface CityEntry {
  name: string;
  population?: number;
  capital?: boolean;
}

export interface CitiesSection {
  link?: string;
  summary?: string;
  updated?: string;
  population?: number;
  urbanisation?: number;
  largestShare?: number;
  exponent?: number;
  list?: CityEntry[];
}

/** The longest link and summary the profile accepts. */
export const MAX_LINK_LENGTH = 4000;
export const MAX_SUMMARY_LENGTH = 600;

/** The "cities" section for a state. The link leaves the names out if it would be too long with them: they are in the list anyway. */
export function toSection(state: CitiesState, { now = new Date(), base }: { now?: Date; base?: string } = {}): CitiesSection {
  const s = cleanState(state);
  const result = calculate(s);
  let link = toLink(s, { base });
  if (link.length > MAX_LINK_LENGTH) link = toLink(s, { base, names: false });
  const text = summary(s, result);
  const section: CitiesSection = {
    summary: text.length > MAX_SUMMARY_LENGTH ? `${text.slice(0, MAX_SUMMARY_LENGTH - 1).trimEnd()}…` : text,
    updated: now.toISOString(),
    population: s.population,
    urbanisation: s.urbanisation,
    largestShare: s.largestShare,
    exponent: s.exponent,
    list: result.cities.map((city) => (city.capital ? { name: city.label, population: city.population, capital: true } : { name: city.label, population: city.population })),
  };
  return link.length <= MAX_LINK_LENGTH && link.startsWith('https://') ? { link, ...section } : section;
}

const object = (value: unknown): Record<string, unknown> | null =>
  value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

const number = (value: unknown): number | undefined => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);

const sameName = (a: string, b: string): boolean => a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;

/** What a profile had for Cities, so the page can say what it loaded. */
export interface ProfileReading {
  state: CitiesState;
  /** True when the profile had a "cities" section; false when the state was put together from other sections. */
  hadSection: boolean;
  /** How many city names came from the profile's "names" section. */
  namesFilled: number;
}

/**
 * The state a profile holds for Cities. Null when the value isn't a profile at all.
 *
 * With a "cities" section: its numbers and names. Settings it doesn't give are taken from its
 * link, then measured from its list, then left as Orioni's sheet has them.
 *
 * Without one: the calculator keeps its settings, takes the population from "stats" and the
 * nation's name from "meta", and names the cities from "names" (the capital from "identity"
 * first). The current names are kept only if the profile is for the same nation.
 */
export function fromProfile(profile: unknown, current: CitiesState): ProfileReading | null {
  const root = object(profile);
  if (!root || !object(root.meta)) return null;
  const meta = object(root.meta) ?? {};
  const identity = object(root.identity) ?? {};
  const stats = object(root.stats) ?? {};
  const names = object(root.names) ?? {};
  const section = object(root.cities);

  const nation = cleanName(meta.nation) || cleanName(identity.commonName);
  const capitalName = cleanName(identity.capital);
  const places = Array.isArray(names.places) ? names.places : [];
  const statsPopulation = number(stats.population);

  if (section) {
    const linked = typeof section.link === 'string' ? fromLink(section.link) : null;
    const list = (Array.isArray(section.list) ? section.list : []).slice(0, LIMITS.count.max).map((entry) => object(entry) ?? {});
    const population = number(section.population) ?? linked?.population ?? statsPopulation ?? current.population;
    const urbanisation = number(section.urbanisation) ?? linked?.urbanisation ?? current.urbanisation;
    const fitted = fitSettings(
      list.map((entry) => number(entry.population) ?? 0),
      urbanPopulation(population, urbanisation),
    );
    const capitalAt = list.findIndex((entry) => entry.capital === true);
    const listNames = cleanNames(list.map((entry) => entry.name));
    const namedCapital = capitalName ? listNames.findIndex((name) => sameName(name, capitalName)) : -1;
    const state = cleanState(
      {
        nation,
        population,
        urbanisation,
        largestShare: number(section.largestShare) ?? linked?.largestShare ?? fitted?.largestShare ?? SHEET.largestShare,
        exponent: number(section.exponent) ?? linked?.exponent ?? fitted?.exponent ?? SHEET.exponent,
        count: list.length > 0 ? list.length : (linked?.count ?? current.count),
        names: list.length > 0 ? listNames : (linked?.names ?? []),
        capital: capitalAt >= 0 ? capitalAt + 1 : namedCapital >= 0 ? namedCapital + 1 : (linked?.capital ?? 1),
      },
      current,
    );
    return { state, hadSection: true, namesFilled: 0 };
  }

  const sameNation = nation !== '' && sameName(nation, current.nation);
  let state = cleanState(
    {
      ...current,
      nation,
      population: statsPopulation ?? current.population,
      names: sameNation ? current.names : [],
      capital: sameNation ? current.capital : 1,
    },
    current,
  );
  const before = state.names.filter(Boolean).length;
  const pool = capitalName ? [capitalName, ...places] : places;
  if (capitalName && !state.names.some((name) => sameName(name, capitalName))) {
    // The capital is the largest city unless someone has said otherwise: name city 1 after it.
    const withCapital = [...state.names];
    if (!withCapital[state.capital - 1]) {
      while (withCapital.length < state.capital) withCapital.push('');
      withCapital[state.capital - 1] = capitalName;
      state = { ...state, names: cleanNames(withCapital) };
    }
  }
  state = fillNames(state, pool);
  return { state, hadSection: false, namesFilled: state.names.filter(Boolean).length - before };
}
