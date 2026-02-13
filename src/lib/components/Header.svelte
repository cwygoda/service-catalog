<script lang="ts">
  import { page } from '$app/state';
  import ThemeToggle from './ThemeToggle.svelte';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services', label: 'Services' },
  ];

  function isActive(href: string): boolean {
    if (href === '/') {
      return page.url.pathname === '/';
    }
    return page.url.pathname.startsWith(href);
  }
</script>

<header class="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div class="flex h-16 items-center justify-between">
      <div class="flex items-center">
        <a href="/" class="text-xl font-bold text-gray-900 dark:text-white"> Service Catalog </a>
        <nav class="ml-10 flex space-x-4">
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
      <ThemeToggle />
    </div>
  </div>
</header>
