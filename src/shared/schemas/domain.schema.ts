import { Type, type Static } from '@sinclair/typebox';

export const DomainSidecarSchema = Type.Object({
  domain: Type.Object({
    id: Type.String({ minLength: 1 }),
    name: Type.String({ minLength: 1 }),
    description: Type.String(),
    parent: Type.Optional(Type.String({ minLength: 1 })),
  }),
});

export type DomainSidecar = Static<typeof DomainSidecarSchema>;
