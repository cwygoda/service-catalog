/**
 * Graph builder service - builds service connection graph from catalog data.
 *
 * Combines:
 * 1. Explicit connections declared in service sidecars
 * 2. Implicit connections derived from use case steps
 */

import type { Catalog } from '../domain/catalog.js';
import type { Connection, ConnectionType } from '../domain/connection.js';
import type { GraphNode, GraphEdge, ServiceGraph } from '../domain/graph.js';

export type { GraphNode, GraphEdge, ServiceGraph };

/**
 * Derives connections from use case steps.
 * When step N has service A and step N+1 has service B, that implies A -> B connection.
 */
export function deriveConnectionsFromUseCases(catalog: Catalog): Map<string, Connection[]> {
  const connectionMap = new Map<string, Connection[]>();

  for (const useCase of catalog.useCases) {
    const steps = useCase.steps;

    for (let i = 0; i < steps.length - 1; i++) {
      const current = steps[i];
      const next = steps[i + 1];

      // Both steps must exist and have services and they must be different
      if (!current || !next) continue;
      if (!current.service || !next.service) continue;
      if (current.service === next.service) continue;

      const sourceId = current.service;
      const targetId = next.service;
      const nextEndpoint = next.endpoint;

      // Determine connection type from the next step
      const type: ConnectionType = nextEndpoint ? 'http' : 'event';

      // Get or create connection list for this source
      let connections = connectionMap.get(sourceId);
      if (!connections) {
        connections = [];
        connectionMap.set(sourceId, connections);
      }

      // Check if this connection already exists
      const existing = connections.find((c) => c.target === targetId && c.type === type);

      if (existing) {
        // Merge endpoint/event info
        if (type === 'http' && nextEndpoint) {
          existing.endpoints = existing.endpoints ?? [];
          if (!existing.endpoints.includes(nextEndpoint)) {
            existing.endpoints.push(nextEndpoint);
          }
        }
      } else {
        // Create new connection
        const conn: Connection = {
          target: targetId,
          type,
        };
        if (type === 'http' && nextEndpoint) {
          conn.endpoints = [nextEndpoint];
        }
        connections.push(conn);
      }
    }
  }

  return connectionMap;
}

/**
 * Merges explicit connections with derived connections.
 * Explicit connections take precedence.
 */
function mergeConnections(
  explicit: Connection[] | undefined,
  derived: Connection[] | undefined
): Connection[] {
  const merged = new Map<string, Connection>();

  // Add explicit connections first (they take precedence)
  for (const conn of explicit ?? []) {
    const key = `${conn.target}:${conn.type}`;
    merged.set(key, { ...conn });
  }

  // Add derived connections if not already present
  for (const conn of derived ?? []) {
    const key = `${conn.target}:${conn.type}`;
    if (!merged.has(key)) {
      merged.set(key, { ...conn });
    } else {
      // Merge endpoints/events from derived into explicit
      const existing = merged.get(key);
      if (!existing) continue; // Should never happen since we checked has()
      if (conn.endpoints) {
        existing.endpoints = [...new Set([...(existing.endpoints ?? []), ...conn.endpoints])];
      }
      if (conn.events) {
        existing.events = [...new Set([...(existing.events ?? []), ...conn.events])];
      }
    }
  }

  return Array.from(merged.values());
}

/**
 * Builds a service graph from catalog data.
 */
export function buildServiceGraph(catalog: Catalog): ServiceGraph {
  // Create nodes from services
  const nodes: GraphNode[] = catalog.services.map((s) => ({
    id: s.id,
    name: s.name,
    ...(s.domain && { domain: s.domain }),
    type: s.type,
    lifecycle: s.lifecycle,
  }));

  // Derive connections from use cases
  const derivedConnections = deriveConnectionsFromUseCases(catalog);

  // Build edges combining explicit and derived connections
  const edgeMap = new Map<string, GraphEdge>();

  for (const service of catalog.services) {
    const derived = derivedConnections.get(service.id);
    const merged = mergeConnections(service.connections, derived);

    for (const conn of merged) {
      // Only add edge if target service exists
      const targetExists = catalog.services.some((s) => s.id === conn.target);
      if (!targetExists) continue;

      const key = `${service.id}->${conn.target}:${conn.type}`;
      if (!edgeMap.has(key)) {
        edgeMap.set(key, {
          source: service.id,
          target: conn.target,
          type: conn.type,
          ...(conn.role && { role: conn.role }),
          ...(conn.endpoints && { endpoints: conn.endpoints }),
          ...(conn.events && { events: conn.events }),
          ...(conn.description && { description: conn.description }),
        });
      }
    }
  }

  return {
    nodes,
    edges: Array.from(edgeMap.values()),
  };
}
