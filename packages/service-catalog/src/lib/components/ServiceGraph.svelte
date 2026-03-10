<script lang="ts">
  import { onMount } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import type { D3ZoomEvent } from 'd3-zoom';
  import { NODE_RADIUS, TYPE_COLORS, DEFAULT_COLOR } from './graph/constants.js';
  import type { LayoutEdge, LayoutResult } from './graph/elk-layout.js';

  interface Props {
    layout: LayoutResult;
    basePath?: string;
    height?: number;
    highlightedNodes?: string[] | undefined;
    lockZoom?: boolean;
  }

  let { layout, basePath = '', height, highlightedNodes, lockZoom = false }: Props = $props();

  let svgEl: SVGSVGElement | undefined = $state();
  let containerEl: HTMLDivElement | undefined = $state();
  let isolatedNodeId = $state<string | null>(null);
  let zoomScale = $state(1);
  let zoomReady = $state(false);

  // Scale pipe strokes so they stay thin when zoomed out
  const pipeWidth = $derived(Math.min(5, 2 + 3 * zoomScale));
  const antsWidth = $derived(Math.min(3, 1 + 2 * zoomScale));

  // Compute which nodes/edges are visible when isolating
  const isolatedSet = $derived.by(() => {
    const id = isolatedNodeId;
    if (id === null) return null;
    const connectedIds = new SvelteSet<string>([id]);
    for (const e of layout.edges) {
      if (e.source === id || e.target === id) {
        connectedIds.add(e.source);
        connectedIds.add(e.target);
      }
    }
    return connectedIds;
  });

  const nodeNameMap = $derived(new Map(layout.nodes.map((n) => [n.id, n.name])));

  function nodeTooltip(node: { id: string; name: string; type?: string }): string {
    const label = node.type ? node.type.replace(/-/g, ' ') : 'service';
    return `${node.name}\n${label}`;
  }

  function edgeTooltip(edge: LayoutEdge): string {
    const src = nodeNameMap.get(edge.source) ?? edge.source;
    const tgt = nodeNameMap.get(edge.target) ?? edge.target;
    const arrow = edge.access === 'rw' ? '\u2194' : '\u2192';
    const header = `${src} ${arrow} ${tgt}`;
    return edge.description ? `${header}\n${edge.description}` : header;
  }

  const hasHighlight = $derived(highlightedNodes !== undefined && highlightedNodes.length > 0);
  const highlightSet = $derived(hasHighlight ? new Set(highlightedNodes) : null);

  function nodeColor(type?: string) {
    if (type && type in TYPE_COLORS) return TYPE_COLORS[type] ?? DEFAULT_COLOR;
    return DEFAULT_COLOR;
  }

  // Map node id -> type for edge coloring
  const nodeTypeMap = $derived(new Map(layout.nodes.map((n) => [n.id, n.type])));

  function edgeColorForTarget(targetId: string): string {
    const type = nodeTypeMap.get(targetId);
    if (type && type in TYPE_COLORS) return (TYPE_COLORS[type] ?? DEFAULT_COLOR).stroke;
    return DEFAULT_COLOR.stroke;
  }

  function nodeHref(node: { id: string; type?: string }): string {
    const prefix = basePath.replace(/\/$/, '');
    const segment = node.type === 'data-store' ? 'data-stores' : 'services';
    return `${prefix}/${segment}/${node.id}`;
  }

  const BEND_RADIUS = 10;
  const ARROW_MARKER_PX = 16;
  const PIPE_END_CLEARANCE = ARROW_MARKER_PX;

  function edgePath(
    edge: LayoutEdge,
    { start = 0, end = 0 }: { start?: number; end?: number } = {}
  ): string {
    const pts = edge.points;
    if (pts.length < 2) return '';
    const first0 = pts[0] as { x: number; y: number };
    // Shorten start for bidirectional edges
    let first = first0;
    if (start > 0 && edge.access === 'rw' && pts.length >= 2) {
      const second = pts[1] as { x: number; y: number };
      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > start) {
        const ratio = start / len;
        first = { x: first.x + dx * ratio, y: first.y + dy * ratio };
      }
    }
    let d = `M ${String(first.x)} ${String(first.y)}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const prev = pts[i - 1] as { x: number; y: number };
      const curr = pts[i] as { x: number; y: number };
      const next = pts[i + 1] as { x: number; y: number };
      const r = BEND_RADIUS;
      const dx1 = Math.sign(curr.x - prev.x) * Math.min(r, Math.abs(curr.x - prev.x) / 2);
      const dy1 = Math.sign(curr.y - prev.y) * Math.min(r, Math.abs(curr.y - prev.y) / 2);
      const dx2 = Math.sign(next.x - curr.x) * Math.min(r, Math.abs(next.x - curr.x) / 2);
      const dy2 = Math.sign(next.y - curr.y) * Math.min(r, Math.abs(next.y - curr.y) / 2);
      d += ` L ${String(curr.x - dx1)} ${String(curr.y - dy1)}`;
      d += ` Q ${String(curr.x)} ${String(curr.y)} ${String(curr.x + dx2)} ${String(curr.y + dy2)}`;
    }
    // Shorten endpoint
    const last = pts[pts.length - 1] as { x: number; y: number };
    const prev = pts[pts.length - 2] as { x: number; y: number };
    const segDx = last.x - prev.x;
    const segDy = last.y - prev.y;
    const segLen = Math.sqrt(segDx * segDx + segDy * segDy);
    if (end > 0 && segLen > end) {
      const ratio = (segLen - end) / segLen;
      d += ` L ${String(prev.x + segDx * ratio)} ${String(prev.y + segDy * ratio)}`;
    } else {
      d += ` L ${String(last.x)} ${String(last.y)}`;
    }
    return d;
  }

  function isDimmed(nodeId: string): boolean {
    if (isolatedSet) return !isolatedSet.has(nodeId);
    return highlightSet !== null && !highlightSet.has(nodeId);
  }

  function isEdgeDimmed(edge: LayoutEdge): boolean {
    if (isolatedSet) return !isolatedSet.has(edge.source) || !isolatedSet.has(edge.target);
    if (!highlightSet) return false;
    return !highlightSet.has(edge.source) || !highlightSet.has(edge.target);
  }

  function toggleIsolate(nodeId: string) {
    isolatedNodeId = isolatedNodeId === nodeId ? null : nodeId;
  }

  onMount(async () => {
    if (typeof window === 'undefined') return;

    const d3Selection = await import('d3-selection');
    const d3Zoom = await import('d3-zoom');

    if (!svgEl) return;

    const svg = d3Selection.select(svgEl);
    const g = svg.select<SVGGElement>('g.graph-content');

    // Zoom/pan
    const zoom = d3Zoom
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 3])
      .filter((event) => (lockZoom ? event.type !== 'wheel' : true))
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', String(event.transform));
        zoomScale = event.transform.k;
      });

    svg.call(zoom);

    // Fit initial view
    if (containerEl) {
      const containerWidth = containerEl.clientWidth;
      const containerHeight =
        containerEl.clientHeight > 0 ? containerEl.clientHeight : (height ?? 600);
      const padding = 40;
      const scaleX = (containerWidth - padding * 2) / layout.width;
      const scaleY = (containerHeight - padding * 2) / layout.height;
      const scale = Math.min(scaleX, scaleY, 1);
      const tx = (containerWidth - layout.width * scale) / 2;
      const ty = (containerHeight - layout.height * scale) / 2;
      svg.call((s) => {
        zoom.transform(s, d3Zoom.zoomIdentity.translate(tx, ty).scale(scale));
      });
    }

    zoomReady = true;
  });
</script>

<div
  bind:this={containerEl}
  class="service-graph"
  style="width:100%;height:{height ? `${String(height)}px` : '100%'};overflow:hidden;"
>
  <svg
    bind:this={svgEl}
    width="100%"
    height="100%"
    style="cursor:grab;opacity:{zoomReady ? 1 : 0};"
  >
    <defs>
      <!-- Arrow markers per node type (fixed size, edges colored by target) -->
      {#each Object.entries(TYPE_COLORS) as [type, color] (type)}
        <marker
          id="arrow-{type}"
          viewBox="0 0 10 7"
          refX="10"
          refY="3.5"
          markerWidth="16"
          markerHeight="12"
          markerUnits="userSpaceOnUse"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={color.stroke} />
        </marker>
        <marker
          id="arrow-{type}-start"
          viewBox="0 0 10 7"
          refX="10"
          refY="3.5"
          markerWidth="16"
          markerHeight="12"
          markerUnits="userSpaceOnUse"
          orient="auto-start-reverse"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill={color.stroke} />
        </marker>
      {/each}
      <!-- Default arrow -->
      <marker
        id="arrow-default"
        viewBox="0 0 10 7"
        refX="10"
        refY="3.5"
        markerWidth="12"
        markerHeight="9"
        markerUnits="userSpaceOnUse"
        orient="auto"
      >
        <polygon points="0 0, 10 3.5, 0 7" fill={DEFAULT_COLOR.stroke} />
      </marker>
    </defs>

    <g class="graph-content">
      <!-- Edge pipes -->
      {#each layout.edges as edge (edge.id)}
        <g class="edge-group" opacity={isEdgeDimmed(edge) ? 0.15 : 0.8}>
          <!-- Hit area -->
          <path d={edgePath(edge)} fill="none" stroke="transparent" stroke-width="14">
            <title>{edgeTooltip(edge)}</title>
          </path>
          <!-- Pipe outline -->
          <path
            class="edge-pipe"
            d={edgePath(edge, { start: PIPE_END_CLEARANCE, end: PIPE_END_CLEARANCE })}
            fill="none"
            stroke={edgeColorForTarget(edge.target)}
            stroke-width={pipeWidth}
            stroke-linecap="round"
            pointer-events="none"
          />
          <!-- Marching ants inside -->
          <path
            class="edge-ants"
            d={edgePath(edge, { start: PIPE_END_CLEARANCE, end: PIPE_END_CLEARANCE })}
            fill="none"
            stroke="white"
            stroke-width={antsWidth}
            stroke-linecap="butt"
            stroke-dasharray="10 5"
            pointer-events="none"
          />
        </g>
      {/each}

      <!-- Nodes -->
      {#each layout.nodes as node (node.id)}
        {@const color = nodeColor(node.type)}
        {@const isDataStore = node.type === 'data-store'}
        {@const ry = isDataStore ? 8 : 0}
        <g
          class="node"
          data-node-id={node.id}
          data-isolated={isolatedNodeId === node.id ? '' : undefined}
          transform="translate({node.x}, {node.y})"
          style="cursor:pointer;"
          opacity={isDimmed(node.id) ? 0.2 : 1}
        >
          <!-- Isolate icon -->
          <!-- svelte-ignore a11y_click_events_have_key_events -->
          <!-- svelte-ignore a11y_no_static_element_interactions -->
          <g
            class="node-actions icon-btn"
            transform="translate({node.width - 20}, {-18})"
            onclick={(e: MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              toggleIsolate(node.id);
            }}
          >
            <rect
              x="0"
              y="0"
              width="18"
              height="18"
              rx="3"
              fill="white"
              stroke="#94a3b8"
              stroke-width="1"
            />
            <path
              d={isolatedNodeId === node.id
                ? 'M 3 9 L 5.5 6.5 L 9 9 L 12.5 6.5 L 15 9 M 3 12 L 5.5 9.5 L 9 12 L 12.5 9.5 L 15 12'
                : 'M 9 4.5 C 5 4.5 2 9 2 9 C 2 9 5 13.5 9 13.5 C 13 13.5 16 9 16 9 C 16 9 13 4.5 9 4.5 Z M 9 7 A 2 2 0 1 1 9 11 A 2 2 0 1 1 9 7'}
              fill="none"
              stroke={isolatedNodeId === node.id ? '#3b82f6' : '#64748b'}
              stroke-width="1"
            />
            <title>{isolatedNodeId === node.id ? 'Show all' : 'Isolate'}</title>
          </g>
          <a href={nodeHref(node)}>
            <title>{nodeTooltip(node)}</title>
            {#if isDataStore}
              <!-- Cylinder shape for data stores -->
              <path
                d="M 0 {ry}
                   A {node.width / 2} {ry} 0 0 1 {node.width} {ry}
                   L {node.width} {node.height - ry}
                   A {node.width / 2} {ry} 0 0 1 0 {node.height - ry}
                   Z"
                fill={color.bg}
                stroke={color.stroke}
                stroke-width="1.5"
              />
              <ellipse
                cx={node.width / 2}
                cy={ry}
                rx={node.width / 2}
                {ry}
                fill={color.bg}
                stroke={color.stroke}
                stroke-width="1.5"
              />
            {:else}
              <rect
                width={node.width}
                height={node.height}
                rx={NODE_RADIUS}
                ry={NODE_RADIUS}
                fill={color.bg}
                stroke={color.stroke}
                stroke-width="1.5"
              />
            {/if}
            <text
              x={node.width / 2}
              y={node.height / 2 + (isDataStore ? 4 : 0)}
              text-anchor="middle"
              dominant-baseline="central"
              fill={color.text}
              font-size="11"
              font-weight="500"
              pointer-events="none"
            >
              {node.name.length > 20 ? node.name.slice(0, 18) + '...' : node.name}
            </text>
          </a>
        </g>
      {/each}

      <!-- Edge arrowheads (rendered above nodes) -->
      {#each layout.edges as edge (`${edge.id}-arrow`)}
        {@const targetType = nodeTypeMap.get(edge.target)}
        {@const markerType = targetType && targetType in TYPE_COLORS ? targetType : 'default'}
        <path
          d={edgePath(edge)}
          fill="none"
          stroke="none"
          marker-end="url(#arrow-{markerType})"
          marker-start={edge.access === 'rw' ? `url(#arrow-${markerType}-start)` : undefined}
          opacity={isEdgeDimmed(edge) ? 0.15 : 0.8}
          pointer-events="none"
        />
      {/each}
    </g>
  </svg>
</div>

<style>
  @keyframes march {
    to {
      stroke-dashoffset: -15;
    }
  }

  .service-graph :global(.edge-ants) {
    animation: march 0.6s linear infinite;
  }

  .service-graph :global(.edge-group:hover .edge-pipe) {
    stroke-width: 7;
  }

  .service-graph :global(.edge-group:hover .edge-ants) {
    stroke-width: 5;
  }

  .service-graph :global(.node-actions) {
    opacity: 0;
    transition: opacity 0.15s;
  }

  .service-graph :global(.node:hover .node-actions),
  .service-graph :global(.node[data-isolated] .node-actions) {
    opacity: 1;
  }

  .service-graph :global(.icon-btn:hover rect) {
    fill: #f1f5f9;
    stroke: #3b82f6;
  }
</style>
