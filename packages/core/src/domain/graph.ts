import type { ConnectionType, ConnectionRole } from './connection.js';
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
  role?: ConnectionRole;
  endpoints?: string[];
  events?: string[];
  description?: string;
}

export interface ServiceGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
