<script lang="ts">
  import type { ServiceType } from '@cwygoda/service-catalog-core/domain';
  import Shield from './Shield.svelte';

  interface Props {
    type: ServiceType;
    size?: number;
  }

  let { type, size = 40 }: Props = $props();

  const labels: Record<ServiceType, { short: string; full: string }> = {
    'web-service': { short: 'Ws', full: 'Web Service' },
    'event-consumer': { short: 'Ec', full: 'Event Consumer' },
    'event-producer': { short: 'Ep', full: 'Event Producer' },
    'event-transformer': { short: 'Et', full: 'Event Transformer' },
    'web-app': { short: 'Wa', full: 'Web App' },
    library: { short: 'Li', full: 'Library' },
  };

  let entry = $derived(labels[type]);
</script>

<span class="group relative inline-flex" title={entry.full}>
  <Shield label={entry.short} {size} />
  <span
    role="tooltip"
    class="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 dark:bg-gray-100 dark:text-gray-900"
  >
    {entry.full}
  </span>
</span>
