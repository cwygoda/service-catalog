export interface ServiceMetadata {
  version?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  metadata?: ServiceMetadata | undefined;
}

export function isService(value: unknown): value is Service {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj['id'] === 'string' &&
    typeof obj['name'] === 'string' &&
    typeof obj['description'] === 'string'
  );
}

export function createService(
  id: string,
  name: string,
  description: string,
  metadata?: ServiceMetadata
): Service {
  const service: Service = { id, name, description };
  if (metadata) {
    service.metadata = metadata;
  }
  return service;
}
