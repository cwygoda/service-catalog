import { computeLayout } from '@cwygoda/service-catalog/ui/graph';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ parent }) => {
  const { catalog } = await parent();

  const graph = catalog.graph ?? { nodes: [], edges: [] };

  return {
    layout: await computeLayout(graph.nodes, graph.edges),
    useCases: catalog.useCases,
  };
};
