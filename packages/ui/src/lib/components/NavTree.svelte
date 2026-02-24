<script lang="ts">
  import { SvelteSet } from 'svelte/reactivity';
  import type { Domain, UseCase, Service } from '@service-catalog/core/domain';

  interface Props {
    domains: Domain[];
    useCases: UseCase[];
    services: Service[];
  }

  let { domains, useCases, services }: Props = $props();

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

  // Get root domains (no parent)
  const rootDomains = $derived(domains.filter((d) => !d.parent));

  // Helper to get child domains
  function getChildDomains(parentId: string): Domain[] {
    return domains.filter((d) => d.parent === parentId);
  }

  // Helper to get use cases for a domain
  function getDomainUseCases(domainId: string): UseCase[] {
    return useCases.filter((uc) => uc.domain === domainId);
  }

  // Helper to get services for a domain
  function getDomainServices(domainId: string): Service[] {
    return services.filter((s) => s.domain === domainId);
  }

  // Helper to get services for a use case
  function getUseCaseServices(useCase: UseCase): Service[] {
    const serviceIds = useCase.participants.map((p) => p.service);
    return services.filter((s) => serviceIds.includes(s.id));
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
            class="flex h-5 w-5 items-center justify-center rounded text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-expanded={expandedDomains.has(domain.id)}
            aria-label={expandedDomains.has(domain.id) ? 'Collapse' : 'Expand'}
          >
            <svg
              class="h-3 w-3 transition-transform {expandedDomains.has(domain.id)
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
                      class="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-expanded={expandedUseCases.has(useCase.id)}
                      aria-label={expandedUseCases.has(useCase.id) ? 'Collapse' : 'Expand'}
                    >
                      <svg
                        class="h-3 w-3 transition-transform {expandedUseCases.has(useCase.id)
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
                    <span class="w-5"></span>
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
                          class="block rounded px-2 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
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
                  class="ml-5 block rounded px-2 py-1 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  {service.name}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </li>
    {/each}
  </ul>
</nav>
