<script lang="ts">
  import type { Service } from '@service-catalog/core/domain';

  let { service }: { service: Service } = $props();
</script>

<a
  href="/services/{service.id}"
  class="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
>
  <div class="mb-2 flex items-center justify-between">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      {service.name}
    </h3>
    {#if service.metadata?.version}
      <span
        class="rounded-full bg-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200"
      >
        v{service.metadata.version}
      </span>
    {/if}
  </div>
  <p class="text-sm text-gray-600 dark:text-gray-400">
    {service.description}
  </p>
</a>
