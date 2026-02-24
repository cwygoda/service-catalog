<script lang="ts">
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-floating-promises, @typescript-eslint/no-non-null-assertion, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unnecessary-condition, no-undef */
  // D3.js is dynamically imported and has complex typing that doesn't play well with strict TS
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';

  interface GraphNode {
    id: string;
    name: string;
    domain?: string;
  }

  interface GraphEdge {
    source: string;
    target: string;
    type: 'http' | 'event';
  }

  interface Props {
    nodes: GraphNode[];
    edges: GraphEdge[];
    height?: number;
    highlightedNodes?: string[] | undefined;
  }

  let { nodes, edges, height = 500, highlightedNodes }: Props = $props();

  // Domain color mapping
  const domainColors: Record<string, string> = {
    commerce: '#3b82f6', // blue
    platform: '#10b981', // green
    default: '#6b7280', // gray
  };

  function getDomainColor(domain?: string): string {
    const key = domain ?? 'default';
    return domainColors[key] ?? domainColors['default']!;
  }

  let wrapper: HTMLDivElement;
  let container: HTMLDivElement;
  let svg: SVGSVGElement | null = null;
  let simulation: d3.Simulation<d3.SimulationNodeDatum, undefined> | null = null;

  // D3 selection refs for highlight updates
  let nodeSelection: d3.Selection<SVGGElement, any, SVGGElement, unknown> | null = null;
  let linkSelection: d3.Selection<SVGLineElement, any, SVGGElement, unknown> | null = null;

  // Tooltip state
  let tooltip = $state({ visible: false, x: 0, y: 0, content: '' });

  // Fullscreen state
  let isFullscreen = $state(false);

  function toggleFullscreen() {
    if (!browser) return;
    if (!document.fullscreenElement) {
      wrapper.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  function handleFullscreenChange() {
    isFullscreen = !!document.fullscreenElement;
  }

  onMount(async () => {
    if (!browser) return;

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    const d3 = await import('d3');

    const width = container.clientWidth;

    // Create simulation nodes with positions
    interface SimNode extends GraphNode {
      x: number;
      y: number;
      fx?: number | null;
      fy?: number | null;
    }
    const simNodes: SimNode[] = nodes.map((n) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: height / 2 + (Math.random() - 0.5) * 100,
    }));

    // Create links referencing node objects
    interface SimLink {
      source: SimNode;
      target: SimNode;
      type: string;
    }
    const nodeById = new Map(simNodes.map((n) => [n.id, n]));
    const simLinks: SimLink[] = [];
    for (const e of edges) {
      const source = nodeById.get(e.source);
      const target = nodeById.get(e.target);
      if (source && target) {
        simLinks.push({ source, target, type: e.type });
      }
    }

    // Create SVG
    const svgEl = d3
      .select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);

    svg = svgEl.node();

    // Arrow marker definitions
    const defs = svgEl.append('defs');
    defs
      .append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('class', 'fill-gray-400 dark:fill-gray-500');

    // Container group for zoom/pan
    const g = svgEl.append('g');

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString());
      });

    svgEl.call(zoom);

    // Draw edges
    linkSelection = g
      .append('g')
      .selectAll('line')
      .data(simLinks)
      .join('line')
      .attr('class', (d) =>
        d.type === 'event'
          ? 'stroke-gray-400 dark:stroke-gray-500'
          : 'stroke-gray-500 dark:stroke-gray-400'
      )
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d) => (d.type === 'event' ? '5,5' : 'none'))
      .attr('marker-end', 'url(#arrowhead)') as typeof linkSelection;

    // Draw nodes
    const nodeGroups = g
      .append('g')
      .selectAll('g')
      .data(simNodes)
      .join('g')
      .attr('class', 'cursor-pointer');

    // Add drag behavior

    nodeGroups.call(
      d3
        .drag<SVGGElement, SimNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation?.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation?.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        }) as any
    );

    nodeSelection = nodeGroups as any;

    // Node circles
    nodeSelection!
      .append('circle')
      .attr('r', 20)
      .attr('fill', (d) => getDomainColor(d.domain))
      .attr('class', 'stroke-2 stroke-white dark:stroke-gray-800 transition-opacity')
      .on('click', (_, d) => {
        goto(`/services/${d.id}`);
      })
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('r', 24);
        tooltip = {
          visible: true,
          x: event.pageX,
          y: event.pageY - 10,
          content: `${d.name}${d.domain ? ` (${d.domain})` : ''}`,
        };
      })
      .on('mousemove', (event) => {
        tooltip.x = event.pageX;
        tooltip.y = event.pageY - 10;
      })
      .on('mouseleave', function () {
        d3.select(this).attr('r', 20);
        tooltip.visible = false;
      });

    // Node labels
    nodeSelection!
      .append('text')
      .text((d) => d.name.split(' ')[0]) // First word only
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr(
        'class',
        'text-xs fill-gray-700 dark:fill-gray-300 pointer-events-none transition-opacity'
      );

    // Force simulation
    simulation = (d3.forceSimulation(simNodes) as any)
      .force(
        'link',
        d3
          .forceLink(simLinks)
          .id((d: any) => d.id)
          .distance(120)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(40))
      .on('tick', () => {
        linkSelection
          ?.attr('x1', (d: SimLink) => d.source.x ?? 0)
          .attr('y1', (d: SimLink) => d.source.y ?? 0)
          .attr('x2', (d: SimLink) => d.target.x ?? 0)
          .attr('y2', (d: SimLink) => d.target.y ?? 0);

        nodeSelection?.attr('transform', (d: SimNode) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      });
  });

  // Effect to update highlighting when highlightedNodes changes
  $effect(() => {
    if (!nodeSelection || !linkSelection) return;

    const highlighted = highlightedNodes;
    const hasHighlight = highlighted && highlighted.length > 0;

    if (hasHighlight) {
      const highlightSet = new Set(highlighted);

      // Dim non-highlighted nodes
      nodeSelection.attr('opacity', (d: GraphNode) => (highlightSet.has(d.id) ? 1 : 0.2));

      // Dim edges not between highlighted nodes
      linkSelection.attr('opacity', (d: { source: unknown; target: unknown }) => {
        const sourceId = typeof d.source === 'object' ? (d.source as GraphNode).id : d.source;
        const targetId = typeof d.target === 'object' ? (d.target as GraphNode).id : d.target;
        return highlightSet.has(sourceId as string) && highlightSet.has(targetId as string)
          ? 1
          : 0.1;
      });
    } else {
      // Reset all to full opacity
      nodeSelection.attr('opacity', 1);
      linkSelection.attr('opacity', 1);
    }
    /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
  });

  onDestroy(() => {
    if (browser) {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }
    simulation?.stop();
    svg?.remove();
  });
