import type { GraphNode, GraphEdge } from '../../../core/domain/graph.js';
import { NODE_WIDTH, NODE_HEIGHT, DATASTORE_HEIGHT, PARTITION_BY_TYPE } from './constants.js';

export interface LayoutNode {
  id: string;
  name: string;
  type?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  access?: 'r' | 'rw';
  description?: string;
  points: { x: number; y: number }[];
}

export interface LayoutResult {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  width: number;
  height: number;
}

export async function computeLayout(nodes: GraphNode[], edges: GraphEdge[]): Promise<LayoutResult> {
  const ELK = (await import('elkjs/lib/elk.bundled.js')).default;
  const elk = new ELK();

  // Pre-compute edge directions (reversed for layout)
  const processedEdges = edges.map((e, i) => {
    const reversed =
      (e.type === 'event' && e.role !== 'producer') ||
      (e.type === 'data-store' && e.access === 'r');
    return {
      id: `e${String(i)}`,
      orig: e,
      reversed,
      layoutSource: reversed ? e.target : e.source,
      layoutTarget: reversed ? e.source : e.target,
    };
  });

  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.partitioning.activate': 'true',
      'elk.spacing.nodeNode': '50',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.spacing.edgeEdge': '30',
      'elk.spacing.edgeNode': '35',
      'elk.layered.spacing.edgeNodeBetweenLayers': '35',
      'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
      'elk.edgeRouting': 'ORTHOGONAL',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
    },
    children: nodes.map((n) => ({
      id: n.id,
      width: NODE_WIDTH,
      height: n.type === 'data-store' ? DATASTORE_HEIGHT : NODE_HEIGHT,
      layoutOptions: {
        'elk.partitioning.partition': String(
          n.partition ?? (n.type ? (PARTITION_BY_TYPE[n.type] ?? 1) : 1)
        ),
      },
    })),
    edges: processedEdges.map((pe) => ({
      id: pe.id,
      sources: [pe.layoutSource],
      targets: [pe.layoutTarget],
    })),
  };

  const layout = await elk.layout(elkGraph);

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const layoutNodes: LayoutNode[] = (layout.children ?? []).map((c) => {
    const orig = nodeMap.get(c.id) ?? { id: c.id, name: c.id };
    return {
      id: c.id,
      name: orig.name,
      ...(orig.type ? { type: orig.type } : {}),
      x: c.x ?? 0,
      y: c.y ?? 0,
      width: c.width ?? NODE_WIDTH,
      height: c.height ?? (orig.type === 'data-store' ? DATASTORE_HEIGHT : NODE_HEIGHT),
    };
  });

  const elkEdgeMap = new Map((layout.edges ?? []).map((e) => [e.id, e]));

  const layoutEdges: LayoutEdge[] = processedEdges.map((pe) => {
    const elkEdge = elkEdgeMap.get(pe.id);
    const section = elkEdge?.sections?.[0];
    const points: { x: number; y: number }[] = [];
    if (section) {
      points.push(section.startPoint);
      if (section.bendPoints) points.push(...section.bendPoints);
      points.push(section.endPoint);
    }
    const origEdge = pe.orig;
    return {
      id: pe.id,
      source: pe.reversed ? origEdge.target : origEdge.source,
      target: pe.reversed ? origEdge.source : origEdge.target,
      type: origEdge.type,
      ...(origEdge.access ? { access: origEdge.access } : {}),
      ...(origEdge.description ? { description: origEdge.description } : {}),
      points,
    };
  });

  return {
    nodes: layoutNodes,
    edges: layoutEdges,
    width: layout.width ?? 800,
    height: layout.height ?? 600,
  };
}
