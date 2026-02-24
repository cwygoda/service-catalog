import type { LayoutLoad } from './$types';
import { fetchCatalog } from '@service-catalog/ui';

export const prerender = true;

export const load: LayoutLoad = async ({ fetch }) => {
  const catalog = await fetchCatalog(fetch);
  return { catalog };
};
