import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchCatalog } from '$lib/utils/fetch-catalog.js';

export const load: PageLoad = async ({ fetch, params }) => {
  const catalog = await fetchCatalog(fetch);
  const domain = catalog.domains.find((d) => d.id === params.id);

  if (!domain) {
    error(404, `Domain '${params.id}' not found`);
  }

  const useCases = catalog.useCases.filter((uc) => uc.domain === domain.id);
  const services = catalog.services.filter((s) => s.domain === domain.id);
  const childDomains = catalog.domains.filter((d) => d.parent === domain.id);

  return {
    domain,
    useCases,
    services,
    childDomains,
  };
};
