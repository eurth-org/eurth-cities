import { describe, expect, it } from 'vitest';
import { formatDecimal, formatNumber, formatPercent, formatSetting, listText, numberWord, parseDecimal, parsePopulation, possessive } from '../src/cities/format';

describe('writing numbers', () => {
  it('formatNumber puts commas between the thousands', () => {
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1000)).toBe('1,000');
    expect(formatNumber(2_416_337)).toBe('2,416,337');
    expect(formatNumber(18_361_225)).toBe('18,361,225');
    expect(formatNumber(1_000_000_000_000)).toBe('1,000,000,000,000');
    expect(formatNumber(1234.5)).toBe('1,235');
    expect(formatNumber(-1_552_401)).toBe('-1,552,401');
    expect(formatNumber(-0.2)).toBe('0');
    expect(formatNumber(NaN)).toBe('0');
  });

  it('formatPercent', () => {
    expect(formatPercent(0.8201)).toBe('82%');
    expect(formatPercent(0.28, 1)).toBe('28.0%');
    expect(formatPercent(0.028, 1)).toBe('2.8%');
    expect(formatPercent(1.1716)).toBe('117%');
    expect(formatPercent(0)).toBe('0%');
  });

  it('formatDecimal and formatSetting drop needless noughts', () => {
    expect(formatDecimal(47)).toBe('47');
    expect(formatDecimal(47.5)).toBe('47.5');
    expect(formatDecimal(1.0)).toBe('1');
    expect(formatDecimal(1.075, 2)).toBe('1.08');
    expect(formatSetting(28)).toBe('28%');
    expect(formatSetting(33.3)).toBe('33.3%');
  });

  it('words for small counts', () => {
    expect(numberWord(1)).toBe('one');
    expect(numberWord(10)).toBe('ten');
    expect(numberWord(20)).toBe('twenty');
    expect(numberWord(21)).toBe('21');
    expect(numberWord(50)).toBe('50');
  });

  it('possessive and listText', () => {
    expect(possessive('Teland')).toBe("Teland's");
    expect(possessive('Honduras')).toBe("Honduras's");
    expect(listText([])).toBe('');
    expect(listText(['a'])).toBe('a');
    expect(listText(['a', 'b'])).toBe('a and b');
    expect(listText(['a', 'b', 'c'])).toBe('a, b and c');
  });
});

describe('reading a population', () => {
  it('plain and grouped', () => {
    expect(parsePopulation('18361225')).toBe(18_361_225);
    expect(parsePopulation('18,361,225')).toBe(18_361_225);
    expect(parsePopulation(' 18 361 225 ')).toBe(18_361_225);
    expect(parsePopulation('18.361.225')).toBe(18_361_225);
    expect(parsePopulation("18'361'225")).toBe(18_361_225);
    expect(parsePopulation('18\u00a0361\u202f225')).toBe(18_361_225);
    expect(parsePopulation('18_361_225')).toBe(18_361_225);
    expect(parsePopulation('0')).toBe(0);
  });

  it('a lone mark before three digits groups thousands', () => {
    expect(parsePopulation('18.361')).toBe(18_361);
    expect(parsePopulation('18,361')).toBe(18_361);
    expect(parsePopulation('1.000')).toBe(1000);
  });

  it('otherwise a lone mark is a decimal, and people are whole', () => {
    expect(parsePopulation('18.4')).toBe(18);
    expect(parsePopulation('18,5')).toBe(19);
    expect(parsePopulation('1,234.56')).toBe(1235);
    expect(parsePopulation('1.234,56')).toBe(1235);
  });

  it('millions and friends', () => {
    expect(parsePopulation('18.4 million')).toBe(18_400_000);
    expect(parsePopulation('18,4 million')).toBe(18_400_000);
    expect(parsePopulation('18.4m')).toBe(18_400_000);
    expect(parsePopulation('18.361 million')).toBe(18_361_000);
    expect(parsePopulation('950k')).toBe(950_000);
    expect(parsePopulation('950 thousand')).toBe(950_000);
    expect(parsePopulation('1.2bn')).toBe(1_200_000_000);
    expect(parsePopulation('1.4 Billion')).toBe(1_400_000_000);
    expect(parsePopulation('2 M')).toBe(2_000_000);
  });

  it('null for what is not a number of people', () => {
    for (const text of ['', ' ', 'many', '-5', '1e6', '12 dozen', '1..2', '1,,2', '.5', '5 %', '=1+1']) {
      expect(parsePopulation(text)).toBeNull();
    }
  });
});

describe('reading a setting', () => {
  it('numbers, with or without a per cent sign', () => {
    expect(parseDecimal('47')).toBe(47);
    expect(parseDecimal('47%')).toBe(47);
    expect(parseDecimal(' 47.5 % ')).toBe(47.5);
    expect(parseDecimal('47,5')).toBe(47.5);
    expect(parseDecimal('28% of urban')).toBe(28);
    expect(parseDecimal('1.0')).toBe(1);
    expect(parseDecimal('.8')).toBe(0.8);
    expect(parseDecimal('0')).toBe(0);
  });

  it('null for anything else', () => {
    for (const text of ['', 'half', '-1', '1.2.3', '47 per cent', '%']) expect(parseDecimal(text)).toBeNull();
  });
});
