import type { PageLoad } from './$types';
import type { Catalog } from '../core/domain/index.js';

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch('/catalog.json');
  const catalog = (await response.json()) as Catalog;

  return {
    serviceCount: catalog.services.length,
    recentServices: catalog.services.slice(0, 3),
  };
};
