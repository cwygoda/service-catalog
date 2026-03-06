<script lang="ts">
  import type { DataStore } from '@cwygoda/service-catalog-core/domain';

  let { dataStore }: { dataStore: DataStore } = $props();

  const typeColors: Record<string, string> = {
    database: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    cache: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    queue: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'search-index': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    'object-store': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  };
</script>

<a
  href="/data-stores/{dataStore.id}"
  aria-label="View {dataStore.name} data store"
  class="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md active:shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
  <div class="mb-2 flex items-center justify-between">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      {dataStore.name}
    </h3>
    <div class="flex items-center gap-1.5">
      <span
        class="rounded-full px-2 py-0.5 text-xs font-medium {typeColors[dataStore.type] ??
          'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}"
      >
        {dataStore.type}
      </span>
      {#if dataStore.technology}
        <span
          class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          {dataStore.technology}
        </span>
      {/if}
    </div>
  </div>
  <p class="text-sm text-gray-600 dark:text-gray-400">
    {dataStore.description}
  </p>
</a>
