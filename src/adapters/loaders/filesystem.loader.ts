import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { CatalogLoaderPort } from '../../core/ports/catalog-loader.port.js';
import type { Catalog } from '../../core/domain/catalog.js';
import type { Service } from '../../core/domain/service.js';
import type { UseCase } from '../../core/domain/use-case.js';
import type { Domain } from '../../core/domain/domain.js';
import { createCatalog } from '../../core/domain/catalog.js';
import {
  parseToml,
  sidecarToService,
  parseUseCaseToml,
  sidecarToUseCase,
  parseDomainToml,
  sidecarToDomain,
} from '../parsers/toml.parser.js';

const SERVICE_FILENAME = 'service.toml';
const USE_CASE_FILENAME = 'use-case.toml';
const DOMAIN_FILENAME = 'domain.toml';

async function findFiles(dir: string, filename: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name === filename) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

export class FilesystemLoader implements CatalogLoaderPort {
  async load(path: string): Promise<Catalog> {
    const stats = await stat(path);

    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${path}`);
    }

    // Load services
    const serviceFiles = await findFiles(path, SERVICE_FILENAME);
    const services: Service[] = [];

    for (const filePath of serviceFiles) {
      const content = await readFile(filePath, 'utf-8');
      const sidecar = parseToml(content, filePath);
      services.push(sidecarToService(sidecar));
    }

    // Load use cases
    const useCaseFiles = await findFiles(path, USE_CASE_FILENAME);
    const useCases: UseCase[] = [];

    for (const filePath of useCaseFiles) {
      const content = await readFile(filePath, 'utf-8');
      const sidecar = parseUseCaseToml(content, filePath);
      useCases.push(sidecarToUseCase(sidecar));
    }

    // Load domains
    const domainFiles = await findFiles(path, DOMAIN_FILENAME);
    const domains: Domain[] = [];

    for (const filePath of domainFiles) {
      const content = await readFile(filePath, 'utf-8');
      const sidecar = parseDomainToml(content, filePath);
      domains.push(sidecarToDomain(sidecar));
    }

    return createCatalog(services, useCases, domains);
  }
}

export function createFilesystemLoader(): CatalogLoaderPort {
  return new FilesystemLoader();
}
