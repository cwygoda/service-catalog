import type { Catalog, Service } from '../../core/domain/index.js';
import type { CatalogPort } from '../ports/catalog.port.js';

export function createStaticJsonAdapter(baseUrl = ''): CatalogPort {
  let catalogCache: Catalog | null = null;

  async function fetchCatalog(): Promise<Catalog> {
    if (catalogCache) {
      return catalogCache;
    }

    const response = await fetch(`${baseUrl}/catalog.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch catalog: ${String(response.status)}`);
    }

    catalogCache = (await response.json()) as Catalog;
    return catalogCache;
  }

  return {
    async getCatalog(): Promise<Catalog> {
      return fetchCatalog();
    },

    async getService(id: string): Promise<Service | undefined> {
      const catalog = await fetchCatalog();
      return catalog.services.find((s) => s.id === id);
    },
  };
}
