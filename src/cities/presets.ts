/**
 * Presets for the largest city's share of the urban population: the one setting that changes a
 * country's character most. The guide explains each, with real countries beside them
 * (src/content/guide.md). The countries named in the blurbs are checked against the World Bank
 * snapshot by a test, so a refresh of the data can't leave them untrue.
 *
 * Each preset also sets the rank-size number. Two of them leave it at the sheet's 1.0. The
 * primate city raises it to 1.3, because a real primate city has no second city half its size:
 * with the plain rule, a 40% capital and ten cities would hold 117% of the urban population;
 * at 1.3 they hold 91%.
 */
import type { CitiesState } from './model';

export interface SharePreset {
  id: 'primate' | 'default' | 'balanced';
  /** The button's label. */
  name: string;
  /** The largest city's share of the urban population, in per cent. */
  largestShare: number;
  /** The rank-size number that goes with it. */
  exponent: number;
  /** One line under the button. */
  blurb: string;
}

export const SHARE_PRESETS: readonly SharePreset[] = Object.freeze([
  {
    id: 'primate',
    name: 'Primate city',
    largestShare: 40,
    exponent: 1.3,
    blurb: 'One city towers over the country, as Lisbon, Athens, Santiago and Lima do over theirs. The rest fall away faster than the plain rule says.',
  },
  {
    id: 'default',
    name: 'Typical',
    largestShare: 28,
    exponent: 1,
    blurb: "Orioni's own setting, and the middle of the real world: Colombia, Ecuador and Belarus are all within a point of it.",
  },
  {
    id: 'balanced',
    name: 'Balanced country',
    largestShare: 15,
    exponent: 1,
    blurb: 'Several big cities share the people, as in South Africa, Kazakhstan or Spain.',
  },
]);

/** The state with a preset's two settings; everything else stays as it is. */
export function applyPreset(state: CitiesState, preset: SharePreset): CitiesState {
  return { ...state, largestShare: preset.largestShare, exponent: preset.exponent };
}

/** The preset a state's two settings match, if any, so its button can show as chosen. */
export function presetFor(state: Pick<CitiesState, 'largestShare' | 'exponent'>): SharePreset | undefined {
  return SHARE_PRESETS.find((preset) => preset.largestShare === state.largestShare && preset.exponent === state.exponent);
}
