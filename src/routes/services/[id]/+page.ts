import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchCatalog } from '$lib/utils/fetch-catalog.js';

export const load: PageLoad = async ({ fetch, params }) => {
  const catalog = await fetchCatalog(fetch);
  const service = catalog.services.find((s) => s.id === params.id);

  if (!service) {
    error(404, `Service '${params.id}' not found`);
  }

  return {
    service,
  };
};
