import { describe, it, expect } from 'vitest';
import { createCatalog, addService, findService } from './catalog.js';
import { createService } from './service.js';

describe('Catalog', () => {
  describe('createCatalog', () => {
    it('creates empty catalog', () => {
      const catalog = createCatalog();
      expect(catalog.services).toEqual([]);
    });

    it('creates catalog with services', () => {
      const service = createService('test', 'Test', 'Description');
      const catalog = createCatalog([service]);
      expect(catalog.services).toHaveLength(1);
      expect(catalog.services[0]).toBe(service);
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
});
