import { describe, it, expect } from 'vitest';
import { isDataStore, createDataStore, type DataStore } from './data-store.js';

describe('DataStore', () => {
  describe('isDataStore', () => {
    it('returns true for valid data store', () => {
      const ds: DataStore = {
        id: 'orders-db',
        name: 'Orders DB',
        description: 'Primary database',
        type: 'database',
      };
      expect(isDataStore(ds)).toBe(true);
    });

    it('validates all types', () => {
      const types = ['database', 'cache', 'queue', 'search-index', 'object-store'] as const;
      for (const type of types) {
        expect(isDataStore({ id: 'test', name: 'Test', description: 'Desc', type })).toBe(true);
      }
    });

    it('returns false for missing id', () => {
      expect(isDataStore({ name: 'Test', description: 'Desc', type: 'database' })).toBe(false);
    });

    it('returns false for missing name', () => {
      expect(isDataStore({ id: 'test', description: 'Desc', type: 'database' })).toBe(false);
    });

    it('returns false for missing description', () => {
      expect(isDataStore({ id: 'test', name: 'Test', type: 'database' })).toBe(false);
    });

    it('returns false for missing type', () => {
      expect(isDataStore({ id: 'test', name: 'Test', description: 'Desc' })).toBe(false);
    });

    it('returns false for invalid type', () => {
      expect(isDataStore({ id: 'test', name: 'Test', description: 'Desc', type: 'nosql' })).toBe(
        false
      );
    });

    it('returns false for non-object', () => {
      expect(isDataStore(null)).toBe(false);
      expect(isDataStore('string')).toBe(false);
      expect(isDataStore(42)).toBe(false);
    });

    it('returns false for non-string optional fields', () => {
      const base = { id: 'test', name: 'Test', description: 'Desc', type: 'database' };
      expect(isDataStore({ ...base, domain: 42 })).toBe(false);
      expect(isDataStore({ ...base, owner: 42 })).toBe(false);
      expect(isDataStore({ ...base, technology: 42 })).toBe(false);
    });

    it('accepts valid optional fields', () => {
      expect(
        isDataStore({
          id: 'test',
          name: 'Test',
          description: 'Desc',
          type: 'database',
          domain: 'commerce',
          owner: 'order-service',
          technology: 'PostgreSQL',
        })
      ).toBe(true);
    });
  });

  describe('createDataStore', () => {
    it('creates data store with required fields only', () => {
      const ds = createDataStore('orders-db', 'Orders DB', 'Primary database', 'database');
      expect(ds).toEqual({
        id: 'orders-db',
        name: 'Orders DB',
        description: 'Primary database',
        type: 'database',
      });
    });

    it('creates data store with all optional fields', () => {
      const links = [{ url: 'https://dash.io', title: 'Dashboard' }];
      const ds = createDataStore('orders-db', 'Orders DB', 'Primary database', 'database', {
        domain: 'commerce',
        owner: 'order-service',
        technology: 'PostgreSQL',
        links,
        content: 'Some content',
      });

      expect(ds.domain).toBe('commerce');
      expect(ds.owner).toBe('order-service');
      expect(ds.technology).toBe('PostgreSQL');
      expect(ds.links).toBe(links);
      expect(ds.content).toBe('Some content');
    });

    it('omits optional fields when not provided', () => {
      const ds = createDataStore('test', 'Test', 'Desc', 'cache');
      expect('domain' in ds).toBe(false);
      expect('owner' in ds).toBe(false);
      expect('technology' in ds).toBe(false);
      expect('links' in ds).toBe(false);
      expect('content' in ds).toBe(false);
    });
  });
});
