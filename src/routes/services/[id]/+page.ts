import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchCatalog } from '$lib/utils/fetch-catalog.js';
import type { Domain } from '$lib/../core/domain/index.js';

export const load: PageLoad = async ({ fetch, params }) => {
  const catalog = await fetchCatalog(fetch);
  const service = catalog.services.find((s) => s.id === params.id);

  if (!service) {
    error(404, `Service '${params.id}' not found`);
  }

  // Get use cases this service participates in
  const useCases = catalog.useCases.filter((uc) =>
    uc.participants.some((p) => p.service === service.id)
  );

  // Find domain and build ancestor chain for breadcrumbs
  const domain = service.domain ? catalog.domains.find((d) => d.id === service.domain) : null;
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
    service,
    useCases,
    domain,
    domainAncestors,
  };
};
