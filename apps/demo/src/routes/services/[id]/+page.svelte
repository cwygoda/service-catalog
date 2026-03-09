<script lang="ts">
  import { Breadcrumbs, ServiceGraph } from '@cwygoda/service-catalog/ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  const breadcrumbItems = $derived([
    ...data.domainAncestors.map((d) => ({ label: d.name, href: `/domains/${d.id}` })),
    { label: 'Services', href: '/services' },
  ]);

  const hasConnections = $derived(
    data.outgoingConnections.length > 0 || data.incomingConnections.length > 0
  );
</script>

<svelte:head>
  <title>{data.service.name} | Service Catalog</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8" data-pagefind-body>
  <Breadcrumbs items={breadcrumbItems} current={data.service.name} />

  <div
    class="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    data-pagefind-meta="type:Service"
  >
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {data.service.name}
        </h1>
        <p class="mt-1 font-mono text-sm text-gray-500 dark:text-gray-400">
          {data.service.id}
        </p>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          {data.service.type}
        </span>
        {#if data.service.lifecycle !== 'active'}
          <span
            class="rounded-full px-2.5 py-1 text-xs font-medium {data.service.lifecycle ===
              'deprecated' || data.service.lifecycle === 'sunset'
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
              : 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'}"
          >
            {data.service.lifecycle}
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
        {data.service.description}
      </p>
    </div>

    {#if data.useCases.length > 0}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Participates in Use Cases
        </h2>
        <div class="grid gap-4 md:grid-cols-2">
          {#each data.useCases as useCase (useCase.id)}
            <a
              href="/use-cases/{useCase.id}"
              class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md active:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:border-gray-700 dark:bg-gray-800"
            >
              <div class="font-medium text-gray-900 dark:text-white">
                {useCase.name}
              </div>
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {useCase.participants.length} participants · {useCase.steps.length} steps
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/if}

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

    {#if hasConnections}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Service Connections
        </h2>

        <!-- Mini graph -->
        {#if data.miniGraph.nodes.length > 1}
          <div class="mb-6">
            <ServiceGraph nodes={data.miniGraph.nodes} edges={data.miniGraph.edges} height={300} />
          </div>
        {/if}

        <!-- Connection lists -->
        <div class="grid gap-6 md:grid-cols-2">
          {#if data.outgoingConnections.length > 0}
            <div>
              <h3 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Calls ({data.outgoingConnections.length})
              </h3>
              <ul class="space-y-2">
                {#each data.outgoingConnections as conn (conn.target + ':' + conn.type)}
                  <li
                    class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <a
                      href="/services/{conn.target}"
                      class="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      {conn.targetName}
                    </a>
                    <div
                      class="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
                    >
                      <span
                        class="rounded px-1.5 py-0.5 {conn.type === 'http'
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}"
                      >
                        {conn.type.toUpperCase()}
                      </span>
                      {#if conn.endpoints && conn.endpoints.length > 0}
                        <span class="truncate" title={conn.endpoints.join(', ')}>
                          {conn.endpoints.join(', ')}
                        </span>
                      {/if}
                    </div>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}

          {#if data.incomingConnections.length > 0}
            <div>
              <h3 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Called by ({data.incomingConnections.length})
              </h3>
              <ul class="space-y-2">
                {#each data.incomingConnections as conn (conn.source + ':' + conn.type)}
                  <li
                    class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                  >
                    <a
                      href="/services/{conn.source}"
                      class="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      {conn.sourceName}
                    </a>
                    <div
                      class="mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
                    >
                      <span
                        class="rounded px-1.5 py-0.5 {conn.type === 'http'
                          ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}"
                      >
                        {conn.type.toUpperCase()}
                      </span>
                      {#if conn.endpoints && conn.endpoints.length > 0}
                        <span class="truncate" title={conn.endpoints.join(', ')}>
                          {conn.endpoints.join(', ')}
                        </span>
                      {/if}
                    </div>
                  </li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
      <h2
        class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
      >
        Coming Soon
      </h2>
      <div class="grid gap-4 text-sm text-gray-500 dark:text-gray-400 md:grid-cols-2">
        <div class="rounded bg-gray-50 p-4 dark:bg-gray-900">
          <span class="font-medium">API Documentation</span>
          <p class="mt-1">OpenAPI and AsyncAPI specs</p>
        </div>
        <div class="rounded bg-gray-50 p-4 dark:bg-gray-900">
          <span class="font-medium">Events</span>
          <p class="mt-1">Published and consumed events</p>
        </div>
      </div>
    </div>
  </div>
</div>
