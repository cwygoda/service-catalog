<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.service.name} | Service Catalog</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
  <nav class="mb-6">
    <a
      href="/services"
      class="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
    >
      ← Back to Services
    </a>
  </nav>

  <div
    class="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
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
      {#if data.service.metadata?.version}
        <span
          class="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200"
        >
          v{data.service.metadata.version}
        </span>
      {/if}
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
        <div class="grid gap-4 sm:grid-cols-2">
          {#each data.useCases as useCase (useCase.id)}
            <a
              href="/use-cases/{useCase.id}"
              class="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-700"
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

    <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
      <h2
        class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
      >
        Coming Soon
      </h2>
      <div class="grid gap-4 text-sm text-gray-500 dark:text-gray-400 sm:grid-cols-2">
        <div class="rounded bg-gray-50 p-4 dark:bg-gray-900">
          <span class="font-medium">Dependencies</span>
          <p class="mt-1">Services this depends on and dependents</p>
        </div>
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
