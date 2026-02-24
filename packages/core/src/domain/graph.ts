import type { ConnectionType } from './connection.js';

export interface GraphNode {
  id: string;
  name: string;
  domain?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: ConnectionType;
  endpoints?: string[];
  events?: string[];
}

export interface ServiceGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
