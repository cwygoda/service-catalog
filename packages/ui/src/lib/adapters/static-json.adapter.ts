import { Value } from '@sinclair/typebox/value';
import type { Catalog, Service } from '@service-catalog/core/domain';
import { findService } from '@service-catalog/core/domain';
import { CatalogSchema } from '@service-catalog/core/schemas';
import type { CatalogPort } from '../ports/catalog.port.js';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CacheEntry {
  data: Catalog;
  timestamp: number;
}

export function createStaticJsonAdapter(baseUrl = ''): CatalogPort {
  let cache: CacheEntry | null = null;

  async function fetchCatalog(): Promise<Catalog> {
    const now = Date.now();

    if (cache && now - cache.timestamp < CACHE_TTL_MS) {
      return cache.data;
    }

    const response = await fetch(`${baseUrl}/catalog.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch catalog: ${String(response.status)}`);
    }

    const data: unknown = await response.json();

    if (!Value.Check(CatalogSchema, data)) {
      const errors = [...Value.Errors(CatalogSchema, data)];
      const message = errors.map((e) => `${e.path}: ${e.message}`).join('; ');
      throw new Error(`Invalid catalog data: ${message}`);
    }

    cache = { data: data as Catalog, timestamp: now };
    return cache.data;
  }

  return {
    async getCatalog(): Promise<Catalog> {
      return fetchCatalog();
    },

    async getService(id: string): Promise<Service | undefined> {
      const catalog = await fetchCatalog();
      return findService(catalog, id);
    },
  };
}
