import type { Connection } from './connection.js';

export type ServiceType =
  | 'web-service'
  | 'event-consumer'
  | 'event-producer'
  | 'web-app'
  | 'library';
export type Lifecycle = 'experimental' | 'active' | 'deprecated' | 'sunset';
export type Tier = 'critical' | 'standard' | 'internal';

export interface Link {
  url: string;
  title: string;
  type?: string;
}

export interface Contact {
  type: string;
  value: string;
}

export interface SpecSummary {
  type: 'openapi' | 'asyncapi';
  version?: string;
  title?: string;
  endpoints?: string[];
  raw?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  domain?: string;
  type: ServiceType;
  lifecycle: Lifecycle;
  owner?: string;
  tags?: string[];
  links?: Link[];
  repository?: string;
  tier?: Tier;
  contacts?: Contact[];
  language?: string[];
  framework?: string;
  specs?: SpecSummary[];
  connections?: Connection[];
  content?: string;
}

import { isConnection } from './connection.js';

const VALID_TYPES = new Set<string>([
  'web-service',
  'event-consumer',
  'event-producer',
  'web-app',
  'library',
]);

const VALID_LIFECYCLES = new Set<string>(['experimental', 'active', 'deprecated', 'sunset']);

export function isService(value: unknown): value is Service {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  // Required fields
  if (typeof obj['id'] !== 'string') return false;
  if (typeof obj['name'] !== 'string') return false;
  if (typeof obj['description'] !== 'string') return false;
  if (typeof obj['type'] !== 'string' || !VALID_TYPES.has(obj['type'])) return false;
  if (typeof obj['lifecycle'] !== 'string' || !VALID_LIFECYCLES.has(obj['lifecycle'])) return false;

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

export interface CreateServiceOptions {
  domain?: string;
  type?: ServiceType;
  lifecycle?: Lifecycle;
  owner?: string;
  tags?: string[];
  links?: Link[];
  repository?: string;
  tier?: Tier;
  contacts?: Contact[];
  language?: string[];
  framework?: string;
  specs?: SpecSummary[];
  connections?: Connection[];
  content?: string;
}

export function createService(
  id: string,
  name: string,
  description: string,
  options?: CreateServiceOptions
): Service {
  return {
    id,
    name,
    description,
    type: options?.type ?? 'web-service',
    lifecycle: options?.lifecycle ?? 'active',
    ...(options?.domain !== undefined && { domain: options.domain }),
    ...(options?.owner !== undefined && { owner: options.owner }),
    ...(options?.tags !== undefined && { tags: options.tags }),
    ...(options?.links !== undefined && { links: options.links }),
    ...(options?.repository !== undefined && { repository: options.repository }),
    ...(options?.tier !== undefined && { tier: options.tier }),
    ...(options?.contacts !== undefined && { contacts: options.contacts }),
    ...(options?.language !== undefined && { language: options.language }),
    ...(options?.framework !== undefined && { framework: options.framework }),
    ...(options?.specs !== undefined && { specs: options.specs }),
    ...(options?.connections !== undefined && { connections: options.connections }),
    ...(options?.content !== undefined && { content: options.content }),
  };
}
