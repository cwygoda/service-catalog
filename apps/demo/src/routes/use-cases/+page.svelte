<script lang="ts">
  import { UseCaseCard } from '@cwygoda/service-catalog-ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Use Cases | Service Catalog</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Use Cases</h1>
    <p class="mt-2 text-gray-600 dark:text-gray-400">
      Browse all {data.useCases.length} business use cases in the catalog
    </p>
  </div>

  {#if data.useCases.length === 0}
    <div
      class="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-800"
    >
      <p class="text-gray-600 dark:text-gray-400">No use cases found in the catalog.</p>
    </div>
  {:else}
    <div class="grid gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.useCases as useCase (useCase.id)}
        <UseCaseCard {useCase} />
      {/each}
    </div>
  {/if}
</div>
