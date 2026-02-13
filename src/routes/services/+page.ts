import type { PageLoad } from './$types';
import type { Catalog } from '../../core/domain/index.js';

export const load: PageLoad = async ({ fetch }) => {
  const response = await fetch('/catalog.json');
  const catalog = (await response.json()) as Catalog;

  return {
    services: catalog.services,
  };
};
