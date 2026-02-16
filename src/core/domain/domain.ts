export interface Domain {
  id: string;
  name: string;
  description: string;
  parent?: string;
}

export function isDomain(value: unknown): value is Domain {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  // Required fields
  if (typeof obj['id'] !== 'string') return false;
  if (typeof obj['name'] !== 'string') return false;
  if (typeof obj['description'] !== 'string') return false;

  // Optional parent
  if ('parent' in obj && obj['parent'] !== undefined && typeof obj['parent'] !== 'string') {
    return false;
  }

  return true;
}

export function createDomain(
  id: string,
  name: string,
  description: string,
  parent?: string
): Domain {
  return {
    id,
    name,
    description,
    ...(parent !== undefined && { parent }),
  };
}
