import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Domain } from '@cwygoda/service-catalog-core';

export const load: PageLoad = async ({ params, parent }) => {
  const { catalog } = await parent();
  const useCase = catalog.useCases.find((uc) => uc.id === params.id);

  if (!useCase) {
    error(404, `Use case '${params.id}' not found`);
  }

  // Build lookup maps for O(1) access
  const serviceMap = new Map(catalog.services.map((s) => [s.id, s]));
  const domainMap = new Map(catalog.domains.map((d) => [d.id, d]));

  // Find participating services
  const participantServices = useCase.participants
    .map((p) => ({
      ...p,
      serviceName: serviceMap.get(p.service)?.name ?? p.service,
    }))
    .sort((a, b) => a.service.localeCompare(b.service));

  // Find domain and build ancestor chain for breadcrumbs
  const domain = useCase.domain ? (domainMap.get(useCase.domain) ?? null) : null;
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
    useCase,
    participantServices,
    domain,
    domainAncestors,
  };
};
