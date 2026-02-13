import type { Catalog, Service } from '../../core/domain/index.js';

export interface CatalogPort {
  getCatalog(): Promise<Catalog>;
  getService(id: string): Promise<Service | undefined>;
}
