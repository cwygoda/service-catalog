import type { PageLoad } from './$types';
import { fetchCatalog } from '@cwygoda/service-catalog-ui';

export const load: PageLoad = async ({ fetch }) => {
  const catalog = await fetchCatalog(fetch);

  return {
    useCases: catalog.useCases,
  };
};
