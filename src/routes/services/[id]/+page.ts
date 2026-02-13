import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchCatalog } from '$lib/utils/fetch-catalog.js';

export const load: PageLoad = async ({ fetch, params }) => {
  const catalog = await fetchCatalog(fetch);
  const service = catalog.services.find((s) => s.id === params.id);

  if (!service) {
    error(404, `Service '${params.id}' not found`);
  }

  // Get use cases this service participates in
  const useCases = catalog.useCases.filter((uc) =>
    uc.participants.some((p) => p.service === service.id)
  );

  return {
    service,
    useCases,
  };
};
