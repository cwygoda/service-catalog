import { Type, type Static } from '@sinclair/typebox';
import { ConnectionSchema } from './connection.schema.js';

export const ServiceMetadataSchema = Type.Object({
  version: Type.Optional(Type.String()),
});

export const ServiceSidecarSchema = Type.Object({
  service: Type.Object({
    id: Type.String({ minLength: 1 }),
    name: Type.String({ minLength: 1 }),
    description: Type.String(),
    domain: Type.Optional(Type.String({ minLength: 1 })),
    metadata: Type.Optional(ServiceMetadataSchema),
    connections: Type.Optional(Type.Array(ConnectionSchema)),
  }),
});

export type ServiceSidecar = Static<typeof ServiceSidecarSchema>;
export type ServiceMetadataInput = Static<typeof ServiceMetadataSchema>;
