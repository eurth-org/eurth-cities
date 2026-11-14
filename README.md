# Cities

> A friendly note: this tool is part of Eurth's advent calendar, and its door opens on 13 December 2026. Please don't spoil the surprise before then.

How big should your cities be? Cities is a free online city population calculator for worldbuilders: give it a country's population and how many of its people live in towns, and it sizes the ten (or fifty) largest cities by the rank-size rule. It is the web version of Orioni's city population calculator, a Google Sheet that Eurth's members have used for years, and it will live at cities.eurth.org. Made by [Eurth](https://eurth.org), a worldbuilding and roleplay community since 2004.

Status: the engine, its tests, the guide and the data are written. The site itself waits for version 1.0.0 of [@eurth/style](https://github.com/eurth-org/eurth-style), the shared look of Eurth's tools. See the [roadmap](roadmap.md) for exactly where things stand, what each release added and what's not planned.

## The method

Exactly as in the sheet:

- Urban population = total population x urbanisation.
- City 1, the largest, = 28% of the urban population.
- City n = city 1 / n (the rank-size rule).

The 28%, the power of n (1.0) and the number of cities (10, up to 50) are settings. Nothing is rounded along the way; only what is shown is rounded to whole people, halves up, as a spreadsheet does. A country of 18,361,225 people, 47% of them in towns, has an urban population of 8,629,776 and cities of 2,416,337, 1,208,169, 805,446 … 241,634. Those numbers are a unit test.

## Where things live

| What | Where |
| --- | --- |
| The state, its limits, and cleaning whatever arrives | `src/cities/model.ts` |
| The sums | `src/cities/calc.ts` |
| Numbers in and out ("18.4 million", 2,416,337, 82%) | `src/cities/format.ts` |
| Links: the whole state in the query string | `src/cities/link.ts` |
| The written description, the summary and the notes beside the table | `src/cities/describe.ts` |
| Wikitext: a `{{Largest cities}}` call and a plain table | `src/cities/wikitext.ts` |
| CSV | `src/cities/csv.ts` |
| Naming cities from a list or from the profile | `src/cities/names.ts` |
| Presets for the largest city's share (the primate one also sets the rank-size number) | `src/cities/presets.ts` |
| The Eurth profile's "cities" section, read and written | `src/cities/profile.ts` |
| Six example countries, one of each kind | `src/cities/examples.ts` |
| Real countries to compare with (World Bank snapshot) | `src/cities/world.ts`, `src/data/worldbank.json`, made by `tools/fetch-worldbank.mjs` |
| The guide, with its sources | `src/content/guide.md` (read by `src/content/guide.ts`) |
| The glossary | `src/content/glossary.ts` |
| What to type for urbanisation, by era | `src/content/eras.ts` |
| Tests | `tests/` |

The engine in `src/cities/` is plain TypeScript with no browser or framework in it: a country's cities are data, and every export is a function of that data.

## The link

A country's cities live in their link; nothing is stored anywhere.

```
https://cities.eurth.org/?v=1&pop=18361225&urban=47&top=28&exp=1&n=10&cap=1&nation=Teland&names=Selunna~Tavelin~Korrasu
```

`v` is the format's version, `pop` the total population, `urban` the urbanisation in per cent, `top` the largest city's share of the urban population in per cent, `exp` the rank-size exponent, `n` the number of cities, `cap` the capital's rank, `nation` the nation's name and `names` the cities' names by rank, joined with `~`. Another tool can send people here with only some of these (`?pop=12480000&nation=Calderwyn`); the rest take the calculator's starting values.

## The profile

Cities owns the `cities` section of the [Eurth profile](https://github.com/eurth-org/eurth-profile) and writes nothing else. It reads `stats` (population), `names` (place names) and `identity` (the capital's name). The section holds the link, a one-paragraph summary, the inputs (`population`, `urbanisation`), the settings (`largestShare`, `exponent`) and the cities (`list`: name, population, and `capital: true` on one). `src/cities/profile.ts` documents it in full.

## Development

Node 22 or later.

```bash
npm install
```

```bash
npm test
```

```bash
npm run check
```

`npm run data` refreshes the World Bank snapshot in `src/data/` (it asks the World Bank's public API; nothing else in this repo talks to the network).

## Deployment

Not yet: until its door opens the site doesn't exist. It will be a Cloudflare Worker serving static assets on cities.eurth.org, deployed by a scheduled launch workflow, as the [handbook](https://github.com/eurth-org/eurth-style) sets out.

## Licence

[Apache 2.0](LICENSE). Made by Orioni for Eurth. Free forever: no ads, no analytics, trackers, cookies or accounts. Made for fiction and fun.
