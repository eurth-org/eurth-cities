import { describe, expect, it } from 'vitest';
import { calculate, citiesThatFit, cityAtRank, fitSettings, largestCity, sheetRound, urbanPopulation, weightSum } from '../src/cities/calc';
import { exampleState, LIMITS, type CitiesState } from '../src/cities/model';

const state = (changes: Partial<CitiesState> = {}): CitiesState => ({ ...exampleState(), ...changes });

describe("Orioni's sheet", () => {
  // The check from the brief: these are the sheet's own numbers, to the person.
  const result = calculate(state());

  it('urban population = total population x urbanisation', () => {
    expect(result.urbanPopulation).toBe(8_629_776);
  });

  it('city 1 = 28% of the urban population', () => {
    expect(result.cities[0]?.population).toBe(2_416_337);
  });

  it('city n = city 1 / n, for n = 2 to 10', () => {
    expect(result.cities.map((city) => city.population)).toEqual([
      2_416_337, 1_208_169, 805_446, 604_084, 483_267, 402_723, 345_191, 302_042, 268_482, 241_634,
    ]);
  });

  it('the four cities named in the brief', () => {
    expect(result.cities[1]?.population).toBe(1_208_169);
    expect(result.cities[2]?.population).toBe(805_446);
    expect(result.cities[9]?.population).toBe(241_634);
  });

  it('lists ten cities, ranked from 1', () => {
    expect(result.cities.map((city) => city.rank)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('the ten cities hold 82% of the urban population', () => {
    expect(result.listedShare).toBeCloseTo(0.28 * (7381 / 2520), 12);
    expect(Math.round(result.listedShare * 100)).toBe(82);
    expect(result.overfull).toBe(false);
  });

  it('the table adds up: listed + rest = urban, urban + rural = total', () => {
    expect(result.listedPopulation).toBe(7_077_375);
    expect(result.restPopulation).toBe(1_552_401);
    expect(result.listedPopulation + result.restPopulation).toBe(result.urbanPopulation);
    expect(result.urbanPopulation + result.ruralPopulation).toBe(18_361_225);
  });

  it('works from unrounded numbers, as a sheet does', () => {
    expect(result.urbanExact).toBe(8_629_775.75);
    expect(result.cities[0]?.exact).toBeCloseTo(2_416_337.21, 6);
    expect(result.cities[2]?.exact).toBeCloseTo(805_445.7367, 3);
  });
});

describe('the steps', () => {
  it('urbanPopulation', () => {
    expect(urbanPopulation(18_361_225, 47)).toBe(8_629_775.75);
    expect(urbanPopulation(1000, 0)).toBe(0);
    expect(urbanPopulation(1000, 100)).toBe(1000);
  });

  it('largestCity', () => {
    expect(largestCity(1_000_000, 28)).toBe(280_000);
    expect(largestCity(1_000_000, 100)).toBe(1_000_000);
  });

  it('cityAtRank with the exponent', () => {
    expect(cityAtRank(1200, 1, 1)).toBe(1200);
    expect(cityAtRank(1200, 2, 1)).toBe(600);
    expect(cityAtRank(1200, 3, 1)).toBe(400);
    expect(cityAtRank(1200, 2, 2)).toBe(300);
    expect(cityAtRank(1200, 7, 0)).toBe(1200);
    expect(cityAtRank(1000, 4, 0.5)).toBe(500);
  });

  it('weightSum is the harmonic number when the exponent is 1', () => {
    expect(weightSum(1, 1)).toBe(1);
    expect(weightSum(10, 1)).toBeCloseTo(7381 / 2520, 12);
    expect(weightSum(10, 0)).toBe(10);
  });
});

describe('sheetRound', () => {
  it('rounds halves up', () => {
    expect(sheetRound(0.5)).toBe(1);
    expect(sheetRound(1.5)).toBe(2);
    expect(sheetRound(2.5)).toBe(3);
    expect(sheetRound(500_000.5)).toBe(500_001);
    expect(sheetRound(2.4)).toBe(2);
  });

  it('clears the tail a binary fraction leaves', () => {
    expect(1.005 * 1000).not.toBe(1005);
    expect(sheetRound(1.005 * 1000)).toBe(1005);
    expect(sheetRound(2.4999999999999996)).toBe(3);
    expect(sheetRound(0.1 + 0.2 + 0.2)).toBe(1);
  });

  it('is safe with nothing and with nonsense', () => {
    expect(sheetRound(0)).toBe(0);
    expect(sheetRound(NaN)).toBe(0);
    expect(sheetRound(Infinity)).toBe(0);
  });

  it('a half-person city rounds up, as in the sheet', () => {
    // 1,000,001 people, all in towns, half of them in the largest city: 500,000.5.
    const result = calculate(state({ population: 1_000_001, urbanisation: 100, largestShare: 50, count: 2 }));
    expect(result.cities[0]?.population).toBe(500_001);
    expect(result.cities[1]?.population).toBe(250_000);
  });
});

describe('settings', () => {
  it('the exponent bends the list', () => {
    const flat = calculate(state({ exponent: 0, largestShare: 5 }));
    expect(new Set(flat.cities.map((city) => city.population)).size).toBe(1);
    const steep = calculate(state({ exponent: 2 }));
    expect(steep.cities[1]?.population).toBe(sheetRound(2_416_337.21 / 4));
    expect(steep.cities[9]?.population).toBe(sheetRound(2_416_337.21 / 100));
  });

  it('lists from 1 to 50 cities', () => {
    expect(calculate(state({ count: 1 })).cities).toHaveLength(1);
    const fifty = calculate(state({ count: 50, largestShare: 15 }));
    expect(fifty.cities).toHaveLength(50);
    expect(fifty.cities[49]?.rank).toBe(50);
    expect(fifty.cities[49]?.population).toBe(sheetRound((8_629_775.75 * 0.15) / 50));
  });

  it('cities never grow down the list, whatever the settings', () => {
    for (const exponent of [0, 0.5, 0.8, 1, 1.07, 1.5, 3]) {
      for (const largestShare of [0.1, 15, 28, 40, 100]) {
        const { cities } = calculate(state({ exponent, largestShare, count: 50 }));
        for (let i = 1; i < cities.length; i++) {
          expect(cities[i]!.population).toBeLessThanOrEqual(cities[i - 1]!.population);
          expect(cities[i]!.size).toBeLessThanOrEqual(cities[i - 1]!.size);
        }
      }
    }
  });

  it('shares and bars: the largest city is the full bar', () => {
    const { cities } = calculate(state());
    expect(cities[0]?.share).toBeCloseTo(0.28, 12);
    expect(cities[0]?.size).toBe(1);
    expect(cities[1]?.size).toBe(0.5);
    expect(cities[3]?.share).toBeCloseTo(0.07, 12);
    expect(cities[9]?.size).toBeCloseTo(0.1, 12);
  });

  it('marks the capital, wherever it is', () => {
    expect(calculate(state()).cities.filter((city) => city.capital).map((city) => city.rank)).toEqual([1]);
    expect(calculate(state({ capital: 4 })).cities.filter((city) => city.capital).map((city) => city.rank)).toEqual([4]);
  });

  it('names the unnamed', () => {
    const { cities } = calculate(state({ names: ['Selunna', '', 'Korrasu'] }));
    expect(cities.slice(0, 4).map((city) => city.label)).toEqual(['Selunna', 'City 2', 'Korrasu', 'City 4']);
    expect(cities[1]?.name).toBe('');
  });
});

describe('edges', () => {
  it('nobody at all', () => {
    const result = calculate(state({ population: 0 }));
    expect(result.urbanPopulation).toBe(0);
    expect(result.cities.every((city) => city.population === 0)).toBe(true);
    expect(result.listedShare).toBeGreaterThan(0);
  });

  it('nobody in a town', () => {
    const result = calculate(state({ urbanisation: 0 }));
    expect(result.urbanPopulation).toBe(0);
    expect(result.ruralPopulation).toBe(18_361_225);
  });

  it('a city-state', () => {
    const result = calculate(state({ urbanisation: 100, largestShare: 100, count: 1 }));
    expect(result.urbanPopulation).toBe(18_361_225);
    expect(result.cities[0]?.population).toBe(18_361_225);
    expect(result.ruralPopulation).toBe(0);
    expect(result.restPopulation).toBe(0);
    expect(result.overfull).toBe(false);
  });

  it('the largest population the profile allows', () => {
    const result = calculate(state({ population: LIMITS.population.max, urbanisation: 100, largestShare: 100, count: 3 }));
    expect(result.cities.map((city) => city.population)).toEqual([1_000_000_000_000, 500_000_000_000, 333_333_333_333]);
  });
});

describe('an overfull list', () => {
  it('a primate city at 40% with ten cities holds more than the towns do', () => {
    const result = calculate(state({ largestShare: 40 }));
    expect(result.overfull).toBe(true);
    expect(result.listedShare).toBeCloseTo(1.1716, 4);
    expect(result.restPopulation).toBeLessThan(0);
    expect(result.fits).toBe(6);
  });

  it('how many cities fit', () => {
    expect(citiesThatFit(40, 1)).toBe(6);
    expect(citiesThatFit(28, 1)).toBe(19);
    expect(citiesThatFit(15, 1)).toBe(50);
    expect(citiesThatFit(100, 1)).toBe(1);
    expect(citiesThatFit(50, 0)).toBe(2);
    expect(citiesThatFit(40, 2)).toBe(50);
  });

  it('exactly full is not overfull', () => {
    expect(calculate(state({ largestShare: 50, exponent: 0, count: 2 })).overfull).toBe(false);
    expect(calculate(state({ largestShare: 25, exponent: 0, count: 4 })).overfull).toBe(false);
    expect(calculate(state({ largestShare: 25, exponent: 0, count: 5 })).overfull).toBe(true);
  });
});

describe('fitSettings', () => {
  it('finds the settings a list was made with', () => {
    for (const [largestShare, exponent] of [[28, 1], [40, 1.5], [15, 0.8], [33.3, 1.07]] as const) {
      const made = state({ largestShare, exponent, count: 12 });
      const result = calculate(made);
      const fitted = fitSettings(result.cities.map((city) => city.population), result.urbanExact);
      expect(fitted?.largestShare).toBeCloseTo(largestShare, 1);
      expect(fitted?.exponent).toBeCloseTo(exponent, 2);
    }
  });

  it('one city is enough for the share; the exponent stays at 1', () => {
    expect(fitSettings([280_000], 1_000_000)).toEqual({ largestShare: 28, exponent: 1 });
  });

  it('has nothing to say about nothing', () => {
    expect(fitSettings([], 1_000_000)).toBeNull();
    expect(fitSettings([0, 0], 1_000_000)).toBeNull();
    expect(fitSettings([100], 0)).toBeNull();
  });

  it('keeps to the limits', () => {
    expect(fitSettings([2_000_000, 1], 1_000_000)).toEqual({ largestShare: 100, exponent: 3 });
    expect(fitSettings([100, 200, 400], 1_000_000)?.exponent).toBe(0);
  });
});
