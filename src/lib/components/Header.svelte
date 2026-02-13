<script lang="ts">
  import { page } from '$app/state';
  import ThemeToggle from './ThemeToggle.svelte';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/use-cases', label: 'Use Cases' },
    { href: '/services', label: 'Services' },
  ];

  let mobileMenuOpen = $state(false);

  function isActive(href: string): boolean {
    if (href === '/') {
      return page.url.pathname === '/';
    }
    return page.url.pathname.startsWith(href);
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<header class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <div class="flex items-center">
        <a href="/" class="text-xl font-bold text-gray-900 dark:text-white"> Service Catalog </a>
        <!-- Desktop nav -->
        <nav class="ml-10 hidden space-x-4 sm:flex">
          {#each navLinks as link (link.href)}
            <a
              href={link.href}
              class="rounded-md px-3 py-2 text-sm font-medium transition-colors {isActive(link.href)
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}"
            >
              {link.label}
            </a>
          {/each}
        </nav>
      </div>

      <div class="flex items-center gap-2">
        <ThemeToggle />
        <!-- Mobile menu button -->
        <button
          onclick={toggleMobileMenu}
          class="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:hidden dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {#if mobileMenuOpen}
            <!-- Close icon -->
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          {:else}
            <!-- Hamburger icon -->
            <svg
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile menu -->
  {#if mobileMenuOpen}
    <nav
      class="border-t border-gray-200 bg-white px-4 py-3 sm:hidden dark:border-gray-700 dark:bg-gray-900"
    >
      <div class="flex flex-col space-y-1">
        {#each navLinks as link (link.href)}
          <a
            href={link.href}
            onclick={closeMobileMenu}
            class="rounded-md px-3 py-2 text-base font-medium transition-colors {isActive(link.href)
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'}"
          >
            {link.label}
          </a>
        {/each}
      </div>
    </nav>
  {/if}
</header>
