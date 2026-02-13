import { describe, it, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseToml, sidecarToService, TomlParseError, ValidationError } from './toml.parser.js';

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
});
