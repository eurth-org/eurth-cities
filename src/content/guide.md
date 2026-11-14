---
title: "How big should your cities be? A guide to the rank-size rule, primate cities and urbanisation"
description: "How city sizes work in real countries, and how to use that in a made-up one: the rank-size rule and Zipf's law, primate cities, urbanisation by era and by region, and the countries that break the pattern. With sources."
updated: 2026-11-14
---

A country's cities are not sized at random. Line them up from largest to smallest and, in country after country, the second is about half the first, the third about a third, and so on down. Geographers call this the rank-size rule. It is the reason a made-up country with cities of 2.4 million, 1.2 million and 800,000 feels right, and one with five cities of exactly a million each doesn't.

This guide explains the three numbers the calculator asks for, what they are in real countries, and when to break the rule on purpose. Numbers in square brackets point to the sources at the end.

## The short version

- **Urbanisation:** about 8% for a medieval realm, 10 to 15% for an early modern kingdom, 30% for a trading republic, 35 to 50% for an industrialising nation, 60 to 85% for a modern one.
- **The largest city's share:** leave it at 28% for a middling country. Raise it towards 40% for a small country with one dominant city. Lower it towards 15%, or under 10%, for a large or federal country.
- **The rank-size number:** leave it at 1.0. Try 0.8 for a country of near-equal cities, or 1.3 to go with a dominant capital (the Primate city preset does this for you).

## How the calculator works

The method is Orioni's city population calculator, a spreadsheet Eurth's members have used for years. It has three steps.

1. **Urban population** = total population × urbanisation.
2. **City 1**, the largest, = 28% of the urban population.
3. **City n** = city 1 ÷ n. The second city is half the first, the third a third, the tenth a tenth.

Take Teland: 18,361,225 people, 47% of them in towns. That makes an urban population of 8,629,776. The largest city, Selunna, has 28% of those, or 2,416,337. The second city has 1,208,169, the third 805,446, and the tenth 241,634. Together the ten hold 82% of Teland's townsfolk; the other 1.55 million live in smaller cities and market towns.

The 28%, the power of n and the number of cities are settings. Nothing is rounded along the way, so the calculator matches the spreadsheet to the person.

## The rank-size rule and Zipf's law

### Where it comes from

The physicist Felix Auerbach noticed the pattern in 1913: multiply a city's rank by its population and, for the cities of Germany, Britain, the United States and others, you get roughly the same number each time [1]. Alfred Lotka put it in the form used today in 1925 [2]. The linguist George Kingsley Zipf made it famous in 1949, in a book that found the same pattern in how often words are used, and proposed the tidy special case in which the power is exactly 1 [3]. That case is Zipf's law. Some researchers now call the whole thing the Auerbach–Lotka–Zipf law, which is fairer and will never catch on [2].

In symbols: the city of rank n has the population of the largest city divided by n to the power q. The calculator calls q the rank-size number. Zipf's law is q = 1.

### How well it holds

Well enough to build on, not well enough to swear by.

One trap first. Most papers measure the pattern the other way up, with a "Pareto exponent" that is one divided by q. A Pareto exponent above 1 means cities more equal than Zipf's law says; below 1 means more top-heavy. The figures below are converted to the rank-size number.

- A classic study of 44 countries found rank-size numbers from about 0.5 (Australia, very even) to 1.2 (Morocco, top-heavy), averaging near 0.88 [4].
- A later one of 73 countries averaged about 0.9, and Zipf's exact value could be ruled out for 53 of them [5].
- A review of 515 estimates from 29 studies averaged about 0.92, with over a third of them outside the range 0.83 to 1.25 [6].
- A collection of 1,702 estimates from 81 studies averaged 1.03, from 0.27 to 3.85. Only 628 of them fell between 0.9 and 1.1 [7].

So the truth is "about 1, give or take a fair bit". Where the rule fits famously well is the United States: its 135 largest metropolitan areas give a number within half a per cent of 1 [8]. The economist Xavier Gabaix showed why something like it should appear at all: if cities grow by random percentages that don't depend on their size, their sizes drift into this pattern [8].

Two things move the number. How you count a city matters: cities inside their official boundaries look more equal, whole built-up areas more top-heavy, because big cities have bigger suburbs [5][6][7]. And time matters: estimates for before 1900 average about 0.83, against 1.05 for recent decades [7]. Cities were more alike in size before railways let a few of them run away.

### Choosing the rank-size number

- **1.0** is the default and needs no excuse.
- **0.75 to 0.9** suits an old or pre-industrial country, a federation, or a land of rival cities. The second city is two-thirds of the first, not half.
- **1.1 to 1.5** suits a country that pours itself into one place. The second city is well under half the first.

### The rule runs out

