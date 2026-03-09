import type { Catalog } from '../domain/catalog.js';

export interface CatalogWriterPort {
  write(catalog: Catalog, outputPath: string): Promise<void>;
}
