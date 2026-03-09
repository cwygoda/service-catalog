import type { Catalog, Service } from '@cwygoda/service-catalog/domain';

export interface CatalogPort {
  getCatalog(): Promise<Catalog>;
  getService(id: string): Promise<Service | undefined>;
}
