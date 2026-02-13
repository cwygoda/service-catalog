import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  parseToml,
  sidecarToService,
  parseUseCaseToml,
  sidecarToUseCase,
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
      expect(result.service.metadata?.version).toBe('1.0.0');
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
    it('converts sidecar to service domain object', () => {
      const sidecar = {
        service: {
          id: 'test',
          name: 'Test',
          description: 'Description',
          metadata: { version: '1.0.0' },
        },
      };

      const service = sidecarToService(sidecar);

      expect(service).toEqual({
        id: 'test',
        name: 'Test',
        description: 'Description',
        metadata: { version: '1.0.0' },
      });
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
});
