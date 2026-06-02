<script lang="ts">
  interface Props {
    offsets: number[];
    mono?: boolean;
    size?: number;
  }
  let { offsets, mono = false, size = 22 }: Props = $props();

  const c = size / 2;
  const r = size / 2 - 3;

  function pos(deg: number) {
    // -90 so that 0° sits at the top of the icon
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: c + r * Math.cos(rad), y: c + r * Math.sin(rad) };
  }
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" fill="none" aria-hidden="true">
  <circle cx={c} cy={c} {r} stroke="currentColor" stroke-opacity="0.3" stroke-width="1" />
  {#if mono}
    <circle cx={c} cy={c - r * 0.55} r="1.9" fill="currentColor" fill-opacity="0.6" />
    <circle cx={c} cy={c} r="2.6" fill="currentColor" />
    <circle cx={c} cy={c + r * 0.55} r="1.9" fill="currentColor" fill-opacity="0.6" />
  {:else}
    {#each offsets as off, i}
      {@const p = pos(off)}
      <line
        x1={c}
        y1={c}
        x2={p.x}
        y2={p.y}
        stroke="currentColor"
        stroke-opacity="0.35"
        stroke-width="1"
      />
      <circle cx={p.x} cy={p.y} r={i === 0 ? 2.7 : 2} fill="currentColor" />
    {/each}
  {/if}
</svg>
