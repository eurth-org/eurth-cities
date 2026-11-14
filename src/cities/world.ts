/**
 * Real countries, to set beside the calculator's numbers: each one's population, urbanisation
 * and the share of its urban population that lives in its largest city. A snapshot of the World
 * Bank's World Development Indicators (CC BY 4.0), refreshed with "npm run data"; see
 * src/data/worldbank.json for the source and its date.
 *
 * A caution the guide repeats: every country counts "urban" its own way, and the largest city
 * here is its whole urban agglomeration, so these are for comparison, not for the last digit.
 */
import data from '../data/worldbank.json';
import { cleanState, SHEET, type CitiesState } from './model';

export interface Country {
  iso3: string;
  /** The World Bank's name for it ("Korea, Rep."). */
  name: string;
  region: string;
  capital: string;
  /** The year of the figures. */
  year: number;
  population: number;
  /** Per cent of the population living in urban areas. */
  urbanisation: number;
  /** The largest city's share of the urban population, per cent. */
  largestShare: number;
  /** People in the largest city, where the World Bank gives it. */
  largestCity?: number;
}

export const WORLD_SOURCE: Readonly<typeof data.source> = data.source;
export const COUNTRIES: readonly Country[] = data.countries;

/** A country by its three-letter code or its World Bank name. */
export function country(key: string): Country | undefined {
  const wanted = key.trim().toLowerCase();
  return COUNTRIES.find((c) => c.iso3.toLowerCase() === wanted || c.name.toLowerCase() === wanted);
}

/** The value a given fraction of the way up a sorted list (0.5 is the median), between neighbours where needed. */
export function quantile(sorted: readonly number[], q: number): number {
  if (sorted.length === 0) return NaN;
  const at = (sorted.length - 1) * Math.min(1, Math.max(0, q));
  const low = Math.floor(at);
  const high = Math.ceil(at);
  const a = sorted[low] ?? NaN;
  const b = sorted[high] ?? a;
  return a + (b - a) * (at - low);
}

export interface ShareSpread {
  count: number;
  /** A quarter of countries are below this share. */
  lowerQuartile: number;
  median: number;
  /** A quarter of countries are above this share. */
  upperQuartile: number;
}

/** How the largest city's share is spread over the world's countries, in per cent, to one decimal. */
export function shareSpread(countries: readonly Country[] = COUNTRIES): ShareSpread {
  const shares = countries.map((c) => c.largestShare).sort((a, b) => a - b);
  const one = (q: number): number => Math.round(quantile(shares, q) * 10) / 10;
  return { count: shares.length, lowerQuartile: one(0.25), median: one(0.5), upperQuartile: one(0.75) };
}

export interface SizeBand {
  id: 'small' | 'middling' | 'large' | 'giant';
  /** "5 to 20 million". */
  label: string;
  /** From this many people… */
  min: number;
  /** …to fewer than this many. */
  max: number;
}

/** Countries by size: the bigger the country, the smaller its largest city's share. */
export const SIZE_BANDS: readonly SizeBand[] = [
  { id: 'small', label: 'under 5 million', min: 0, max: 5_000_000 },
  { id: 'middling', label: '5 to 20 million', min: 5_000_000, max: 20_000_000 },
  { id: 'large', label: '20 to 100 million', min: 20_000_000, max: 100_000_000 },
  { id: 'giant', label: 'over 100 million', min: 100_000_000, max: Infinity },
];

/** The band a population falls in. */
export function sizeBand(population: number): SizeBand {
  return SIZE_BANDS.find((band) => population >= band.min && population < band.max) ?? (SIZE_BANDS[SIZE_BANDS.length - 1] as SizeBand);
}

/** The middle largest-city share of the countries in each size band, in per cent, rounded to a whole number. */
export function shareBySize(countries: readonly Country[] = COUNTRIES): { band: SizeBand; count: number; median: number }[] {
  return SIZE_BANDS.map((band) => {
    const shares = countries.filter((c) => c.population >= band.min && c.population < band.max).map((c) => c.largestShare).sort((a, b) => a - b);
    return { band, count: shares.length, median: Math.round(quantile(shares, 0.5)) };
  });
}

/** The share of countries whose largest city holds less than this, as a fraction: where a setting sits in the real world. */
export function shareStanding(largestShare: number, countries: readonly Country[] = COUNTRIES): number {
  if (countries.length === 0) return NaN;
  return countries.filter((c) => c.largestShare < largestShare).length / countries.length;
}

/** The countries whose largest city's share is closest to a setting, nearest first. Small countries are left out by default. */
export function nearestByShare(largestShare: number, limit = 3, { minPopulation = 3_000_000 }: { minPopulation?: number } = {}): Country[] {
  return COUNTRIES.filter((c) => c.population >= minPopulation)
    .map((c) => ({ c, away: Math.abs(c.largestShare - largestShare) }))
    .sort((a, b) => a.away - b.away || a.c.name.localeCompare(b.c.name, 'en'))
    .slice(0, limit)
    .map(({ c }) => c);
}

/** The calculator set to a real country's three numbers; the rank-size exponent and the list stay as the sheet has them. */
export function stateFromCountry(c: Country): CitiesState {
  return cleanState({
    nation: c.name,
    population: c.population,
    urbanisation: c.urbanisation,
    largestShare: c.largestShare,
    exponent: SHEET.exponent,
    count: SHEET.count,
    names: [],
    capital: 1,
  });
}
