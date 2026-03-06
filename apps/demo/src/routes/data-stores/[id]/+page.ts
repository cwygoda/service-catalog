import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Domain } from '@cwygoda/service-catalog-core';

export const load: PageLoad = async ({ params, parent }) => {
  const { catalog } = await parent();
  const dataStore = catalog.dataStores.find((ds) => ds.id === params.id);

  if (!dataStore) {
    error(404, `Data store '${params.id}' not found`);
  }

  const domainMap = new Map(catalog.domains.map((d) => [d.id, d]));

  // Find owner service
  const ownerService = dataStore.owner
    ? (catalog.services.find((s) => s.id === dataStore.owner) ?? null)
    : null;

  // Find domain and build ancestor chain for breadcrumbs
  const domain = dataStore.domain ? (domainMap.get(dataStore.domain) ?? null) : null;
  const domainAncestors: Domain[] = [];
  if (domain) {
    domainAncestors.push(domain);
    let current = domain;
    while (current.parent) {
      const p = domainMap.get(current.parent);
      if (!p) break;
      domainAncestors.unshift(p);
      current = p;
    }
  }

  return {
    dataStore,
    ownerService,
    domain,
    domainAncestors,
  };
};
