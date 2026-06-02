<script lang="ts">
  import autoAnimate from '@formkit/auto-animate';
  import { store } from '../lib/store.svelte';
  import { HARMONIES, HARMONY_MAP } from '../lib/harmonies';
  import {
    toCssVars,
    toTailwind,
    toJson,
    toHexList,
    toSvg,
    downloadPng,
    downloadText,
  } from '../lib/export';
  import type { CodeFormat } from '../lib/types';
  import Swatch from './Swatch.svelte';
  import ContrastChecker from './ContrastChecker.svelte';
  import HarmonyIcon from './HarmonyIcon.svelte';

  const formats: CodeFormat[] = ['hex', 'rgb', 'hsl'];

  let toast = $state<string | null>(null);
  let toastTimer: ReturnType<typeof setTimeout>;
  function flash(msg: string) {
    toast = msg;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast = null), 1400);
  }

  const adjustable = $derived(HARMONY_MAP[store.harmony].adjustable);
  const counts = $derived(HARMONY_MAP[store.harmony].counts ?? []);

  async function copy(text: string, msg: string) {
    try {
      await navigator.clipboard.writeText(text);
      flash(msg);
    } catch {
      flash('No se pudo copiar');
    }
  }

  function share() {
    store.syncUrl();
    copy(store.shareUrl, 'Enlace copiado');
  }
</script>

