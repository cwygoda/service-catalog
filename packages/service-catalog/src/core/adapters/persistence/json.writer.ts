import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { CatalogWriterPort } from '../../ports/catalog-writer.port.js';
import type { Catalog } from '../../domain/catalog.js';

export class JsonWriter implements CatalogWriterPort {
  async write(catalog: Catalog, outputPath: string): Promise<void> {
    const dir = dirname(outputPath);
    await mkdir(dir, { recursive: true });

    const json = JSON.stringify(catalog, null, 2);
    await writeFile(outputPath, json, 'utf-8');
  }
}

export function createJsonWriter(): CatalogWriterPort {
  return new JsonWriter();
}
