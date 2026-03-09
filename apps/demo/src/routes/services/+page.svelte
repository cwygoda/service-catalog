<script lang="ts">
  import { ServiceCard } from '@cwygoda/service-catalog/ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Services | Service Catalog</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Services</h1>
    <p class="mt-2 text-gray-600 dark:text-gray-400">
      Browse all {data.services.length} services in the catalog
    </p>
  </div>

  <div class="grid gap-3 sm:gap-4 lg:gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#each data.services as service (service.id)}
      <ServiceCard {service} />
    {/each}
  </div>
</div>
