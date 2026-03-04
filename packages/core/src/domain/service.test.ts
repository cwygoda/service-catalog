import { describe, it, expect } from 'vitest';
import { isService, createService, type Service } from './service.js';

describe('Service', () => {
  describe('isService', () => {
    it('returns true for valid service', () => {
      const service: Service = {
        id: 'test-service',
        name: 'Test Service',
        description: 'A test service',
        type: 'web-service',
        lifecycle: 'active',
      };
      expect(isService(service)).toBe(true);
    });

    it('returns true for all service types', () => {
      for (const type of [
        'web-service',
        'event-consumer',
        'event-producer',
        'web-app',
        'library',
      ] as const) {
        expect(
          isService({
            id: 'test',
            name: 'Test',
            description: 'Desc',
            type,
            lifecycle: 'active',
          })
        ).toBe(true);
      }
    });

    it('returns true for all lifecycle values', () => {
      for (const lifecycle of ['experimental', 'active', 'deprecated', 'sunset'] as const) {
        expect(
          isService({
            id: 'test',
            name: 'Test',
            description: 'Desc',
            type: 'web-service',
            lifecycle,
          })
        ).toBe(true);
      }
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
      expect(isService({ id: 'test', name: 'Test', description: 'D' })).toBe(false);
    });

    it('returns false for invalid type', () => {
      expect(
        isService({
          id: 'test',
          name: 'Test',
          description: 'Desc',
          type: 'invalid',
          lifecycle: 'active',
        })
      ).toBe(false);
    });

    it('returns false for invalid lifecycle', () => {
      expect(
        isService({
          id: 'test',
          name: 'Test',
          description: 'Desc',
          type: 'web-service',
          lifecycle: 'unknown',
        })
      ).toBe(false);
    });

    it('returns true for service with domain', () => {
      const service: Service = {
        id: 'test-service',
        name: 'Test Service',
        description: 'A test service',
        type: 'web-service',
        lifecycle: 'active',
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
          type: 'web-service',
          lifecycle: 'active',
          domain: 123,
        })
      ).toBe(false);
    });
  });

  describe('createService', () => {
    it('creates service with defaults', () => {
      const service = createService('id', 'Name', 'Description');
      expect(service).toEqual({
        id: 'id',
        name: 'Name',
        description: 'Description',
        type: 'web-service',
        lifecycle: 'active',
      });
    });

    it('creates service with explicit type and lifecycle', () => {
      const service = createService('id', 'Name', 'Description', {
        type: 'event-producer',
        lifecycle: 'deprecated',
      });
      expect(service).toEqual({
        id: 'id',
        name: 'Name',
        description: 'Description',
        type: 'event-producer',
        lifecycle: 'deprecated',
      });
    });

    it('creates service with domain', () => {
      const service = createService('id', 'Name', 'Description', { domain: 'commerce' });
      expect(service).toEqual({
        id: 'id',
        name: 'Name',
        description: 'Description',
        type: 'web-service',
        lifecycle: 'active',
        domain: 'commerce',
      });
    });

    it('creates service with all optional fields', () => {
      const service = createService('id', 'Name', 'Description', {
        domain: 'commerce',
        type: 'web-app',
        lifecycle: 'experimental',
        owner: 'team-a',
        tags: ['core'],
        links: [{ url: 'https://dash.io', title: 'Dashboard', type: 'dashboard' }],
        repository: 'https://github.com/acme/svc',
        tier: 'critical',
        contacts: [{ type: 'slack', value: '#eng' }],
        language: ['typescript'],
        framework: 'nestjs',
        connections: [{ target: 'other', type: 'http' }],
        content: 'Rich description',
      });
      expect(service.owner).toBe('team-a');
      expect(service.tags).toEqual(['core']);
      expect(service.links).toHaveLength(1);
      expect(service.repository).toBe('https://github.com/acme/svc');
      expect(service.tier).toBe('critical');
      expect(service.contacts).toHaveLength(1);
      expect(service.language).toEqual(['typescript']);
      expect(service.framework).toBe('nestjs');
      expect(service.connections).toHaveLength(1);
      expect(service.content).toBe('Rich description');
    });

    it('does not include domain key when undefined', () => {
      const service = createService('id', 'Name', 'Description');
      expect('domain' in service).toBe(false);
    });

    it('does not include optional keys when not provided', () => {
      const service = createService('id', 'Name', 'Description');
      expect('owner' in service).toBe(false);
      expect('tags' in service).toBe(false);
      expect('links' in service).toBe(false);
      expect('repository' in service).toBe(false);
      expect('tier' in service).toBe(false);
      expect('contacts' in service).toBe(false);
      expect('language' in service).toBe(false);
      expect('framework' in service).toBe(false);
      expect('specs' in service).toBe(false);
      expect('connections' in service).toBe(false);
      expect('content' in service).toBe(false);
    });
  });
});
