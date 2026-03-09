<script lang="ts">
  interface Props {
    label: string;
    size?: number;
  }

  let { label, size = 80 }: Props = $props();

  // FNV-1a 32-bit hash with avalanche finalizer
  function hash(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    // Murmur3-style finalizer — spreads clustered inputs
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b) >>> 0;
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  }

  // Golden-ratio distribution: maps hash to [0, range) with maximal spacing
  function golden(h: number, range: number): number {
    return Math.round((((h / 0x100000000) * 0x9e3779b9) % 1) * range);
  }

  const n = (v: number): string => String(v);

  let display = $derived(label.slice(0, 2).toUpperCase());

  let palette = $derived.by(() => {
    const h = hash(label);
    const h2 = hash(label + 'salt2');
    const h3 = hash(label + 'salt3');

    const hue1 = golden(h, 360);
    const hue2 = (hue1 + 30 + golden(h2, 60)) % 360;
    const sat1 = 65 + golden(h2, 30);
    const sat2 = 70 + golden(h3, 25);
    const lit1 = 38 + golden(h3, 18);
    const lit2 = 28 + golden(h2, 14);
    const angle = golden(h, 160) + 120;

    const c1 = `hsl(${n(hue1)}, ${n(sat1)}%, ${n(lit1)}%)`;
    const c2 = `hsl(${n(hue2)}, ${n(sat2)}%, ${n(lit2)}%)`;
    const outline = `hsl(${n(hue1)}, ${n(sat1)}%, ${n(Math.min(lit1 + 28, 72))}%)`;

    return { c1, c2, angle, outline };
  });

  let r = $derived(size * 0.22);
  let fontSize = $derived(size * 0.36);
  let border = $derived(size * 0.045);

  let wrapStyle = $derived(
    `width:${n(size)}px;height:${n(size)}px;border-radius:${n(r)}px;` +
      `background:linear-gradient(${n(palette.angle)}deg,${palette.c1},${palette.c2});` +
      `box-shadow:0 0 0 ${n(border)}px ${palette.outline}33,0 ${n(size * 0.06)}px ${n(size * 0.18)}px ${palette.c2}66;` +
      `font-size:${n(fontSize)}px`
  );

  let sheenStyle = $derived(`border-radius:${n(r)}px ${n(r)}px 60% 60%`);

  let innerStyle = $derived(
    `inset:${n(border * 0.7)}px;border-radius:${n(r * 0.75)}px;` +
      `border:${n(border * 0.6)}px solid rgba(255,255,255,0.13)`
  );
</script>

<div class="shield" style={wrapStyle} aria-hidden="true">
  <div class="sheen" style={sheenStyle}></div>
  <div class="inner" style={innerStyle}></div>
  <span class="label">{display}</span>
</div>

<style>
  .shield {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }

  .sheen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 52%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.18) 0%,
      rgba(255, 255, 255, 0.04) 100%
    );
    pointer-events: none;
  }

  .inner {
    position: absolute;
    pointer-events: none;
  }

  .label {
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.95);
    letter-spacing: -0.02em;
    line-height: 1;
    user-select: none;
    text-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
    position: relative;
  }
</style>
