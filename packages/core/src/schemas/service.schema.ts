import { Type, type Static } from '@sinclair/typebox';
import { ConnectionSchema } from './connection.schema.js';

export const ServiceTypeSchema = Type.Union([
  Type.Literal('web-service'),
  Type.Literal('event-consumer'),
  Type.Literal('event-producer'),
  Type.Literal('web-app'),
  Type.Literal('library'),
]);

export const LifecycleSchema = Type.Union([
  Type.Literal('experimental'),
  Type.Literal('active'),
  Type.Literal('deprecated'),
  Type.Literal('sunset'),
]);

export const TierSchema = Type.Union([
  Type.Literal('critical'),
  Type.Literal('standard'),
  Type.Literal('internal'),
]);

export const LinkSchema = Type.Object({
  url: Type.String({ minLength: 1 }),
  title: Type.String({ minLength: 1 }),
  type: Type.Optional(Type.String()),
});

export const ContactSchema = Type.Object({
  type: Type.String({ minLength: 1 }),
  value: Type.String({ minLength: 1 }),
});

export const SpecRefsSchema = Type.Object({
  openapi: Type.Optional(Type.String({ minLength: 1 })),
  asyncapi: Type.Optional(Type.String({ minLength: 1 })),
});

export const ServiceSidecarSchema = Type.Object({
  service: Type.Object({
    id: Type.String({ minLength: 1 }),
    name: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    domain: Type.Optional(Type.String({ minLength: 1 })),
    type: Type.Optional(ServiceTypeSchema),
    lifecycle: Type.Optional(LifecycleSchema),
    owner: Type.Optional(Type.String({ minLength: 1 })),
    tags: Type.Optional(Type.Array(Type.String())),
    links: Type.Optional(Type.Array(LinkSchema)),
    repository: Type.Optional(Type.String({ minLength: 1 })),
    tier: Type.Optional(TierSchema),
    contacts: Type.Optional(Type.Array(ContactSchema)),
    language: Type.Optional(Type.Array(Type.String())),
    framework: Type.Optional(Type.String()),
    specs: Type.Optional(SpecRefsSchema),
    connections: Type.Optional(Type.Array(ConnectionSchema)),
  }),
});

export type ServiceSidecar = Static<typeof ServiceSidecarSchema>;
export type SpecRefs = Static<typeof SpecRefsSchema>;
