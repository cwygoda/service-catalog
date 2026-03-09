import { describe, it, expect } from 'vitest';
import { isDomain, createDomain, type Domain } from './domain.js';

describe('Domain', () => {
  describe('isDomain', () => {
    it('returns true for valid domain', () => {
      const domain: Domain = {
        id: 'commerce',
        name: 'Commerce',
        description: 'E-commerce domain',
      };
      expect(isDomain(domain)).toBe(true);
    });

    it('returns true for domain with parent', () => {
      const domain: Domain = {
        id: 'orders',
        name: 'Orders',
        description: 'Order management subdomain',
        parent: 'commerce',
      };
      expect(isDomain(domain)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isDomain(null)).toBe(false);
    });

    it('returns false for undefined', () => {
      expect(isDomain(undefined)).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isDomain('string')).toBe(false);
      expect(isDomain(123)).toBe(false);
      expect(isDomain(true)).toBe(false);
      expect(isDomain([])).toBe(false);
    });

    it('returns false for missing id', () => {
      expect(isDomain({ name: 'Commerce', description: 'desc' })).toBe(false);
    });

    it('returns false for missing name', () => {
      expect(isDomain({ id: 'commerce', description: 'desc' })).toBe(false);
    });

    it('returns false for missing description', () => {
      expect(isDomain({ id: 'commerce', name: 'Commerce' })).toBe(false);
    });

    it('returns false for non-string id', () => {
      expect(isDomain({ id: 123, name: 'Commerce', description: 'desc' })).toBe(false);
    });

    it('returns false for non-string name', () => {
      expect(isDomain({ id: 'commerce', name: 123, description: 'desc' })).toBe(false);
    });

    it('returns false for non-string description', () => {
      expect(isDomain({ id: 'commerce', name: 'Commerce', description: 123 })).toBe(false);
    });

    it('returns false for non-string parent', () => {
      expect(isDomain({ id: 'orders', name: 'Orders', description: 'desc', parent: 123 })).toBe(
        false
      );
    });

    it('returns true for undefined parent field', () => {
      const domain = { id: 'commerce', name: 'Commerce', description: 'desc', parent: undefined };
      expect(isDomain(domain)).toBe(true);
    });
  });

  describe('createDomain', () => {
    it('creates domain without parent', () => {
      const domain = createDomain('commerce', 'Commerce', 'E-commerce domain');
      expect(domain).toEqual({
        id: 'commerce',
        name: 'Commerce',
        description: 'E-commerce domain',
      });
    });

    it('creates domain with parent', () => {
      const domain = createDomain('orders', 'Orders', 'Order subdomain', 'commerce');
      expect(domain).toEqual({
        id: 'orders',
        name: 'Orders',
        description: 'Order subdomain',
        parent: 'commerce',
      });
    });

    it('does not include parent key when undefined', () => {
      const domain = createDomain('commerce', 'Commerce', 'desc', undefined);
      expect('parent' in domain).toBe(false);
    });

    it('created domain passes isDomain check', () => {
      const domain = createDomain('commerce', 'Commerce', 'desc');
      expect(isDomain(domain)).toBe(true);
    });

    it('created domain with parent passes isDomain check', () => {
      const domain = createDomain('orders', 'Orders', 'desc', 'commerce');
      expect(isDomain(domain)).toBe(true);
    });
  });
});
