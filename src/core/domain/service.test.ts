import { describe, it, expect } from 'vitest';
import { isService, createService, type Service } from './service.js';

describe('Service', () => {
  describe('isService', () => {
    it('returns true for valid service', () => {
      const service: Service = {
        id: 'test-service',
        name: 'Test Service',
        description: 'A test service',
      };
      expect(isService(service)).toBe(true);
    });

    it('returns true for service with metadata', () => {
      const service: Service = {
        id: 'test-service',
        name: 'Test Service',
        description: 'A test service',
        metadata: { version: '1.0.0' },
      };
      expect(isService(service)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isService(null)).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isService('string')).toBe(false);
      expect(isService(123)).toBe(false);
    });

    it('returns false for missing required fields', () => {
      expect(isService({ id: 'test' })).toBe(false);
      expect(isService({ id: 'test', name: 'Test' })).toBe(false);
    });

    it('returns true for service with domain', () => {
      const service: Service = {
        id: 'test-service',
        name: 'Test Service',
        description: 'A test service',
        domain: 'commerce',
      };
      expect(isService(service)).toBe(true);
    });

    it('returns false for non-string domain', () => {
      expect(
        isService({
          id: 'test',
          name: 'Test',
          description: 'Desc',
          domain: 123,
        })
      ).toBe(false);
    });
  });

  describe('createService', () => {
    it('creates service without options', () => {
      const service = createService('id', 'Name', 'Description');
      expect(service).toEqual({
        id: 'id',
        name: 'Name',
        description: 'Description',
      });
    });

    it('creates service with metadata', () => {
      const service = createService('id', 'Name', 'Description', {
        metadata: { version: '1.0.0' },
      });
      expect(service).toEqual({
        id: 'id',
        name: 'Name',
        description: 'Description',
        metadata: { version: '1.0.0' },
      });
    });

    it('creates service with domain', () => {
      const service = createService('id', 'Name', 'Description', { domain: 'commerce' });
      expect(service).toEqual({
        id: 'id',
        name: 'Name',
        description: 'Description',
        domain: 'commerce',
      });
    });

    it('creates service with domain and metadata', () => {
      const service = createService('id', 'Name', 'Description', {
        domain: 'commerce',
        metadata: { version: '1.0.0' },
      });
      expect(service).toEqual({
        id: 'id',
        name: 'Name',
        description: 'Description',
        domain: 'commerce',
        metadata: { version: '1.0.0' },
      });
    });

    it('does not include domain key when undefined', () => {
      const service = createService('id', 'Name', 'Description', {
        metadata: { version: '1.0.0' },
      });
      expect('domain' in service).toBe(false);
    });
  });
});
