/**
 * Connection entity - represents a dependency from one service to another.
 */

export type ConnectionType = 'http' | 'event';

export interface Connection {
  /** Target service ID */
  target: string;
  /** Connection type */
  type: ConnectionType;
  /** API endpoints for http connections */
  endpoints?: string[];
  /** Event topics for event connections */
  events?: string[];
}

/**
 * Creates a Connection with defaults applied.
 */
export function createConnection(input: Connection): Connection {
  return {
    target: input.target,
    type: input.type,
    ...(input.endpoints && { endpoints: input.endpoints }),
    ...(input.events && { events: input.events }),
  };
}

/**
 * Type guard for Connection.
 */
export function isConnection(value: unknown): value is Connection {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const conn = value as Record<string, unknown>;

  if (typeof conn['target'] !== 'string' || conn['target'].length === 0) {
    return false;
  }

  if (conn['type'] !== 'http' && conn['type'] !== 'event') {
    return false;
  }

  if (conn['endpoints'] !== undefined) {
    if (!Array.isArray(conn['endpoints'])) return false;
    if (!conn['endpoints'].every((e) => typeof e === 'string')) return false;
  }

  if (conn['events'] !== undefined) {
    if (!Array.isArray(conn['events'])) return false;
    if (!conn['events'].every((e) => typeof e === 'string')) return false;
  }

  return true;
}
