/**
 * Connection entity - represents a dependency from one service to another.
 */

export type ConnectionType = 'http' | 'event' | 'grpc';
export type ConnectionRole = 'producer' | 'consumer';

export interface Connection {
  /** Target service ID */
  target: string;
  /** Connection type */
  type: ConnectionType;
  /** Role of the declaring service in event connections */
  role?: ConnectionRole;
  /** API endpoints for http/grpc connections */
  endpoints?: string[];
  /** Event topics for event connections */
  events?: string[];
  /** Markdown description of this connection */
  description?: string;
}

/**
 * Creates a Connection with defaults applied.
 */
export function createConnection(input: Connection): Connection {
  return {
    target: input.target,
    type: input.type,
    ...(input.role && { role: input.role }),
    ...(input.endpoints && { endpoints: input.endpoints }),
    ...(input.events && { events: input.events }),
    ...(input.description && { description: input.description }),
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

  if (conn['type'] !== 'http' && conn['type'] !== 'event' && conn['type'] !== 'grpc') {
    return false;
  }

  if (conn['role'] !== undefined) {
    if (conn['role'] !== 'producer' && conn['role'] !== 'consumer') return false;
  }

  if (conn['endpoints'] !== undefined) {
    if (!Array.isArray(conn['endpoints'])) return false;
    if (!conn['endpoints'].every((e) => typeof e === 'string')) return false;
  }

  if (conn['events'] !== undefined) {
    if (!Array.isArray(conn['events'])) return false;
    if (!conn['events'].every((e) => typeof e === 'string')) return false;
  }

  if (conn['description'] !== undefined) {
    if (typeof conn['description'] !== 'string') return false;
  }

  return true;
}
