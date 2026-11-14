/**
 * What to type for urbanisation, by the kind of country: rules of thumb drawn from the
 * historians' and the United Nations' estimates that the guide sets out with their sources
 * (src/content/guide.md, "Urbanisation by era"). The calculator can offer them as hints under
 * the urbanisation box; the guide prints them as a table.
 *
 * These are ranges for whole countries. A rich corner of a poor age (the Low Countries, northern
 * Italy) can sit two or three times higher than its neighbours.
 */
export interface Era {
  id: string;
  /** The kind of country. */
  label: string;
  /** The usual range of urbanisation, in per cent. */
  from: number;
  to: number;
  /** A sensible number to start from. */
  typical: number;
  /** A real-world anchor, with its date. */
  anchor: string;
}

export const ERAS: readonly Era[] = [
  {
    id: 'ancient',
    label: 'Ancient empire or early kingdom',
    from: 5,
    to: 12,
    typical: 8,
    anchor: 'The Roman Empire at its height: roughly 7 to 12%.',
  },
  {
    id: 'medieval',
    label: 'Medieval realm',
    from: 5,
    to: 10,
    typical: 8,
    anchor: 'Western Europe around 1300: about 8 to 10%.',
  },
  {
    id: 'early-modern',
    label: 'Early modern kingdom',
    from: 8,
    to: 15,
    typical: 10,
    anchor: 'France in 1700: 9%. England in 1700: 13%. Edo-period Japan: roughly 10 to 14%.',
  },
  {
    id: 'trading',
    label: 'Trading republic or league of cities',
    from: 20,
    to: 35,
    typical: 30,
    anchor: 'The Dutch Republic in 1700: 34%. The southern Low Countries in 1500: 21%.',
  },
  {
    id: 'industrialising',
    label: 'Industrialising nation',
    from: 20,
    to: 50,
    typical: 35,
    anchor: 'England in 1800: 20%; in 1850: 41%. Britain passed one half by 1851.',
  },
  {
    id: 'industrial',
    label: 'Industrial power',
    from: 40,
    to: 65,
    typical: 50,
    anchor: 'England in 1890: 62%. Europe as a whole in 1900: 38%, and in 1950: 51%.',
  },
  {
    id: 'modern',
    label: 'Modern country',
    from: 45,
    to: 85,
    typical: 60,
    anchor: 'The world in 2025: 58%. Africa 46%, Asia 54%, Europe 75%, the Americas about 81%.',
  },
  {
    id: 'city-state',
    label: 'City-state',
    from: 100,
    to: 100,
    typical: 100,
    anchor: 'Singapore, Monaco, Kuwait: 100%.',
  },
];

/** The eras a given urbanisation fits, for a hint such as "an early modern kingdom". */
export function erasFor(urbanisation: number): Era[] {
  return ERAS.filter((era) => urbanisation >= era.from && urbanisation <= era.to);
}
