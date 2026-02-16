export interface ServiceMetadata {
  version?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  domain?: string;
  metadata?: ServiceMetadata | undefined;
}

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

  return true;
}

export function createService(
  id: string,
  name: string,
  description: string,
  options?: { domain?: string; metadata?: ServiceMetadata }
): Service {
  return {
    id,
    name,
    description,
    ...(options?.domain !== undefined && { domain: options.domain }),
    ...(options?.metadata !== undefined && { metadata: options.metadata }),
  };
}
