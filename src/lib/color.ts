import { colord, extend } from 'colord';
import mixPlugin from 'colord/plugins/mix';
import a11yPlugin from 'colord/plugins/a11y';
import type { CodeFormat, HslColor } from './types';

extend([mixPlugin, a11yPlugin]);

export const clampHue = (h: number): number => ((h % 360) + 360) % 360;
export const clamp = (n: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, n));

export function hslToHex({ h, s, l }: HslColor): string {
  return colord({ h: clampHue(h), s: clamp(s, 0, 100), l: clamp(l, 0, 100) }).toHex();
}

export function hexToHsl(hex: string): HslColor {
  const { h, s, l } = colord(hex).toHsl();
  return { h, s, l };
}

export function formatColor(color: HslColor, fmt: CodeFormat): string {
  const c = colord({ h: clampHue(color.h), s: clamp(color.s, 0, 100), l: clamp(color.l, 0, 100) });
  switch (fmt) {
    case 'hex':
      return c.toHex().toUpperCase();
    case 'rgb': {
      const { r, g, b } = c.toRgb();
      return `rgb(${r}, ${g}, ${b})`;
    }
    case 'hsl': {
      const { h, s, l } = c.toHsl();
      return `hsl(${Math.round(h)}, ${Math.round(s)}%, ${Math.round(l)}%)`;
    }
  }
}

/** Readable text colour (black/white) for a given background. */
export function readableTextOn(color: HslColor): string {
  return colord(hslToHex(color)).isLight() ? '#0a0a0a' : '#ffffff';
}

/** N tints (towards white) and shades (towards black) of a colour, excluding the colour itself. */
export function tintsAndShades(color: HslColor, steps = 4): { tints: string[]; shades: string[] } {
  const base = colord(hslToHex(color));
  const tints: string[] = [];
  const shades: string[] = [];
  for (let i = 1; i <= steps; i++) {
    const ratio = i / (steps + 1);
    tints.push(base.mix('#ffffff', ratio).toHex().toUpperCase());
    shades.push(base.mix('#000000', ratio).toHex().toUpperCase());
  }
  return { tints, shades };
}

export interface WcagResult {
  ratio: number; // e.g. 4.53
  aaNormal: boolean; // >= 4.5
  aaaNormal: boolean; // >= 7
  aaLarge: boolean; // >= 3
  aaaLarge: boolean; // >= 4.5
}

/** WCAG 2.1 contrast ratio + pass/fail levels between two hex colours. */
export function wcag(fgHex: string, bgHex: string): WcagResult {
  const ratio = colord(bgHex).contrast(fgHex);
  return {
    ratio: Math.round(ratio * 100) / 100,
    aaNormal: ratio >= 4.5,
    aaaNormal: ratio >= 7,
    aaLarge: ratio >= 3,
    aaaLarge: ratio >= 4.5,
  };
}
