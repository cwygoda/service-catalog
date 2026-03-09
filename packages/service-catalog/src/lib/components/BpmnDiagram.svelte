<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  interface DocLink {
    elementId: string;
    anchor: string;
  }

  interface ElementClickEvent {
    elementId: string;
    docAnchor?: string | undefined;
  }

  interface Props {
    xml: string;
    interactive?: boolean;
    class?: string;
    docLinks?: DocLink[];
    onElementClick?: (event: ElementClickEvent) => void;
  }

  interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface BpmnCanvas {
    zoom(level: 'fit-viewport' | number): void;
    zoom(): number; // get current zoom
    viewbox(): Bounds & { scale: number; inner: Bounds; outer: Bounds };
    viewbox(bounds: Partial<Bounds>): void;
  }

  const FIT_PADDING = 40; // pixels of padding around diagram when fitting
  const FULLSCREEN_TRANSITION_MS = 100;

  interface BpmnViewer {
    importXML: (xml: string) => Promise<unknown>;
    get: (name: string) => unknown;
    destroy?: () => void;
  }

  let {
    xml,
    interactive = false,
    class: className = '',
    docLinks,
    onElementClick,
  }: Props = $props();

  let wrapper: HTMLDivElement | undefined = $state();
  let container: HTMLDivElement | undefined = $state();
  let resizeObserver: ResizeObserver | null = null;
  let viewer: BpmnViewer | null = $state(null);
  let error: string | null = $state(null);
  let ready = $state(false);

  // Fullscreen state
  let isFullscreen = $state(false);

  function setBodyOverflow(hidden: boolean) {
    if (!browser) return;
    document.body.style.overflow = hidden ? 'hidden' : '';
  }

  function handleEscapeKey(e: KeyboardEvent) {
    if (e.key === 'Escape' && isFullscreen) {
      toggleFullscreen();
    }
  }

  function toggleFullscreen() {
    if (!browser) return;
    isFullscreen = !isFullscreen;
    setBodyOverflow(isFullscreen);

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscapeKey);
    } else {
      document.removeEventListener('keydown', handleEscapeKey);
    }

    // Re-fit diagram after layout settles
    if (ready) {
      setTimeout(fitWithPadding, FULLSCREEN_TRANSITION_MS);
    }
  }

  function getCanvas(): BpmnCanvas | null {
    if (!viewer) return null;
    return viewer.get('canvas') as BpmnCanvas;
  }

  function fitWithPadding() {
    const canvas = getCanvas();
    if (!canvas) return;

    // First fit to viewport to get the content bounds
    canvas.zoom('fit-viewport');

    // Get current viewbox info - inner is the diagram bounds, outer is container
    const vb = canvas.viewbox();
    const inner = vb.inner;
    const outer = vb.outer;

    // Calculate scale to fit content with padding
    const availableWidth = outer.width - FIT_PADDING * 2;
    const availableHeight = outer.height - FIT_PADDING * 2;
    const scaleX = availableWidth / inner.width;
    const scaleY = availableHeight / inner.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate centered viewbox dimensions
    const viewWidth = outer.width / scale;
    const viewHeight = outer.height / scale;

    // Center the content
    const centerX = inner.x + inner.width / 2;
    const centerY = inner.y + inner.height / 2;

    canvas.viewbox({
      x: centerX - viewWidth / 2,
      y: centerY - viewHeight / 2,
      width: viewWidth,
      height: viewHeight,
    });
  }

  function zoomIn() {
    const canvas = getCanvas();
    if (!canvas) return;
    const current = canvas.zoom();
    canvas.zoom(current * 1.25);
  }

  function zoomOut() {
    const canvas = getCanvas();
    if (!canvas) return;
    const current = canvas.zoom();
    canvas.zoom(current * 0.8);
  }

  function resetZoom() {
    fitWithPadding();
  }

  /**
   * Re-center inline message-flow labels rendered by bpmn-js.
   * bpmn-js positions these labels using getBBox() which can return
   * incorrect widths before fonts are loaded, causing left-aligned labels.
   */
  function fixMessageFlowLabels() {
    if (!viewer) return;

    const elementRegistry = viewer.get('elementRegistry') as {
      forEach: (cb: (el: { id: string; type: string }) => void) => void;
      get: (id: string) => { id: string } | undefined;
      getGraphics: (el: { id: string }) => SVGElement | null;
    };

    elementRegistry.forEach((el) => {
      if (el.type !== 'bpmn:MessageFlow') return;

      // Get the connection's SVG group
      const connGfx = elementRegistry.getGraphics(el);
      if (!connGfx) return;

      const visual = connGfx.querySelector('.djs-visual');
      if (!visual) return;

      // The actual line path is a direct child of .djs-visual;
      // the arrow marker path lives inside <defs> and must be skipped.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- needed for svelte-check
      const linePath = visual.querySelector(':scope > path') as SVGPathElement | null;
      if (!linePath?.getTotalLength) return;

      // bpmn-js renders labels as separate shape elements: {flowId}_label
      const labelEl = elementRegistry.get(el.id + '_label');
      if (!labelEl) return;

      const labelGfx = elementRegistry.getGraphics(labelEl);
      if (!labelGfx) return;

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- needed for svelte-check
      const textEl = labelGfx.querySelector('text') as SVGTextElement | null;
      if (!textEl) return;

      const bbox = textEl.getBBox();
      if (bbox.width <= 0) return;

      // Center the label on the midpoint of the connection path
      const midPoint = linePath.getPointAtLength(linePath.getTotalLength() / 2);
      const newX = midPoint.x - bbox.width / 2 - bbox.x;
      const newY = midPoint.y - bbox.height / 2 - bbox.y;
      labelGfx.setAttribute('transform', `matrix(1 0 0 1 ${String(newX)} ${String(newY)})`);
    });
  }

  onMount(async () => {
    if (!browser || !xml || !container) return;

    try {
      // Dynamic import to avoid SSR issues
      const { default: BpmnViewer } = await import('bpmn-js/lib/NavigatedViewer');

      viewer = new BpmnViewer({
        container,
        keyboard: { bindTo: interactive ? document : undefined },
      }) as BpmnViewer;

      await viewer.importXML(xml);
      fixMessageFlowLabels();

      // Register click handler for doc links
      if (onElementClick) {
        const eventBus = viewer.get('eventBus') as {
          on: (event: string, callback: (e: { element: { id: string } }) => void) => void;
        };
        const docLinkMap = new Map((docLinks ?? []).map((l) => [l.elementId, l.anchor]));

        eventBus.on('element.click', (e) => {
          const id = e.element.id;
          onElementClick({
            elementId: id,
            docAnchor: docLinkMap.get(id),
          });
        });

        // Add pointer cursor on clickable elements
        if (docLinks?.length) {
          const elementRegistry = viewer.get('elementRegistry') as {
            forEach: (cb: (el: { id: string; type: string }) => void) => void;
            getGraphics: (el: { id: string }) => SVGElement | null;
          };
          elementRegistry.forEach((el) => {
            if (docLinkMap.has(el.id)) {
              const gfx = elementRegistry.getGraphics(el);
              if (gfx) gfx.style.cursor = 'pointer';
            }
          });
        }
      }

      // Fit diagram to container with padding
      fitWithPadding();
      ready = true;

      // Re-fit on resize
      resizeObserver = new ResizeObserver(() => {
        if (ready) fitWithPadding();
      });
      resizeObserver.observe(container);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to render BPMN diagram';
      console.error('BPMN render error:', e);
    }
  });

  onDestroy(() => {
    if (browser) {
      document.removeEventListener('keydown', handleEscapeKey);
      setBodyOverflow(false);
    }
    resizeObserver?.disconnect();
    if (viewer?.destroy) {
      viewer.destroy();
    }
  });

  $effect(() => {
    // Re-import when xml changes
    if (browser && viewer && xml) {
      viewer
        .importXML(xml)
        .then(() => {
          fixMessageFlowLabels();
          fitWithPadding();
        })
        .catch((e: unknown) => {
          error = e instanceof Error ? e.message : 'Failed to update diagram';
        });
    }
  });
