import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Catalog } from '../../../core/domain/index.js';

export const load: PageLoad = async ({ fetch, params }) => {
  const response = await fetch('/catalog.json');
  const catalog = (await response.json()) as Catalog;

  const service = catalog.services.find((s) => s.id === params.id);

  if (!service) {
    error(404, `Service '${params.id}' not found`);
  }

  return {
    service,
  };
};