There is a catch in the arithmetic. If the largest city has 28% of the urban population and every city after it follows the rule, the first nineteen cities use up all the townsfolk there are. The rule describes the top of the list; below it, real towns are smaller than the rule predicts. The calculator tells you when your list asks for more people than live in towns, and how many cities fit.

The same arithmetic explains why big countries have small largest-city shares. A country with a thousand towns cannot give 28% to the first of them and still follow the rule; about 13% is the most it allows.

## How big is the largest city?

The World Bank publishes, for 153 countries, the share of the urban population living in the largest city [9]. Half the countries are below 29.5% and half above; a quarter are below 19% and a quarter above 39%. Orioni's 28% is, near enough, the middle of the real world.

The calculator's three presets are a high, a middling and a low country:

| Preset | Largest city's share | Rank-size number | Real countries near that share |
| --- | --- | --- | --- |
| Primate city | 40% | 1.3 | Chile 40%, Peru 39%, Greece 38%, Portugal 46% |
| Typical | 28% | 1.0 | Colombia 28%, Ecuador 28%, Belarus 29% |
| Balanced country | 15% | 1.0 | South Africa 16%, Kazakhstan 16%, Spain 17% |

Size is most of the story. The bigger the country, the smaller the share:

| Country's population | Middle share of the largest city |
| --- | --- |
| Under 5 million | 47% |
| 5 to 20 million | 31% |
| 20 to 100 million | 23% |
| Over 100 million | 18% |

At the far ends sit Singapore (100%) and China (3%). The United States is at 7%, India at 7%, Germany at 5%, Egypt at 45%.

## Primate cities

In 1939 the geographer Mark Jefferson pointed out that a country's leading city is very often far bigger than the rule allows, and far more important than its size alone suggests: the place where the court, the banks, the newspapers and the ambitious all end up [10]. He called it the primate city. In most of the countries he looked at, the largest city was more than twice the second. The usual definition today is a largest city at least twice the size of the next, and more than twice as significant.

Some are far beyond twice. Budapest is about eight times Debrecen. Greater Buenos Aires is more than nine times Córdoba, and Lima about ten times Arequipa. London is about four times Manchester, and Paris more than five times Lyon [11].

Primacy is measured two ways, and they disagree. By the ratio of first city to second, Thailand, France and Britain are textbook cases. By the largest city's share of the urban population they are ordinary: 25%, 21% and 17% [9]. A big country can have a monstrous capital that is still a modest slice of its many townsfolk.

What makes a primate city? A study of 85 countries found the largest city about 42% bigger when it is also the capital, and about half as big again under a dictatorship; countries that trade more have smaller largest cities [12]. Small countries, centralised states and former imperial capitals tend the same way.

**To make one in the calculator:** choose the Primate city preset. It sets the largest city to 40% and the rank-size number to 1.3, so the second city is about two-fifths of the first, and the ten largest cities hold 91% of the townsfolk. The preset changes both numbers for a reason: with the plain rule, a 40% capital and ten cities add up to 117% of the urban population, because a real primate city does not have a second city half its size.

## Urbanisation by era

Urbanisation is the share of people who live in towns and cities. For most of history it was small, because a town eats food it doesn't grow. Until farming and transport improved, a region could feed only so many people who didn't farm, and could haul food only so far: the historian Paul Bairoch called the second limit the tyranny of distance [13][14].

Every figure before 1900 is an estimate, and historians' estimates differ. Treat this table as what to type, not as settled fact.

| Kind of country | Urbanisation | A real anchor |
| --- | --- | --- |
| Ancient empire or early kingdom | 5 to 12% | The Roman Empire at its height: roughly 7 to 12% [15] |
| Medieval realm | 5 to 10% | Western Europe around 1300: about 8 to 10% [13] |
| Early modern kingdom | 8 to 15% | France in 1700: 9%. England in 1700: 13% [16]. Edo-period Japan: roughly 10 to 14% [13] |
| Trading republic or league of cities | 20 to 35% | The Dutch Republic in 1700: 34%. The southern Low Countries in 1500: 21% [16] |
| Industrialising nation | 20 to 50% | England in 1800: 20%; in 1850: 41% [16]. Britain passed one half by 1851 [17] |
| Industrial power | 40 to 65% | England in 1890: 62% [16]. Europe as a whole in 1900: 38%, and in 1950: 51% [13] |
| Modern country | 45 to 85% | The world in 2025: 58% [18] |
| City-state | 100% | Singapore, Monaco, Kuwait [18] |

For the world as a whole, the long-run estimates are 6% in 1500, 7% in 1700, 8% in 1800, 10% in 1850 and 16% in 1900 [19]. The United Nations' figures then give 29% in 1950 and 58% in 2025; the world passed one half in 2007 [18][19].

