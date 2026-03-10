import type { ConnectionType, ConnectionRole } from './connection.js';
import type { ServiceType, Lifecycle } from './service.js';

export interface GraphNode {
  id: string;
  name: string;
  domain?: string;
  type?: ServiceType | 'data-store';
  lifecycle?: Lifecycle;
  partition?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: ConnectionType | 'data-store';
  role?: ConnectionRole;
  endpoints?: string[];
  events?: string[];
  description?: string;
  access?: 'r' | 'rw';
}

export interface ServiceGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}
