import { Type, type Static } from '@sinclair/typebox';

/**
 * Connection type enum schema.
 */
export const ConnectionTypeSchema = Type.Union([
  Type.Literal('http'),
  Type.Literal('event'),
  Type.Literal('grpc'),
]);

export const ConnectionRoleSchema = Type.Union([
  Type.Literal('producer'),
  Type.Literal('consumer'),
]);

/**
 * Connection schema for service-to-service dependencies.
 */
export const ConnectionSchema = Type.Object({
  target: Type.String({ minLength: 1 }),
  type: ConnectionTypeSchema,
  role: Type.Optional(ConnectionRoleSchema),
  endpoints: Type.Optional(Type.Array(Type.String())),
  events: Type.Optional(Type.Array(Type.String())),
  description: Type.Optional(Type.String()),
});

export type ConnectionSchemaType = Static<typeof ConnectionSchema>;
