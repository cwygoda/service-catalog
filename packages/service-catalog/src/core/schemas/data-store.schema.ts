import { Type, type Static } from '@sinclair/typebox';
import { LinkSchema } from './service.schema.js';

export const DataStoreTypeSchema = Type.Union([
  Type.Literal('database'),
  Type.Literal('cache'),
  Type.Literal('queue'),
  Type.Literal('search-index'),
  Type.Literal('object-store'),
]);

export const DataStoreSidecarSchema = Type.Object({
  data_store: Type.Object({
    id: Type.String({ minLength: 1 }),
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    type: DataStoreTypeSchema,
    domain: Type.Optional(Type.String({ minLength: 1 })),
    owner: Type.Optional(Type.String({ minLength: 1 })),
    technology: Type.Optional(Type.String({ minLength: 1 })),
    links: Type.Optional(Type.Array(LinkSchema)),
  }),
});

export type DataStoreSidecar = Static<typeof DataStoreSidecarSchema>;
