import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { CatalogLoaderPort } from '../../core/ports/catalog-loader.port.js';
import type { Catalog } from '../../core/domain/catalog.js';
import type { Service } from '../../core/domain/service.js';
import { createCatalog } from '../../core/domain/catalog.js';
import { parseToml, sidecarToService } from '../parsers/toml.parser.js';

const SERVICE_FILENAME = 'service.toml';

async function findServiceFiles(dir: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name === SERVICE_FILENAME) {
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

    const serviceFiles = await findServiceFiles(path);
    const services: Service[] = [];

    for (const filePath of serviceFiles) {
      const content = await readFile(filePath, 'utf-8');
      const sidecar = parseToml(content, filePath);
      services.push(sidecarToService(sidecar));
    }

    return createCatalog(services);
  }
}

export function createFilesystemLoader(): CatalogLoaderPort {
  return new FilesystemLoader();
}
