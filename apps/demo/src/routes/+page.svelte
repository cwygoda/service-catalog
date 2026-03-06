<script lang="ts">
  import { ServiceCard, UseCaseCard } from '@cwygoda/service-catalog-ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>Service Catalog</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
  <div class="mb-12 text-center">
    <h1
      class="font-bold tracking-tight text-gray-900 dark:text-white text-[clamp(2.25rem,6vw,3rem)]"
    >
      Service Catalog
    </h1>
    <p class="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
      Explore services, understand dependencies, and navigate business flows.
    </p>
  </div>

  <div class="mb-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
    <a
      href="/domains"
      class="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="text-4xl font-bold text-primary-600 dark:text-primary-400">
        {data.domainCount}
      </div>
      <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Domains</div>
    </a>
    <a
      href="/use-cases"
      class="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="text-4xl font-bold text-primary-600 dark:text-primary-400">
        {data.useCaseCount}
      </div>
      <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Use Cases</div>
    </a>
    <a
      href="/services"
      class="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="text-4xl font-bold text-primary-600 dark:text-primary-400">
        {data.serviceCount}
      </div>
      <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Services</div>
    </a>
    <a
      href="/data-stores"
      class="rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="text-4xl font-bold text-primary-600 dark:text-primary-400">
        {data.dataStoreCount}
      </div>
      <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">Data Stores</div>
    </a>
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
