import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { catalog } = await parent();

  // Use pre-built graph from catalog, fallback to empty
  const graph = catalog.graph ?? { nodes: [], edges: [] };

  return {
    nodes: graph.nodes,
    edges: graph.edges,
    useCases: catalog.useCases,
  };
};
