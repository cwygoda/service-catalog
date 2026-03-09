<script lang="ts">
  import type { Service } from '@cwygoda/service-catalog/domain';
  import ServiceTypeShield from './ServiceTypeShield.svelte';

  let { service }: { service: Service } = $props();
</script>

<a
  href="/services/{service.id}"
  aria-label="View {service.name} service"
  class="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md active:shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
  <div class="mb-3 flex items-start gap-4">
    <ServiceTypeShield type={service.type} size={44} />
    <div class="min-w-0 flex-1">
      <div class="flex items-center justify-between gap-2">
        <h3 class="truncate text-lg font-semibold text-gray-900 dark:text-white">
          {service.name}
        </h3>
        {#if service.lifecycle !== 'active'}
          <span
            class="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium {service.lifecycle ===
              'deprecated' || service.lifecycle === 'sunset'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
              : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'}"
          >
            {service.lifecycle}
          </span>
        {/if}
      </div>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {service.description}
      </p>
    </div>
  </div>
</a>
