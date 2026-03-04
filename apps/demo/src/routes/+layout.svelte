<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import { Header, NavTree, SearchModal, theme, navModeStore } from '@cwygoda/service-catalog-ui';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  let { children, data }: { children: Snippet; data: LayoutData } = $props();

  onMount(() => {
    theme.init();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
  <div data-pagefind-ignore>
    <Header />
  </div>
  <div class="flex">
    {#if navModeStore.mode === 'tree'}
      <aside
        aria-label="Catalog navigation"
        class="hidden w-64 shrink-0 border-r border-gray-200 bg-white p-4 md:block dark:border-gray-700 dark:bg-gray-900"
        data-pagefind-ignore
      >
        <NavTree
          domains={data.catalog.domains}
          useCases={data.catalog.useCases}
          services={data.catalog.services}
        />
      </aside>
    {/if}
    <main class="flex-1">
      {@render children()}
    </main>
  </div>
  <SearchModal />
</div>
