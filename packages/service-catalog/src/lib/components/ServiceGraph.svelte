<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import type { GraphNode, GraphEdge } from '@cwygoda/service-catalog/domain';
  import type { Selection } from 'd3-selection';
  import type { Simulation, SimulationNodeDatum } from 'd3-force';
  import type { D3ZoomEvent } from 'd3-zoom';

  interface Props {
    nodes: GraphNode[];
    edges: GraphEdge[];
    height?: number;
    highlightedNodes?: string[] | undefined;
  }

  let { nodes, edges, height = 500, highlightedNodes }: Props = $props();

  function getDomainFillClass(domain?: string): string {
    switch (domain) {
      case 'commerce':
        return 'fill-blue-500 dark:fill-blue-400';
      case 'platform':
        return 'fill-green-500 dark:fill-green-400';
      default:
        return 'fill-gray-500 dark:fill-gray-400';
    }
  }

  let wrapper: HTMLDivElement;
  let container: HTMLDivElement;
  let svg: SVGSVGElement | null = null;
  let simulation: Simulation<SimulationNodeDatum, undefined> | null = null;

  // Simulation node type with position
  interface SimNode extends GraphNode {
    x: number;
    y: number;
    fx?: number | null;
    fy?: number | null;
  }

  // Simulation link type with node references
  interface SimLink {
    source: SimNode;
    target: SimNode;
    type: string;
  }

  // D3 selection refs for highlight updates
  let nodeSelection: Selection<SVGGElement, SimNode, SVGGElement, unknown> | null = null;
  let linkSelection: Selection<SVGLineElement, SimLink, SVGGElement, unknown> | null = null;

  // Tooltip state
  let tooltip = $state({ visible: false, x: 0, y: 0, content: '' });

  // Responsive height — scales with container width on narrow screens
  // Initialized to default; computed from height prop in onMount/resize
  let responsiveHeight = $state(500);
  let resizeObserver: ResizeObserver | null = null;

  // Fullscreen state
  let isFullscreen = $state(false);

  function toggleFullscreen(): void {
    if (!browser) return;
    if (!document.fullscreenElement) {
      void wrapper.requestFullscreen();
    } else {
      void document.exitFullscreen();
    }
  }

  function handleFullscreenChange(): void {
    isFullscreen = !!document.fullscreenElement;
  }

  onMount(async () => {
    if (!browser) return;

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const [
      { select },
      { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide },
      { zoom },
      { drag },
    ] = await Promise.all([
      import('d3-selection'),
      import('d3-force'),
      import('d3-zoom'),
      import('d3-drag'),
    ]);

    const width = container.clientWidth;
    responsiveHeight = Math.max(width < 640 ? 400 : 300, Math.min(width * 0.6, height));

    // Create simulation nodes with positions
    const simNodes: SimNode[] = nodes.map((n) => ({
      ...n,
      x: width / 2 + (Math.random() - 0.5) * 100,
      y: responsiveHeight / 2 + (Math.random() - 0.5) * 100,
    }));

    // Create links referencing node objects
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
    const svgEl = select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', responsiveHeight)
      .attr('viewBox', `0 0 ${String(width)} ${String(responsiveHeight)}`)
      .attr('role', 'img')
      .attr(
        'aria-label',
        `Service dependency graph with ${String(nodes.length)} services and ${String(edges.length)} connections`
      );

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
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        g.attr('transform', event.transform.toString());
      });

    svgEl.call(zoomBehavior);

    // Draw edges
    linkSelection = g
      .append('g')
      .selectAll<SVGLineElement, SimLink>('line')
      .data(simLinks)
      .join('line')
      .attr('class', (d) =>
        d.type === 'event'
          ? 'stroke-gray-400 dark:stroke-gray-500'
          : 'stroke-gray-500 dark:stroke-gray-400'
      )
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', (d) => (d.type === 'event' ? '5,5' : 'none'))
      .attr('marker-end', 'url(#arrowhead)');

    // Draw nodes
    const nodeGroups = g
      .append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .join('g')
      .attr('class', 'cursor-pointer');

    // Add drag behavior
    nodeGroups.call(
      drag<SVGGElement, SimNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation?.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x as number;
          d.fy = event.y as number;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation?.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

    nodeSelection = nodeGroups;

    // Node circles
    nodeSelection
      .append('circle')
      .attr('r', 20)
      .attr(
        'class',
        (d) =>
          `${getDomainFillClass(d.domain)} stroke-2 stroke-white dark:stroke-gray-800 transition-opacity`
      )
      .on('click', (_, d) => {
        void goto(`/services/${d.id}`);
      })
      .on('mouseenter', function (event: MouseEvent, d: SimNode) {
        select(this).attr('r', 24);
        tooltip = {
          visible: true,
          x: event.pageX,
          y: event.pageY - 10,
          content: `${d.name}${d.domain ? ` (${d.domain})` : ''}`,
        };
      })
      .on('mousemove', (event: MouseEvent) => {
        tooltip.x = event.pageX;
        tooltip.y = event.pageY - 10;
      })
      .on('mouseleave', function () {
        select(this).attr('r', 20);
        tooltip.visible = false;
      });

    // Node labels
    nodeSelection
      .append('text')
      .text((d) => d.name.split(' ')[0] ?? d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr(
        'class',
        'text-xs fill-gray-700 dark:fill-gray-300 pointer-events-none transition-opacity'
      );

    // Force simulation - D3's forceSimulation has complex generics that don't match our SimNode
    simulation =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
      forceSimulation(simNodes as any)
        .force(
          'link',
          forceLink(simLinks)
            .id((d) => (d as SimNode).id)
            .distance(120)
        )
        .force('charge', forceManyBody().strength(-400))
        .force('center', forceCenter(width / 2, responsiveHeight / 2))
        .force('collision', forceCollide().radius(40))
        .on('tick', () => {
          linkSelection
            ?.attr('x1', (d) => d.source.x)
            .attr('y1', (d) => d.source.y)
            .attr('x2', (d) => d.target.x)
            .attr('y2', (d) => d.target.y);

          nodeSelection?.attr('transform', (d) => `translate(${String(d.x)},${String(d.y)})`);
        });

    // Resize observer for responsive height
    resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const newWidth = entry.contentRect.width;
      const newHeight = Math.max(300, Math.min(newWidth * 0.6, height));
      if (Math.abs(newHeight - responsiveHeight) < 10) return;
      responsiveHeight = newHeight;
      svgEl
        .attr('height', newHeight)
        .attr('viewBox', `0 0 ${String(newWidth)} ${String(newHeight)}`);
      simulation
        ?.force('center', forceCenter(newWidth / 2, newHeight / 2))
        .alpha(0.3)
        .restart();
    });
    resizeObserver.observe(container);
  });

  // Effect to update highlighting when highlightedNodes changes (CSS class-based)
  $effect(() => {
    if (!nodeSelection || !linkSelection) return;

    const highlighted = highlightedNodes;
    const hasHighlight = highlighted && highlighted.length > 0;

    if (hasHighlight) {
      const highlightSet = new Set(highlighted);

      nodeSelection
        .classed('graph-node-dimmed', (d) => !highlightSet.has(d.id))
        .classed('graph-full-opacity', (d) => highlightSet.has(d.id));

      linkSelection
        .classed(
          'graph-link-dimmed',
          (d) => !(highlightSet.has(d.source.id) && highlightSet.has(d.target.id))
        )
        .classed(
          'graph-full-opacity',
          (d) => highlightSet.has(d.source.id) && highlightSet.has(d.target.id)
        );
    } else {
      nodeSelection.classed('graph-node-dimmed', false).classed('graph-full-opacity', false);
      linkSelection.classed('graph-link-dimmed', false).classed('graph-full-opacity', false);
    }
  });

  // Pause simulation when tab is hidden to save CPU
  function handleVisibilityChange(): void {
    if (!simulation) return;
    if (document.hidden) {
      simulation.stop();
    } else if (simulation.alpha() > simulation.alphaMin()) {
      simulation.restart();
    }
  }

  onDestroy(() => {
    if (browser) {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
    resizeObserver?.disconnect();
    simulation?.stop();
    svg?.remove();
  });
</script>

<div bind:this={wrapper} class="relative {isFullscreen ? 'bg-white dark:bg-gray-900' : ''}">
  <div
    bind:this={container}
    class="w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    style="height: {isFullscreen ? '100vh' : `${String(responsiveHeight)}px`}"
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
      class="flex min-h-11 min-w-11 items-center justify-center rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
    >
      {#if isFullscreen}
        <!-- Exit fullscreen icon -->
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
          />
        </svg>
      {:else}
        <!-- Enter fullscreen icon -->
        <svg
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
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
      <span class="h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-400"></span>
      <span class="text-gray-700 dark:text-gray-300">Commerce</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="h-3 w-3 rounded-sm bg-green-500 dark:bg-green-400"></span>
      <span class="text-gray-700 dark:text-gray-300">Platform</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="mr-1 h-0.5 w-4 bg-gray-500 dark:bg-gray-400"></span>
      <span class="text-gray-700 dark:text-gray-300">HTTP</span>
    </div>
    <div class="flex items-center gap-1.5">
      <span class="mr-1 h-0.5 w-4 border-t-2 border-dashed border-gray-400 dark:border-gray-500"
      ></span>
      <span class="text-gray-700 dark:text-gray-300">Event</span>
    </div>
  </div>
</div>

<style>
  :global(.graph-node-dimmed) {
    opacity: 0.2;
    transition: opacity 0.3s ease;
  }

  :global(.graph-link-dimmed) {
    opacity: 0.1;
    transition: opacity 0.3s ease;
  }

  :global(.graph-full-opacity) {
    opacity: 1;
    transition: opacity 0.3s ease;
  }
</style>
