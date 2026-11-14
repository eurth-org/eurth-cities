/**
 * The glossary: the words the calculator and the guide use, in plain English, in alphabetical
 * order. The glossary page lists them (as a DefinedTermSet for search engines) and the guide
 * links to them by id.
 *
 * Text is plain: no markup. "see" names other entries by id. Keep each definition to what a
 * worldbuilder needs; the guide has the argument and the sources.
 */
export interface Term {
  /** The entry's address on the glossary page: /glossary#rank-size-rule. */
  id: string;
  term: string;
  /** Other names for the same thing. */
  also?: readonly string[];
  definition: string;
  /** Related entries, by id. */
  see?: readonly string[];
}

export const GLOSSARY_UPDATED = '2026-11-14';

export const GLOSSARY: readonly Term[] = [
  {
    id: 'capital',
    term: 'Capital',
    definition:
      'The city where a country’s government sits. It is usually the largest city, but not always: Canberra, Ottawa, Brasília and Washington are all outranked at home. The calculator marks the largest city as the capital until you move the mark.',
    see: ['planned-capital', 'primate-city'],
  },
  {
    id: 'central-place-theory',
    term: 'Central place theory',
    definition:
      'Walter Christaller’s idea, from 1933, that settlements arrange themselves in a hierarchy: many villages around fewer market towns, market towns around fewer cities, each level offering what the level below can’t support. It explains why big cities are rare and small towns common.',
    see: ['urban-hierarchy', 'market-town', 'hinterland'],
  },
  {
    id: 'city-proper',
    term: 'City proper',
    definition:
      'The city inside its official boundary, and nothing beyond it. Boundaries are accidents of history, so a city proper can be far smaller than the built-up place people mean by its name: the City of Paris holds about two million people, greater Paris more than ten.',
    see: ['urban-agglomeration', 'metropolitan-area'],
  },
  {
    id: 'city-state',
    term: 'City-state',
    definition:
      'A country that is one city and little else, such as Singapore or Monaco. Its urbanisation is 100% and its largest city holds everyone, which makes for a short table.',
    see: ['urbanisation', 'largest-city-share'],
  },
  {
    id: 'conurbation',
    term: 'Conurbation',
    definition:
      'Several towns and cities that have grown into one continuous built-up area while keeping their own names and councils. The word is Patrick Geddes’s, from 1915; the Ruhr and the West Midlands are the usual examples.',
    see: ['urban-agglomeration', 'megalopolis'],
  },
  {
    id: 'counter-urbanisation',
    term: 'Counter-urbanisation',
    definition:
      'People moving out of big cities to smaller towns and the countryside, seen in rich countries from the 1970s. It slows a large city’s growth without making the country any less urban.',
    see: ['urbanisation'],
  },
  {
    id: 'gibrats-law',
    term: 'Gibrat’s law',
    definition:
      'The rule of proportionate growth, named after Robert Gibrat (1931): a city’s growth rate doesn’t depend on its size. If every city grows by a random percentage each year, big or small, the sizes drift towards the pattern Zipf’s law describes.',
    see: ['zipfs-law', 'power-law'],
  },
  {
    id: 'hinterland',
    term: 'Hinterland',
    definition:
      'The country a city serves and lives off: where its food comes from, and where its goods, news and orders go. Before railways, the size of a city’s hinterland set the size of the city.',
    see: ['central-place-theory', 'market-town'],
  },
  {
    id: 'king-effect',
    term: 'King effect',
    definition:
      'When the top one or two items of a ranking are far larger than the rule that fits all the others would allow. Paris among French cities is the classic case. A primate city is a king effect.',
    see: ['primate-city', 'rank-size-rule'],
  },
  {
    id: 'largest-city-share',
    term: 'Largest city’s share',
    also: ['Primacy share'],
    definition:
      'The part of the urban population that lives in the largest city, in per cent. It is the calculator’s first setting, 28% unless you change it. Across the world’s countries it runs from about 3% (China) to 100% (Singapore), with the middle near 30%.',
    see: ['primacy', 'urban-population', 'primate-city'],
  },
  {
    id: 'log-log-chart',
    term: 'Log-log chart',
    definition:
      'A chart with both axes stretched so that each step multiplies by ten instead of adding. Cities that follow the rank-size rule fall on a straight line on it, and the steepness of the line is the rank-size exponent.',
    see: ['rank-size-exponent', 'power-law'],
  },
  {
    id: 'market-town',
    term: 'Market town',
    definition:
      'A small town with the right to hold a market, a day’s walk there and back for the villages around it. In an agrarian country most towns are these, and they are where the urban population not in your listed cities lives.',
    see: ['central-place-theory', 'town', 'hinterland'],
  },
  {
    id: 'megacity',
    term: 'Megacity',
    definition: 'A city of ten million people or more, by the United Nations’ count. There were two in 1950, New York and Tokyo; there are more than thirty now.',
    see: ['urban-agglomeration', 'megalopolis'],
  },
  {
    id: 'megalopolis',
    term: 'Megalopolis',
    definition:
      'A chain of cities and their suburbs that run into one another for hundreds of kilometres. Jean Gottmann used the word in 1961 for the north-eastern seaboard of the United States, from Boston to Washington.',
    see: ['conurbation', 'megacity'],
  },
  {
    id: 'metropolitan-area',
    term: 'Metropolitan area',
    definition:
      'A city together with the suburbs and towns whose people commute to it: the city as a labour market. It is usually the largest of the three ways to count a city, and the one that follows the rank-size rule best.',
    see: ['city-proper', 'urban-agglomeration'],
  },
  {
    id: 'pareto-exponent',
    term: 'Pareto exponent',
    definition:
      'How the academic papers measure the same thing as the rank-size exponent, the other way up: the number of cities above a given size falls with size to this power. It is one divided by the rank-size exponent, so a Pareto exponent above 1 means cities more equal than Zipf’s law says, and below 1 less equal.',
    see: ['rank-size-exponent', 'zipfs-law'],
  },
  {
    id: 'planned-capital',
    term: 'Planned capital',
    also: ['Purpose-built capital'],
    definition:
      'A capital built on purpose, often on neutral ground between rival cities or to pull people inland: Canberra, Brasília, Washington, Abuja, Astana. Planned capitals are rarely the largest city, so they sit well down the table.',
    see: ['capital'],
  },
  {
    id: 'power-law',
    term: 'Power law',
    definition:
      'A relationship in which one quantity changes as a fixed power of another: double the rank and the size falls by the same factor every time. City sizes, word frequencies and earthquake strengths all roughly follow one.',
    see: ['rank-size-rule', 'zipfs-law', 'log-log-chart'],
  },
  {
    id: 'primacy',
    term: 'Primacy',
    definition:
      'How far the largest city stands above the rest. It is measured in two ways that don’t always agree: the largest city’s share of the urban population, and the largest city divided by the second largest (2 under the rank-size rule; far more in Thailand or Hungary).',
    see: ['primate-city', 'largest-city-share', 'king-effect'],
  },
  {
    id: 'primate-city',
    term: 'Primate city',
    definition:
      'A largest city that is out of all proportion to the rest: by Mark Jefferson’s 1939 definition, at least twice the size of the next city and more than twice as significant. Bangkok, Budapest and Montevideo are primate cities; no German or Indian city is.',
    see: ['primacy', 'king-effect', 'largest-city-share'],
  },
  {
    id: 'rank',
    term: 'Rank',
    definition: 'A city’s place in the list by population: 1 for the largest, 2 for the next, and so on.',
    see: ['rank-size-rule'],
  },
  {
    id: 'rank-size-exponent',
    term: 'Rank-size exponent',
    also: ['Rank-size number'],
    definition:
      'The calculator’s second setting: the power of the rank that the largest city is divided by. At 1.0, city 2 is a half and city 3 a third of the largest. Above 1 the cities fall away faster, leaving one giant and many small towns; below 1 they fall away more slowly, for a country of near-equals.',
    see: ['rank-size-rule', 'pareto-exponent', 'log-log-chart'],
  },
  {
    id: 'rank-size-rule',
    term: 'Rank-size rule',
    definition:
      'The observation that a country’s city of rank n has about one n-th the population of its largest city: the second city half, the third a third, the tenth a tenth. It is a rule of thumb, not a law, and it is what the calculator works by.',
    see: ['zipfs-law', 'rank-size-exponent', 'rank'],
  },
  {
    id: 'rural-population',
    term: 'Rural population',
    definition: 'Everyone who doesn’t live in a town or city: the total population less the urban population. For most of history, that was nine people in ten.',
    see: ['urban-population', 'urbanisation'],
  },
  {
    id: 'town',
    term: 'Town',
    definition:
      'A settlement larger than a village and smaller than a city. Where the lines fall is each country’s own business: Denmark counts 200 people as urban, Japan asks for 50,000. In the calculator, towns are where the urban population outside the listed cities lives.',
    see: ['market-town', 'urban-population'],
  },
  {
    id: 'urban-agglomeration',
    term: 'Urban agglomeration',
    definition:
      'The continuous built-up area of a city, wherever the official boundaries run. It is how the United Nations counts cities, and the fairest way to compare one country’s cities with another’s.',
    see: ['city-proper', 'metropolitan-area', 'conurbation'],
  },
  {
    id: 'urban-hierarchy',
    term: 'Urban hierarchy',
    definition: 'A country’s settlements ranked by size and by what they offer, from the capital down to the hamlet. Each step down has more places and fewer people in each.',
    see: ['central-place-theory', 'rank-size-rule'],
  },
  {
    id: 'urban-population',
    term: 'Urban population',
    definition:
      'The people who live in towns and cities: the total population multiplied by the urbanisation. It is the first thing the calculator works out, and every city is a share of it.',
    see: ['urbanisation', 'rural-population', 'largest-city-share'],
  },
  {
    id: 'urbanisation',
    term: 'Urbanisation',
    also: ['Urbanization', 'Urban share'],
    definition:
      'The share of a country’s people who live in towns and cities, in per cent. About one in ten before industry, more than half of the world today, and over 80% in the most urban regions. The word also means the process of getting there.',
    see: ['urban-population', 'rural-population', 'counter-urbanisation'],
  },
  {
    id: 'zipfs-law',
    term: 'Zipf’s law',
    definition:
      'The rank-size rule with an exponent of exactly 1, named after the linguist George Kingsley Zipf, who made it famous in 1949; the physicist Felix Auerbach had noticed it for German cities in 1913. Zipf found the same pattern in how often words are used.',
    see: ['rank-size-rule', 'power-law', 'gibrats-law'],
  },
];

/** An entry by its id. */
export function term(id: string): Term | undefined {
  return GLOSSARY.find((entry) => entry.id === id);
}
