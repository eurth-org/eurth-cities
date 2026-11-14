/**
 * Numbers in and out, in British English: 2,416,337 and 28%. Written by hand rather than with
 * Intl, so a page built on a server, a test and every browser print the same characters.
 */
import { roundTo } from './model';

/** A whole number with commas between the thousands: 2416337 becomes "2,416,337". */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0';
  const whole = Math.round(Math.abs(value));
  const digits = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return value < 0 && whole !== 0 ? `-${digits}` : digits;
}

/** A number with up to so many decimals and no trailing noughts: 47, 47.5, 1.25. */
export function formatDecimal(value: number, decimals = 2): string {
  return String(roundTo(value, decimals));
}

/** A fraction as a percentage: 0.8201 becomes "82%"; with one decimal, "82.0%". */
export function formatPercent(fraction: number, decimals = 0): string {
  return `${roundTo(fraction * 100, decimals).toFixed(decimals)}%`;
}

/** A setting already in per cent, as the visitor typed it: 28 becomes "28%", 47.5 "47.5%". */
export function formatSetting(percent: number): string {
  return `${formatDecimal(percent)}%`;
}

const WORDS = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

/** A small count in words, as running text wants it: "ten" for 10, "32" for 32. */
export function numberWord(n: number): string {
  return WORDS[n] ?? String(n);
}

/** "Teland's": whose cities these are. */
export function possessive(name: string): string {
  return `${name}'s`;
}

/** A list in running text: "a, b and c". */
export function listText(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

const SCALES: Record<string, number> = {
  k: 1e3,
  thousand: 1e3,
  m: 1e6,
  mn: 1e6,
  mio: 1e6,
  million: 1e6,
  b: 1e9,
  bn: 1e9,
  billion: 1e9,
};

/**
 * A population as someone might type it: "18,361,225", "18 361 225", "18.361.225", "18.4 million",
 * "950k", "1.2bn". Null for anything that isn't a number of people. A population is a whole
 * number, so a single full stop followed by exactly three digits ("18.361") is read as a
 * thousands separator, as on the Continent, and so is a single comma ("18,361").
 */
export function parsePopulation(text: string): number | null {
  const found = /^([0-9][0-9.,'’\u00a0\u202f\u2009 _]*)([a-z]*)$/i.exec(text.trim());
  if (!found) return null;
  const scale = found[2] ? SCALES[found[2].toLowerCase()] : 1;
  if (scale === undefined) return null;
  let digits = (found[1] ?? '').replace(/['’\u00a0\u202f\u2009 _]/g, '');
  const marks = digits.replace(/\d/g, '');
  const grouped = (text: string, mark: string): boolean => new RegExp(`^\\d{1,3}(\\${mark}\\d{3})+$`).test(text);
  if (marks.includes('.') && marks.includes(',')) {
    // Both marks: the last one is the decimal mark, the other groups the thousands.
    const decimal = digits.lastIndexOf('.') > digits.lastIndexOf(',') ? '.' : ',';
    const group = decimal === '.' ? ',' : '.';
    const [whole = '', fraction = '', ...more] = digits.split(decimal);
    if (more.length > 0 || !grouped(whole, group)) return null;
    digits = `${whole.split(group).join('')}.${fraction}`;
  } else if (marks.length > 1) {
    // One mark, several times: it can only be grouping thousands.
    const mark = marks.charAt(0);
    if (!grouped(digits, mark)) return null;
    digits = digits.split(mark).join('');
  } else if (marks.length === 1) {
    digits = grouped(digits, marks) && scale === 1 ? digits.replace(marks, '') : digits.replace(',', '.');
  }
  if (!/^\d+(\.\d+)?$/.test(digits)) return null;
  const value = Number(digits) * scale;
  return Number.isFinite(value) ? Math.round(Number(value.toPrecision(15))) : null;
}

/**
 * A percentage or other small number as someone might type it: "47", "47%", "47.5 %", "47,5",
 * "28% of urban". Null for anything that doesn't start with a number.
 */
export function parseDecimal(text: string): number | null {
  const found = /^([0-9]+(?:[.,][0-9]+)?|[.,][0-9]+)\s*(%.*)?$/.exec(text.trim());
  if (!found) return null;
  const value = Number((found[1] ?? '').replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}
