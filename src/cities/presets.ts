/**
 * Presets for the largest city's share of the urban population: the one setting that changes a
 * country's character most. The guide explains each, with real countries beside them
 * (src/content/guide.md). The countries named in the blurbs are checked against the World Bank
 * snapshot by a test, so a refresh of the data can't leave them untrue.
 */
export interface SharePreset {
  id: 'primate' | 'default' | 'balanced';
  /** The button's label. */
  name: string;
  /** The largest city's share of the urban population, in per cent. */
  largestShare: number;
  /** One line under the button. */
  blurb: string;
}

export const SHARE_PRESETS: readonly SharePreset[] = Object.freeze([
  {
    id: 'primate',
    name: 'Primate city',
    largestShare: 40,
    blurb: 'One city towers over the country, as Lisbon, Athens, Santiago and Lima do over theirs.',
  },
  {
    id: 'default',
    name: 'Typical',
    largestShare: 28,
    blurb: "Orioni's own setting, and the middle of the real world: Colombia, Ecuador and Belarus are all within a point of it.",
  },
  {
    id: 'balanced',
    name: 'Balanced country',
    largestShare: 15,
    blurb: 'Several big cities share the people, as in South Africa, Kazakhstan or Spain.',
  },
]);

/** The preset a share matches, if any, so its button can show as chosen. */
export function presetFor(largestShare: number): SharePreset | undefined {
  return SHARE_PRESETS.find((preset) => preset.largestShare === largestShare);
}
