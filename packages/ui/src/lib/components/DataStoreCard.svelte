<script lang="ts">
  import type { DataStore } from '@cwygoda/service-catalog-core/domain';
  import DataStoreShield from './DataStoreShield.svelte';

  let { dataStore }: { dataStore: DataStore } = $props();
</script>

<a
  href="/data-stores/{dataStore.id}"
  aria-label="View {dataStore.name} data store"
  class="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md active:shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
  <div class="mb-3 flex items-start gap-4">
    <DataStoreShield type={dataStore.type} technology={dataStore.technology} size={44} />
    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <h3 class="truncate text-lg font-semibold text-gray-900 dark:text-white">
          {dataStore.name}
        </h3>
      </div>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {dataStore.description}
      </p>
    </div>
  </div>
</a>