<div class="panel">
  <!-- Harmony -->
  <section>
    <h2 class="label">Armonía</h2>
    <div class="harmony-grid">
      {#each HARMONIES as h}
        <button
          class="pill tooltip tooltip-bottom"
          class:active={store.harmony === h.id}
          onclick={() => store.setHarmony(h.id)}
          data-tip={h.label}
          aria-label={h.label}
          aria-pressed={store.harmony === h.id}
        >
          <HarmonyIcon offsets={h.offsets} mono={h.id === 'monochromatic'} />
        </button>
      {/each}
    </div>
  </section>

  <!-- Count + lightness -->
  <section class="row">
    {#if adjustable}
      <div class="count">
        <span class="label">Colores</span>
        <div class="count-chips">
          {#each counts as n}
            <button class="chip-btn" class:active={store.count === n} onclick={() => store.setCount(n)}>
              {n}
            </button>
          {/each}
        </div>
      </div>
    {/if}
    <div class="light">
      <span class="label">Luminosidad</span>
      <input
        type="range"
        class="range range-sm"
        min="0"
        max="100"
        value={Math.round(store.base.l)}
        oninput={(e) => store.setBaseLightness(+e.currentTarget.value)}
      />
    </div>
  </section>

  <!-- Swatches -->
  <section>
    <div class="swatch-head">
      <h2 class="label">Paleta</h2>
      <div class="fmt">
        {#each formats as f}
          <button class="fmt-btn" class:active={store.format === f} onclick={() => store.setFormat(f)}>
            {f}
          </button>
        {/each}
      </div>
    </div>
    <div class="swatches" use:autoAnimate>
      {#each store.colors as c, i (i)}
        <Swatch color={c} format={store.format} isBase={i === store.baseIndex} />
      {/each}
    </div>
  </section>

  <!-- Actions -->
  <section class="actions">
    <button
      class="btn btn-random tooltip tooltip-bottom"
      onclick={() => store.randomize()}
      data-tip="Aleatorio"
      aria-label="Aleatorio"
    >
      🎲 <kbd>espacio</kbd>
    </button>
    <button class="btn" onclick={() => store.saveFavorite()}>★ Guardar</button>
    <button class="btn" onclick={share}>🔗 Compartir</button>
  </section>

  <!-- Export -->
  <section>
    <h2 class="label">Exportar</h2>
    <div class="export-grid">
      <button class="exp" onclick={() => copy(toHexList(store.colors), 'HEX copiado')}>HEX</button>
      <button class="exp" onclick={() => copy(toCssVars(store.colors), 'CSS copiado')}>CSS</button>
      <button class="exp" onclick={() => copy(toTailwind(store.colors), 'Tailwind copiado')}>Tailwind</button>
      <button class="exp" onclick={() => copy(toJson(store.colors), 'JSON copiado')}>JSON</button>
      <button class="exp dl" onclick={() => downloadPng(store.colors)}>↓ PNG</button>
      <button class="exp dl" onclick={() => downloadText('chroma-palette.svg', toSvg(store.colors), 'image/svg+xml')}>↓ SVG</button>
    </div>
  </section>

  <!-- Contrast checker -->
  <ContrastChecker />

  <!-- Favorites -->
  {#if store.favorites.length > 0}
    <section>
      <h2 class="label">Favoritos</h2>
      <div class="favs" use:autoAnimate>
        {#each store.favorites as fav, i}
          <div class="fav">
            <button class="fav-strip" title="Cargar paleta" onclick={() => store.loadFavorite(fav)} aria-label="Cargar favorito">
              {#each fav.colors as hex}
                <span style="background:{hex}"></span>
              {/each}
            </button>
            <button class="fav-x" title="Eliminar" onclick={() => store.removeFavorite(i)}>×</button>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if toast}
    <div class="toast">{toast}</div>
  {/if}
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 1.4rem;
    width: 100%;
  }
  .label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
    margin-bottom: 0.55rem;
  }
  .harmony-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }
  .pill {
    width: 46px;
    height: 46px;
    display: grid;
    place-items: center;
    border-radius: 12px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    cursor: pointer;
    transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .pill:hover {
    color: var(--color-text);
    border-color: var(--color-border-strong);
    transform: translateY(-2px);
  }
  .pill:active {
    transform: scale(0.94);
  }
  .pill.active {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }
  .row {
    display: flex;
    gap: 1.2rem;
    align-items: flex-end;
    flex-wrap: wrap;
  }
  .count-chips,
  .fmt {
    display: flex;
    gap: 0.5rem;
  }
  .chip-btn,
  .fmt-btn {
    min-width: 38px;
    padding: 0.35rem 0.7rem;
    border-radius: 8px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 0.78rem;
    text-transform: uppercase;
    transition: all 0.15s ease;
  }
  .chip-btn.active,
  .fmt-btn.active {
    background: var(--color-surface-2);
    color: var(--color-text);
    border-color: var(--color-border-strong);
  }
  .light {
    flex: 1;
    min-width: 160px;
  }
  .light input[type='range'] {
    width: 100%;
    accent-color: var(--color-text);
  }
  .swatch-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .swatches {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-top: 0.85rem;
  }
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .btn {
    flex: 1;
    min-width: 120px;
    padding: 0.6rem 0.8rem;
    border-radius: 10px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    cursor: pointer;
    font-size: 0.82rem;
    transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .btn:hover {
    border-color: var(--color-border-strong);
    transform: translateY(-1px);
  }
  .btn:active {
    transform: scale(0.97);
  }
  .btn.primary {
    background: var(--color-text);
    color: var(--color-bg);
    border-color: var(--color-text);
  }
  .btn-random {
    flex: 0 0 auto;
    min-width: 0;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .btn-random kbd {
    font-size: 0.62rem;
    opacity: 0.6;
    border: 1px solid currentColor;
    border-radius: 5px;
    padding: 0 4px;
  }
  .export-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 0.4rem;
  }
  .exp {
    padding: 0.5rem 0.4rem;
    border-radius: 9px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text-muted);
    cursor: pointer;
    font-size: 0.78rem;
    transition: all 0.15s ease;
  }
  .exp:hover {
    color: var(--color-text);
    border-color: var(--color-border-strong);
    transform: translateY(-1px);
  }
  .exp:active {
    transform: scale(0.96);
  }
  .exp.dl {
    color: var(--color-text-faint);
  }
  .favs {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
    gap: 0.5rem;
  }
  .fav {
    position: relative;
  }
  .fav-strip {
    display: flex;
    width: 100%;
    height: 36px;
    border-radius: 9px;
    overflow: hidden;
    border: 1px solid var(--color-border);
    cursor: pointer;
  }
  .fav-strip span {
    flex: 1;
  }
  .fav-x {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    border-radius: 999px;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border-strong);
    color: var(--color-text-muted);
    font-size: 0.8rem;
    line-height: 1;
    cursor: pointer;
    display: grid;
    place-items: center;
    opacity: 0;
    transition: opacity 0.15s ease;
  }
  .fav:hover .fav-x {
    opacity: 1;
  }
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-text);
    color: var(--color-bg);
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-size: 0.82rem;
    z-index: 50;
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.8);
  }
</style>
