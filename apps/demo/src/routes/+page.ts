import type { PageLoad } from './$types';
import { fetchCatalog } from '@cwygoda/service-catalog-ui';

export const load: PageLoad = async ({ fetch }) => {
  const catalog = await fetchCatalog(fetch);

  return {
    serviceCount: catalog.services.length,
    useCaseCount: catalog.useCases.length,
    domainCount: catalog.domains.length,
    dataStoreCount: catalog.dataStores.length,
    recentServices: catalog.services.slice(0, 3),
    featuredUseCases: catalog.useCases.slice(0, 3),
  };
};
