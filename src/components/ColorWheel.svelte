<script lang="ts">
  import { store } from '../lib/store.svelte';
  import type { HslColor } from '../lib/types';
  import { clamp } from '../lib/color';

  let canvas: HTMLCanvasElement;
  let wrapper: HTMLDivElement;
  let size = $state(380);
  let dragging = $state<number | null>(null);

  // The disc is built once per size (heavy per-pixel work) at a reference
  // lightness; the actual lightness is applied as a cheap overlay each frame.
  let discCache: { px: number; canvas: HTMLCanvasElement } | null = null;
  const DISC_L = 50; // reference lightness the disc is rendered at

  const RING = 14; // marker radius in px
  const dpr = () => (typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);

  function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    s /= 100;
    l /= 100;
    const k = (n: number) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number) =>
      l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
  }

  function buildDisc(px: number): HTMLCanvasElement {
    const off = document.createElement('canvas');
    off.width = px;
    off.height = px;
    const octx = off.getContext('2d')!;
    const img = octx.createImageData(px, px);
    const data = img.data;
    const r = px / 2;
    for (let y = 0; y < px; y++) {
      for (let x = 0; x < px; x++) {
        const dx = x - r;
        const dy = y - r;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const idx = (y * px + x) * 4;
        if (dist > r) {
          data[idx + 3] = 0;
          continue;
        }
        let angle = Math.atan2(dy, dx) * (180 / Math.PI); // -180..180, 0 = +x
        const hue = (angle + 360) % 360;
        const sat = clamp((dist / r) * 100, 0, 100);
        const [rr, gg, bb] = hslToRgb(hue, sat, DISC_L);
        data[idx] = rr;
        data[idx + 1] = gg;
        data[idx + 2] = bb;
        // soft anti-aliased edge
        data[idx + 3] = dist > r - 1.5 ? Math.round(255 * (r - dist) / 1.5) : 255;
      }
    }
    octx.putImageData(img, 0, 0);
    return off;
  }

  function markerPos(c: HslColor, r: number): { x: number; y: number } {
    const rad = (c.h * Math.PI) / 180;
    const dist = (c.s / 100) * r;
    return { x: r + Math.cos(rad) * dist, y: r + Math.sin(rad) * dist };
  }

  function draw() {
    if (!canvas) return;
    const px = Math.round(size * dpr());
    const ctx = canvas.getContext('2d')!;
    canvas.width = px;
    canvas.height = px;

    const r = px / 2;

    // Build the disc only when the size changes (expensive); cache otherwise.
    if (!discCache || discCache.px !== px) {
      discCache = { px, canvas: buildDisc(px) };
    }
    ctx.clearRect(0, 0, px, px);
    ctx.drawImage(discCache.canvas, 0, 0);

    // Apply the current lightness as a cheap white/black overlay (clipped to disc).
    const l = store.base.l;
    if (l !== DISC_L) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(r, r, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle =
        l > DISC_L
          ? `rgba(255,255,255,${(l - DISC_L) / (100 - DISC_L)})`
          : `rgba(0,0,0,${(DISC_L - l) / DISC_L})`;
      ctx.fillRect(0, 0, px, px);
      ctx.restore();
    }
    store.colors.forEach((c, i) => {
      const { x, y } = markerPos(c, r);
      const isBase = i === store.baseIndex;
      const rad = (isBase ? RING + 4 : RING) * dpr();
      // halo
      ctx.beginPath();
      ctx.arc(x, y, rad + 3 * dpr(), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.fill();
      // fill
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${c.h} ${c.s}% ${c.l}%)`;
      ctx.fill();
      // ring
      ctx.lineWidth = (isBase ? 3 : 2) * dpr();
      ctx.strokeStyle = '#fff';
      ctx.stroke();
      if (isBase) {
        ctx.lineWidth = 1 * dpr();
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.arc(x, y, rad + 1.5 * dpr(), 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  function colorFromEvent(e: PointerEvent, keepL: number): HslColor {
    const rect = canvas.getBoundingClientRect();
    const r = rect.width / 2;
    const dx = e.clientX - rect.left - r;
    const dy = e.clientY - rect.top - r;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const hue = (Math.atan2(dy, dx) * (180 / Math.PI) + 360) % 360;
    const sat = clamp((dist / r) * 100, 0, 100);
    return { h: hue, s: sat, l: keepL };
  }

  function hitTest(e: PointerEvent): number | null {
    const rect = canvas.getBoundingClientRect();
    const r = rect.width / 2;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    let best: { i: number; d: number } | null = null;
    store.colors.forEach((c, i) => {
      const p = markerPos(c, r);
      const d = Math.hypot(mx - p.x, my - p.y);
      const hitR = (i === store.baseIndex ? RING + 6 : RING + 4);
      if (d <= hitR && (!best || d < best.d)) best = { i, d };
    });
    return best ? best.i : null;
  }

  function withinDisc(e: PointerEvent): boolean {
    const rect = canvas.getBoundingClientRect();
    const r = rect.width / 2;
    const dx = e.clientX - rect.left - r;
    const dy = e.clientY - rect.top - r;
    return Math.hypot(dx, dy) <= r;
  }

  function onPointerDown(e: PointerEvent) {
    const hit = hitTest(e);
    if (hit !== null) {
      // grabbed an existing marker (base moves all, others fine-tune)
      dragging = hit;
    } else {
      // clicked empty space inside the disc → jump the base here and drag it
      if (!withinDisc(e)) return;
      dragging = store.baseIndex;
      store.updateColor(store.baseIndex, colorFromEvent(e, store.base.l));
    }
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
  }

  function onPointerMove(e: PointerEvent) {
    if (dragging === null) return;
    const keepL = store.colors[dragging].l;
    store.updateColor(dragging, colorFromEvent(e, keepL));
  }

  function onPointerUp(e: PointerEvent) {
    if (dragging === null) return;
    dragging = null;
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch {}
  }

  // Redraw whenever colours or size change.
  $effect(() => {
    void store.colors;
    void size;
    draw();
  });

  $effect(() => {
    if (!wrapper) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      size = Math.max(220, Math.min(440, Math.floor(w)));
    });
    ro.observe(wrapper);
    return () => ro.disconnect();
  });
</script>

<div bind:this={wrapper} class="wheel-wrap no-select">
  <canvas
    bind:this={canvas}
    style="width:{size}px;height:{size}px"
    class="wheel"
    class:grabbing={dragging !== null}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
  ></canvas>
</div>

<style>
  .wheel-wrap {
    width: 100%;
    max-width: 460px;
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    margin-inline: auto;
  }
  .wheel {
    border-radius: 9999px;
    touch-action: none;
    cursor: grab;
    box-shadow:
      0 0 0 1px var(--color-border-strong),
      0 30px 80px -20px rgba(0, 0, 0, 0.8);
    transition: box-shadow 0.25s ease;
  }
  .wheel.grabbing {
    cursor: grabbing;
  }
</style>
