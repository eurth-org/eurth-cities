/**
 * Cities: the model. A country's cities are five numbers and a list of names: how many people
 * there are, how many of them live in towns, how large the largest city is, how fast the rest
 * fall away, and how many to list. Everything else is worked out from those (calc.ts).
 *
 * Whatever arrives from a link or a file is someone else's input: cleanState checks and clamps
 * every value before anything is worked out or shown.
 */

export interface CitiesState {
  /** The nation's name; '' when it has none yet. */
  nation: string;
  /** The total population: a whole number of people. */
  population: number;
  /** The share of people who live in towns and cities, in per cent (0 to 100). */
  urbanisation: number;
  /** The largest city's share of the urban population, in per cent. */
  largestShare: number;
  /** The rank-size exponent q: city n = city 1 / n^q. */
  exponent: number;
  /** How many cities to list. */
  count: number;
  /** City names by rank: names[0] is the largest city. '' is a city not named yet. */
  names: string[];
  /** The rank of the capital: 1 is the largest city. */
  capital: number;
}

/** The limits every value is kept to. */
export const LIMITS = {
  population: { min: 0, max: 1_000_000_000_000 },
  urbanisation: { min: 0, max: 100 },
  largestShare: { min: 0.1, max: 100 },
  exponent: { min: 0, max: 3 },
  count: { min: 1, max: 50 },
  /** The longest name, in characters: the profile's own limit. */
  name: 80,
} as const;

/** The settings of Orioni's sheet: the largest city has 28% of the urban population, city n = city 1 / n. */
export const SHEET = { largestShare: 28, exponent: 1, count: 10 } as const;

/** The example the calculator opens with, and the numbers the tests hold the sums to. */
export const EXAMPLE: Readonly<CitiesState> = Object.freeze({
  nation: 'Teland',
  population: 18_361_225,
  urbanisation: 47,
  largestShare: SHEET.largestShare,
  exponent: SHEET.exponent,
  count: SHEET.count,
  names: Object.freeze(['Selunna', 'Tavelin', 'Korrasu', 'Mirevad', 'Ostaril', 'Venmarra', 'Lukeholm', 'Tessavin', 'Avandra', 'Delmaris']) as unknown as string[],
  capital: 1,
});

/** A fresh copy of the example, safe to change. */
export function exampleState(): CitiesState {
  return { ...EXAMPLE, names: [...EXAMPLE.names] };
}

/** A number within its limits; the fallback for anything that isn't a number. */
export function clamp(value: unknown, min: number, max: number, fallback: number): number {
  const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

/** Rounded to a number of decimal places, without the tail binary fractions leave (1.005 becomes 1.01). */
export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(Number((value * factor).toPrecision(15))) / factor;
}

/** A name: plain text on one line, no markup, at most 80 characters. */
export function cleanName(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/[<>\u0000-\u001f\u007f\u2028\u2029]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LIMITS.name)
    .trim();
}

/** The name a city goes by until it is given one. */
export function placeholderName(rank: number): string {
  return `City ${rank}`;
}

/** Whether a name is only the placeholder for its rank, so not a name at all. */
export function isPlaceholder(name: string, rank: number): boolean {
  return name.trim().toLowerCase() === placeholderName(rank).toLowerCase();
}

/**
 * Names by rank, cleaned: at most 50, placeholders ("City 4" in fourth place) read as not named,
 * and no empty names left trailing at the end.
 */
export function cleanNames(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const names = value.slice(0, LIMITS.count.max).map((name, i) => {
    const clean = cleanName(name);
    return isPlaceholder(clean, i + 1) ? '' : clean;
  });
  while (names.length > 0 && names[names.length - 1] === '') names.pop();
  return names;
}

/**
 * A state that is safe to use, from anything at all. Missing or broken values fall back to the
 * given state (the example, unless told otherwise); numbers are clamped to LIMITS; a capital
 * outside the list goes back to the largest city.
 */
export function cleanState(input: unknown, fallback: Readonly<CitiesState> = EXAMPLE): CitiesState {
  const o = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
  const count = Math.round(clamp(o.count, LIMITS.count.min, LIMITS.count.max, fallback.count));
  const capital = Math.round(clamp(o.capital, -Infinity, Infinity, fallback.capital));
  return {
    nation: 'nation' in o ? cleanName(o.nation) : fallback.nation,
    population: Math.round(clamp(o.population, LIMITS.population.min, LIMITS.population.max, fallback.population)),
    urbanisation: roundTo(clamp(o.urbanisation, LIMITS.urbanisation.min, LIMITS.urbanisation.max, fallback.urbanisation), 2),
    largestShare: roundTo(clamp(o.largestShare, LIMITS.largestShare.min, LIMITS.largestShare.max, fallback.largestShare), 2),
    exponent: roundTo(clamp(o.exponent, LIMITS.exponent.min, LIMITS.exponent.max, fallback.exponent), 2),
    count,
    names: 'names' in o ? cleanNames(o.names) : [...fallback.names],
    capital: capital >= 1 && capital <= count ? capital : 1,
  };
}

/** The name shown for a rank: the city's own, or its placeholder. */
export function cityLabel(state: Pick<CitiesState, 'names'>, rank: number): string {
  return state.names[rank - 1] || placeholderName(rank);
}

/** The state with one city renamed. */
export function renameCity(state: CitiesState, rank: number, name: string): CitiesState {
  if (rank < 1 || rank > LIMITS.count.max) return state;
  const names = [...state.names];
  while (names.length < rank) names.push('');
  names[rank - 1] = cleanName(name);
  return { ...state, names: cleanNames(names) };
}
