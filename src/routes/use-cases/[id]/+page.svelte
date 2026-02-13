<script lang="ts">
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<svelte:head>
  <title>{data.useCase.name} | Service Catalog</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
  <nav class="mb-6">
    <a
      href="/use-cases"
      class="text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200"
    >
      ← Back to Use Cases
    </a>
  </nav>

  <div
    class="rounded-lg border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <!-- Header -->
    <div class="mb-6 flex items-start justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
          {data.useCase.name}
        </h1>
        <p class="mt-1 font-mono text-sm text-gray-500 dark:text-gray-400">
          {data.useCase.id}
        </p>
      </div>
      {#if data.useCase.bpmn}
        <span
          class="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        >
          BPMN
        </span>
      {/if}
    </div>

    <!-- Description -->
    <div class="border-t border-gray-200 pt-6 dark:border-gray-700">
      <h2
        class="mb-2 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
      >
        Description
      </h2>
      <p class="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
        {data.useCase.description}
      </p>
    </div>

    <!-- BPMN Diagram placeholder -->
    {#if data.useCase.bpmn}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Process Diagram
        </h2>
        <div
          class="flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 dark:border-gray-600 dark:bg-gray-900"
        >
          <p class="text-sm text-gray-500 dark:text-gray-400">
            BPMN diagram: {data.useCase.bpmn}
          </p>
        </div>
      </div>
    {/if}

    <!-- Steps -->
    {#if data.useCase.steps.length > 0}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Process Steps
        </h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead>
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  #
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Actor/Service
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Action
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                >
                  Endpoint
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              {#each data.useCase.steps.sort((a, b) => a.sequence - b.sequence) as step (step.sequence)}
                <tr>
                  <td class="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                    {step.sequence}
                  </td>
                  <td class="whitespace-nowrap px-4 py-3 text-sm">
                    {#if step.actor}
                      <span class="text-gray-700 dark:text-gray-300">{step.actor}</span>
                    {:else if step.service}
                      <a
                        href="/services/{step.service}"
                        class="text-primary-600 hover:underline dark:text-primary-400"
                      >
                        {step.service}
                      </a>
                    {:else}
                      <span class="text-gray-400">—</span>
                    {/if}
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {step.action}
                  </td>
                  <td
                    class="whitespace-nowrap px-4 py-3 font-mono text-sm text-gray-500 dark:text-gray-400"
                  >
                    {step.endpoint ?? '—'}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}

    <!-- Participating Services -->
    {#if data.participantServices.length > 0}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Participating Services
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          {#each data.participantServices as participant (participant.service)}
            <a
              href="/services/{participant.service}"
              class="rounded-lg border border-gray-200 p-4 transition-shadow hover:shadow-md dark:border-gray-700"
            >
              <div class="font-medium text-gray-900 dark:text-white">
                {participant.serviceName}
              </div>
              <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {participant.role}
              </div>
            </a>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</div>
