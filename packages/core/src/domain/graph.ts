import type { ConnectionType } from './connection.js';
import type { ServiceType, Lifecycle } from './service.js';

export interface GraphNode {
  id: string;
  name: string;
  domain?: string;
  type?: ServiceType;
  lifecycle?: Lifecycle;
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
