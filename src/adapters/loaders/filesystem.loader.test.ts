import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { mkdtemp, rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FilesystemLoader } from './filesystem.loader.js';

describe('FilesystemLoader', () => {
  let tempDir: string;
  let loader: FilesystemLoader;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'catalog-test-'));
    loader = new FilesystemLoader();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  it('loads empty catalog from empty directory', async () => {
    const catalog = await loader.load(tempDir);
    expect(catalog.services).toEqual([]);
  });

  it('loads single service', async () => {
    const serviceDir = join(tempDir, 'my-service');
    await mkdir(serviceDir);
    await writeFile(
      join(serviceDir, 'service.toml'),
      `[service]
id = "my-service"
name = "My Service"
description = "A test service"
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.services).toHaveLength(1);
    expect(catalog.services[0]).toEqual({
      id: 'my-service',
      name: 'My Service',
      description: 'A test service',
    });
  });

  it('loads multiple services from nested directories', async () => {
    // Create nested structure
    const service1Dir = join(tempDir, 'services', 'auth');
    const service2Dir = join(tempDir, 'services', 'billing');
    await mkdir(service1Dir, { recursive: true });
    await mkdir(service2Dir, { recursive: true });

    await writeFile(
      join(service1Dir, 'service.toml'),
      `[service]
id = "auth"
name = "Auth"
description = "Auth service"
`
    );

    await writeFile(
      join(service2Dir, 'service.toml'),
      `[service]
id = "billing"
name = "Billing"
description = "Billing service"
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.services).toHaveLength(2);
    const ids = catalog.services.map((s) => s.id).sort();
    expect(ids).toEqual(['auth', 'billing']);
  });

  it('loads service with metadata', async () => {
    const serviceDir = join(tempDir, 'versioned');
    await mkdir(serviceDir);
    await writeFile(
      join(serviceDir, 'service.toml'),
      `[service]
id = "versioned"
name = "Versioned Service"
description = "Has version"

[service.metadata]
version = "1.2.3"
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.services[0]?.metadata?.version).toBe('1.2.3');
  });

  it('throws for non-directory path', async () => {
    const filePath = join(tempDir, 'not-a-dir.txt');
    await writeFile(filePath, 'content');

    await expect(loader.load(filePath)).rejects.toThrow('Path is not a directory');
  });

  it('throws for non-existent path', async () => {
    const badPath = join(tempDir, 'does-not-exist');

    await expect(loader.load(badPath)).rejects.toThrow();
  });

  it('ignores non-service.toml files', async () => {
    await writeFile(join(tempDir, 'readme.md'), '# Hello');
    await writeFile(join(tempDir, 'other.toml'), '[other]\nkey = "value"');

    const catalog = await loader.load(tempDir);

    expect(catalog.services).toEqual([]);
  });
});
