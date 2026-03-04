import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  parseYaml,
  parseUseCaseYaml,
  parseDomainYaml,
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
