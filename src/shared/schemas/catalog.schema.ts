import { Type, type Static } from '@sinclair/typebox';
import { ParticipantSchema, StepSchema } from './use-case.schema.js';
import { ConnectionSchema } from './connection.schema.js';

export const ServiceSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  description: Type.String(),
  domain: Type.Optional(Type.String({ minLength: 1 })),
  metadata: Type.Optional(
    Type.Object({
      version: Type.Optional(Type.String()),
    })
  ),
  connections: Type.Optional(Type.Array(ConnectionSchema)),
});

export const UseCaseSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  description: Type.String(),
  domain: Type.Optional(Type.String({ minLength: 1 })),
  bpmn: Type.Optional(Type.String()),
  participants: Type.Array(ParticipantSchema),
  steps: Type.Array(StepSchema),
});

export const DomainOutputSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  description: Type.String(),
  parent: Type.Optional(Type.String({ minLength: 1 })),
});

// Graph schemas for visualization
export const GraphNodeSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  domain: Type.Optional(Type.String()),
});

export const GraphEdgeSchema = Type.Object({
  source: Type.String({ minLength: 1 }),
  target: Type.String({ minLength: 1 }),
  type: Type.Union([Type.Literal('http'), Type.Literal('event')]),
  endpoints: Type.Optional(Type.Array(Type.String())),
  events: Type.Optional(Type.Array(Type.String())),
});

export const ServiceGraphSchema = Type.Object({
  nodes: Type.Array(GraphNodeSchema),
  edges: Type.Array(GraphEdgeSchema),
});

export const CatalogSchema = Type.Object({
  services: Type.Array(ServiceSchema),
  useCases: Type.Array(UseCaseSchema),
  domains: Type.Array(DomainOutputSchema),
  graph: Type.Optional(ServiceGraphSchema),
});

export type CatalogData = Static<typeof CatalogSchema>;
export type GraphNode = Static<typeof GraphNodeSchema>;
export type GraphEdge = Static<typeof GraphEdgeSchema>;
export type ServiceGraph = Static<typeof ServiceGraphSchema>;
