<script lang="ts">
  import { onMount, onDestroy, tick } from 'svelte';
  import { browser } from '$app/environment';
  import { searchStore } from '../stores/search.svelte.js';

  interface SearchResult {
    id: string;
    url: string;
    meta: { title?: string; type?: string; domain?: string };
    excerpt: string;
  }

  let query = $state('');
  let results = $state<SearchResult[]>([]);
  let loading = $state(false);
  let selectedIndex = $state(0);
  let devMode = $state(false);

  let inputEl: HTMLInputElement | undefined = $state();
  let pagefind: {
    search: (
      q: string
    ) => Promise<{ results: { id: string; data: () => Promise<SearchResult> }[] }>;
  } | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  async function initPagefind() {
    if (pagefind) return;
    try {
      // Use a variable to prevent bundler from statically analyzing the import
      // path. Pagefind injects its JS into the build output at build time.
      const pagefindPath = '/pagefind/pagefind.js';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const pf = await import(/* @vite-ignore */ pagefindPath);
      await pf.init();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      pagefind = pf;
    } catch {
      pagefind = null;
      devMode = true;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchStore.toggle();
    }
    if (e.key === 'Escape' && searchStore.open) {
      e.preventDefault();
      close();
    }
  }

  function close() {
    searchStore.hide();
    query = '';
    results = [];
    selectedIndex = 0;
  }

  async function search(q: string) {
    if (!pagefind || !q.trim()) {
      results = [];
      return;
    }
    loading = true;
    try {
      const response = await pagefind.search(q);
      const items = await Promise.all(response.results.slice(0, 8).map((r) => r.data()));
      results = items;
      selectedIndex = 0;
    } finally {
      loading = false;
    }
  }

  function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      void search(query);
    }, 150);
  }

  function handleModalKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (e.key === 'Enter') {
      const selected = results[selectedIndex];
      if (selected) {
        e.preventDefault();
        navigate(selected.url);
      }
    }
  }

  function navigate(url: string) {
    close();
    window.location.href = url;
  }

  function getTypeBadgeClass(type: string | undefined): string {
    switch (type) {
      case 'Service':
        return 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300';
      case 'Use Case':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
      case 'Domain':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300';
    }
  }

  $effect(() => {
    if (searchStore.open && browser) {
      void initPagefind();
      void tick().then(() => inputEl?.focus());
    }
  });

  onMount(() => {
    if (browser) {
      window.addEventListener('keydown', handleKeydown);
    }
  });

  onDestroy(() => {
    if (browser) {
      window.removeEventListener('keydown', handleKeydown);
    }
    clearTimeout(debounceTimer);
  });
</script>

{#if searchStore.open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
    role="presentation"
    onclick={close}
    onkeydown={(e) => {
      if (e.key === 'Escape') close();
    }}
  ></div>

  <!-- Modal -->
  <div
    class="fixed inset-x-0 top-[15%] z-50 mx-auto w-full max-w-lg"
    role="dialog"
    aria-modal="true"
    aria-label="Search catalog"
    onkeydown={handleModalKeydown}
  >
    <div
      class="mx-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800"
    >
      <!-- Search input -->
      <div class="flex items-center border-b border-gray-200 px-4 dark:border-gray-700">
        <svg
          class="h-5 w-5 shrink-0 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          bind:this={inputEl}
          bind:value={query}
          oninput={handleInput}
          type="text"
          placeholder="Search services, use cases, domains..."
          class="w-full bg-transparent px-3 py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-white dark:placeholder:text-gray-500"
        />
        <kbd
          class="hidden rounded border border-gray-300 px-1.5 py-0.5 text-xs text-gray-400 sm:inline dark:border-gray-600"
        >
          Esc
        </kbd>
      </div>

      <!-- Results -->
      <div class="max-h-80 overflow-y-auto">
        {#if devMode}
          <div class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Search available in production build
          </div>
        {:else if loading}
          <div class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            Searching...
          </div>
        {:else if query && results.length === 0}
          <div class="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No results for "{query}"
          </div>
        {:else}
          <ul role="listbox">
            {#each results as result, i (result.url)}
              <li
                role="option"
                aria-selected={i === selectedIndex}
                class="cursor-pointer border-b border-gray-100 px-4 py-3 last:border-b-0 dark:border-gray-700 {i ===
                selectedIndex
                  ? 'bg-primary-50 dark:bg-primary-900/30'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}"
                onclick={() => {
                  navigate(result.url);
                }}
                onmouseenter={() => {
                  selectedIndex = i;
                }}
              >
                <div class="flex items-center gap-2">
                  {#if result.meta.type}
                    <span
                      class="rounded px-1.5 py-0.5 text-xs font-medium {getTypeBadgeClass(
                        result.meta.type
                      )}"
                    >
                      {result.meta.type}
                    </span>
                  {/if}
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {result.meta.title ?? ''}
                  </span>
                </div>
                {#if result.excerpt}
                  <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <!-- eslint-disable-next-line svelte/no-at-html-tags — pagefind sanitizes excerpts -->
                    {@html result.excerpt}
                  </p>
                {/if}
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-between border-t border-gray-200 px-4 py-2 text-xs text-gray-400 dark:border-gray-700 dark:text-gray-500"
      >
        <div class="flex gap-2">
          <span><kbd class="font-mono">&uarr;&darr;</kbd> navigate</span>
          <span><kbd class="font-mono">&crarr;</kbd> open</span>
        </div>
        <span>Powered by Pagefind</span>
      </div>
    </div>
  </div>
{/if}
