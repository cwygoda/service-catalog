import { Type, type Static } from '@sinclair/typebox';

export const ServiceSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  description: Type.String(),
  metadata: Type.Optional(
    Type.Object({
      version: Type.Optional(Type.String()),
    })
  ),
});

export const CatalogSchema = Type.Object({
  services: Type.Array(ServiceSchema),
});

export type CatalogData = Static<typeof CatalogSchema>;
