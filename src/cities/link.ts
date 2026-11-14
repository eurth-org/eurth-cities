/**
 * A country's cities live in their link: the whole state is in the query string (not the # part,
 * so a Worker could read it one day), readable and with a version in front:
 *
 *   https://cities.eurth.org/?v=1&pop=18361225&urban=47&top=28&exp=1&n=10&cap=1&nation=Teland&names=Selunna~Tavelin~Korrasu
 *
 *   v       the version of this format
 *   pop     total population
 *   urban   urbanisation, in per cent
 *   top     the largest city's share of the urban population, in per cent
 *   exp     the rank-size exponent
 *   n       how many cities are listed
 *   cap     the capital's rank
 *   nation  the nation's name
 *   names   the cities' names by rank, joined with ~ (an empty place is a city not named yet)
 *
 * Every number is always written, so a link made today reads the same after the defaults have
 * changed. What arrives in a link is someone else's input: fromQuery never throws, and
 * everything it reads goes through cleanState.
 */
import { formatDecimal } from './format';
import { cleanState, EXAMPLE, LIMITS, type CitiesState } from './model';

export const LINK_VERSION = 1;

/** Where the calculator lives. */
export const SITE = 'https://cities.eurth.org/';

/** The longest query string read: anything longer is not one of ours. */
export const MAX_QUERY_LENGTH = 8000;

const KEYS = ['v', 'pop', 'urban', 'top', 'exp', 'n', 'cap', 'nation', 'names'] as const;

/** One value, safe in a query string and in the places links get pasted: only A-Z a-z 0-9 - _ . and %XX. */
const encode = (text: string): string =>
  encodeURIComponent(text).replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

const decode = (text: string): string => {
  try {
    return decodeURIComponent(text.replace(/\+/g, ' '));
  } catch {
    return '';
  }
};

/** The state as a query string, without the leading "?". */
export function toQuery(state: CitiesState, { names = true }: { names?: boolean } = {}): string {
  const s = cleanState(state);
  const parts = [
    `v=${LINK_VERSION}`,
    `pop=${s.population}`,
    `urban=${formatDecimal(s.urbanisation)}`,
    `top=${formatDecimal(s.largestShare)}`,
    `exp=${formatDecimal(s.exponent)}`,
    `n=${s.count}`,
    `cap=${s.capital}`,
  ];
  if (s.nation) parts.push(`nation=${encode(s.nation)}`);
  const listed = s.names.slice(0, s.count);
  while (listed.length > 0 && listed[listed.length - 1] === '') listed.pop();
  if (names && listed.length > 0) parts.push(`names=${listed.map(encode).join('~')}`);
  return parts.join('&');
}

/** The link that brings a state back: the calculator's address with the state as its query. */
export function toLink(state: CitiesState, { base = SITE, names = true }: { base?: string; names?: boolean } = {}): string {
  const url = new URL(base);
  url.search = toQuery(state, { names });
  url.hash = '';
  return url.toString();
}

/** The raw, still-encoded values of a query string, by key; the first of each wins. */
function rawParams(query: string): Map<string, string> {
  const found = new Map<string, string>();
  for (const pair of query.replace(/^[?#]/, '').split('&')) {
    if (!pair) continue;
    const at = pair.indexOf('=');
    const key = decode(at < 0 ? pair : pair.slice(0, at));
    if (!found.has(key)) found.set(key, at < 0 ? '' : pair.slice(at + 1));
  }
  return found;
}

/**
 * Reads a state from a query string ("?v=1&pop=…", with or without the "?"). Null when the
 * query holds none of our keys, so the page can open with its example. A link that gives only
 * some values (say, another tool sending "?pop=12480000&nation=Calderwyn") gets the example's
 * numbers for the rest, and no names it didn't bring.
 */
export function fromQuery(query: string | null | undefined): CitiesState | null {
  if (typeof query !== 'string' || query.length > MAX_QUERY_LENGTH) return null;
  const raw = rawParams(query);
  if (!KEYS.some((key) => key !== 'v' && raw.has(key))) return null;
  const text = (key: (typeof KEYS)[number]): string | undefined => {
    const value = raw.get(key);
    return value === undefined ? undefined : decode(value);
  };
  const names = (raw.get('names') ?? '')
    .split('~')
    .slice(0, LIMITS.count.max)
    .map(decode);
  return cleanState(
    {
      nation: text('nation') ?? '',
      population: text('pop'),
      urbanisation: text('urban'),
      largestShare: text('top'),
      exponent: text('exp'),
      count: text('n'),
      capital: text('cap') ?? 1,
      names,
    },
    EXAMPLE,
  );
}

/** Reads a state from a whole link, or null. */
export function fromLink(link: string | null | undefined): CitiesState | null {
  if (typeof link !== 'string' || link.length > MAX_QUERY_LENGTH) return null;
  try {
    return fromQuery(new URL(link).search);
  } catch {
    return null;
  }
}
