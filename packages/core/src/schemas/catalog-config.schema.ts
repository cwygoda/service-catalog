import { Type, type Static } from '@sinclair/typebox';

export const BpmnLintLevel = Type.Union([
  Type.Literal('error'),
  Type.Literal('warn'),
  Type.Literal('off'),
]);

export const CatalogConfigSchema = Type.Object({
  catalog: Type.Object({
    name: Type.Optional(Type.String({ minLength: 1 })),
    description: Type.Optional(Type.String()),
    bpmn_lint: Type.Optional(BpmnLintLevel),
  }),
});

export type BpmnLintLevel = Static<typeof BpmnLintLevel>;
export type CatalogConfig = Static<typeof CatalogConfigSchema>;
