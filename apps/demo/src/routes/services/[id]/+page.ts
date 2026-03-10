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
  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

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

  // Get edges where this service is source or target
  const relevantEdges = graph.edges.filter(
    (e) => e.source === service.id || e.target === service.id
  );

  // Filter nodes to only connected services
  const connectedServiceIds = new Set<string>([service.id]);
  for (const edge of relevantEdges) {
    connectedServiceIds.add(edge.source);
    connectedServiceIds.add(edge.target);
  }
  const relevantNodes = graph.nodes.filter((n) => connectedServiceIds.has(n.id));

  // Separate incoming and outgoing connections
  const outgoingConnections = relevantEdges
    .filter((e) => e.source === service.id)
    .map((e) => ({
      ...e,
      targetName: nodeMap.get(e.target)?.name ?? e.target,
    }));

  const incomingConnections = relevantEdges
    .filter((e) => e.target === service.id)
    .map((e) => ({
      ...e,
      sourceName: nodeMap.get(e.source)?.name ?? e.source,
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
