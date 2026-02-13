import { describe, it, expect } from 'vitest';
import {
  createCatalog,
  addService,
  addUseCase,
  findService,
  findUseCase,
  getServiceUseCases,
} from './catalog.js';
import { createService } from './service.js';
import { createUseCase, type UseCase } from './use-case.js';

describe('Catalog', () => {
  describe('createCatalog', () => {
    it('creates empty catalog', () => {
      const catalog = createCatalog();
      expect(catalog.services).toEqual([]);
      expect(catalog.useCases).toEqual([]);
    });

    it('creates catalog with services', () => {
      const service = createService('test', 'Test', 'Description');
      const catalog = createCatalog([service]);
      expect(catalog.services).toHaveLength(1);
      expect(catalog.services[0]).toBe(service);
      expect(catalog.useCases).toEqual([]);
    });

    it('creates catalog with services and use cases', () => {
      const service = createService('test', 'Test', 'Description');
      const useCase = createUseCase('checkout', 'Checkout', 'Flow');
      const catalog = createCatalog([service], [useCase]);

      expect(catalog.services).toHaveLength(1);
      expect(catalog.useCases).toHaveLength(1);
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
});
