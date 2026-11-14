/**
 * Presets for the largest city's share of the urban population: the one setting that changes a
 * country's character most. The guide explains each, with real countries beside them
 * (src/content/guide.md, "How big is the largest city?").
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
    blurb: 'One city towers over the country: court, port, press and money all in one place.',
  },
  {
    id: 'default',
    name: 'Typical',
    largestShare: 28,
    blurb: "Orioni's own setting: a clear first city, with room for rivals.",
  },
  {
    id: 'balanced',
    name: 'Balanced country',
    largestShare: 15,
    blurb: 'Several big cities share the people, as in a federation or a land of old city-states.',
  },
]);

/** The preset a share matches, if any, so its button can show as chosen. */
export function presetFor(largestShare: number): SharePreset | undefined {
  return SHARE_PRESETS.find((preset) => preset.largestShare === largestShare);
}