The historians' figures above count only towns over a threshold: 10,000 people for the Dutch, English and French figures, 5,000 for Europe as a whole. A lower bar gives a higher share. Counting towns of 2,500 and up puts the Dutch Republic at about 40% by 1700 [17].

**How big could a city get?** Before industry, about a million. Rome, Chang'an, Baghdad, Hangzhou, Edo and Beijing are each credited with around a million people at their height by some historians, and with half that or less by others [20]. London reached about a million at the census of 1801, and was the first city to pass two million [20]. If your medieval kingdom of two million people has a capital of 900,000, something magical is feeding it.

A worked example: Corwald, a duchy of 2.3 million people at 9%, has 207,000 townsfolk. With the largest city at 22%, the capital has about 45,500 people and the eighth town fewer than 6,000. That is what a medieval country looks like.

## Urbanisation by region today

The United Nations' World Urbanization Prospects is the standard source; its 2025 edition gives these shares for 2025 [18]:

| Region | Urban, 2025 | Projected, 2050 |
| --- | --- | --- |
| World | 58% | 67% |
| Africa | 46% | 60% |
| Asia | 54% | 65% |
| Europe | 75% | 81% |
| Latin America and the Caribbean | 82% | 88% |
| Northern America | 81% | 87% |
| Oceania | 68% | 73% |

Countries run from 100% (Singapore, Kuwait, Monaco) through the Netherlands at 96%, Japan at 92% and Belgium at 88%, down to Burundi at 26%, Niger at 18% and Papua New Guinea at 16% [18].

A warning that applies to every figure here: each country decides for itself what "urban" means. Denmark and Sweden count a built-up place of 200 people. Argentina asks for 2,000, Japan for a city of 50,000, and India for 5,000 people at a set density with most men working outside farming [19]. To get round this, the 2025 edition also measures every country the same way, by density on a map grid. On that measure 45% of the world lives in cities of 50,000 or more, 36% in towns, and only 19% in the countryside [18]. For a made-up country you get to choose the definition, which is one of the perks.

## When real countries break the pattern

The rule is a habit, not a law. Here are the usual ways of breaking it, all of them worth stealing.

**The capital isn't the largest city.** In nearly one country in five it isn't [21]. Some capitals were built on purpose, often between rivals: Canberra between Sydney and Melbourne, Ottawa between Toronto and Montréal, Brasília, Washington, Abuja, Astana. Others simply lost the race to a port: Bern to Zürich, Wellington to Auckland, Rabat to Casablanca, Ankara to Istanbul, Hanoi to Ho Chi Minh City. In the calculator, move the capital mark to any city in the list.

**Two cities share the top.** Sydney and Melbourne are within 4% of each other [22]. Ho Chi Minh City and Hanoi, and Madrid and Barcelona, are closer than the rule's two-to-one [11]. Rivalry of this kind usually has history behind it: two old kingdoms joined, a commercial city and a political one, a coast and an interior. A low rank-size number, 0.5 or less, closes the gap between first and second.

**No city dominates.** Germany's largest city has 5% of its urban population; the Netherlands' has 7% [9]. Germany was dozens of states until 1871 and each kept its capital. Countries assembled from older pieces keep the cities of the pieces. Use the Balanced country preset, or go lower, with a rank-size number under 1.

**One city is nearly everything.** Montevideo holds 55% of Uruguay's townsfolk, Ulaanbaatar 68% of Mongolia's [9]. Small populations, a single port or a hard hinterland will do it.

**The country is a city.** Singapore, Monaco and the Vatican are 100% urban with one city [18]. Type 100% for the urbanisation and see what the calculator says.

**It depends how you count.** Mumbai is India's largest city by its official boundary; Delhi is larger as a built-up area [11]. Rome is Italy's largest municipality, Milan its largest urban area. When two of your nations' players argue about whose capital is bigger, they may both be right.

And at the very top, the rule often fails in the same direction: the first city is bigger than the line through all the others predicts. Statisticians studying French and American cities have fitted other curves for that reason [23]. It is the primate city again, seen from the other side.

## Sources

