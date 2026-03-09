import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Domain } from '@cwygoda/service-catalog';

export const load: PageLoad = async ({ params, parent }) => {
  const { catalog } = await parent();
  const domainMap = new Map(catalog.domains.map((d) => [d.id, d]));
  const domain = domainMap.get(params.id);

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
    const p = domainMap.get(current.parent);
    if (!p) break;
    ancestors.unshift(p);
    current = p;
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
