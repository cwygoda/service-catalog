<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import favicon from '$lib/assets/favicon.svg';
  import Header from '$lib/components/Header.svelte';
  import NavTree from '$lib/components/NavTree.svelte';
  import { theme } from '$lib/stores/theme.svelte';
  import { navModeStore } from '$lib/stores/nav-mode.svelte.js';
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
  <Header />
  <div class="flex">
    {#if navModeStore.mode === 'tree'}
      <aside
        class="hidden w-64 shrink-0 border-r border-gray-200 bg-white p-4 lg:block dark:border-gray-700 dark:bg-gray-900"
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
</div>
