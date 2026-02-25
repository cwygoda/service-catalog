<script lang="ts">
  interface BreadcrumbItem {
    label: string;
    href: string;
  }

  interface Props {
    items: BreadcrumbItem[];
    current: string;
  }

  let { items, current }: Props = $props();
</script>

<nav aria-label="Breadcrumb" class="mb-6">
  <ol class="flex flex-wrap items-center gap-1 text-sm">
    {#each items as item (item.href)}
      <li class="flex items-center">
        <a
          href={item.href}
          class="text-primary-600 hover:text-primary-800 hover:underline dark:text-primary-400 dark:hover:text-primary-200"
        >
          {item.label}
        </a>
        <span class="mx-2 text-gray-400" aria-hidden="true">/</span>
      </li>
    {/each}
    <li class="text-gray-700 dark:text-gray-300" aria-current="page">
      {current}
    </li>
  </ol>
</nav>
