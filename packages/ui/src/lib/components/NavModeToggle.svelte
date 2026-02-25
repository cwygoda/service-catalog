<script lang="ts">
  import { navModeStore } from '$lib/stores/nav-mode.svelte.js';
</script>

<button
  onclick={() => {
    navModeStore.toggle();
  }}
  class="hidden rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:block dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
  aria-label={navModeStore.mode === 'flat' ? 'Switch to tree view' : 'Switch to flat view'}
  title={navModeStore.mode === 'flat' ? 'Switch to tree view' : 'Switch to flat view'}
>
  <span class="sr-only" aria-live="polite">Navigation: {navModeStore.mode} view</span>
  {#if navModeStore.mode === 'flat'}
    <!-- List icon -->
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  {:else}
    <!-- Tree icon -->
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3 7h2m4 0h12M3 12h2m4 0h12M3 17h2m4 0h12"
      />
    </svg>
  {/if}
</button>
