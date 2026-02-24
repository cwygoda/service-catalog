<script lang="ts">
  import { DomainCard } from '@cwygoda/service-catalog-ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Domains | Service Catalog</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <div class="mb-8">
    <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Domains</h1>
    <p class="mt-2 text-gray-600 dark:text-gray-400">
      Browse all {data.domains.length} business domains
    </p>
  </div>

  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#each data.domains as { domain, useCaseCount, serviceCount } (domain.id)}
      <DomainCard {domain} {useCaseCount} {serviceCount} />
    {/each}
  </div>
</div>
