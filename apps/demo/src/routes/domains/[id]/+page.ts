import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchCatalog } from '@cwygoda/service-catalog-ui';
import type { Domain } from '@cwygoda/service-catalog-core';

export const load: PageLoad = async ({ fetch, params }) => {
  const catalog = await fetchCatalog(fetch);
  const domain = catalog.domains.find((d) => d.id === params.id);

  if (!domain) {
    error(404, `Domain '${params.id}' not found`);
  }

  const useCases = catalog.useCases.filter((uc) => uc.domain === domain.id);
  const services = catalog.services.filter((s) => s.domain === domain.id);
  const dataStores = catalog.dataStores.filter((ds) => ds.domain === domain.id);
  const childDomains = catalog.domains.filter((d) => d.parent === domain.id);

  // Build ancestor chain for breadcrumbs
  const ancestors: Domain[] = [];
  let current = domain;
  while (current.parent) {
    const parent = catalog.domains.find((d) => d.id === current.parent);
    if (!parent) break;
    ancestors.unshift(parent);
    current = parent;
  }

  return {
    domain,
    useCases,
    services,
    dataStores,
    childDomains,
    ancestors,
  };
};
