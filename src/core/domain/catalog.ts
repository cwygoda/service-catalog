import type { Service } from './service.js';
import type { UseCase } from './use-case.js';
import type { Domain } from './domain.js';
import type { ServiceGraph } from './graph.js';

export interface Catalog {
  services: Service[];
  useCases: UseCase[];
  domains: Domain[];
  graph?: ServiceGraph;
}

export function createCatalog(
  services: Service[] = [],
  useCases: UseCase[] = [],
  domains: Domain[] = []
): Catalog {
  return { services, useCases, domains };
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

export function addDomain(catalog: Catalog, domain: Domain): Catalog {
  return { ...catalog, domains: [...catalog.domains, domain] };
}

export function findDomain(catalog: Catalog, id: string): Domain | undefined {
  return catalog.domains.find((d) => d.id === id);
}

export function getDomainUseCases(catalog: Catalog, domainId: string): UseCase[] {
  return catalog.useCases.filter((uc) => uc.domain === domainId);
}

export function getDomainServices(catalog: Catalog, domainId: string): Service[] {
  return catalog.services.filter((s) => s.domain === domainId);
}

export function getChildDomains(catalog: Catalog, parentId: string): Domain[] {
  return catalog.domains.filter((d) => d.parent === parentId);
}
