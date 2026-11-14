/**
 * The result in words: what "Copy description" copies, what a screen reader is told, what goes
 * into the profile as the section's summary, and the notes the calculator shows beside the
 * table (too many cities for the towns to hold; nobody in a town at all; a city-state).
 */
import type { Result } from './calc';
import { formatNumber, formatPercent, formatSetting, numberWord, possessive } from './format';
import type { CitiesState } from './model';

/** "ten largest cities", "largest city". */
function citiesPhrase(count: number): string {
  return count === 1 ? 'largest city' : `${numberWord(count)} largest cities`;
}

/** "Teland's ten largest cities", "The ten largest cities". */
function heading(state: CitiesState, count: number): string {
  return state.nation ? `${possessive(state.nation)} ${citiesPhrase(count)}` : `The ${citiesPhrase(count)}`;
}

/**
 * What "Copy description" copies:
 * "Teland's ten largest cities: Selunna 2,416,337, Tavelin 1,208,169, …, Delmaris 241,634. The capital is Selunna."
 */
export function describe(state: CitiesState, result: Result): string {
  const cities = result.cities.map((city) => `${city.label} ${formatNumber(city.population)}`);
  const capital = result.cities.find((city) => city.capital);
  const list = `${heading(state, result.cities.length)}: ${cities.join(', ')}.`;
  return capital ? `${list} The capital is ${capital.label}.` : list;
}

/** "The ten largest cities hold 82% of the urban population." */
export function listedSentence(result: Result): string {
  const count = result.cities.length;
  const decimals = result.overfull && result.listedShare < 1.005 ? 1 : 0;
  const share = formatPercent(result.listedShare, decimals);
  return count === 1
    ? `The largest city holds ${share} of the urban population.`
    : `The ${numberWord(count)} largest cities hold ${share} of the urban population.`;
}

/**
 * One paragraph on the whole result, for the profile's summary and for screen readers:
 * "Of Teland's 18,361,225 people, 47% (8,629,776) live in towns and cities. The largest city,
 * Selunna, has 2,416,337 people, 28% of the urban population. The ten largest cities hold 82%
 * of the urban population. The capital is Selunna."
 */
export function summary(state: CitiesState, result: Result): string {
  const whose = state.nation ? `Of ${possessive(state.nation)}` : 'Of';
  const first = result.cities[0];
  const capital = result.cities.find((city) => city.capital);
  const parts = [
    `${whose} ${formatNumber(state.population)} people, ${formatSetting(state.urbanisation)} (${formatNumber(result.urbanPopulation)}) live in towns and cities.`,
  ];
  if (first) {
    parts.push(`The largest city, ${first.label}, has ${formatNumber(first.population)} people, ${formatSetting(state.largestShare)} of the urban population.`);
  }
  if (result.cities.length > 1) parts.push(listedSentence(result));
  if (capital && first) {
    parts.push(capital.rank === 1 ? `The capital is ${capital.label}.` : `The capital is ${capital.label}, with ${formatNumber(capital.population)} people.`);
  }
  return parts.join(' ');
}

/** The rule in force, in one sentence, for the line under the settings. */
export function ruleSentence(state: CitiesState): string {
  const share = formatSetting(state.largestShare);
  if (state.exponent === 1) {
    return `The largest city holds ${share} of the urban population; the second is half its size, the third a third, and so on (the rank-size rule).`;
  }
  if (state.exponent === 0) {
    return `Every city holds ${share} of the urban population: with a rank-size number of 0, they are all the same size.`;
  }
  return `The largest city holds ${share} of the urban population; city n is the largest divided by n to the power ${state.exponent} (the rank-size rule).`;
}

export interface Note {
  id: 'no-people' | 'no-towns' | 'city-state' | 'overfull' | 'rest';
  /** 'problem' asks the visitor to change something; 'aside' is a remark; 'fact' completes the result. */
  kind: 'problem' | 'aside' | 'fact';
  text: string;
}

/** The easter egg: an urbanisation of 100%. */
export const CITY_STATE = 'A city-state. Ambitious.';

/** What the calculator says beside the table. Problems are plain; the one joke is an aside. */
export function notes(state: CitiesState, result: Result): Note[] {
  const found: Note[] = [];
  if (state.population === 0) {
    found.push({ id: 'no-people', kind: 'problem', text: 'Enter a total population to size the cities.' });
    return found;
  }
  if (state.urbanisation === 0) {
    found.push({ id: 'no-towns', kind: 'problem', text: 'With an urbanisation of 0%, nobody lives in a town, so there are no cities to size.' });
    return found;
  }
  if (state.urbanisation === 100) found.push({ id: 'city-state', kind: 'aside', text: CITY_STATE });
  if (result.overfull) {
    const fits =
      result.fits <= 1
        ? 'List one city'
        : `List ${numberWord(result.fits)} cities or fewer`;
    found.push({
      id: 'overfull',
      kind: 'problem',
      text: `These cities would hold ${formatPercent(result.listedShare, result.listedShare < 1.005 ? 1 : 0)} of the urban population, more people than live in towns at all. ${fits}, lower the largest city's share, or raise the rank-size number.`,
    });
  } else if (result.restPopulation > 0) {
    found.push({
      id: 'rest',
      kind: 'fact',
      text: `The other ${formatNumber(result.restPopulation)} town dwellers live in smaller cities and towns.`,
    });
  }
  return found;
}
