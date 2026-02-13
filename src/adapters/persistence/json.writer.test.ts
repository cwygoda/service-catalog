import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JsonWriter } from './json.writer.js';
import type { Catalog } from '../../core/domain/catalog.js';

describe('JsonWriter', () => {
  let tempDir: string;
  let writer: JsonWriter;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'writer-test-'));
    writer = new JsonWriter();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('writes catalog to JSON file', async () => {
    const catalog: Catalog = {
      services: [
        { id: 'svc-1', name: 'Service 1', description: 'First' },
        { id: 'svc-2', name: 'Service 2', description: 'Second' },
      ],
    };
    const outputPath = join(tempDir, 'catalog.json');

    await writer.write(catalog, outputPath);

    const content = await readFile(outputPath, 'utf-8');
    const parsed = JSON.parse(content) as Catalog;
    expect(parsed).toEqual(catalog);
  });

  it('creates nested directories if needed', async () => {
    const catalog: Catalog = { services: [] };
    const outputPath = join(tempDir, 'nested', 'deep', 'catalog.json');

    await writer.write(catalog, outputPath);

    const content = await readFile(outputPath, 'utf-8');
    expect(JSON.parse(content)).toEqual(catalog);
  });

  it('writes pretty-printed JSON', async () => {
    const catalog: Catalog = {
      services: [{ id: 'test', name: 'Test', description: 'Desc' }],
    };
    const outputPath = join(tempDir, 'catalog.json');

    await writer.write(catalog, outputPath);

    const content = await readFile(outputPath, 'utf-8');
    expect(content).toContain('\n'); // Has newlines
    expect(content).toContain('  '); // Has indentation
  });

  it('overwrites existing file', async () => {
    const outputPath = join(tempDir, 'catalog.json');

    await writer.write({ services: [{ id: 'old', name: 'Old', description: 'Old' }] }, outputPath);
    await writer.write({ services: [{ id: 'new', name: 'New', description: 'New' }] }, outputPath);

    const content = await readFile(outputPath, 'utf-8');
    const parsed = JSON.parse(content) as Catalog;
    expect(parsed.services[0]?.id).toBe('new');
  });

  it('preserves service metadata', async () => {
    const catalog: Catalog = {
      services: [
        {
          id: 'with-meta',
          name: 'With Meta',
          description: 'Has metadata',
          metadata: { version: '2.0.0' },
        },
      ],
    };
    const outputPath = join(tempDir, 'catalog.json');

    await writer.write(catalog, outputPath);

    const content = await readFile(outputPath, 'utf-8');
    const parsed = JSON.parse(content) as Catalog;
    expect(parsed.services[0]?.metadata?.version).toBe('2.0.0');
  });
});
