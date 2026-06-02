import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const BG = '#0a0a0a';

/** Build a colour-wheel SVG. `scale` shrinks the wheel for maskable safe zone. */
function wheelSvg(size, scale = 1) {
  const c = size / 2;
  const r = (size / 2) * 0.9 * scale;
  const segments = 36;
  const wedges = [];
  for (let i = 0; i < segments; i++) {
    const a0 = (i / segments) * Math.PI * 2;
    const a1 = ((i + 1) / segments) * Math.PI * 2 + 0.02; // slight overlap, no seams
    const x0 = c + r * Math.cos(a0);
    const y0 = c + r * Math.sin(a0);
    const x1 = c + r * Math.cos(a1);
    const y1 = c + r * Math.sin(a1);
    const hue = (i + 0.5) * (360 / segments);
    wedges.push(
      `<path d="M${c} ${c} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r.toFixed(2)} ${r.toFixed(
        2,
      )} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z" fill="hsl(${hue}, 80%, 55%)"/>`,
    );
  }
  // inner dark hole for a cleaner "wheel" look
  const inner = r * 0.42;
  const radius = size * 0.22;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/>
  <g>${wedges.join('')}</g>
  <circle cx="${c}" cy="${c}" r="${inner.toFixed(2)}" fill="${BG}"/>
</svg>`;
}

const targets = [
  { name: 'pwa-192x192.png', size: 192, scale: 1 },
  { name: 'pwa-512x512.png', size: 512, scale: 1 },
  { name: 'pwa-maskable-512x512.png', size: 512, scale: 0.78 },
  { name: 'apple-touch-icon.png', size: 180, scale: 1 },
];

for (const t of targets) {
  const svg = wheelSvg(t.size, t.scale);
  await sharp(Buffer.from(svg)).png().toFile(join(publicDir, t.name));
  console.log('generated', t.name);
}
