import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { fetchCatalog } from '@service-catalog/ui';
import type { Domain } from '@service-catalog/core';

export const load: PageLoad = async ({ fetch, params }) => {
  const catalog = await fetchCatalog(fetch);
  const service = catalog.services.find((s) => s.id === params.id);

  if (!service) {
    error(404, `Service '${params.id}' not found`);
  }

  // Get use cases this service participates in
  const useCases = catalog.useCases.filter((uc) =>
    uc.participants.some((p) => p.service === service.id)
  );

  // Find domain and build ancestor chain for breadcrumbs
  const domain = service.domain ? catalog.domains.find((d) => d.id === service.domain) : null;
  const domainAncestors: Domain[] = [];
  if (domain) {
    domainAncestors.push(domain);
    let current = domain;
    while (current.parent) {
      const parent = catalog.domains.find((d) => d.id === current.parent);
      if (!parent) break;
      domainAncestors.unshift(parent);
      current = parent;
    }
  }

  // Build mini-graph for this service's connections
  const graph = catalog.graph ?? { nodes: [], edges: [] };

  // Get edges where this service is source or target
  const relevantEdges = graph.edges.filter(
    (e) => e.source === service.id || e.target === service.id
  );

  // Get all service IDs involved (this service + connected ones)
  const connectedServiceIds = new Set<string>([service.id]);
  for (const edge of relevantEdges) {
    connectedServiceIds.add(edge.source);
    connectedServiceIds.add(edge.target);
  }

  // Filter nodes to only connected services
  const relevantNodes = graph.nodes.filter((n) => connectedServiceIds.has(n.id));

  // Separate incoming and outgoing connections
  const outgoingConnections = relevantEdges
    .filter((e) => e.source === service.id)
    .map((e) => ({
      ...e,
      targetName: graph.nodes.find((n) => n.id === e.target)?.name ?? e.target,
    }));

  const incomingConnections = relevantEdges
    .filter((e) => e.target === service.id)
    .map((e) => ({
      ...e,
      sourceName: graph.nodes.find((n) => n.id === e.source)?.name ?? e.source,
    }));

  return {
    service,
    useCases,
    domain,
    domainAncestors,
    miniGraph: {
      nodes: relevantNodes,
      edges: relevantEdges,
    },
    outgoingConnections,
    incomingConnections,
  };
};
