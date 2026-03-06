<script lang="ts">
  import { SvelteMap, SvelteSet } from 'svelte/reactivity';
  import type { Domain, UseCase, Service, DataStore } from '@cwygoda/service-catalog-core/domain';

  interface Props {
    domains: Domain[];
    useCases: UseCase[];
    services: Service[];
    dataStores?: DataStore[];
  }

  let { domains, useCases, services, dataStores = [] }: Props = $props();

  // Track expanded state for domains and use cases
  const expandedDomains = new SvelteSet<string>();
  const expandedUseCases = new SvelteSet<string>();

  function toggleDomain(id: string) {
    if (expandedDomains.has(id)) {
      expandedDomains.delete(id);
    } else {
      expandedDomains.add(id);
    }
  }

  function toggleUseCase(id: string) {
    if (expandedUseCases.has(id)) {
      expandedUseCases.delete(id);
    } else {
      expandedUseCases.add(id);
    }
  }

  // Pre-computed lookup maps — O(1) per query instead of O(n) filter scans
  const rootDomains = $derived(domains.filter((d) => !d.parent));

  const childDomainMap = $derived.by(() => {
    const map = new SvelteMap<string, Domain[]>();
    for (const d of domains) {
      if (d.parent) {
        const arr = map.get(d.parent);
        if (arr) arr.push(d);
        else map.set(d.parent, [d]);
      }
    }
    return map;
  });

  const domainUseCaseMap = $derived.by(() => {
    const map = new SvelteMap<string, UseCase[]>();
    for (const uc of useCases) {
      if (!uc.domain) continue;
      const arr = map.get(uc.domain);
      if (arr) arr.push(uc);
      else map.set(uc.domain, [uc]);
    }
    return map;
  });

  const domainServiceMap = $derived.by(() => {
    const map = new SvelteMap<string, Service[]>();
    for (const s of services) {
      if (!s.domain) continue;
      const arr = map.get(s.domain);
      if (arr) arr.push(s);
      else map.set(s.domain, [s]);
    }
    return map;
  });

  const domainDataStoreMap = $derived.by(() => {
    const map = new SvelteMap<string, DataStore[]>();
    for (const ds of dataStores) {
      if (!ds.domain) continue;
      const arr = map.get(ds.domain);
      if (arr) arr.push(ds);
      else map.set(ds.domain, [ds]);
    }
    return map;
  });

  const serviceById = $derived.by(() => new SvelteMap(services.map((s) => [s.id, s] as const)));

  // Thin wrappers — keep template call sites unchanged
  function getChildDomains(parentId: string): Domain[] {
    return childDomainMap.get(parentId) ?? [];
  }

  function getDomainUseCases(domainId: string): UseCase[] {
    return domainUseCaseMap.get(domainId) ?? [];
  }

  function getDomainServices(domainId: string): Service[] {
    return domainServiceMap.get(domainId) ?? [];
  }

  function getDomainDataStores(domainId: string): DataStore[] {
    return domainDataStoreMap.get(domainId) ?? [];
  }

  function getUseCaseServices(useCase: UseCase): Service[] {
    return useCase.participants
      .map((p) => serviceById.get(p.service))
      .filter((s): s is Service => s !== undefined);
  }
</script>

<nav class="text-sm" aria-label="Catalog tree">
  <ul class="space-y-1">
    {#each rootDomains as domain (domain.id)}
      <li>
        <div class="flex items-center gap-1">
          <button
            type="button"
            onclick={() => {
              toggleDomain(domain.id);
            }}
            class="flex min-h-11 min-w-11 items-center justify-center rounded text-gray-500 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-600 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-expanded={expandedDomains.has(domain.id)}
            aria-label={expandedDomains.has(domain.id) ? 'Collapse' : 'Expand'}
          >
            <svg
              class="h-4 w-4 transition-transform {expandedDomains.has(domain.id)
                ? 'rotate-90'
                : ''}"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
          <a
            href="/domains/{domain.id}"
            class="flex-1 rounded px-2 py-1 font-medium text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          >
            {domain.name}
          </a>
        </div>

        {#if expandedDomains.has(domain.id)}
          <ul class="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-2 dark:border-gray-700">
            <!-- Child Domains -->
            {#each getChildDomains(domain.id) as child (child.id)}
              <li>
                <a
                  href="/domains/{child.id}"
                  class="block rounded px-2 py-1 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {child.name}
                </a>
              </li>
            {/each}

            <!-- Use Cases -->
            {#each getDomainUseCases(domain.id) as useCase (useCase.id)}
              <li>
                <div class="flex items-center gap-1">
                  {#if getUseCaseServices(useCase).length > 0}
                    <button
                      type="button"
                      onclick={() => {
                        toggleUseCase(useCase.id);
                      }}
                      class="flex min-h-11 min-w-11 items-center justify-center rounded text-gray-400 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-600 dark:hover:bg-gray-700"
                      aria-expanded={expandedUseCases.has(useCase.id)}
                      aria-label={expandedUseCases.has(useCase.id) ? 'Collapse' : 'Expand'}
                    >
                      <svg
                        class="h-4 w-4 transition-transform {expandedUseCases.has(useCase.id)
                          ? 'rotate-90'
                          : ''}"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  {:else}
                    <span class="min-w-11"></span>
                  {/if}
                  <a
                    href="/use-cases/{useCase.id}"
                    class="flex-1 rounded px-2 py-1 text-primary-600 hover:bg-gray-100 dark:text-primary-400 dark:hover:bg-gray-700"
                  >
                    {useCase.name}
                  </a>
                </div>

                {#if expandedUseCases.has(useCase.id)}
                  <ul
                    class="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-2 dark:border-gray-700"
                  >
                    {#each getUseCaseServices(useCase) as service (service.id)}
                      <li>
                        <a
                          href="/services/{service.id}"
                          class="block rounded px-2 py-1 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          {service.name}
                        </a>
                      </li>
                    {/each}
                  </ul>
                {/if}
              </li>
            {/each}

            <!-- Services directly in domain (not via use case) -->
            {#each getDomainServices(domain.id) as service (service.id)}
              <li>
                <a
                  href="/services/{service.id}"
                  class="ml-5 block rounded px-2 py-1 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {service.name}
                </a>
              </li>
            {/each}

            <!-- Data Stores -->
            {#each getDomainDataStores(domain.id) as ds (ds.id)}
              <li>
                <a
                  href="/data-stores/{ds.id}"
                  class="ml-5 block rounded px-2 py-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  {ds.name}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ul>
</nav>
