import type { Link } from './service.js';

export type DataStoreType = 'database' | 'cache' | 'queue' | 'search-index' | 'object-store';

export interface DataStore {
  id: string;
  name: string;
  description: string;
  type: DataStoreType;
  domain?: string;
  owner?: string;
  technology?: string;
  links?: Link[];
  content?: string;
}

const VALID_TYPES = new Set<string>(['database', 'cache', 'queue', 'search-index', 'object-store']);

export function isDataStore(value: unknown): value is DataStore {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  // Required fields
  if (typeof obj['id'] !== 'string') return false;
  if (typeof obj['name'] !== 'string') return false;
  if (typeof obj['description'] !== 'string') return false;
  if (typeof obj['type'] !== 'string' || !VALID_TYPES.has(obj['type'])) return false;

  // Optional fields
  if ('domain' in obj && obj['domain'] !== undefined && typeof obj['domain'] !== 'string') {
    return false;
  }
  if ('owner' in obj && obj['owner'] !== undefined && typeof obj['owner'] !== 'string') {
    return false;
  }
  if (
    'technology' in obj &&
    obj['technology'] !== undefined &&
    typeof obj['technology'] !== 'string'
  ) {
    return false;
  }

  return true;
}

export interface CreateDataStoreOptions {
  domain?: string;
  owner?: string;
  technology?: string;
  links?: Link[];
  content?: string;
}

export function createDataStore(
  id: string,
  name: string,
  description: string,
  type: DataStoreType,
  options?: CreateDataStoreOptions
): DataStore {
  return {
    id,
    name,
    description,
    type,
    ...(options?.domain !== undefined && { domain: options.domain }),
    ...(options?.owner !== undefined && { owner: options.owner }),
    ...(options?.technology !== undefined && { technology: options.technology }),
    ...(options?.links !== undefined && { links: options.links }),
    ...(options?.content !== undefined && { content: options.content }),
  };
}
