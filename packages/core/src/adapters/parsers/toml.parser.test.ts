import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  parseToml,
  sidecarToService,
  parseUseCaseToml,
  sidecarToUseCase,
  parseDomainToml,
  sidecarToDomain,
  parseDataStoreToml,
  sidecarToDataStore,
  TomlParseError,
  ValidationError,
} from './toml.parser.js';

const fixturesDir = join(import.meta.dirname, '../../../tests/fixtures');

describe('toml.parser', () => {
  describe('parseToml', () => {
    it('parses valid service sidecar', async () => {
      const content = await readFile(join(fixturesDir, 'valid-service.toml'), 'utf-8');
      const result = parseToml(content, 'test.toml');

      expect(result.service.id).toBe('test-service');
      expect(result.service.name).toBe('Test Service');
      expect(result.service.description).toBe('A test service for unit tests');
    });

    it('throws ValidationError for missing required field', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-missing-id.toml'), 'utf-8');

      expect(() => parseToml(content, 'invalid.toml')).toThrow(ValidationError);
    });

    it('throws TomlParseError for syntax errors', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-syntax.toml'), 'utf-8');

      expect(() => parseToml(content, 'syntax.toml')).toThrow(TomlParseError);
    });

    it('includes file path in error', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-missing-id.toml'), 'utf-8');

      try {
        parseToml(content, '/path/to/service.toml');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).filePath).toBe('/path/to/service.toml');
      }
    });
  });

  describe('sidecarToService', () => {
    it('converts sidecar to service with defaults', () => {
      const sidecar = {
        service: {
          id: 'test',
          name: 'Test',
          description: 'Description',
        },
      };

      const service = sidecarToService(sidecar);

      expect(service).toEqual({
        id: 'test',
        name: 'Test',
        description: 'Description',
        type: 'web-service',
        lifecycle: 'active',
      });
    });

    it('converts sidecar with explicit type and lifecycle', () => {
      const sidecar = {
        service: {
          id: 'test',
          name: 'Test',
          description: 'Description',
          type: 'event-producer' as const,
          lifecycle: 'deprecated' as const,
        },
      };

      const service = sidecarToService(sidecar);

      expect(service.type).toBe('event-producer');
      expect(service.lifecycle).toBe('deprecated');
    });

    it('converts sidecar with all new fields', () => {
      const sidecar = {
        service: {
          id: 'test',
          name: 'Test',
          description: 'Description',
          domain: 'commerce',
          type: 'web-service' as const,
          lifecycle: 'active' as const,
          owner: 'team-a',
          tags: ['core'],
          links: [{ url: 'https://dash.io', title: 'Dashboard' }],
          repository: 'https://github.com/acme/test',
          tier: 'critical' as const,
          contacts: [{ type: 'slack', value: '#eng' }],
          language: ['typescript'],
          framework: 'nestjs',
        },
      };

      const service = sidecarToService(sidecar);

      expect(service.domain).toBe('commerce');
      expect(service.owner).toBe('team-a');
      expect(service.tags).toEqual(['core']);
      expect(service.links).toEqual([{ url: 'https://dash.io', title: 'Dashboard' }]);
      expect(service.repository).toBe('https://github.com/acme/test');
      expect(service.tier).toBe('critical');
      expect(service.contacts).toEqual([{ type: 'slack', value: '#eng' }]);
      expect(service.language).toEqual(['typescript']);
      expect(service.framework).toBe('nestjs');
    });

    it('defaults description to empty string when omitted', () => {
      const sidecar = {
        service: {
          id: 'no-desc',
          name: 'No Description',
        },
      };

      const service = sidecarToService(sidecar);

      expect(service.description).toBe('');
    });

    it('maps connections from sidecar', () => {
      const sidecar = {
        service: {
          id: 'test',
          name: 'Test',
          description: 'Description',
          connections: [
            { target: 'billing', type: 'http' as const, endpoints: ['/pay'] },
            { target: 'crm', type: 'event' as const, events: ['order.created'] },
            { target: 'auth', type: 'grpc' as const },
          ],
        },
      };

      const service = sidecarToService(sidecar);

      expect(service.connections).toHaveLength(3);
      expect(service.connections).toEqual([
        { target: 'billing', type: 'http', endpoints: ['/pay'] },
        { target: 'crm', type: 'event', events: ['order.created'] },
        { target: 'auth', type: 'grpc' },
      ]);
    });

    it('omits connections key when array is empty', () => {
      const sidecar = {
        service: {
          id: 'test',
          name: 'Test',
          description: 'Description',
          connections: [],
        },
      };

      const service = sidecarToService(sidecar);

      expect('connections' in service).toBe(false);
    });

    it('does not include specs from sidecar (resolved in loader)', () => {
      const sidecar = {
        service: {
          id: 'test',
          name: 'Test',
          description: 'Description',
          specs: { openapi: './openapi.yaml' },
        },
      };

      const service = sidecarToService(sidecar);

      expect('specs' in service).toBe(false);
    });
  });

  describe('parseUseCaseToml', () => {
    it('parses valid use case sidecar', async () => {
      const content = await readFile(join(fixturesDir, 'valid-use-case.toml'), 'utf-8');
      const result = parseUseCaseToml(content, 'test.toml');

      expect(result.use_case.id).toBe('checkout-flow');
      expect(result.use_case.name).toBe('Customer Checkout');
      expect(result.use_case.bpmn).toBe('./checkout.bpmn.txt');
      expect(result.use_case.participants).toHaveLength(2);
      expect(result.use_case.steps).toHaveLength(3);
    });

    it('throws ValidationError for invalid use case', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-use-case.toml'), 'utf-8');

      expect(() => parseUseCaseToml(content, 'invalid.toml')).toThrow(ValidationError);
    });

    it('includes file path in error', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-use-case.toml'), 'utf-8');

      try {
        parseUseCaseToml(content, '/path/to/use-case.toml');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).filePath).toBe('/path/to/use-case.toml');
      }
    });
  });

  describe('sidecarToUseCase', () => {
    it('converts sidecar to use case domain object', () => {
      const sidecar = {
        use_case: {
          id: 'checkout',
          name: 'Checkout',
          description: 'Checkout flow',
          bpmn: './flow.bpmn.txt',
          participants: [{ service: 'order-service', role: 'Creates orders' }],
          steps: [
            { sequence: 1, actor: 'Customer', action: 'Submit' },
            { sequence: 2, service: 'order-service', action: 'Validate', endpoint: 'POST /orders' },
          ],
        },
      };

      const useCase = sidecarToUseCase(sidecar);

      expect(useCase.id).toBe('checkout');
      expect(useCase.name).toBe('Checkout');
      expect(useCase.description).toBe('Checkout flow');
      expect(useCase.bpmn).toBe('./flow.bpmn.txt');
      expect(useCase.participants).toEqual([{ service: 'order-service', role: 'Creates orders' }]);
      expect(useCase.steps).toHaveLength(2);
      expect(useCase.steps[0]).toEqual({ sequence: 1, actor: 'Customer', action: 'Submit' });
      expect(useCase.steps[1]).toEqual({
        sequence: 2,
        service: 'order-service',
        action: 'Validate',
        endpoint: 'POST /orders',
      });
    });

    it('omits bpmn when not present', () => {
      const sidecar = {
        use_case: {
          id: 'simple',
          name: 'Simple',
          description: 'Desc',
          participants: [],
          steps: [],
        },
      };

      const useCase = sidecarToUseCase(sidecar);

      expect('bpmn' in useCase).toBe(false);
    });
  });

  describe('parseDomainToml', () => {
    it('parses valid domain sidecar', async () => {
      const content = await readFile(join(fixturesDir, 'valid-domain.toml'), 'utf-8');
      const result = parseDomainToml(content, 'test.toml');

      expect(result.domain.id).toBe('commerce');
      expect(result.domain.name).toBe('Commerce');
      expect(result.domain.description).toBe(
        'E-commerce domain handling orders, payments, and fulfillment'
      );
      expect(result.domain.parent).toBeUndefined();
    });

    it('parses domain with parent', async () => {
      const content = await readFile(join(fixturesDir, 'valid-domain-with-parent.toml'), 'utf-8');
      const result = parseDomainToml(content, 'test.toml');

      expect(result.domain.id).toBe('orders');
      expect(result.domain.parent).toBe('commerce');
    });

    it('throws ValidationError for invalid domain', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-domain.toml'), 'utf-8');

      expect(() => parseDomainToml(content, 'invalid.toml')).toThrow(ValidationError);
    });

    it('includes file path in error', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-domain.toml'), 'utf-8');

      try {
        parseDomainToml(content, '/path/to/domain.toml');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).filePath).toBe('/path/to/domain.toml');
      }
    });
  });

  describe('parseDataStoreToml', () => {
    it('parses valid data store sidecar', async () => {
      const content = await readFile(join(fixturesDir, 'valid-data-store.toml'), 'utf-8');
      const result = parseDataStoreToml(content, 'test.toml');

      expect(result.data_store.id).toBe('orders-db');
      expect(result.data_store.name).toBe('Orders Database');
      expect(result.data_store.type).toBe('database');
      expect(result.data_store.technology).toBe('PostgreSQL');
    });

    it('throws ValidationError for invalid data store', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-data-store.toml'), 'utf-8');

      expect(() => parseDataStoreToml(content, 'invalid.toml')).toThrow(ValidationError);
    });

    it('includes file path in error', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-data-store.toml'), 'utf-8');

      try {
        parseDataStoreToml(content, '/path/to/data-store.toml');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).filePath).toBe('/path/to/data-store.toml');
      }
    });
  });

  describe('sidecarToDataStore', () => {
    it('converts sidecar to data store', () => {
      const sidecar = {
        data_store: {
          id: 'orders-db',
          name: 'Orders DB',
          description: 'Primary database',
          type: 'database' as const,
          domain: 'commerce',
          owner: 'orders-service',
          technology: 'PostgreSQL',
        },
      };

      const ds = sidecarToDataStore(sidecar);

      expect(ds).toEqual({
        id: 'orders-db',
        name: 'Orders DB',
        description: 'Primary database',
        type: 'database',
        domain: 'commerce',
        owner: 'orders-service',
        technology: 'PostgreSQL',
      });
    });
  });

  describe('sidecarToDomain', () => {
    it('converts sidecar to domain object', () => {
      const sidecar = {
        domain: {
          id: 'commerce',
          name: 'Commerce',
          description: 'E-commerce domain',
        },
      };

      const domain = sidecarToDomain(sidecar);

      expect(domain).toEqual({
        id: 'commerce',
        name: 'Commerce',
        description: 'E-commerce domain',
      });
    });

    it('includes parent when present', () => {
      const sidecar = {
        domain: {
          id: 'orders',
          name: 'Orders',
          description: 'Order subdomain',
          parent: 'commerce',
        },
      };

      const domain = sidecarToDomain(sidecar);

      expect(domain.parent).toBe('commerce');
    });

    it('omits parent when not present', () => {
      const sidecar = {
        domain: {
          id: 'commerce',
          name: 'Commerce',
          description: 'Desc',
        },
      };

      const domain = sidecarToDomain(sidecar);

      expect('parent' in domain).toBe(false);
    });
  });
});
