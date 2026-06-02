<script lang="ts">
  import { scale } from 'svelte/transition';
  import { backOut } from 'svelte/easing';
  import autoAnimate from '@formkit/auto-animate';
  import type { CodeFormat, HslColor } from '../lib/types';
  import { formatColor, readableTextOn, tintsAndShades } from '../lib/color';

  interface Props {
    color: HslColor;
    format: CodeFormat;
    isBase?: boolean;
  }
  let { color, format, isBase = false }: Props = $props();

  let copied = $state(false);
  let expanded = $state(false);
  let copyTimer: ReturnType<typeof setTimeout>;

  const code = $derived(formatColor(color, format));
  const fg = $derived(readableTextOn(color));
  const ramp = $derived(tintsAndShades(color, 3));

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => (copied = false), 1100);
    } catch {}
  }
</script>

<div class="swatch-card">
  <button
    class="swatch no-select"
    style="background:{formatColor(color, 'hex')};color:{fg}"
    onclick={() => copy(code)}
    title="Copiar {code}"
  >
    {#if isBase}<span class="badge" style="border-color:{fg}">base</span>{/if}
    <span class="code">
      {#if copied}
        <span in:scale={{ duration: 260, easing: backOut, start: 0.4 }}>✓ copiado</span>
      {:else}
        {code}
      {/if}
    </span>
  </button>

  <button class="expand" onclick={() => (expanded = !expanded)} title="Tints & shades">
    {expanded ? '–' : '+'}
  </button>

  {#if expanded}
    <div class="ramp" use:autoAnimate transition:scale={{ duration: 200, start: 0.9 }}>
      {#each [...ramp.shades].reverse() as s}
        <button class="chip" style="background:{s}" title="Copiar {s}" onclick={() => copy(s)} aria-label={s}></button>
      {/each}
      <button class="chip current" style="background:{formatColor(color, 'hex')}" title="Copiar {formatColor(color, 'hex')}" onclick={() => copy(formatColor(color, 'hex'))} aria-label="actual"></button>
      {#each ramp.tints as t}
        <button class="chip" style="background:{t}" title="Copiar {t}" onclick={() => copy(t)} aria-label={t}></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .swatch-card {
    position: relative;
  }
  .swatch {
    position: relative;
    width: 100%;
    height: 64px;
    border-radius: 12px;
    border: 1px solid var(--color-border);
    display: flex;
    align-items: flex-end;
    justify-content: flex-start;
    padding: 8px 10px;
    cursor: pointer;
    transition:
      transform 0.16s cubic-bezier(0.34, 1.56, 0.64, 1),
      box-shadow 0.16s ease;
  }
  .swatch:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 30px -12px rgba(0, 0, 0, 0.7);
  }
  .swatch:active {
    transform: translateY(0) scale(0.98);
  }
  .code {
    font-size: 0.78rem;
    letter-spacing: 0.02em;
    font-variant-numeric: tabular-nums;
    text-transform: uppercase;
    opacity: 0.95;
  }
  .badge {
    position: absolute;
    top: 8px;
    left: 10px;
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    border: 1px solid;
    border-radius: 999px;
    padding: 1px 7px;
    opacity: 0.8;
  }
  .expand {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    border-radius: 7px;
    background: rgba(10, 10, 10, 0.35);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.25);
    line-height: 1;
    cursor: pointer;
    display: grid;
    place-items: center;
    font-size: 1rem;
  }
  .ramp {
    display: flex;
    gap: 4px;
    margin-top: 6px;
  }
  .chip {
    flex: 1;
    height: 22px;
    border-radius: 6px;
    border: 1px solid var(--color-border);
    cursor: pointer;
  }
  .chip.current {
    outline: 2px solid var(--color-text);
    outline-offset: 1px;
  }
</style>
