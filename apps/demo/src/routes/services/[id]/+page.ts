import { error } from '@sveltejs/kit';
import { computeLayout } from '@cwygoda/service-catalog/ui/graph';
import type { PageLoad } from './$types';
import type { Domain } from '@cwygoda/service-catalog';

export const load: PageLoad = async ({ params, parent }) => {
  const { catalog } = await parent();
  const service = catalog.services.find((s) => s.id === params.id);

  if (!service) {
    error(404, `Service '${params.id}' not found`);
  }

  // Build lookup maps for O(1) access
  const domainMap = new Map(catalog.domains.map((d) => [d.id, d]));
  const graph = catalog.graph ?? { nodes: [], edges: [] };

  // Get use cases this service participates in
  const useCases = catalog.useCases.filter((uc) =>
    uc.participants.some((p) => p.service === service.id)
  );

  // Find domain and build ancestor chain for breadcrumbs
  const domain = service.domain ? (domainMap.get(service.domain) ?? null) : null;
  const domainAncestors: Domain[] = [];
  if (domain) {
    domainAncestors.push(domain);
    let current = domain;
    while (current.parent) {
      const p = domainMap.get(current.parent);
      if (!p) break;
      domainAncestors.unshift(p);
      current = p;
    }
  }

  // Data store edges for this service
  const dsDescMap = new Map(catalog.dataStores.map((ds) => [ds.id, ds.description]));
  const serviceDataStoreEdges = (service.dataStores ?? []).map((ds) => {
    const desc = dsDescMap.get(ds.target);
    return {
      source: service.id,
      target: ds.target,
      type: 'data-store' as const,
      access: ds.access,
      ...(desc ? { description: desc } : {}),
    };
  });

  const allEdges = [...graph.edges, ...serviceDataStoreEdges];

  // Get edges where this service is source or target
  const relevantEdges = allEdges.filter((e) => e.source === service.id || e.target === service.id);

  // Filter nodes to only connected services + data stores
  const connectedIds = new Set<string>([service.id]);
  for (const edge of relevantEdges) {
    connectedIds.add(edge.source);
    connectedIds.add(edge.target);
  }

  // Build data store nodes for connected data stores
  const PARTITION_BY_TYPE: Record<string, number> = {
    'web-app': 0,
    'web-service': 1,
    'event-consumer': 2,
    'event-producer': 2,
    'event-transformer': 2,
    library: 3,
  };
  const ownerPartition = PARTITION_BY_TYPE[service.type] ?? 1;

  const dataStoreNodes = catalog.dataStores
    .filter((ds) => connectedIds.has(ds.id))
    .map((ds) => ({
      id: ds.id,
      name: ds.name,
      ...(ds.domain ? { domain: ds.domain } : {}),
      type: 'data-store' as const,
      partition: ownerPartition,
    }));

  const relevantNodes = [...graph.nodes.filter((n) => connectedIds.has(n.id)), ...dataStoreNodes];

  // Name lookup across services and data stores
  const nameMap = new Map<string, string>();
  for (const n of graph.nodes) nameMap.set(n.id, n.name);
  for (const ds of catalog.dataStores) nameMap.set(ds.id, ds.name);

  // Separate incoming and outgoing connections
  const outgoingConnections = relevantEdges
    .filter((e) => e.source === service.id)
    .map((e) => ({
      ...e,
      targetName: nameMap.get(e.target) ?? e.target,
    }));

  const incomingConnections = relevantEdges
    .filter((e) => e.target === service.id)
    .map((e) => ({
      ...e,
      sourceName: nameMap.get(e.source) ?? e.source,
    }));

  // Get data stores owned by this service
  const dataStores = catalog.dataStores.filter((ds) => ds.owner === service.id);

  // Compute ELK layout for the mini graph
  const miniLayout =
    relevantNodes.length > 1
      ? await computeLayout(relevantNodes, relevantEdges)
      : { nodes: [], edges: [], width: 0, height: 0 };

  return {
    service,
    useCases,
    dataStores,
    domain,
    domainAncestors,
    miniLayout,
    outgoingConnections,
    incomingConnections,
  };
};
