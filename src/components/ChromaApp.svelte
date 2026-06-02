<script lang="ts">
  import { store } from '../lib/store.svelte';
  import ColorWheel from './ColorWheel.svelte';
  import PalettePanel from './PalettePanel.svelte';

  store.init();

  function onKeydown(e: KeyboardEvent) {
    if (e.code !== 'Space') return;
    const t = e.target as HTMLElement;
    const tag = t?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || t?.isContentEditable) return;
    e.preventDefault();
    store.randomize();
  }

  // Keep the URL in sync with the current palette (shareable / bookmarkable).
  $effect(() => {
    void store.colors;
    void store.harmony;
    store.syncUrl();
  });
</script>

<svelte:window onkeydown={onKeydown} />

<div class="layout">
  <div class="wheel-col">
    <ColorWheel />
    <p class="hint">Arrastra el marcador <strong>base</strong> para mover toda la paleta · arrastra cualquier otro para afinarlo</p>
  </div>
  <aside class="panel-col">
    <PalettePanel />
  </aside>
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 3rem;
    align-items: start;
    max-width: 1100px;
    margin-inline: auto;
    padding: 1rem 1.5rem 4rem;
  }
  .wheel-col {
    position: sticky;
    top: 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  .hint {
    font-size: 0.75rem;
    color: var(--color-text-faint);
    text-align: center;
    max-width: 320px;
    line-height: 1.5;
  }
  .hint strong {
    color: var(--color-text-muted);
  }
  @media (max-width: 860px) {
    .layout {
      grid-template-columns: 1fr;
      gap: 2rem;
    }
    .wheel-col {
      position: static;
    }
  }
</style>
