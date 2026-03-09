import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  parseYaml,
  parseUseCaseYaml,
  parseDomainYaml,
  parseDataStoreYaml,
  sidecarToDataStore,
  YamlParseError,
  ValidationError,
} from './yaml.parser.js';

const fixturesDir = join(import.meta.dirname, '../../../tests/fixtures');

describe('yaml.parser', () => {
  describe('parseYaml', () => {
    it('parses valid service sidecar', async () => {
      const content = await readFile(join(fixturesDir, 'valid-service.yaml'), 'utf-8');
      const result = parseYaml(content, 'test.yaml');

      expect(result.service.id).toBe('test-service');
      expect(result.service.name).toBe('Test Service');
      expect(result.service.description).toBe('A test service for unit tests');
    });

    it('throws ValidationError for missing required field', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-missing-id.yaml'), 'utf-8');

      expect(() => parseYaml(content, 'invalid.yaml')).toThrow(ValidationError);
    });

    it('throws YamlParseError for syntax errors', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-syntax.yaml'), 'utf-8');

      expect(() => parseYaml(content, 'syntax.yaml')).toThrow(YamlParseError);
    });

    it('includes file path in error', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-missing-id.yaml'), 'utf-8');

      try {
        parseYaml(content, '/path/to/service.yaml');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).filePath).toBe('/path/to/service.yaml');
      }
    });
  });

  describe('parseUseCaseYaml', () => {
    it('parses valid use case sidecar', async () => {
      const content = await readFile(join(fixturesDir, 'valid-use-case.yaml'), 'utf-8');
      const result = parseUseCaseYaml(content, 'test.yaml');

      expect(result.use_case.id).toBe('checkout-flow');
      expect(result.use_case.name).toBe('Customer Checkout');
      expect(result.use_case.bpmn).toBe('./checkout.bpmn.txt');
      expect(result.use_case.participants).toHaveLength(2);
      expect(result.use_case.steps).toHaveLength(3);
    });

    it('throws ValidationError for invalid use case', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-use-case.yaml'), 'utf-8');

      expect(() => parseUseCaseYaml(content, 'invalid.yaml')).toThrow(ValidationError);
    });

    it('includes file path in error', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-use-case.yaml'), 'utf-8');

      try {
        parseUseCaseYaml(content, '/path/to/use-case.yaml');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).filePath).toBe('/path/to/use-case.yaml');
      }
    });
  });

  describe('parseDataStoreYaml', () => {
    it('parses valid data store sidecar', async () => {
      const content = await readFile(join(fixturesDir, 'valid-data-store.yaml'), 'utf-8');
      const result = parseDataStoreYaml(content, 'test.yaml');

      expect(result.data_store.id).toBe('orders-db');
      expect(result.data_store.name).toBe('Orders Database');
      expect(result.data_store.type).toBe('database');
      expect(result.data_store.domain).toBe('commerce');
      expect(result.data_store.owner).toBe('orders-service');
      expect(result.data_store.technology).toBe('PostgreSQL');
      expect(result.data_store.links).toHaveLength(1);
    });

    it('throws ValidationError for invalid data store', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-data-store.yaml'), 'utf-8');

      expect(() => parseDataStoreYaml(content, 'invalid.yaml')).toThrow(ValidationError);
    });

    it('includes file path in error', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-data-store.yaml'), 'utf-8');

      try {
        parseDataStoreYaml(content, '/path/to/data-store.yaml');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).filePath).toBe('/path/to/data-store.yaml');
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
          links: [{ url: 'https://dash.io', title: 'Dashboard' }],
        },
      };

      const ds = sidecarToDataStore(sidecar);

      expect(ds.id).toBe('orders-db');
      expect(ds.name).toBe('Orders DB');
      expect(ds.description).toBe('Primary database');
      expect(ds.type).toBe('database');
      expect(ds.domain).toBe('commerce');
      expect(ds.owner).toBe('orders-service');
      expect(ds.technology).toBe('PostgreSQL');
      expect(ds.links).toHaveLength(1);
    });

    it('defaults description to empty string', () => {
      const sidecar = {
        data_store: {
          id: 'test',
          name: 'Test',
          type: 'cache' as const,
        },
      };

      const ds = sidecarToDataStore(sidecar);
      expect(ds.description).toBe('');
    });

    it('omits optional fields when not present', () => {
      const sidecar = {
        data_store: {
          id: 'test',
          name: 'Test',
          type: 'queue' as const,
        },
      };

      const ds = sidecarToDataStore(sidecar);
      expect('domain' in ds).toBe(false);
      expect('owner' in ds).toBe(false);
      expect('technology' in ds).toBe(false);
      expect('links' in ds).toBe(false);
    });
  });

  describe('parseDomainYaml', () => {
    it('parses valid domain sidecar', async () => {
      const content = await readFile(join(fixturesDir, 'valid-domain.yaml'), 'utf-8');
      const result = parseDomainYaml(content, 'test.yaml');

      expect(result.domain.id).toBe('commerce');
      expect(result.domain.name).toBe('Commerce');
      expect(result.domain.description).toBe(
        'E-commerce domain handling orders, payments, and fulfillment'
      );
      expect(result.domain.parent).toBeUndefined();
    });

    it('parses domain with parent', async () => {
      const content = await readFile(join(fixturesDir, 'valid-domain-with-parent.yaml'), 'utf-8');
      const result = parseDomainYaml(content, 'test.yaml');

      expect(result.domain.id).toBe('orders');
      expect(result.domain.parent).toBe('commerce');
    });

    it('throws ValidationError for invalid domain', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-domain.yaml'), 'utf-8');

      expect(() => parseDomainYaml(content, 'invalid.yaml')).toThrow(ValidationError);
    });

    it('includes file path in error', async () => {
      const content = await readFile(join(fixturesDir, 'invalid-domain.yaml'), 'utf-8');

      try {
        parseDomainYaml(content, '/path/to/domain.yaml');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);
        expect((error as ValidationError).filePath).toBe('/path/to/domain.yaml');
      }
    });
  });
});
