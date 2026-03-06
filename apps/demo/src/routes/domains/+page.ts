import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { catalog } = await parent();

  const domainsWithCounts = catalog.domains.map((domain) => ({
    domain,
    useCaseCount: catalog.useCases.filter((uc) => uc.domain === domain.id).length,
    serviceCount: catalog.services.filter((s) => s.domain === domain.id).length,
  }));

  return {
    domains: domainsWithCounts,
  };
};
