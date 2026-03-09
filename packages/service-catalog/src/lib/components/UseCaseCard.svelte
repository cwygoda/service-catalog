<script lang="ts">
  import type { UseCase } from '@cwygoda/service-catalog/domain';
  import Shield from './Shield.svelte';

  let { useCase }: { useCase: UseCase } = $props();

  function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trimEnd() + '...';
  }
</script>

<a
  href="/use-cases/{useCase.id}"
  aria-label="View {useCase.name} use case"
  class="block rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md active:shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
  <div class="mb-3 flex items-start gap-4">
    <Shield label={useCase.name} size={44} />
    <div class="min-w-0 flex-1">
      <h3 class="truncate text-lg font-semibold text-gray-900 dark:text-white">
        {useCase.name}
      </h3>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        {truncate(useCase.description, 120)}
      </p>
    </div>
  </div>

  <div class="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
    <span class="flex items-center gap-1">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {useCase.participants.length} participant{useCase.participants.length !== 1 ? 's' : ''}
    </span>
    <span class="flex items-center gap-1">
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
        />
      </svg>
      {useCase.steps.length} step{useCase.steps.length !== 1 ? 's' : ''}
    </span>
    {#if useCase.bpmn}
      <span
        class="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-800 dark:bg-primary-900 dark:text-primary-200"
      >
        BPMN
      </span>
    {/if}
  </div>
</a>
