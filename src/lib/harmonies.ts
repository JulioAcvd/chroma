import type { HarmonyDef, HarmonyId, HslColor } from './types';
import { clamp, clampHue } from './color';

export const HARMONIES: HarmonyDef[] = [
  {
    id: 'analogous',
    label: 'Análoga',
    offsets: [0, -30, 30, -60, 60],
    adjustable: true,
    counts: [3, 4, 5],
  },
  { id: 'complementary', label: 'Complementaria', offsets: [0, 180], adjustable: false },
  {
    id: 'split-complementary',
    label: 'Compl. dividida',
    offsets: [0, 150, 210],
    adjustable: false,
  },
  { id: 'triadic', label: 'Triádica', offsets: [0, 120, 240], adjustable: false },
  { id: 'tetradic', label: 'Tetrádica', offsets: [0, 60, 180, 240], adjustable: false },
  { id: 'square', label: 'Cuadrada', offsets: [0, 90, 180, 270], adjustable: false },
  {
    id: 'monochromatic',
    label: 'Monocromática',
    offsets: [0],
    adjustable: true,
    counts: [3, 4, 5],
  },
];

export const HARMONY_MAP: Record<HarmonyId, HarmonyDef> = Object.fromEntries(
  HARMONIES.map((h) => [h.id, h]),
) as Record<HarmonyId, HarmonyDef>;

/** Default swatch count for a harmony, honouring an optional desired count. */
export function resolveCount(def: HarmonyDef, desired?: number): number {
  if (!def.adjustable) return def.offsets.length;
  const counts = def.counts ?? [def.offsets.length];
  if (desired && counts.includes(desired)) return desired;
  return counts[Math.floor(counts.length / 2)] ?? counts[0];
}

/**
 * Compute a palette from a base colour, harmony and swatch count.
 * Monochromatic varies lightness; everything else rotates the hue.
 */
export function computePalette(base: HslColor, id: HarmonyId, count: number): HslColor[] {
  const def = HARMONY_MAP[id];

  if (id === 'monochromatic') {
    // Spread lightness evenly around the base, keeping hue + saturation.
    const span = 60; // total lightness range
    const start = clamp(base.l - span / 2, 12, 88);
    const end = clamp(base.l + span / 2, 12, 88);
    return Array.from({ length: count }, (_, i) => {
      const l = count === 1 ? base.l : start + ((end - start) * i) / (count - 1);
      return { h: clampHue(base.h), s: base.s, l: clamp(l, 0, 100) };
    });
  }

  const offsets = def.adjustable ? def.offsets.slice(0, count) : def.offsets;
  return offsets.map((off) => ({
    h: clampHue(base.h + off),
    s: base.s,
    l: base.l,
  }));
}