1. Felix Auerbach, "Das Gesetz der Bevölkerungskonzentration", *Petermanns Geographische Mitteilungen* 59 (1913), 74–76. [English translation](https://www.vwl.uni-mannheim.de/media/Lehrstuehle/vwl/Ciccone/auerbach_1913_translation_march2021.pdf).
2. Diego Rybski and Antonio Ciccone, ["Auerbach, Lotka, and Zipf: pioneers of power-law city-size distributions"](https://doi.org/10.1007/s00407-023-00314-0), *Archive for History of Exact Sciences* 77 (2023), 601–613.
3. George Kingsley Zipf, *Human Behavior and the Principle of Least Effort* (Addison-Wesley, 1949).
4. Kenneth Rosen and Mitchel Resnick, "The size distribution of cities: an examination of the Pareto law and primacy", *Journal of Urban Economics* 8 (1980), 165–186. Figures as reported in [5] and [6].
5. Kwok Tong Soo, ["Zipf's Law for cities: a cross-country investigation"](https://researchonline.lse.ac.uk/id/eprint/19947/1/Zipf%27s_Law_for_Cities_A_Cross_Country_Investigation.pdf), *Regional Science and Urban Economics* 35 (2005), 239–263. Read in its 2004 discussion-paper version.
6. Volker Nitsch, ["Zipf zipped"](https://www.econstor.eu/bitstream/10419/49914/1/668835885.pdf), *Journal of Urban Economics* 57 (2005), 86–100. Read in its 2004 working-paper version.
7. Clémentine Cottineau, ["MetaZipf. A dynamic meta-analysis of city size distributions"](https://arxiv.org/abs/1606.06162), *PLOS ONE* 12 (2017), e0183919. Figures from the 2016 preprint; the published version covers 1,962 estimates from 86 studies.
8. Xavier Gabaix, ["Zipf's Law for Cities: An Explanation"](https://ideas.repec.org/a/oup/qjecon/v114y1999i3p739-767..html), *Quarterly Journal of Economics* 114 (1999), 739–767.
9. World Bank, World Development Indicators: ["Population in the largest city (% of urban population)"](https://data.worldbank.org/indicator/EN.URB.LCTY.UR.ZS) and ["Urban population (% of total population)"](https://data.worldbank.org/indicator/SP.URB.TOTL.IN.ZS), figures for 2025, read in November 2026. CC BY 4.0. The largest city is counted as its whole urban area.
10. Mark Jefferson, ["The Law of the Primate City"](https://doi.org/10.2307/209944), *Geographical Review* 29 (1939), 226–232.
11. Thomas Brinkhoff, [City Population](https://www.citypopulation.de/), compiled from national censuses: Hungary 2022, Argentina 2022, Peru 2022, United Kingdom 2021, Vietnam 2019, and its table of the world's agglomerations for 2026. Paris and Lyon are compared as metropolitan areas, from Wikipedia's ["Primate city"](https://en.wikipedia.org/wiki/Primate_city).
12. Alberto Ades and Edward Glaeser, ["Trade and Circuses: Explaining Urban Giants"](https://www.nber.org/papers/w4715), *Quarterly Journal of Economics* 110 (1995), 195–227.
13. Paul Bairoch, *Cities and Economic Development: From the Dawn of History to the Present* (University of Chicago Press, 1988). European figures count towns of 5,000 and more.
14. Gilles Duranton, ["Distance, land, and proximity: economic analysis and the evolution of cities"](https://researchonline.lse.ac.uk/id/eprint/7271), *Environment and Planning A* 31 (1999), 2169–2188.
15. Andrew Wilson, "City sizes and urbanization in the Roman Empire", in Alan Bowman and Andrew Wilson (eds), *Settlement, Urbanization, and Population* (Oxford University Press, 2011).
16. Jan de Vries, *European Urbanization 1500–1800* (Methuen, 1984). Figures count towns of 10,000 and more, as reproduced in Phil Withington, ["Urbanization"](https://eprints.whiterose.ac.uk/105617/1/Withington%2C%20Urbanization%2C%20Final.pdf) (2017).
17. Romola Davenport, ["Urban society"](https://www.campop.geog.cam.ac.uk/blog/2024/10/31/urban-society/), Cambridge Group for the History of Population and Social Structure (2024).
18. United Nations, Department of Economic and Social Affairs, [World Urbanization Prospects 2025](https://www.un.org/development/desa/pd/node/4442), with its [key messages](https://www.un.org/development/desa/pd/sites/www.un.org.development.desa.pd/files/undesa_pd_2024_key_messages_wup_2025.pdf).
19. Our World in Data, ["Urbanization"](https://ourworldindata.org/urbanization), with long-run estimates from the HYDE database.
20. Wikipedia, ["List of largest cities throughout history"](https://en.wikipedia.org/wiki/List_of_largest_cities_throughout_history), which sets the estimates of Chandler, Modelski, Morris and others side by side.
21. Wikipedia, ["List of countries whose capital is not their largest city"](https://en.wikipedia.org/wiki/List_of_countries_whose_capital_is_not_their_largest_city): 36 sovereign states when read in November 2026.
22. Australian Bureau of Statistics, ["Regional population, 2023–24"](https://www.abs.gov.au/statistics/people/population/regional-population/2023-24).
23. Jean Laherrère and Didier Sornette, ["Stretched exponential distributions in nature and economy: 'fat tails' with characteristic scales"](https://arxiv.org/abs/cond-mat/9801293), *European Physical Journal B* 2 (1998), 525–539.

The calculator's own numbers for real countries come from source 9 and are kept in this site's code, so they can be checked and refreshed.
