export type HarmonyId =
  | 'analogous'
  | 'complementary'
  | 'split-complementary'
  | 'triadic'
  | 'tetradic'
  | 'square'
  | 'monochromatic';

export interface HarmonyDef {
  id: HarmonyId;
  label: string;
  /** Hue offsets (in degrees) applied to the base hue. First is always 0 (the base). */
  offsets: number[];
  /** Whether the swatch count can be adjusted by the user. */
  adjustable: boolean;
  /** Allowed counts when adjustable. */
  counts?: number[];
}

/** A single colour in HSL space — the canonical internal representation. */
export interface HslColor {
  h: number; // 0..360
  s: number; // 0..100
  l: number; // 0..100
}

export type CodeFormat = 'hex' | 'rgb' | 'hsl';
