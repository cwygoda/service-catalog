<script lang="ts">
  import { UseCaseCard, ServiceCard, Breadcrumbs } from '@cwygoda/service-catalog-ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const breadcrumbItems = $derived([
    { label: 'Domains', href: '/domains' },
    ...data.ancestors.map((d) => ({ label: d.name, href: `/domains/${d.id}` })),
  ]);
</script>

<svelte:head>
  <title>{data.domain.name} | Service Catalog</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8" data-pagefind-body>
  <Breadcrumbs items={breadcrumbItems} current={data.domain.name} />

  <div
    class="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    data-pagefind-meta="type:Domain"
  >
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
        {data.domain.name}
      </h1>
      <p class="mt-1 font-mono text-sm text-gray-500 dark:text-gray-400">
        {data.domain.id}
      </p>
    </div>

    <!-- Description -->
    <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
      <p class="text-gray-700 dark:text-gray-300">
        {data.domain.description}
      </p>
    </div>

    <!-- Use Cases (Primary) -->
    {#if data.useCases.length > 0}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Use Cases ({data.useCases.length})
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          {#each data.useCases as useCase (useCase.id)}
            <UseCaseCard {useCase} />
          {/each}
        </div>
      </div>
    {:else}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Use Cases
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">No use cases in this domain yet.</p>
      </div>
    {/if}

    <!-- Services -->
    {#if data.services.length > 0}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Services ({data.services.length})
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          {#each data.services as service (service.id)}
            <ServiceCard {service} />
          {/each}
        </div>
      </div>
    {:else}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Services
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">No services in this domain yet.</p>
      </div>
    {/if}

    <!-- Data Stores -->
    {#if data.dataStores.length > 0}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Data Stores ({data.dataStores.length})
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          {#each data.dataStores as ds (ds.id)}
            <a
              href="/data-stores/{ds.id}"
              class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:border-gray-700 dark:bg-gray-800"
            >
              <div class="font-medium text-gray-900 dark:text-white">
                {ds.name}
              </div>
              <div class="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span class="rounded bg-gray-100 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                  {ds.type}
                </span>
                {#if ds.technology}
                  <span>{ds.technology}</span>
                {/if}
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Child Domains -->
    {#if data.childDomains.length > 0}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Subdomains ({data.childDomains.length})
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          {#each data.childDomains as child (child.id)}
            <a
              href="/domains/{child.id}"
              class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:border-gray-700 dark:bg-gray-800"
            >
              <div class="font-medium text-gray-900 dark:text-white">
                {child.name}
              </div>
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {child.description}
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
