/**
 * The sums, exactly as in Orioni's city population calculator (a Google Sheet):
 *
 *   urban population = total population x urbanisation
 *   city 1           = 28% of the urban population
 *   city n           = city 1 / n          (the rank-size rule)
 *
 * with the 28%, the power of n and the number of cities as settings. Like the sheet, nothing is
 * rounded along the way: every city is worked out from the unrounded numbers, and only what is
 * shown is rounded to whole people.
 */
import { cityLabel, LIMITS, roundTo, type CitiesState } from './model';

export interface City {
  /** 1 for the largest. */
  rank: number;
  /** The city's own name, or '' when it has none. */
  name: string;
  /** The name to show: its own, or "City 4". */
  label: string;
  /** People, rounded to a whole number. */
  population: number;
  /** People, before rounding. */
  exact: number;
  /** Its share of the urban population, as a fraction (0.28 is 28%). */
  share: number;
  /** Its size next to the largest city, as a fraction: the length of its bar. */
  size: number;
  capital: boolean;
}

export interface Result {
  /** People living in towns and cities, rounded. */
  urbanPopulation: number;
  /** The same, before rounding. */
  urbanExact: number;
  /** Everyone else. */
  ruralPopulation: number;
  cities: City[];
  /** The listed cities together: the sum of the rounded figures, so the table adds up. */
  listedPopulation: number;
  /** The share of the urban population the listed cities hold, as a fraction. */
  listedShare: number;
  /** Town dwellers who live outside the listed cities; below zero when the list is overfull. */
  restPopulation: number;
  /** True when the listed cities hold more people than live in towns at all. */
  overfull: boolean;
  /** How many cities (up to 50) fit within the urban population with these settings. */
  fits: number;
}

/**
 * Rounds to whole people the way a spreadsheet does: halves go up, and the tail a binary
 * fraction leaves (2.4999999999999996 for what is really 2.5) is cleared first by keeping 15
 * significant digits, which is what Google Sheets and Excel work to.
 */
export function sheetRound(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(Number(value.toPrecision(15)));
}

/** Urban population = total population x urbanisation (in per cent). Not rounded. */
export function urbanPopulation(population: number, urbanisation: number): number {
  return (population * urbanisation) / 100;
}

/** City 1 = its share (in per cent) of the urban population. Not rounded. */
export function largestCity(urban: number, largestShare: number): number {
  return (urban * largestShare) / 100;
}

/** What a city of a given rank is next to the largest: 1 / n^q. */
export function rankWeight(rank: number, exponent: number): number {
  return 1 / Math.pow(rank, exponent);
}

/** City n = city 1 / n^q. Not rounded. */
export function cityAtRank(largest: number, rank: number, exponent: number): number {
  return largest / Math.pow(rank, exponent);
}

/** 1 + 1/2^q + 1/3^q + … for the first so many ranks: the listed cities, counted in largest cities. */
export function weightSum(count: number, exponent: number): number {
  let sum = 0;
  for (let n = 1; n <= count; n++) sum += rankWeight(n, exponent);
  return sum;
}

const OVER = 1 + 1e-9;

/** How many cities, up to 50, fit within the urban population: the longest list that isn't overfull. */
export function citiesThatFit(largestShare: number, exponent: number): number {
  let sum = 0;
  let fits = 0;
  for (let n = 1; n <= LIMITS.count.max; n++) {
    sum += rankWeight(n, exponent);
    if ((largestShare / 100) * sum > OVER) break;
    fits = n;
  }
  return fits;
}

/** Everything the calculator shows, from a state. */
export function calculate(state: CitiesState): Result {
  const urbanExact = urbanPopulation(state.population, state.urbanisation);
  const urban = sheetRound(urbanExact);
  const largest = largestCity(urbanExact, state.largestShare);
  const cities: City[] = [];
  for (let rank = 1; rank <= state.count; rank++) {
    const size = rankWeight(rank, state.exponent);
    const exact = cityAtRank(largest, rank, state.exponent);
    cities.push({
      rank,
      name: state.names[rank - 1] ?? '',
      label: cityLabel(state, rank),
      population: sheetRound(exact),
      exact,
      share: (state.largestShare / 100) * size,
      size,
      capital: rank === state.capital,
    });
  }
  const listedPopulation = cities.reduce((sum, city) => sum + city.population, 0);
  const listedShare = (state.largestShare / 100) * weightSum(state.count, state.exponent);
  return {
    urbanPopulation: urban,
    urbanExact,
    ruralPopulation: state.population - urban,
    cities,
    listedPopulation,
    listedShare,
    restPopulation: urban - listedPopulation,
    overfull: listedShare > OVER,
    fits: citiesThatFit(state.largestShare, state.exponent),
  };
}

/**
 * The settings that best match a list of city populations, largest first: the largest city's
 * share of the urban population, and the exponent of the line through the cities on a log-log
 * chart (least squares). Used when a profile arrives with cities but without settings, and for
 * measuring real countries against the rule. Null when there is nothing to measure.
 */
export function fitSettings(populations: readonly number[], urban: number): { largestShare: number; exponent: number } | null {
  const sizes = populations.filter((p) => Number.isFinite(p) && p > 0);
  const first = sizes[0];
  if (first === undefined || !(urban > 0)) return null;
  const largestShare = roundTo(Math.min(LIMITS.largestShare.max, Math.max(LIMITS.largestShare.min, (first / urban) * 100)), 2);
  if (sizes.length < 2) return { largestShare, exponent: 1 };
  const xs = sizes.map((_, i) => Math.log(i + 1));
  const ys = sizes.map((p) => Math.log(p));
  const meanX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const meanY = ys.reduce((a, b) => a + b, 0) / ys.length;
  let top = 0;
  let bottom = 0;
  xs.forEach((x, i) => {
    top += (x - meanX) * ((ys[i] ?? meanY) - meanY);
    bottom += (x - meanX) ** 2;
  });
  const slope = bottom > 0 ? top / bottom : -1;
  const exponent = roundTo(Math.min(LIMITS.exponent.max, Math.max(LIMITS.exponent.min, -slope)), 2);
  return { largestShare, exponent };
}
