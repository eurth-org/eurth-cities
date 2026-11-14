You're building Cities (cities.eurth.org), a free online city population calculator for worldbuilders, one of Eurth's free worldbuilding tools. Eurth (eurth.org) is a worldbuilding and roleplay community since 2004. The attached repo is eurth-org/eurth-cities.

Working order (Foundations and many other tools are being built at the same time tonight):
1. Save this brief as CLAUDE.md.
2. If the repo named above doesn't exist on GitHub yet, create it as a public, empty repo in eurth-org with the gh CLI and connect this folder; if you can't, ask me.
3. Read what already exists of github.com/eurth-org/eurth-style (HANDBOOK.md) and github.com/eurth-org/eurth-profile; they may still be in progress. Write the plan and show it to me.
4. Build the tool's core logic as plain TypeScript modules with thorough tests, and its content and data (guide text, presets, examples, data snapshots). None of that needs eurth-style.
5. Only once @eurth/style 1.0.0 is released (check the releases of github.com/eurth-org/eurth-style), start the site from its starter template and carry on to the end of this brief. Until then, don't scaffold the site, pages or styles.
6. Commit and push after every finished step, and keep roadmap.md up to date with exactly where to pick up, so a new session can continue if this one stops.

Background for every step: Read HANDBOOK.md in github.com/eurth-org/eurth-style and start from its starter template; read the profile schema in github.com/eurth-org/eurth-profile (if it has no "cities" section yet, propose one as a pull request there first); look at github.com/eurth-org/eurth-flag, the reference build. The handbook wins over this brief on everything shared. Then write a plan and show it to me before you build.

Mock-up: the "cities.eurth.org, city population calculator" board on https://claude.ai/artifact/32RKDdVTtCfHsL6Qc6LxV6.

The source: my Google Sheet calculator, which this tool turns into a web page. Its method, exactly:
- Urban population = total population x urbanisation.
- City 1 (the largest) = 28% of the urban population.
- City n = City 1 / n, for n = 2 to 10 (the rank-size rule).
- Check: total 18,361,225 and 47% give an urban population of 8,629,776, City 1 2,416,337, City 2 1,208,169, City 3 805,446, City 10 241,634. Make these numbers a unit test.

Pages: Calculator, Guide, Glossary.

The calculator, v1
- Inputs: total population, urbanisation (%), and three settings that default to my sheet's method: the largest city's share of the urban population (28%), the rank-size exponent (1.0, so City n = City 1 / n^1.0), and how many cities to list (10, up to 50).
- Results: the urban population; a table of cities by rank with population, share of the urban population and a bar for each; the share of the urban population the listed cities hold.
- Names: each city's name is editable; fill them from the profile's names section or from names.eurth.org. Mark which city is the capital (by default the largest), and allow the capital to be another city.
- Presets for the largest city's share, explained in the guide: a primate city (40%), the default (28%) and a balanced country (15%).
- Credit: "Based on Orioni's city population calculator", linking to the guide.

Guide: the rank-size rule and Zipf's law, primate cities, urbanisation by era and region, and when real countries break the pattern, with sources.

Profile section "cities": the inputs, the settings and the named cities. Stats and Wiki read it (capital population, largest cities).

Exports: a wikitext "largest cities" table in the style of IIWiki's Template:Largest cities of Orioni, CSV, Copy description ("Teland's ten largest cities: Selunna 2,416,337, ...").

Signature touch: the bars grow from the left, largest first. Easter egg: an urbanisation of 100% shows "A city-state. Ambitious."

Done when the handbook's checklist passes and the calculator matches my sheet to the person for the test case above.
