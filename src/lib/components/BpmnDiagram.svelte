<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';

  interface Props {
    xml: string;
    interactive?: boolean;
  }

  let { xml, interactive = false }: Props = $props();

  let container: HTMLDivElement;
  let viewer: unknown;
  let error: string | null = $state(null);

  onMount(async () => {
    if (!browser || !xml) return;

    try {
      // Dynamic import to avoid SSR issues
      const { default: BpmnViewer } = await import('bpmn-js/lib/NavigatedViewer');

      viewer = new BpmnViewer({
        container,
        keyboard: { bindTo: interactive ? document : undefined },
      });

      await (viewer as { importXML: (xml: string) => Promise<void> }).importXML(xml);

      // Fit diagram to container
      const canvas = (viewer as { get: (name: string) => unknown }).get('canvas') as {
        zoom: (level: string) => void;
      };
      canvas.zoom('fit-viewport');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to render BPMN diagram';
      console.error('BPMN render error:', e);
    }
  });

  onDestroy(() => {
    if (viewer && typeof (viewer as { destroy?: () => void }).destroy === 'function') {
      (viewer as { destroy: () => void }).destroy();
    }
  });

  $effect(() => {
    // Re-import when xml changes
    if (browser && viewer && xml) {
      (viewer as { importXML: (xml: string) => Promise<void> })
        .importXML(xml)
        .then(() => {
          const canvas = (viewer as { get: (name: string) => unknown }).get('canvas') as {
            zoom: (level: string) => void;
          };
          canvas.zoom('fit-viewport');
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
    bind:this={container}
    class="bpmn-container h-96 w-full rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    class:cursor-grab={interactive}
  ></div>
{/if}

<style>
  .bpmn-container :global(.djs-container) {
    height: 100% !important;
  }
</style>
