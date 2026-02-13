import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchCatalog } from '$lib/utils/fetch-catalog.js';

export const load: PageLoad = async ({ fetch, params }) => {
  const catalog = await fetchCatalog(fetch);
  const useCase = catalog.useCases.find((uc) => uc.id === params.id);

  if (!useCase) {
    error(404, `Use case '${params.id}' not found`);
  }

  // Find participating services
  const participantServices = useCase.participants
    .map((p) => {
      const service = catalog.services.find((s) => s.id === p.service);
      return service ? { ...p, serviceName: service.name } : { ...p, serviceName: p.service };
    })
    .sort((a, b) => a.service.localeCompare(b.service));

  return {
    useCase,
    participantServices,
  };
};
