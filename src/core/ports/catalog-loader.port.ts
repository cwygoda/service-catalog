import type { Catalog } from '../domain/catalog.js';

export interface CatalogLoaderPort {
  load(path: string): Promise<Catalog>;
}
