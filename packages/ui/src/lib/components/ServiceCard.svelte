<script lang="ts">
  import type { Service } from '@cwygoda/service-catalog-core/domain';

  let { service }: { service: Service } = $props();
</script>

<a
  href="/services/{service.id}"
  aria-label="View {service.name} service"
  class="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
>
  <div class="mb-2 flex items-center justify-between">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      {service.name}
    </h3>
    <div class="flex items-center gap-1.5">
      <span
        class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
      >
        {service.type}
      </span>
      {#if service.lifecycle !== 'active'}
        <span
          class="rounded-full px-2 py-0.5 text-xs font-medium {service.lifecycle === 'deprecated' ||
          service.lifecycle === 'sunset'
            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
            : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'}"
        >
          {service.lifecycle}
        </span>
      {/if}
    </div>
  </div>
  <p class="text-sm text-gray-600 dark:text-gray-400">
    {service.description}
  </p>
</a>
