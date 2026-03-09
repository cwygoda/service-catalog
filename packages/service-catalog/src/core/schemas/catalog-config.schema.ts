import { Type, type Static } from '@sinclair/typebox';

export const BpmnLintLevel = Type.Union([
  Type.Literal('error'),
  Type.Literal('warn'),
  Type.Literal('off'),
]);

export const ResolversConfigSchema = Type.Object({
  github: Type.Optional(
    Type.Object({
      token_env: Type.Optional(Type.String({ minLength: 1 })),
    })
  ),
});

export const CatalogConfigSchema = Type.Object({
  catalog: Type.Object({
    name: Type.Optional(Type.String({ minLength: 1 })),
    description: Type.Optional(Type.String()),
    bpmn_lint: Type.Optional(BpmnLintLevel),
    resolvers: Type.Optional(ResolversConfigSchema),
  }),
});

export type BpmnLintLevel = Static<typeof BpmnLintLevel>;
export type ResolversConfig = Static<typeof ResolversConfigSchema>;
export type CatalogConfig = Static<typeof CatalogConfigSchema>;
