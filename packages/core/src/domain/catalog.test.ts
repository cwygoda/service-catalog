import { describe, it, expect } from 'vitest';
import {
  createCatalog,
  addService,
  addUseCase,
  addDomain,
  findService,
  findUseCase,
  findDomain,
  getServiceUseCases,
  getDomainUseCases,
  getDomainServices,
  getChildDomains,
} from './catalog.js';
import { createService } from './service.js';
import { createUseCase, type UseCase } from './use-case.js';
import { createDomain } from './domain.js';

describe('Catalog', () => {
  describe('createCatalog', () => {
    it('creates empty catalog', () => {
      const catalog = createCatalog();
      expect(catalog.services).toEqual([]);
      expect(catalog.useCases).toEqual([]);
      expect(catalog.domains).toEqual([]);
    });

    it('creates catalog with services', () => {
      const service = createService('test', 'Test', 'Description');
      const catalog = createCatalog([service]);
      expect(catalog.services).toHaveLength(1);
      expect(catalog.services[0]).toBe(service);
      expect(catalog.useCases).toEqual([]);
      expect(catalog.domains).toEqual([]);
    });

    it('creates catalog with services and use cases', () => {
      const service = createService('test', 'Test', 'Description');
      const useCase = createUseCase('checkout', 'Checkout', 'Flow');
      const catalog = createCatalog([service], [useCase]);

      expect(catalog.services).toHaveLength(1);
      expect(catalog.useCases).toHaveLength(1);
      expect(catalog.domains).toEqual([]);
    });

    it('creates catalog with domains', () => {
      const domain = createDomain('commerce', 'Commerce', 'E-commerce domain');
      const catalog = createCatalog([], [], [domain]);

      expect(catalog.domains).toHaveLength(1);
      expect(catalog.domains[0]).toBe(domain);
    });
  });

  describe('addService', () => {
    it('adds service to empty catalog', () => {
      const catalog = createCatalog();
      const service = createService('test', 'Test', 'Description');
      const updated = addService(catalog, service);

      expect(updated.services).toHaveLength(1);
      expect(updated.services[0]).toBe(service);
    });

    it('does not mutate original catalog', () => {
      const catalog = createCatalog();
      const service = createService('test', 'Test', 'Description');
      addService(catalog, service);

      expect(catalog.services).toHaveLength(0);
    });

    it('preserves useCases when adding service', () => {
      const useCase = createUseCase('checkout', 'Checkout', 'Flow');
      const catalog = createCatalog([], [useCase]);
      const service = createService('test', 'Test', 'Description');
      const updated = addService(catalog, service);

      expect(updated.useCases).toHaveLength(1);
      expect(updated.useCases[0]).toBe(useCase);
    });
  });

  describe('addUseCase', () => {
    it('adds use case to empty catalog', () => {
      const catalog = createCatalog();
      const useCase = createUseCase('checkout', 'Checkout', 'Flow');
      const updated = addUseCase(catalog, useCase);

      expect(updated.useCases).toHaveLength(1);
      expect(updated.useCases[0]).toBe(useCase);
    });

    it('does not mutate original catalog', () => {
      const catalog = createCatalog();
      const useCase = createUseCase('checkout', 'Checkout', 'Flow');
      addUseCase(catalog, useCase);

      expect(catalog.useCases).toHaveLength(0);
    });

    it('preserves services when adding use case', () => {
      const service = createService('test', 'Test', 'Description');
      const catalog = createCatalog([service]);
      const useCase = createUseCase('checkout', 'Checkout', 'Flow');
      const updated = addUseCase(catalog, useCase);

      expect(updated.services).toHaveLength(1);
      expect(updated.services[0]).toBe(service);
    });
  });

  describe('findService', () => {
    it('finds service by id', () => {
      const service = createService('test', 'Test', 'Description');
      const catalog = createCatalog([service]);

      expect(findService(catalog, 'test')).toBe(service);
    });

    it('returns undefined for unknown id', () => {
      const catalog = createCatalog();
      expect(findService(catalog, 'unknown')).toBeUndefined();
    });
  });

  describe('findUseCase', () => {
    it('finds use case by id', () => {
      const useCase = createUseCase('checkout', 'Checkout', 'Flow');
      const catalog = createCatalog([], [useCase]);

      expect(findUseCase(catalog, 'checkout')).toBe(useCase);
    });

    it('returns undefined for unknown id', () => {
      const catalog = createCatalog();
      expect(findUseCase(catalog, 'unknown')).toBeUndefined();
    });
  });

  describe('getServiceUseCases', () => {
    it('returns use cases where service participates', () => {
      const useCase: UseCase = {
        id: 'checkout',
        name: 'Checkout',
        description: 'Flow',
        participants: [
          { service: 'order-service', role: 'Creates orders' },
          { service: 'billing-service', role: 'Processes payment' },
        ],
        steps: [],
      };
      const catalog = createCatalog([], [useCase]);

      const result = getServiceUseCases(catalog, 'order-service');

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(useCase);
    });

    it('returns empty array when service not in any use case', () => {
      const useCase: UseCase = {
        id: 'checkout',
        name: 'Checkout',
        description: 'Flow',
        participants: [{ service: 'order-service', role: 'Creates orders' }],
        steps: [],
      };
      const catalog = createCatalog([], [useCase]);

      const result = getServiceUseCases(catalog, 'unknown-service');

      expect(result).toEqual([]);
    });

    it('returns multiple use cases when service participates in many', () => {
      const useCase1: UseCase = {
        id: 'checkout',
        name: 'Checkout',
        description: 'Flow',
        participants: [{ service: 'order-service', role: 'Creates orders' }],
        steps: [],
      };
      const useCase2: UseCase = {
        id: 'returns',
        name: 'Returns',
        description: 'Flow',
        participants: [{ service: 'order-service', role: 'Processes returns' }],
        steps: [],
      };
      const catalog = createCatalog([], [useCase1, useCase2]);

      const result = getServiceUseCases(catalog, 'order-service');

      expect(result).toHaveLength(2);
    });
  });

  describe('addDomain', () => {
    it('adds domain to empty catalog', () => {
      const catalog = createCatalog();
      const domain = createDomain('commerce', 'Commerce', 'Description');
      const updated = addDomain(catalog, domain);

      expect(updated.domains).toHaveLength(1);
      expect(updated.domains[0]).toBe(domain);
    });

    it('does not mutate original catalog', () => {
      const catalog = createCatalog();
      const domain = createDomain('commerce', 'Commerce', 'Description');
      addDomain(catalog, domain);

      expect(catalog.domains).toHaveLength(0);
    });

    it('preserves services and useCases when adding domain', () => {
      const service = createService('test', 'Test', 'Description');
      const useCase = createUseCase('checkout', 'Checkout', 'Flow');
      const catalog = createCatalog([service], [useCase]);
      const domain = createDomain('commerce', 'Commerce', 'Description');
      const updated = addDomain(catalog, domain);

      expect(updated.services).toHaveLength(1);
      expect(updated.useCases).toHaveLength(1);
    });
  });

  describe('findDomain', () => {
    it('finds domain by id', () => {
      const domain = createDomain('commerce', 'Commerce', 'Description');
      const catalog = createCatalog([], [], [domain]);

      expect(findDomain(catalog, 'commerce')).toBe(domain);
    });

    it('returns undefined for unknown id', () => {
      const catalog = createCatalog();
      expect(findDomain(catalog, 'unknown')).toBeUndefined();
    });
  });

  describe('getDomainUseCases', () => {
    it('returns use cases in domain', () => {
      const useCase = createUseCase('checkout', 'Checkout', 'Flow', [], [], { domain: 'commerce' });
      const catalog = createCatalog([], [useCase]);

      const result = getDomainUseCases(catalog, 'commerce');

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(useCase);
    });

    it('returns empty array when no use cases in domain', () => {
      const useCase = createUseCase('checkout', 'Checkout', 'Flow', [], [], { domain: 'other' });
      const catalog = createCatalog([], [useCase]);

      const result = getDomainUseCases(catalog, 'commerce');

      expect(result).toEqual([]);
    });

    it('returns multiple use cases in same domain', () => {
      const useCase1 = createUseCase('checkout', 'Checkout', 'Flow', [], [], {
        domain: 'commerce',
      });
      const useCase2 = createUseCase('returns', 'Returns', 'Flow', [], [], { domain: 'commerce' });
      const catalog = createCatalog([], [useCase1, useCase2]);

      const result = getDomainUseCases(catalog, 'commerce');

      expect(result).toHaveLength(2);
    });
  });

  describe('getDomainServices', () => {
    it('returns services in domain', () => {
      const service = createService('order-service', 'Order', 'Desc', { domain: 'commerce' });
      const catalog = createCatalog([service]);

      const result = getDomainServices(catalog, 'commerce');

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(service);
    });

    it('returns empty array when no services in domain', () => {
      const service = createService('order-service', 'Order', 'Desc', { domain: 'other' });
      const catalog = createCatalog([service]);

      const result = getDomainServices(catalog, 'commerce');

      expect(result).toEqual([]);
    });

    it('returns multiple services in same domain', () => {
      const service1 = createService('order-service', 'Order', 'Desc', { domain: 'commerce' });
      const service2 = createService('billing-service', 'Billing', 'Desc', { domain: 'commerce' });
      const catalog = createCatalog([service1, service2]);

      const result = getDomainServices(catalog, 'commerce');

      expect(result).toHaveLength(2);
    });
  });

  describe('getChildDomains', () => {
    it('returns child domains', () => {
      const parent = createDomain('commerce', 'Commerce', 'Parent domain');
      const child = createDomain('orders', 'Orders', 'Child domain', 'commerce');
      const catalog = createCatalog([], [], [parent, child]);

      const result = getChildDomains(catalog, 'commerce');

      expect(result).toHaveLength(1);
      expect(result[0]).toBe(child);
    });

    it('returns empty array when no children', () => {
      const domain = createDomain('commerce', 'Commerce', 'Domain');
      const catalog = createCatalog([], [], [domain]);

      const result = getChildDomains(catalog, 'commerce');

      expect(result).toEqual([]);
    });

    it('returns multiple children', () => {
      const parent = createDomain('commerce', 'Commerce', 'Parent');
      const child1 = createDomain('orders', 'Orders', 'Child 1', 'commerce');
      const child2 = createDomain('billing', 'Billing', 'Child 2', 'commerce');
      const catalog = createCatalog([], [], [parent, child1, child2]);

      const result = getChildDomains(catalog, 'commerce');

      expect(result).toHaveLength(2);
    });

    it('only returns direct children, not grandchildren', () => {
      const grandparent = createDomain('platform', 'Platform', 'Top level');
      const parent = createDomain('commerce', 'Commerce', 'Middle level', 'platform');
      const child = createDomain('orders', 'Orders', 'Bottom level', 'commerce');
      const catalog = createCatalog([], [], [grandparent, parent, child]);

      const result = getChildDomains(catalog, 'platform');

      expect(result).toHaveLength(1);
      expect(result[0]?.id).toBe('commerce');
    });
  });
});
