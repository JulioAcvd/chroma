<script lang="ts">
  import { store } from '../lib/store.svelte';
  import { hslToHex, wcag } from '../lib/color';

  // Foreground = a palette colour (by index); background = palette colour or a fixed option.
  let fgIdx = $state(0);
  let bgHex = $state('#0A0A0A');

  const paletteHexes = $derived(store.colors.map((c) => hslToHex(c).toUpperCase()));
  const fixed = [
    { label: 'Fondo app', hex: '#0A0A0A' },
    { label: 'Blanco', hex: '#FFFFFF' },
    { label: 'Negro', hex: '#000000' },
  ];

  const safeFg = $derived(Math.min(fgIdx, paletteHexes.length - 1));
  const fg = $derived(paletteHexes[safeFg] ?? '#FFFFFF');
  const result = $derived(wcag(fg, bgHex));
</script>

<section class="checker">
  <h2 class="label">Contraste (WCAG)</h2>

  <div class="selectors">
    <label>
      <span>Texto</span>
      <select bind:value={fgIdx}>
        {#each paletteHexes as hex, i}
          <option value={i}>Color {i + 1} · {hex}</option>
        {/each}
      </select>
    </label>
    <label>
      <span>Fondo</span>
      <select bind:value={bgHex}>
        <optgroup label="Paleta">
          {#each paletteHexes as hex, i}
            <option value={hex}>Color {i + 1} · {hex}</option>
          {/each}
        </optgroup>
        <optgroup label="Fijos">
          {#each fixed as f}
            <option value={f.hex}>{f.label} · {f.hex}</option>
          {/each}
        </optgroup>
      </select>
    </label>
  </div>

  <div class="result">
    <div class="preview" style="background:{bgHex};color:{fg}">
      <span class="big">Aa</span>
      <span class="small">Texto de ejemplo 123</span>
    </div>
    <div class="score">
      <div class="ratio">{result.ratio.toFixed(2)}<span>:1</span></div>
      <div class="badges">
        <span class="badge" class:pass={result.aaNormal}>AA</span>
        <span class="badge" class:pass={result.aaaNormal}>AAA</span>
        <span class="badge" class:pass={result.aaLarge}>AA grande</span>
        <span class="badge" class:pass={result.aaaLarge}>AAA grande</span>
      </div>
    </div>
  </div>
</section>

<style>
  .label {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--color-text-muted);
    margin-bottom: 0.55rem;
  }
  .selectors {
    display: flex;
    gap: 0.6rem;
    margin-bottom: 0.7rem;
  }
  .selectors label {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .selectors span {
    font-size: 0.7rem;
    color: var(--color-text-faint);
  }
  select {
    width: 100%;
    padding: 0.45rem 0.5rem;
    border-radius: 9px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    font-size: 0.78rem;
    cursor: pointer;
  }
  .result {
    display: flex;
    gap: 0.8rem;
    align-items: stretch;
  }
  .preview {
    flex: 1;
    border-radius: 12px;
    border: 1px solid var(--color-border);
    padding: 0.8rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.2rem;
    min-height: 92px;
  }
  .preview .big {
    font-size: 1.7rem;
    line-height: 1;
  }
  .preview .small {
    font-size: 0.82rem;
    opacity: 0.95;
  }
  .score {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .ratio {
    font-size: 1.9rem;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }
  .ratio span {
    font-size: 0.9rem;
    color: var(--color-text-faint);
  }
  .badges {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35rem;
  }
  .badge {
    font-size: 0.68rem;
    text-align: center;
    padding: 0.3rem 0.2rem;
    border-radius: 7px;
    border: 1px solid var(--color-border);
    background: var(--color-surface);
    color: var(--color-text-faint);
    position: relative;
  }
  .badge.pass {
    border-color: #2f7d4f;
    background: rgba(47, 125, 79, 0.18);
    color: #6ee7a0;
  }
  .badge::before {
    content: '✕ ';
    opacity: 0.7;
  }
  .badge.pass::before {
    content: '✓ ';
  }
</style>