</script>

{#if error}
  <div
    class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
  >
    <p class="font-medium">Failed to render diagram</p>
    <p class="mt-1 text-sm">{error}</p>
  </div>
{:else}
  <div
    bind:this={wrapper}
    class="bpmn-wrapper {isFullscreen
      ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900'
      : 'relative'}"
  >
    <div
      bind:this={container}
      class="bpmn-container w-full {isFullscreen
        ? 'h-full bg-white dark:bg-gray-900'
        : 'bpmn-container--inline rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'} {className}"
      class:cursor-grab={interactive}
      role="img"
      aria-label="BPMN process diagram"
    ></div>

    <!-- Zoom controls -->
    {#if ready}
      <div
        class="absolute right-3 top-3 flex flex-col gap-1 rounded-lg border border-gray-200 bg-white/90 p-1 shadow-sm backdrop-blur-sm dark:border-gray-600 dark:bg-gray-800/90"
      >
        <button
          onclick={zoomIn}
          class="flex min-h-11 min-w-11 items-center justify-center rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          aria-label="Zoom in"
          title="Zoom in"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          onclick={zoomOut}
          class="flex min-h-11 min-w-11 items-center justify-center rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          aria-label="Zoom out"
          title="Zoom out"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 12H4" />
          </svg>
        </button>
        <div class="my-0.5 border-t border-gray-200 dark:border-gray-600"></div>
        <button
          onclick={resetZoom}
          class="flex min-h-11 min-w-11 items-center justify-center rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          aria-label="Fit to view"
          title="Fit to view"
        >
          <!-- Viewfinder/target icon for fit-to-view -->
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
              d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
        <div class="my-0.5 border-t border-gray-200 dark:border-gray-600"></div>
        <button
          onclick={toggleFullscreen}
          class="flex min-h-11 min-w-11 items-center justify-center rounded p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-600 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
        >
          {#if isFullscreen}
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
    {/if}
  </div>
{/if}

<style>
  .bpmn-container--inline {
    aspect-ratio: 1;
    max-height: 75vh;
  }

  .bpmn-container :global(.djs-container) {
    height: 100% !important;
  }

  /* Dark mode styles for BPMN diagram */
  :global(.dark) .bpmn-container :global(.djs-visual) {
    /* Invert strokes: black -> light gray */
    --bpmn-stroke: #d1d5db;
    --bpmn-fill: #374151;
  }

  /* Participant/Pool borders and labels */
  :global(.dark) .bpmn-container :global(.djs-group .djs-visual > rect) {
    stroke: #9ca3af !important;
  }

  :global(.dark) .bpmn-container :global(.djs-group .djs-visual > path) {
    stroke: #9ca3af !important;
  }

  /* Task boxes */
  :global(.dark) .bpmn-container :global(.djs-shape .djs-visual > rect) {
    stroke: #9ca3af !important;
    fill: #374151 !important;
  }

  /* Events (circles) */
  :global(.dark) .bpmn-container :global(.djs-shape .djs-visual > circle) {
    stroke: #9ca3af !important;
    fill: #374151 !important;
  }

  /* Gateways (diamonds) */
  :global(.dark) .bpmn-container :global(.djs-shape .djs-visual > polygon) {
    stroke: #9ca3af !important;
    fill: #374151 !important;
  }

  /* Sequence flows (solid lines) */
  :global(.dark) .bpmn-container :global(.djs-connection .djs-visual > path) {
    stroke: #9ca3af !important;
  }

  /* Message flows (dashed lines) */
  :global(.dark) .bpmn-container :global(.djs-connection .djs-visual > polyline) {
    stroke: #9ca3af !important;
  }

  /* Arrow markers */
  :global(.dark) .bpmn-container :global(marker path) {
    fill: #9ca3af !important;
    stroke: #9ca3af !important;
  }

  /* Text labels */
  :global(.dark) .bpmn-container :global(.djs-label text),
  :global(.dark) .bpmn-container :global(.djs-visual text),
  :global(.dark) .bpmn-container :global(text) {
    fill: #e5e7eb !important;
  }

  /* Participant header background (the title band) */
  :global(.dark) .bpmn-container :global(.djs-visual > rect:first-child) {
    fill: #1f2937 !important;
  }

  /* bpmn.io logo/watermark in corner */
  :global(.dark) .bpmn-container :global(.bjs-powered-by) {
    filter: invert(1) hue-rotate(180deg);
    opacity: 0.7;
  }
</style>
