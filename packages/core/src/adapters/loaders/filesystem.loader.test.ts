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
    expect(catalog.domains).toEqual([]);
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
    // Create bpmn-txt file
    await writeFile(
      join(useCaseDir, 'checkout.bpmn.txt'),
      `process: checkout
  start: begin
    -> finish
  end: finish
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.useCases[0]?.participants).toHaveLength(1);
    expect(catalog.useCases[0]?.steps).toHaveLength(1);
    // bpmn field now contains generated XML
    expect(catalog.useCases[0]?.bpmn).toContain('<?xml');
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

  it('loads single domain', async () => {
    const domainDir = join(tempDir, 'commerce');
    await mkdir(domainDir);
    await writeFile(
      join(domainDir, 'domain.toml'),
      `[domain]
id = "commerce"
name = "Commerce"
description = "E-commerce domain"
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.domains).toHaveLength(1);
    expect(catalog.domains[0]?.id).toBe('commerce');
    expect(catalog.domains[0]?.name).toBe('Commerce');
  });

  it('loads domain with parent', async () => {
    const domainDir = join(tempDir, 'orders');
    await mkdir(domainDir);
    await writeFile(
      join(domainDir, 'domain.toml'),
      `[domain]
id = "orders"
name = "Orders"
description = "Order subdomain"
parent = "commerce"
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.domains[0]?.parent).toBe('commerce');
  });

  it('loads services, use cases, and domains together', async () => {
    // Create domain
    const domainDir = join(tempDir, 'domains', 'commerce');
    await mkdir(domainDir, { recursive: true });
    await writeFile(
      join(domainDir, 'domain.toml'),
      `[domain]
id = "commerce"
name = "Commerce"
description = "E-commerce domain"
`
    );

    // Create service
    const serviceDir = join(tempDir, 'services', 'order');
    await mkdir(serviceDir, { recursive: true });
    await writeFile(
      join(serviceDir, 'service.toml'),
      `[service]
id = "order-service"
name = "Order Service"
description = "Handles orders"
domain = "commerce"
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
domain = "commerce"
participants = []
steps = []
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.domains).toHaveLength(1);
    expect(catalog.services).toHaveLength(1);
    expect(catalog.useCases).toHaveLength(1);
    expect(catalog.domains[0]?.id).toBe('commerce');
    expect(catalog.services[0]?.domain).toBe('commerce');
    expect(catalog.useCases[0]?.domain).toBe('commerce');
  });

  it('loads markdown use case', async () => {
    const useCaseDir = join(tempDir, 'order-data');
    await mkdir(useCaseDir);
    await writeFile(
      join(useCaseDir, 'use-case.md'),
      `---
id: order-data
name: Order Data Products
domain: data-delivery
---

# Overview
Customer browses and orders data.

\`\`\`bpmn
process: order-data
  start: begin
    -> browse
  task: browse
    name: "Browse"
    type: user
    service: catalog-ui
    doc: browsing
    -> finish
  end: finish
\`\`\`

## Browsing {#browsing}

Details about browsing...
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.useCases).toHaveLength(1);
    const uc = catalog.useCases[0];
    expect(uc).toBeDefined();
    expect(uc?.id).toBe('order-data');
    expect(uc?.name).toBe('Order Data Products');
    expect(uc?.domain).toBe('data-delivery');
    expect(uc?.description).toBe('Customer browses and orders data.');
    expect(uc?.bpmn).toContain('<?xml');
    expect(uc?.content).toContain('## Browsing');
    expect(uc?.docLinks).toEqual([{ elementId: 'browse', anchor: 'browsing' }]);
    expect(uc?.serviceRefs).toEqual([{ elementId: 'browse', serviceId: 'catalog-ui' }]);
    expect(uc?.participants).toHaveLength(1);
    expect(uc?.participants[0]?.service).toBe('catalog-ui');
  });

  it('markdown takes precedence over TOML', async () => {
    const useCaseDir = join(tempDir, 'dual-format');
    await mkdir(useCaseDir);

    // TOML version
    await writeFile(
      join(useCaseDir, 'use-case.toml'),
      `[use_case]
id = "dual-format"
name = "TOML Version"
description = "From TOML"
participants = []
steps = []
`
    );

    // Markdown version (should win)
    await writeFile(
      join(useCaseDir, 'use-case.md'),
      `---
id: dual-format
name: Markdown Version
---

From markdown.
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.useCases).toHaveLength(1);
    expect(catalog.useCases[0]?.name).toBe('Markdown Version');
  });

  it('TOML still works when no markdown present', async () => {
    const useCaseDir = join(tempDir, 'toml-only');
    await mkdir(useCaseDir);
    await writeFile(
      join(useCaseDir, 'use-case.toml'),
      `[use_case]
id = "toml-only"
name = "TOML Only"
description = "Still works"
participants = []
steps = []
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.useCases).toHaveLength(1);
    expect(catalog.useCases[0]?.id).toBe('toml-only');
  });

  it('markdown without bpmn block has no XML', async () => {
    const useCaseDir = join(tempDir, 'no-bpmn');
    await mkdir(useCaseDir);
    await writeFile(
      join(useCaseDir, 'use-case.md'),
      `---
id: no-bpmn
name: No BPMN
---

Just documentation, no process.
`
    );

    const catalog = await loader.load(tempDir);

    expect(catalog.useCases).toHaveLength(1);
    const uc = catalog.useCases[0];
    expect(uc).toBeDefined();
    expect(uc?.bpmn).toBeUndefined();
    expect(uc?.docLinks).toBeUndefined();
    expect(uc?.serviceRefs).toBeUndefined();
  });
});
