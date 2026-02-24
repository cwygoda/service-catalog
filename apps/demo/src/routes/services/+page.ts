import type { PageLoad } from './$types';
import { fetchCatalog } from '@service-catalog/ui';

export const load: PageLoad = async ({ fetch }) => {
  const catalog = await fetchCatalog(fetch);

  return {
    services: catalog.services,
  };
};
