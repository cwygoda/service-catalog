<script lang="ts">
  import UseCaseCard from '$lib/components/UseCaseCard.svelte';
  import ServiceCard from '$lib/components/ServiceCard.svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.domain.name} | Service Catalog</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
  <nav class="mb-6">
    <a
      href="/domains"
      class="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
    >
      ← Back to Domains
    </a>
  </nav>

  <div
    class="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
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
        <div class="grid gap-4 sm:grid-cols-2">
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
        <div class="grid gap-4 sm:grid-cols-2">
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

    <!-- Child Domains -->
    {#if data.childDomains.length > 0}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Subdomains ({data.childDomains.length})
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          {#each data.childDomains as child (child.id)}
            <a
              href="/domains/{child.id}"
              class="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-700"
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
