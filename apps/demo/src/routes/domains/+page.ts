import type { PageLoad } from './$types';
import { fetchCatalog } from '@cwygoda/service-catalog-ui';

export const load: PageLoad = async ({ fetch }) => {
  const catalog = await fetchCatalog(fetch);

  const domainsWithCounts = catalog.domains.map((domain) => ({
    domain,
    useCaseCount: catalog.useCases.filter((uc) => uc.domain === domain.id).length,
    serviceCount: catalog.services.filter((s) => s.domain === domain.id).length,
  }));

  return {
    domains: domainsWithCounts,
  };
};
