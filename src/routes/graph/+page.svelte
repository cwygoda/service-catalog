<script lang="ts">
  import ServiceGraph from '$lib/components/ServiceGraph.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  // Use case filter state
  let selectedUseCaseId = $state<string>('');

  // Get highlighted service IDs based on selected use case
  const highlightedNodes = $derived(() => {
    if (!selectedUseCaseId) return undefined;
    const useCase = data.useCases.find((uc) => uc.id === selectedUseCaseId);
    if (!useCase) return undefined;
    return useCase.participants.map((p) => p.service);
  });

  const selectedUseCaseName = $derived(() => {
    if (!selectedUseCaseId) return null;
    return data.useCases.find((uc) => uc.id === selectedUseCaseId)?.name ?? null;
  });
</script>

<svelte:head>
  <title>Service Graph | Service Catalog</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Service Graph</h1>
      <p class="mt-1 text-gray-600 dark:text-gray-400">
        Visualize service connections derived from use case flows. Click a node to view service
        details.
      </p>
    </div>

    <!-- Use case filter -->
    <div class="flex items-center gap-3">
      <label for="use-case-filter" class="text-sm font-medium text-gray-700 dark:text-gray-300">
        Highlight use case:
      </label>
      <select
        id="use-case-filter"
        bind:value={selectedUseCaseId}
        class="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
      >
        <option value="">All services</option>
        {#each data.useCases as useCase (useCase.id)}
          <option value={useCase.id}>{useCase.name}</option>
        {/each}
      </select>
    </div>
  </div>

  {#if selectedUseCaseName}
    <div
      class="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-4 py-2 text-sm text-primary-800 dark:border-primary-800 dark:bg-primary-900/30 dark:text-primary-200"
    >
      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        Showing services participating in <strong>{selectedUseCaseName}</strong>
      </span>
      <button
        onclick={() => (selectedUseCaseId = '')}
        class="ml-auto rounded p-1 hover:bg-primary-100 dark:hover:bg-primary-800"
        aria-label="Clear filter"
      >
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  {/if}

  <div
    class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
  >
    <ServiceGraph
      nodes={data.nodes}
      edges={data.edges}
      height={600}
      highlightedNodes={highlightedNodes()}
    />
  </div>

  <div class="text-sm text-gray-500 dark:text-gray-400">
    <p>
      <strong>{data.nodes.length}</strong> services,
      <strong>{data.edges.length}</strong> connections derived from
      <strong>{data.useCases.length}</strong> use cases
    </p>
  </div>
</div>
