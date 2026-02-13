import { error } from '@sveltejs/kit';
import { Value } from '@sinclair/typebox/value';
import { CatalogSchema } from '../../shared/schemas/catalog.schema.js';
import type { Catalog } from '../../core/domain/index.js';

/**
 * Fetches and validates catalog.json with proper error handling.
 * Use in SvelteKit load functions.
 */
export async function fetchCatalog(
  fetch: typeof globalThis.fetch,
  path = '/catalog.json'
): Promise<Catalog> {
  const response = await fetch(path);

  if (!response.ok) {
    error(response.status, `Failed to load catalog: ${response.statusText}`);
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    error(500, 'Invalid JSON in catalog');
  }

  if (!Value.Check(CatalogSchema, data)) {
    const errors = [...Value.Errors(CatalogSchema, data)];
    const message = errors.map((e) => `${e.path}: ${e.message}`).join('; ');
    error(500, `Invalid catalog data: ${message}`);
  }

  return data as Catalog;
}
