/**
 * Example countries, to show what the settings do: one of each kind the guide describes. All
 * of them are invented. The first is the country the calculator opens with.
 */
import { EXAMPLE, type CitiesState } from './model';

export interface Example {
  id: string;
  /** The label in the examples menu. */
  title: string;
  /** One line on what the example shows. */
  blurb: string;
  state: CitiesState;
}

export const EXAMPLES: readonly Example[] = [
  {
    id: 'teland',
    title: 'Teland, by the sheet',
    blurb: "A middling country with Orioni's own settings: 47% urban, the largest city at 28%, each city a fraction of the first.",
    state: { ...EXAMPLE, names: [...EXAMPLE.names] },
  },
  {
    id: 'varesh',
    title: 'Varesh, a primate city',
    blurb: 'One great port holds two in five townsfolk and the rest fall away fast: the largest city at 40%, the rank-size number at 1.3.',
    state: {
      nation: 'Varesh',
      population: 6_400_000,
      urbanisation: 58,
      largestShare: 40,
      exponent: 1.3,
      count: 8,
      names: ['Port Varesh', 'Lissenby', 'Carrowmere', 'Tolvane', 'Eskwick', 'Marrenfold', 'Dunhallow', 'Sable Cross'],
      capital: 1,
    },
  },
  {
    id: 'halvern',
    title: 'Halvern, a federation of equals',
    blurb: 'Twenty cities and no giant among them: the largest at 6%, the rank-size number at 0.75, as in a land of old free cities.',
    state: {
      nation: 'Halvern',
      population: 84_000_000,
      urbanisation: 77,
      largestShare: 6,
      exponent: 0.75,
      count: 20,
      names: [
        'Brenhaven', 'Altmarsch', 'Kesselmark', 'Vorlund', 'Stromfels', 'Wendrau', 'Lutterau', 'Hallenau', 'Ostergard', 'Greifwald',
        'Marbrück', 'Tannrode', 'Felsheim', 'Odergast', 'Rhedow', 'Sülzen', 'Kirchwend', 'Bodmar', 'Elsterau', 'Wolmirs',
      ],
      capital: 3,
    },
  },
  {
    id: 'corwald',
    title: 'Corwald, before industry',
    blurb: 'Nine in ten people work the land, so even the capital is a town of forty-odd thousand: 9% urban.',
    state: {
      nation: 'Corwald',
      population: 2_300_000,
      urbanisation: 9,
      largestShare: 22,
      exponent: 1,
      count: 8,
      names: ['Corwald Keep', 'Ashby Market', 'Thornwick', 'Hexmoor', 'Wyrebridge', 'Saint Aldous', 'Fennmouth', 'Barrowgate'],
      capital: 1,
    },
  },
  {
    id: 'ysmere',
    title: 'Ysmere, a planned capital',
    blurb: 'Two rival ports couldn’t agree, so the government sits in a purpose-built city eighth in size.',
    state: {
      nation: 'Ysmere',
      population: 27_000_000,
      urbanisation: 86,
      largestShare: 22,
      exponent: 1,
      count: 10,
      names: ['Saltreach', 'Port Amity', 'Brisk Harbour', 'Wendolin', 'Adelie', 'Goldmark', 'Northcliffe', 'Concord', 'Tarramurra', 'Hobbs Landing'],
      capital: 8,
    },
  },
  {
    id: 'lanterne',
    title: 'Lanterne, a city-state',
    blurb: 'One city, and everyone in it.',
    state: {
      nation: 'Lanterne',
      population: 640_000,
      urbanisation: 100,
      largestShare: 100,
      exponent: 1,
      count: 1,
      names: ['Lanterne'],
      capital: 1,
    },
  },
];

/** An example by its id. */
export function example(id: string): Example | undefined {
  return EXAMPLES.find((entry) => entry.id === id);
}
