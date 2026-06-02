import type { HslColor } from './types';
import { formatColor, hslToHex } from './color';

const hexes = (colors: HslColor[]): string[] => colors.map((c) => hslToHex(c).toUpperCase());

/** Plain newline-separated HEX list. */
export function toHexList(colors: HslColor[]): string {
  return hexes(colors).join('\n');
}

/** CSS custom properties. */
export function toCssVars(colors: HslColor[]): string {
  const lines = hexes(colors).map((hex, i) => `  --color-${i + 1}: ${hex};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

/** Tailwind v3/v4 theme color snippet. */
export function toTailwind(colors: HslColor[]): string {
  const lines = hexes(colors).map((hex, i) => `        'chroma-${i + 1}': '${hex}',`);
  return `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n${lines.join('\n')}\n      },\n    },\n  },\n};`;
}

/** Structured JSON with hex/rgb/hsl per colour. */
export function toJson(colors: HslColor[]): string {
  const data = colors.map((c, i) => ({
    name: `color-${i + 1}`,
    hex: formatColor(c, 'hex'),
    rgb: formatColor(c, 'rgb'),
    hsl: formatColor(c, 'hsl'),
  }));
  return JSON.stringify(data, null, 2);
}

/** Standalone SVG of the palette swatches. */
export function toSvg(colors: HslColor[], w = 600, h = 160): string {
  const list = hexes(colors);
  const seg = w / list.length;
  const rects = list
    .map((hex, i) => {
      const x = i * seg;
      const textColor = isLightHex(hex) ? '#0a0a0a' : '#ffffff';
      const tx = x + seg / 2;
      return (
        `  <rect x="${x.toFixed(2)}" y="0" width="${seg.toFixed(2)}" height="${h}" fill="${hex}"/>\n` +
        `  <text x="${tx.toFixed(2)}" y="${h - 16}" fill="${textColor}" font-family="monospace" font-size="13" text-anchor="middle">${hex}</text>`
      );
    })
    .join('\n');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n${rects}\n</svg>`;
}

function isLightHex(hex: string): boolean {
  const n = hex.replace('#', '');
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  // perceived luminance
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6;
}

// --- downloads ---
export function downloadText(filename: string, content: string, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  triggerDownload(filename, URL.createObjectURL(blob));
}

export function downloadPng(colors: HslColor[], filename = 'chroma-palette.png') {
  const list = hexes(colors);
  const scale = 2;
  const w = 600 * scale;
  const h = 160 * scale;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  const seg = w / list.length;
  ctx.font = `${13 * scale}px monospace`;
  ctx.textAlign = 'center';
  list.forEach((hex, i) => {
    ctx.fillStyle = hex;
    ctx.fillRect(i * seg, 0, seg, h);
    ctx.fillStyle = isLightHex(hex) ? '#0a0a0a' : '#ffffff';
    ctx.fillText(hex, i * seg + seg / 2, h - 16 * scale);
  });
  triggerDownload(filename, canvas.toDataURL('image/png'));
}

function triggerDownload(filename: string, href: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
