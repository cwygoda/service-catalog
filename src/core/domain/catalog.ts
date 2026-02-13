import type { Service } from './service.js';
import type { UseCase } from './use-case.js';

export interface Catalog {
  services: Service[];
  useCases: UseCase[];
}

export function createCatalog(services: Service[] = [], useCases: UseCase[] = []): Catalog {
  return { services, useCases };
}

export function addService(catalog: Catalog, service: Service): Catalog {
  return { ...catalog, services: [...catalog.services, service] };
}

export function addUseCase(catalog: Catalog, useCase: UseCase): Catalog {
  return { ...catalog, useCases: [...catalog.useCases, useCase] };
}

export function findService(catalog: Catalog, id: string): Service | undefined {
  return catalog.services.find((s) => s.id === id);
}

export function findUseCase(catalog: Catalog, id: string): UseCase | undefined {
  return catalog.useCases.find((uc) => uc.id === id);
}

export function getServiceUseCases(catalog: Catalog, serviceId: string): UseCase[] {
  return catalog.useCases.filter((uc) => uc.participants.some((p) => p.service === serviceId));
}
