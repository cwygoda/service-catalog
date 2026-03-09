import { Type, type Static } from '@sinclair/typebox';

export const ParticipantSchema = Type.Object({
  service: Type.String({ minLength: 1 }),
  role: Type.String({ minLength: 1 }),
});

export const StepSchema = Type.Object({
  sequence: Type.Number({ minimum: 1 }),
  actor: Type.Optional(Type.String({ minLength: 1 })),
  service: Type.Optional(Type.String({ minLength: 1 })),
  action: Type.String({ minLength: 1 }),
  endpoint: Type.Optional(Type.String()),
});

export const UseCaseSidecarSchema = Type.Object({
  use_case: Type.Object({
    id: Type.String({ minLength: 1 }),
    name: Type.String({ minLength: 1 }),
    description: Type.String(),
    domain: Type.Optional(Type.String({ minLength: 1 })),
    bpmn: Type.Optional(Type.String()),
    participants: Type.Array(ParticipantSchema),
    steps: Type.Array(StepSchema),
  }),
});

export const DocLinkSchema = Type.Object({
  elementId: Type.String({ minLength: 1 }),
  anchor: Type.String({ minLength: 1 }),
});

export const ServiceRefSchema = Type.Object({
  elementId: Type.String({ minLength: 1 }),
  serviceId: Type.String({ minLength: 1 }),
});

export const UseCaseMarkdownFrontmatterSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  name: Type.String({ minLength: 1 }),
  domain: Type.Optional(Type.String({ minLength: 1 })),
  participants: Type.Optional(Type.Array(ParticipantSchema)),
});

export type ParticipantInput = Static<typeof ParticipantSchema>;
export type StepInput = Static<typeof StepSchema>;
export type UseCaseSidecar = Static<typeof UseCaseSidecarSchema>;
export type UseCaseMarkdownFrontmatter = Static<typeof UseCaseMarkdownFrontmatterSchema>;
