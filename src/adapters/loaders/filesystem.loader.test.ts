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
    expect(catalog.useCases).toEqual([]);
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
    expect(catalog.useCases).toEqual([]);
  });

  it('loads single use case', async () => {
    const useCaseDir = join(tempDir, 'checkout');
    await mkdir(useCaseDir);
    await writeFile(
      join(useCaseDir, 'use-case.toml'),
      `[use_case]
id = "checkout"
name = "Customer Checkout"
description = "Checkout flow"
participants = []
steps = []
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.useCases).toHaveLength(1);
    expect(catalog.useCases[0]?.id).toBe('checkout');
    expect(catalog.useCases[0]?.name).toBe('Customer Checkout');
  });

  it('loads use case with participants and steps', async () => {
    const useCaseDir = join(tempDir, 'full-checkout');
    await mkdir(useCaseDir);
    await writeFile(
      join(useCaseDir, 'use-case.toml'),
      `[use_case]
id = "full-checkout"
name = "Full Checkout"
description = "Complete checkout"
bpmn = "./checkout.bpmn.txt"

[[use_case.participants]]
service = "order-service"
role = "Creates order"

[[use_case.steps]]
sequence = 1
actor = "Customer"
action = "Submit order"
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.useCases[0]?.participants).toHaveLength(1);
    expect(catalog.useCases[0]?.steps).toHaveLength(1);
    expect(catalog.useCases[0]?.bpmn).toBe('./checkout.bpmn.txt');
  });

  it('loads services and use cases together', async () => {
    // Create service
    const serviceDir = join(tempDir, 'services', 'order');
    await mkdir(serviceDir, { recursive: true });
    await writeFile(
      join(serviceDir, 'service.toml'),
      `[service]
id = "order-service"
name = "Order Service"
description = "Handles orders"
`
    );

    // Create use case
    const useCaseDir = join(tempDir, 'use-cases', 'checkout');
    await mkdir(useCaseDir, { recursive: true });
    await writeFile(
      join(useCaseDir, 'use-case.toml'),
      `[use_case]
id = "checkout"
name = "Checkout"
description = "Checkout flow"
participants = []
steps = []
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.services).toHaveLength(1);
    expect(catalog.useCases).toHaveLength(1);
    expect(catalog.services[0]?.id).toBe('order-service');
    expect(catalog.useCases[0]?.id).toBe('checkout');
  });
});
