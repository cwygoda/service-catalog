import type { Connection } from './connection.js';

export interface ServiceMetadata {
  version?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  domain?: string;
  metadata?: ServiceMetadata | undefined;
  connections?: Connection[];
}

import { isConnection } from './connection.js';

export function isService(value: unknown): value is Service {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  // Required fields
  if (typeof obj['id'] !== 'string') return false;
  if (typeof obj['name'] !== 'string') return false;
  if (typeof obj['description'] !== 'string') return false;

  // Optional domain
  if ('domain' in obj && obj['domain'] !== undefined && typeof obj['domain'] !== 'string') {
    return false;
  }

  // Optional connections
  if ('connections' in obj && obj['connections'] !== undefined) {
    if (!Array.isArray(obj['connections'])) return false;
    if (!obj['connections'].every(isConnection)) return false;
  }

  return true;
}

export function createService(
  id: string,
  name: string,
  description: string,
  options?: { domain?: string; metadata?: ServiceMetadata; connections?: Connection[] }
): Service {
  return {
    id,
    name,
    description,
    ...(options?.domain !== undefined && { domain: options.domain }),
    ...(options?.metadata !== undefined && { metadata: options.metadata }),
    ...(options?.connections !== undefined && { connections: options.connections }),
  };
}
