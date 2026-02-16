import type { LayoutLoad } from './$types';
import { fetchCatalog } from '$lib/utils/fetch-catalog.js';

export const prerender = true;

export const load: LayoutLoad = async ({ fetch }) => {
  const catalog = await fetchCatalog(fetch);
  return { catalog };
};