</script>

<div bind:this={wrapper} class="relative {isFullscreen ? 'bg-white dark:bg-gray-900' : ''}">
  <div
    bind:this={container}
    class="w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    style="height: {isFullscreen ? '100vh' : `${height}px`}"
  ></div>

  <!-- Tooltip -->
  {#if tooltip.visible}
    <div
      class="pointer-events-none fixed z-50 rounded bg-gray-900 px-2 py-1 text-sm text-white shadow-lg dark:bg-gray-700"
      style="left: {tooltip.x}px; top: {tooltip.y}px; transform: translate(-50%, -100%)"
    >
      {tooltip.content}
    </div>
  {/if}

  <!-- Controls -->
  <div
    class="absolute right-3 top-3 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white/90 p-1 shadow-sm backdrop-blur-sm dark:border-gray-600 dark:bg-gray-800/90"
  >
    <button
      onclick={toggleFullscreen}
      class="rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
    >
      {#if isFullscreen}
        <!-- Exit fullscreen icon -->
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
          />
        </svg>
      {:else}
        <!-- Enter fullscreen icon -->
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
          />
        </svg>
      {/if}
    </button>
  </div>

  <!-- Legend -->
  <div
    class="absolute bottom-3 left-3 flex flex-wrap gap-3 rounded-lg border border-gray-200 bg-white/90 px-3 py-2 text-xs backdrop-blur-sm dark:border-gray-600 dark:bg-gray-800/90"
  >
    <div class="flex items-center gap-1.5">
      <span class="h-3 w-3 rounded-full bg-blue-500"></span>
      <span class="text-gray-600 dark:text-gray-400">Commerce</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="h-3 w-3 rounded-full bg-green-500"></span>
      <span class="text-gray-600 dark:text-gray-400">Platform</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="mr-1 h-0.5 w-4 bg-gray-500"></span>
      <span class="text-gray-600 dark:text-gray-400">HTTP</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="mr-1 h-0.5 w-4 border-t-2 border-dashed border-gray-400"></span>
      <span class="text-gray-600 dark:text-gray-400">Event</span>
    </div>
  </div>
</div>
