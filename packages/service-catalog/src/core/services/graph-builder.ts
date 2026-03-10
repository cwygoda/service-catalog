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

export const PARTITION_BY_TYPE: Record<string, number> = {
  'web-app': 0,
  'web-service': 1,
  'event-consumer': 2,
  'event-producer': 2,
  'event-transformer': 2,
  library: 3,
};

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
 * Includes shared data-store nodes (connected to 2+ services).
 */
export function buildServiceGraph(catalog: Catalog): ServiceGraph {
  // Create nodes from services with partitions
  const nodes: GraphNode[] = catalog.services.map((s) => ({
    id: s.id,
    name: s.name,
    ...(s.domain && { domain: s.domain }),
    type: s.type,
    lifecycle: s.lifecycle,
    partition: PARTITION_BY_TYPE[s.type] ?? 1,
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

  // Collect data-store edges from all services
  const serviceTypeMap = new Map(catalog.services.map((s) => [s.id, s.type]));
  const dsDescMap = new Map(catalog.dataStores.map((ds) => [ds.id, ds.description]));

  const allDsEdges: GraphEdge[] = catalog.services.flatMap((svc) =>
    (svc.dataStores ?? []).map((ds) => {
      const desc = dsDescMap.get(ds.target);
      return {
        source: svc.id,
        target: ds.target,
        type: 'data-store' as const,
        access: ds.access,
        ...(desc ? { description: desc } : {}),
      };
    })
  );

  // Only include shared data stores (connected to 2+ services)
  const dsOwners = new Map<string, string[]>();
  for (const e of allDsEdges) {
    const owners = dsOwners.get(e.target) ?? [];
    owners.push(e.source);
    dsOwners.set(e.target, owners);
  }

  const sharedDsIds = new Set(
    [...dsOwners.entries()].filter(([, owners]) => owners.length >= 2).map(([id]) => id)
  );

  // Add shared data-store nodes
  const dsNodes: GraphNode[] = catalog.dataStores
    .filter((ds) => sharedDsIds.has(ds.id))
    .map((ds) => {
      const owners = dsOwners.get(ds.id) ?? [];
      const ownerPartitions = owners.map(
        (id) => PARTITION_BY_TYPE[serviceTypeMap.get(id) ?? ''] ?? 1
      );
      const partition = Math.max(...ownerPartitions, 1);
      return {
        id: ds.id,
        name: ds.name,
        ...(ds.domain ? { domain: ds.domain } : {}),
        type: 'data-store' as const,
        partition,
      };
    });

  // Add shared data-store edges
  const dsEdges = allDsEdges.filter((e) => sharedDsIds.has(e.target));

  return {
    nodes: [...nodes, ...dsNodes],
    edges: [...Array.from(edgeMap.values()), ...dsEdges],
  };
}
