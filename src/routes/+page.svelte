<script lang="ts">
  import ServiceCard from '$lib/components/ServiceCard.svelte';
  import UseCaseCard from '$lib/components/UseCaseCard.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Service Catalog</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <div class="mb-12 text-center">
    <h1 class="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
      Service Catalog
    </h1>
    <p class="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
      Explore services, understand dependencies, and navigate business flows.
    </p>
  </div>

  <div class="mb-12 grid gap-6 sm:grid-cols-3">
    <a
      href="/use-cases"
      class="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="text-4xl font-bold text-primary-600 dark:text-primary-400">
        {data.useCaseCount}
      </div>
      <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Use Cases</div>
    </a>
    <a
      href="/services"
      class="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="text-4xl font-bold text-primary-600 dark:text-primary-400">
        {data.serviceCount}
      </div>
      <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Services</div>
    </a>
    <div
      class="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center dark:border-gray-600 dark:bg-gray-900"
    >
      <div class="text-4xl font-bold text-gray-400 dark:text-gray-600">—</div>
      <div class="mt-1 text-sm text-gray-500 dark:text-gray-500">Domains (Phase 3)</div>
    </div>
  </div>

  {#if data.featuredUseCases.length > 0}
    <div class="mb-12">
      <div class="mb-6 flex items-center justify-between">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Featured Use Cases</h2>
        <a
          href="/use-cases"
          class="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
        >
          View all →
        </a>
      </div>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.featuredUseCases as useCase (useCase.id)}
          <UseCaseCard {useCase} />
        {/each}
      </div>
    </div>
  {/if}

  <div>
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Recent Services</h2>
      <a
        href="/services"
        class="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
      >
        View all →
      </a>
    </div>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.recentServices as service (service.id)}
        <ServiceCard {service} />
      {/each}
    </div>
  </div>
</div>
