/**
 * The cities as CSV, for a spreadsheet: one row per city, a header row first. Written to
 * RFC 4180 (quotes doubled, lines ended with CRLF). Names that a spreadsheet would run as a
 * formula (starting with = + - or @) get an apostrophe in front, so opening the file is safe.
 */
import type { Result } from './calc';
import { roundTo, type CitiesState } from './model';

export const CSV_HEADER = ['Rank', 'City', 'Population', 'Share of urban population (%)', 'Capital'] as const;

/** One cell: quoted when it holds a comma, a quote or a line break; defused when it looks like a formula. */
export function csvCell(value: string | number): string {
  let text = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** The whole file as text. Populations are plain digits, so a spreadsheet reads them as numbers. */
export function toCsv(_state: CitiesState, result: Result): string {
  const rows: (string | number)[][] = [[...CSV_HEADER]];
  for (const city of result.cities) {
    rows.push([city.rank, city.label, city.population, roundTo(city.share * 100, 2), city.capital ? 'yes' : '']);
  }
  return rows.map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

/** "teland-cities.csv": a file name from the nation's name. */
export function csvFileName(state: CitiesState): string {
  const slug = state.nation
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return `${slug ? `${slug}-` : ''}cities.csv`;
}
