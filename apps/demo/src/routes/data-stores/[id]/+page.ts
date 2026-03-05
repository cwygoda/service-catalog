import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchCatalog } from '@cwygoda/service-catalog-ui';
import type { Domain } from '@cwygoda/service-catalog-core';

export const load: PageLoad = async ({ fetch, params }) => {
  const catalog = await fetchCatalog(fetch);
  const dataStore = catalog.dataStores.find((ds) => ds.id === params.id);

  if (!dataStore) {
    error(404, `Data store '${params.id}' not found`);
  }

  // Find owner service
  const ownerService = dataStore.owner
    ? catalog.services.find((s) => s.id === dataStore.owner)
    : null;

  // Find domain and build ancestor chain for breadcrumbs
  const domain = dataStore.domain ? catalog.domains.find((d) => d.id === dataStore.domain) : null;
  const domainAncestors: Domain[] = [];
  if (domain) {
    domainAncestors.push(domain);
    let current = domain;
    while (current.parent) {
      const parent = catalog.domains.find((d) => d.id === current.parent);
      if (!parent) break;
      domainAncestors.unshift(parent);
      current = parent;
    }
  }

  return {
    dataStore,
    ownerService,
    domain,
    domainAncestors,
  };
};
