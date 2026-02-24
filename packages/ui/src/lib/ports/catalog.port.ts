import type { Catalog, Service } from '@service-catalog/core/domain';

export interface CatalogPort {
  getCatalog(): Promise<Catalog>;
  getService(id: string): Promise<Service | undefined>;
}
