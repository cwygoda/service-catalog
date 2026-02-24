<script lang="ts">
  import { onMount } from 'svelte';
  import { BpmnDiagram, Breadcrumbs } from '@service-catalog/ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();

  function isInlineXml(value: string | undefined): boolean {
    if (!value) return false;
    const trimmed = value.trim();
    return trimmed.startsWith('<?xml') || trimmed.startsWith('<bpmn:');
  }

  const inlineXml = $derived(isInlineXml(data.useCase.bpmn) ? data.useCase.bpmn : null);
  let bpmnXml = $state<string | null>(null);
  let bpmnLoading = $state(false);
  let bpmnError = $state<string | null>(null);
  const effectiveXml = $derived(inlineXml ?? bpmnXml);

  const breadcrumbItems = $derived([
    ...data.domainAncestors.map((d) => ({ label: d.name, href: `/domains/${d.id}` })),
    { label: 'Use Cases', href: '/use-cases' },
  ]);

  onMount(async () => {
    if (data.useCase.bpmn && !isInlineXml(data.useCase.bpmn)) {
      bpmnLoading = true;
      try {
        const response = await fetch(data.useCase.bpmn);
        if (!response.ok) {
          throw new Error(`Failed to load BPMN: ${String(response.status)}`);
        }
        bpmnXml = await response.text();
      } catch (e) {
        bpmnError = e instanceof Error ? e.message : 'Failed to load diagram';
      } finally {
        bpmnLoading = false;
      }
    }
  });
</script>

<svelte:head>
  <title>{data.useCase.name} | Service Catalog</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
  <Breadcrumbs items={breadcrumbItems} current={data.useCase.name} />

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

    <!-- BPMN Diagram -->
    {#if data.useCase.bpmn}
      <div class="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <h2
          class="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
        >
          Process Diagram
        </h2>
        {#if bpmnLoading}
          <div
            class="flex h-96 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900"
          >
            <p class="text-sm text-gray-500 dark:text-gray-400">Loading diagram...</p>
          </div>
        {:else if bpmnError}
          <div
            class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
          >
            <p class="font-medium">Failed to load diagram</p>
            <p class="mt-1 text-sm">{bpmnError}</p>
          </div>
        {:else if effectiveXml}
          <BpmnDiagram xml={effectiveXml} interactive />
        {/if}
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
