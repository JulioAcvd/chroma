import type { CodeFormat, HarmonyId, HslColor } from './types';
import { clamp, clampHue, hexToHsl, hslToHex } from './color';
import { HARMONY_MAP, computePalette, resolveCount } from './harmonies';
import { decodeState, encodeState } from './url';

// #6366F1 indigo ≈ hsl(239, 84%, 67%)
const DEFAULT_BASE: HslColor = { h: 239, s: 84, l: 67 };

interface FavoriteEntry {
  harmony: HarmonyId;
  colors: string[]; // hex
}

const FAV_KEY = 'chroma:favorites';

class ChromaStore {
  colors = $state<HslColor[]>([]);
  harmony = $state<HarmonyId>('analogous');
  count = $state<number>(4);
  format = $state<CodeFormat>('hex');
  favorites = $state<FavoriteEntry[]>([]);

  /** Index of the base marker — always 0. */
  readonly baseIndex = 0;

  init() {
    const { harmony, colors } = typeof window !== 'undefined'
      ? decodeState(window.location.search)
      : { harmony: null, colors: null };

    if (harmony && colors) {
      this.harmony = harmony;
      this.colors = colors;
      this.count = colors.length;
    } else {
      this.harmony = 'analogous';
      this.count = resolveCount(HARMONY_MAP.analogous);
      this.colors = computePalette(DEFAULT_BASE, this.harmony, this.count);
    }

    this.loadFavorites();
  }

  get base(): HslColor {
    return this.colors[this.baseIndex] ?? DEFAULT_BASE;
  }

  /** Recompute the whole palette from the current base, harmony and count. */
  private regenerate(base: HslColor = this.base) {
    this.colors = computePalette(base, this.harmony, this.count);
  }

  setHarmony(id: HarmonyId) {
    this.harmony = id;
    this.count = resolveCount(HARMONY_MAP[id], this.count);
    this.regenerate();
  }

  setCount(n: number) {
    const def = HARMONY_MAP[this.harmony];
    if (!def.adjustable) return;
    this.count = resolveCount(def, n);
    this.regenerate();
  }

  /** Rigidly move the whole palette by the delta implied by a new base colour. */
  moveBase(next: HslColor) {
    const cur = this.base;
    const dh = next.h - cur.h;
    const ds = next.s - cur.s;
    const dl = next.l - cur.l;
    this.colors = this.colors.map((c, i) =>
      i === this.baseIndex
        ? { h: clampHue(next.h), s: clamp(next.s, 0, 100), l: clamp(next.l, 0, 100) }
        : {
            h: clampHue(c.h + dh),
            s: clamp(c.s + ds, 0, 100),
            l: clamp(c.l + dl, 0, 100),
          },
    );
  }

  /** Edit a single marker (fine-tuning, breaks strict harmony on purpose). */
  updateColor(index: number, next: HslColor) {
    if (index === this.baseIndex) {
      this.moveBase(next);
      return;
    }
    this.colors = this.colors.map((c, i) =>
      i === index
        ? { h: clampHue(next.h), s: clamp(next.s, 0, 100), l: clamp(next.l, 0, 100) }
        : c,
    );
  }

  /** Global lightness slider — shifts every colour by the same delta. */
  setBaseLightness(l: number) {
    const dl = clamp(l, 0, 100) - this.base.l;
    this.colors = this.colors.map((c) => ({ ...c, l: clamp(c.l + dl, 0, 100) }));
  }

  randomize() {
    const base: HslColor = {
      h: Math.floor(Math.random() * 360),
      s: 55 + Math.floor(Math.random() * 35), // 55..90
      l: 45 + Math.floor(Math.random() * 25), // 45..70
    };
    this.regenerate(base);
  }

  setFormat(fmt: CodeFormat) {
    this.format = fmt;
  }

  get shareUrl(): string {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}${encodeState(this.harmony, this.colors)}`;
  }

  syncUrl() {
    if (typeof window === 'undefined') return;
    const qs = encodeState(this.harmony, this.colors);
    window.history.replaceState(null, '', qs);
  }

  // --- favorites (localStorage) ---
  private loadFavorites() {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(FAV_KEY);
      this.favorites = raw ? (JSON.parse(raw) as FavoriteEntry[]) : [];
    } catch {
      this.favorites = [];
    }
  }

  private persistFavorites() {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(FAV_KEY, JSON.stringify(this.favorites));
  }

  saveFavorite() {
    const entry: FavoriteEntry = {
      harmony: this.harmony,
      colors: this.colors.map((c) => hslToHex(c).toUpperCase()),
    };
    // de-dupe identical palettes
    const key = JSON.stringify(entry);
    if (this.favorites.some((f) => JSON.stringify(f) === key)) return;
    this.favorites = [entry, ...this.favorites].slice(0, 24);
    this.persistFavorites();
  }

  removeFavorite(index: number) {
    this.favorites = this.favorites.filter((_, i) => i !== index);
    this.persistFavorites();
  }

  loadFavorite(entry: FavoriteEntry) {
    this.harmony = entry.harmony;
    this.colors = entry.colors.map((hex) => hexToHsl(hex));
    this.count = this.colors.length;
  }
}

export const store = new ChromaStore();
export type { FavoriteEntry };
