import type { Service } from './service.js';

export interface Catalog {
  services: Service[];
}

export function createCatalog(services: Service[] = []): Catalog {
  return { services };
}

export function addService(catalog: Catalog, service: Service): Catalog {
  return { services: [...catalog.services, service] };
}

export function findService(catalog: Catalog, id: string): Service | undefined {
  return catalog.services.find((s) => s.id === id);
}
