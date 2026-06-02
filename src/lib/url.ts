import type { HarmonyId, HslColor } from './types';
import { hexToHsl, hslToHex } from './color';

/**
 * Encode palette state into a compact query string:
 *   ?h=<harmony>&c=<hex>-<hex>-...
 * Hexes are stored without the leading '#'.
 */
export function encodeState(harmony: HarmonyId, colors: HslColor[]): string {
  const params = new URLSearchParams();
  params.set('h', harmony);
  params.set('c', colors.map((col) => hslToHex(col).replace('#', '')).join('-'));
  return `?${params.toString()}`;
}

export interface DecodedState {
  harmony: HarmonyId | null;
  colors: HslColor[] | null;
}

const VALID_HARMONIES: HarmonyId[] = [
  'analogous',
  'complementary',
  'split-complementary',
  'triadic',
  'tetradic',
  'square',
  'monochromatic',
];

export function decodeState(search: string): DecodedState {
  const params = new URLSearchParams(search);
  const h = params.get('h');
  const c = params.get('c');

  const harmony = h && VALID_HARMONIES.includes(h as HarmonyId) ? (h as HarmonyId) : null;

  let colors: HslColor[] | null = null;
  if (c) {
    const parts = c.split('-').filter(Boolean);
    const parsed = parts
      .map((p) => `#${p}`)
      .filter((hex) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex))
      .map(hexToHsl);
    if (parsed.length > 0) colors = parsed;
  }

  return { harmony, colors };
}
