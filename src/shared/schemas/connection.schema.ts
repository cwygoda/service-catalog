import { Type, type Static } from '@sinclair/typebox';

/**
 * Connection type enum schema.
 */
export const ConnectionTypeSchema = Type.Union([Type.Literal('http'), Type.Literal('event')]);

/**
 * Connection schema for service-to-service dependencies.
 */
export const ConnectionSchema = Type.Object({
  target: Type.String({ minLength: 1 }),
  type: ConnectionTypeSchema,
  endpoints: Type.Optional(Type.Array(Type.String())),
  events: Type.Optional(Type.Array(Type.String())),
});

export type ConnectionSchemaType = Static<typeof ConnectionSchema>;
