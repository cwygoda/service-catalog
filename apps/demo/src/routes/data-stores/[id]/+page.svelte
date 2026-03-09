<script lang="ts">
  import { Breadcrumbs } from '@cwygoda/service-catalog/ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const typeColors: Record<string, string> = {
    database: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    cache: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    queue: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    'search-index': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
    'object-store': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  };

  const breadcrumbItems = $derived([
    ...data.domainAncestors.map((d) => ({ label: d.name, href: `/domains/${d.id}` })),
    { label: 'Data Stores', href: '/data-stores' },
  ]);
</script>

<svelte:head>
  <title>{data.dataStore.name} | Service Catalog</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8" data-pagefind-body>
  <Breadcrumbs items={breadcrumbItems} current={data.dataStore.name} />

  <div
    class="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    data-pagefind-meta="type:Data Store"
  >
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {data.dataStore.name}
        </h1>
        <p class="mt-1 font-mono text-sm text-gray-500 dark:text-gray-400">
          {data.dataStore.id}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="rounded-full px-2.5 py-1 text-xs font-medium {typeColors[data.dataStore.type] ??
            'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}"
        >
          {data.dataStore.type}
        </span>
        {#if data.dataStore.technology}
          <span
            class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            {data.dataStore.technology}
          </span>
        {/if}
      </div>
    </div>

    <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
      <h2
        class="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
      >
        Description
      </h2>
      <p class="text-gray-700 dark:text-gray-300">
        {data.dataStore.description}
      </p>
    </div>

    {#if data.ownerService}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Owner Service
        </h2>
        <a
          href="/services/{data.ownerService.id}"
          class="inline-block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="font-medium text-gray-900 dark:text-white">
            {data.ownerService.name}
          </div>
          <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {data.ownerService.description}
          </div>
        </a>
      </div>
    {/if}

    {#if data.dataStore.links && data.dataStore.links.length > 0}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Links
        </h2>
        <ul class="space-y-2">
          {#each data.dataStore.links as link (link.url)}
            <li>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                class="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
              >
                {link.title}
              </a>
              {#if link.type}
                <span
                  class="ml-2 rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                >
                  {link.type}
                </span>
              {/if}
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</div>
