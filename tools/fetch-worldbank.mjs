// Refreshes src/data/worldbank.json: for every country the World Bank has figures for, its
// population, its urbanisation, and how much of its urban population lives in its largest city.
// The guide sets real countries beside the calculator's presets with these numbers.
//
//   npm run data
//
// Source: World Bank, World Development Indicators (CC BY 4.0), through its public API. The
// urban figures are the United Nations' (World Urbanization Prospects), as the World Bank says
// on each indicator's page. This is the only thing in the repo that talks to the network, and
// it sends nothing but the request.
import { writeFile } from 'node:fs/promises';

const API = 'https://api.worldbank.org/v2';
const OUT = new URL('../src/data/worldbank.json', import.meta.url);

const INDICATORS = {
  population: { id: 'SP.POP.TOTL', name: 'Population, total' },
  urbanisation: { id: 'SP.URB.TOTL.IN.ZS', name: 'Urban population (% of total population)' },
  largestShare: { id: 'EN.URB.LCTY.UR.ZS', name: 'Population in the largest city (% of urban population)' },
  largestCity: { id: 'EN.URB.LCTY', name: 'Population in largest city' },
};

async function get(path) {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(`${API}/${path}`, { signal: AbortSignal.timeout(60_000) });
      if (!response.ok) throw new Error(`${response.status} for ${path}`);
      const body = await response.json();
      if (!Array.isArray(body) || !Array.isArray(body[1])) throw new Error(`Unexpected answer for ${path}`);
      return body;
    } catch (error) {
      if (attempt >= 4) throw error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    }
  }
}

const round = (value, decimals) => Math.round(value * 10 ** decimals) / 10 ** decimals;

// Countries only: the list also holds regions and income groups ("Aggregates").
const [, places] = await get('country?format=json&per_page=400');
const countries = new Map(
  places
    .filter((place) => place.region?.id !== 'NA')
    .map((place) => [place.id, { iso3: place.id, name: place.name.trim(), region: place.region.value.trim(), capital: place.capitalCity.trim() }]),
);

// The most recent value each country has, per indicator.
let updated = '';
for (const [key, indicator] of Object.entries(INDICATORS)) {
  const [meta, rows] = await get(`country/all/indicator/${indicator.id}?format=json&mrnev=1&per_page=400`);
  if (meta.pages > 1) throw new Error(`${indicator.id}: more than one page`);
  if (meta.lastupdated > updated) updated = meta.lastupdated;
  for (const row of rows) {
    const country = countries.get(row.countryiso3code);
    if (!country || typeof row.value !== 'number') continue;
    country[key] = row.value;
    country[`${key}Year`] = Number(row.date);
  }
}

const list = [...countries.values()]
  .filter((c) => c.population > 0 && c.urbanisation > 0 && c.largestShare > 0)
  .map((c) => ({
    iso3: c.iso3,
    name: c.name,
    region: c.region,
    capital: c.capital,
    year: c.largestShareYear,
    population: Math.round(c.population),
    urbanisation: round(c.urbanisation, 1),
    largestShare: round(c.largestShare, 1),
    ...(c.largestCity > 0 ? { largestCity: Math.round(c.largestCity) } : {}),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'));

const data = {
  source: {
    name: 'World Bank, World Development Indicators',
    url: 'https://data.worldbank.org/indicator/EN.URB.LCTY.UR.ZS',
    licence: 'CC BY 4.0',
    note: "The most recent year each country has. Urban figures are the United Nations' (World Urbanization Prospects); each country counts 'urban' its own way, and the largest city is its urban agglomeration.",
    updated,
    fetched: new Date().toISOString().slice(0, 10),
  },
  indicators: Object.fromEntries(Object.entries(INDICATORS).map(([key, indicator]) => [key, indicator])),
  countries: list,
};

await writeFile(OUT, `${JSON.stringify(data, null, 1)}\n`);
console.log(`${list.length} countries written to src/data/worldbank.json (World Bank data last updated ${updated}).`);
