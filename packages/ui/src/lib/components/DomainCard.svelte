<script lang="ts">
  import type { Domain } from '@cwygoda/service-catalog-core/domain';

  interface Props {
    domain: Domain;
    useCaseCount: number;
    serviceCount: number;
  }

  let { domain, useCaseCount, serviceCount }: Props = $props();
</script>

<a
  href="/domains/{domain.id}"
  aria-label="View {domain.name} domain"
  class="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md active:shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
  <div class="mb-2">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
      {domain.name}
    </h3>
  </div>
  <p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
    {domain.description}
  </p>
  <div class="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
    <span>{useCaseCount} use case{useCaseCount !== 1 ? 's' : ''}</span>
    <span>{serviceCount} service{serviceCount !== 1 ? 's' : ''}</span>
  </div>
</a>
