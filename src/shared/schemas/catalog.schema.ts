import { Type, type Static } from '@sinclair/typebox';
import { ParticipantSchema, StepSchema } from './use-case.schema.js';

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

export const CatalogSchema = Type.Object({
  services: Type.Array(ServiceSchema),
  useCases: Type.Array(UseCaseSchema),
  domains: Type.Array(DomainOutputSchema),
});

export type CatalogData = Static<typeof CatalogSchema>;
