import { Type, type Static } from '@sinclair/typebox';
import {
  ParticipantSchema,
  StepSchema,
  DocLinkSchema,
  ServiceRefSchema,
} from './use-case.schema.js';
import { ConnectionSchema } from './connection.schema.js';
import {
  ServiceTypeSchema,
  LifecycleSchema,
  TierSchema,
  LinkSchema,
  ContactSchema,
} from './service.schema.js';
import { DataStoreTypeSchema } from './data-store.schema.js';

export const SpecSummarySchema = Type.Object({
  type: Type.Union([Type.Literal('openapi'), Type.Literal('asyncapi')]),
  version: Type.Optional(Type.String()),
  title: Type.Optional(Type.String()),
  endpoints: Type.Optional(Type.Array(Type.String())),
  raw: Type.Optional(Type.String()),
});

export const ServiceSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  description: Type.String(),
  domain: Type.Optional(Type.String({ minLength: 1 })),
  type: ServiceTypeSchema,
  lifecycle: LifecycleSchema,
  owner: Type.Optional(Type.String({ minLength: 1 })),
  tags: Type.Optional(Type.Array(Type.String())),
  links: Type.Optional(Type.Array(LinkSchema)),
  repository: Type.Optional(Type.String({ minLength: 1 })),
  tier: Type.Optional(TierSchema),
  contacts: Type.Optional(Type.Array(ContactSchema)),
  language: Type.Optional(Type.Array(Type.String())),
  frameworks: Type.Optional(Type.Array(Type.String())),
  dataStores: Type.Optional(
    Type.Array(
      Type.Object({
        target: Type.String({ minLength: 1 }),
        access: Type.Union([Type.Literal('r'), Type.Literal('rw')]),
      })
    )
  ),
  specs: Type.Optional(Type.Array(SpecSummarySchema)),
  connections: Type.Optional(Type.Array(ConnectionSchema)),
  content: Type.Optional(Type.String()),
});

export const UseCaseSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  description: Type.String(),
  domain: Type.Optional(Type.String({ minLength: 1 })),
  bpmn: Type.Optional(Type.String()),
  participants: Type.Array(ParticipantSchema),
  steps: Type.Array(StepSchema),
  content: Type.Optional(Type.String()),
  docLinks: Type.Optional(Type.Array(DocLinkSchema)),
  serviceRefs: Type.Optional(Type.Array(ServiceRefSchema)),
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
  domain: Type.Optional(Type.String({ minLength: 1 })),
  type: Type.Optional(ServiceTypeSchema),
  lifecycle: Type.Optional(LifecycleSchema),
});

export const GraphEdgeSchema = Type.Object({
  source: Type.String({ minLength: 1 }),
  target: Type.String({ minLength: 1 }),
  type: Type.Union([Type.Literal('http'), Type.Literal('event'), Type.Literal('grpc')]),
  endpoints: Type.Optional(Type.Array(Type.String())),
  events: Type.Optional(Type.Array(Type.String())),
});

export const ServiceGraphSchema = Type.Object({
  nodes: Type.Array(GraphNodeSchema),
  edges: Type.Array(GraphEdgeSchema),
});

export const DataStoreOutputSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  description: Type.String(),
  type: DataStoreTypeSchema,
  domain: Type.Optional(Type.String({ minLength: 1 })),
  owner: Type.Optional(Type.String({ minLength: 1 })),
  technology: Type.Optional(Type.String({ minLength: 1 })),
  links: Type.Optional(Type.Array(LinkSchema)),
  content: Type.Optional(Type.String()),
});

export const CatalogSchema = Type.Object({
  services: Type.Array(ServiceSchema),
  useCases: Type.Array(UseCaseSchema),
  domains: Type.Array(DomainOutputSchema),
  dataStores: Type.Array(DataStoreOutputSchema),
  graph: Type.Optional(ServiceGraphSchema),
});

export type CatalogData = Static<typeof CatalogSchema>;
