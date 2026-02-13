import type { PageLoad } from './$types';
import { fetchCatalog } from '$lib/utils/fetch-catalog.js';

export const load: PageLoad = async ({ fetch }) => {
  const catalog = await fetchCatalog(fetch);

  return {
    serviceCount: catalog.services.length,
    recentServices: catalog.services.slice(0, 3),
  };
};
