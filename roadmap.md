# Roadmap

Cities is a city population calculator for worldbuilders, at cities.eurth.org from 13 December 2026 (door 4 of Eurth's advent calendar): give it a population and an urbanisation, and it sizes a country's largest cities by the rank-size rule. It is the web version of Orioni's city population calculator, a Google Sheet.

Three parts: what comes next, what each release added (newest first), and what's not planned.

## Where to pick up

A new session starts here. Read `CLAUDE.md` (the brief) first; the handbook in eurth-org/eurth-style wins on everything shared.

**Done (steps 1 to 4 of the brief), all pushed, 192 tests green (`npm test`, `npm run check`):**

- The repo, the brief as `CLAUDE.md`, licence, README, CI (check and test).
- **The engine** in `src/cities/`, plain TypeScript: the sums (the sheet's check numbers are a test), the model and its cleaning, number reading and writing, the link, the description and notes, wikitext, CSV, names, presets, six example countries, and the profile's "cities" section.
- **The data:** `src/data/worldbank.json`, 153 real countries from the World Bank (`npm run data` refreshes it), read through `src/cities/world.ts`.
- **The content:** the guide (`src/content/guide.md`, about 3,000 words, 23 sources), the glossary (`src/content/glossary.ts`, 30 terms) and the urbanisation-by-era table (`src/content/eras.ts`). Tests hold the guide's figures to the engine and the data.
- **The profile:** [eurth-org/eurth-profile#1](https://github.com/eurth-org/eurth-profile/pull/1) proposes `cities.population`, `cities.largestShare` and `cities.exponent`. Cities already reads and writes them, and works without them.

**Blocked, and on what:**

- **The site (step 5)** waits for `@eurth/style` 1.0.0. Check with `gh release list --repo eurth-org/eurth-style`. Until a 1.0.0 release is listed: no Astro scaffold, pages or styles. Once it is: start from its starter template, then follow "Next" from the top.

**Open questions for Orioni:**

- Is the wikitext right for IIWiki? (Next, item 9.)
- Should the primate preset also change the rank-size number, or get a setting of its own? (Next, item 10.)

## Next

In order:

1. **Site from the starter template** of @eurth/style: Astro, static, the shared shell. Keep `src/cities/`, `src/content/`, `src/data/` and `tests/` as they are; replace `.github/workflows/ci.yml` with the starter's; add `@eurth/style` and `@eurth/profile` from GitHub.
2. **The calculator page** (`/`): a Svelte island over `src/cities/`. Inputs for total population and urbanisation; the three settings; the three presets; the table (rank, editable name, bar, population, share) with a capital mark that can move; the urban population; the sentence on what the listed cities hold; the notes from `notes()`. Layout as on the mock-up board "cities.eurth.org, city population calculator". The state lives in the address bar (`toQuery`, `fromQuery`).
3. **Names:** "Load profile file" (via @eurth/profile, then `fromProfile`), "Names from names.eurth.org" (a link to Names, plus a box to paste a list into: `parseNameList`, `fillNames`). Once Names publishes its link format, read a Names link directly.
4. **Exports:** Copy wikitext (`largestCitiesTemplate`, and `citiesWikitable` for more than 20 cities), Download CSV (`toCsv`), Copy description (`describe`), Copy link with the paper plane, the Share dialog, Save profile file (`toSection`, set with @eurth/profile). "Add to country card" only once Card has launched at build time (tools.json).
5. **Signature touch:** the bars grow from the left, largest first; still for reduced motion. **Easter egg:** an urbanisation of 100% shows "A city-state. Ambitious." (already in `notes()`).
6. **Guide and glossary pages** from `src/content/`, with BreadcrumbList and DefinedTermSet, sources and a last-updated date. Credit on the calculator: "Based on Orioni's city population calculator", linking to the guide.
7. **Everything the handbook asks of every tool:** titles and descriptions, JSON-LD, sitemap, robots.txt, llms.txt, Open Graph images, manifest and icons, service worker, `_headers` with the Content-Security-Policy and its test, axe and Lighthouse in CI, the offline note, the install button.
8. **Launch workflow:** `LAUNCH_AT` = `2026-12-13T00:00:00+01:00`; scheduled for 22:30 UTC on 12 December, with `workflow_dispatch` as the fallback. No deploy of any kind before then.
9. **Check the wikitext against IIWiki's Template:Largest cities of Orioni.** IIWiki sits behind a bot check, so the export follows Wikipedia's `{{Largest cities}}` parameters from memory. Orioni to paste the template's source, or confirm the output works on IIWiki.
10. **Primacy as its own setting.** With the sheet's method, a primate city (40%) and ten cities add up to 117% of the urban population, because real primate cities don't have a second city half their size. For now the calculator says so and suggests a way out. Better: let the second city's size be set apart from the rule (city 2 = a share of city 1, the rest following rank-size from there).
11. **Before launch, spot-check the guide's city figures** in the Primate cities and "break the pattern" sections against the census pages behind source 11: they were gathered by a research pass and rounded on purpose ("about eight times"), but not each read by hand. Check the profile pull request has merged, and if 1.0.0 of @eurth/profile was tagged without it, that the fields are in a later release.
12. **Hints under the urbanisation box** from `erasFor()` ("an early modern kingdom"), and under the largest city's share from `nearestByShare()` ("about where Colombia is").

Ideas for later:

- A log-log chart of the cities beside the table, with a real country to compare.
- "Start from a real country": the World Bank's numbers for population, urbanisation and the largest city's share.
- Round to "wiki numbers" (2,416,000) as an option, and a little noise so the list doesn't look calculated.
- Regions: split the cities over a country's provinces.
- A capital outside the list (a small, purpose-built capital).

## Not planned

- **Storing designs in the browser or on a server.** A country's cities live in their link and in the profile file; nothing else is kept.
- **Maps.** Where the cities are is the map's business, not the calculator's.
- **Changing the sheet's sums.** The defaults stay exactly Orioni's method; anything new is a setting that starts switched off.
