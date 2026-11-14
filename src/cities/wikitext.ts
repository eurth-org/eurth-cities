/**
 * The cities as wikitext, to paste into a wiki such as IIWiki.
 *
 * largestCitiesTemplate writes a call to {{Largest cities}}, the template behind pages like
 * "Template:Largest cities of Orioni": save it as "Template:Largest cities of <nation>" and
 * place {{Largest cities of <nation>}} on the country's page. The template shows 20 cities at
 * most, so longer lists are cut there. Regions (div_1 …) and pictures (img_1 …) are left empty
 * to fill in on the wiki.
 *
 * citiesWikitable writes a plain sortable table with every listed city, for wikis without the
 * template.
 */
import type { Result } from './calc';
import { formatNumber, formatPercent } from './format';
import type { CitiesState } from './model';

/** How many cities {{Largest cities}} can show. */
export const TEMPLATE_MAX = 20;

/** A name that can't break out of a template or a table cell: no brackets, braces or pipes. */
export function wikiSafe(text: string): string {
  return text
    .replace(/[[\]{}|]/g, ' ')
    .replace(/'{2,}/g, "'")
    .replace(/~{3,}/g, '~')
    .replace(/\s+/g, ' ')
    .trim();
}

export interface WikitextOptions {
  /** The link that brings the calculation back, cited as the source of the figures. */
  link?: string;
}

function source(link: string | undefined): string {
  return link ? `[${link} Cities by Eurth], a rank-size estimate` : 'Cities by Eurth, a rank-size estimate';
}

/** A {{Largest cities}} call for the first 20 cities. */
export function largestCitiesTemplate(state: CitiesState, result: Result, { link }: WikitextOptions = {}): string {
  const nation = wikiSafe(state.nation);
  const cities = result.cities.slice(0, TEMPLATE_MAX);
  const width = String(cities.length).length;
  const lines = [
    '{{Largest cities',
    `| name        = Largest cities of ${nation || 'the country'}`,
    `| country     = ${nation}`,
    `| stat_ref    = ${source(link)}`,
    '| list_by_pop = ',
    '| class       = nav',
    '| div_name    = ',
    '| div_link    = ',
    '',
  ];
  for (const city of cities) {
    const n = String(city.rank);
    const pad = ' '.repeat(width - n.length);
    lines.push(`| city_${n}${pad} = ${wikiSafe(city.label)} | div_${n}${pad} = | pop_${n}${pad} = ${formatNumber(city.population)} | img_${n}${pad} = `);
  }
  lines.push('}}');
  return lines.join('\n');
}

/** A sortable wikitable with every listed city: rank, city, population and share of the urban population. */
export function citiesWikitable(state: CitiesState, result: Result, { link }: WikitextOptions = {}): string {
  const nation = wikiSafe(state.nation);
  const lines = [
    '{| class="wikitable sortable" style="text-align:right"',
    `|+ Largest cities${nation ? ` of ${nation}` : ''}`,
    '! scope="col" | Rank',
    '! scope="col" | City',
    '! scope="col" | Population',
    '! scope="col" | Share of urban population',
  ];
  for (const city of result.cities) {
    lines.push('|-');
    lines.push(`| ${city.rank}`);
    lines.push(`| style="text-align:left" | [[${wikiSafe(city.label)}]]${city.capital ? ' (capital)' : ''}`);
    lines.push(`| ${formatNumber(city.population)}`);
    lines.push(`| ${formatPercent(city.share, 1)}`);
  }
  lines.push('|}');
  lines.push(`<small>Source: ${source(link)}.</small>`);
  return lines.join('\n');
}
