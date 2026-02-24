import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchCatalog } from '@cwygoda/service-catalog-ui';
import type { Domain } from '@cwygoda/service-catalog-core';

export const load: PageLoad = async ({ fetch, params }) => {
  const catalog = await fetchCatalog(fetch);
  const useCase = catalog.useCases.find((uc) => uc.id === params.id);

  if (!useCase) {
    error(404, `Use case '${params.id}' not found`);
  }

  // Find participating services
  const participantServices = useCase.participants
    .map((p) => {
      const service = catalog.services.find((s) => s.id === p.service);
      return service ? { ...p, serviceName: service.name } : { ...p, serviceName: p.service };
    })
    .sort((a, b) => a.service.localeCompare(b.service));

  // Find domain and build ancestor chain for breadcrumbs
  const domain = useCase.domain ? catalog.domains.find((d) => d.id === useCase.domain) : null;
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
    useCase,
    participantServices,
    domain,
    domainAncestors,
  };
};
