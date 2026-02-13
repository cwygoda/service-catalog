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
    bpmn: Type.Optional(Type.String()),
    participants: Type.Array(ParticipantSchema),
    steps: Type.Array(StepSchema),
  }),
});

export type ParticipantInput = Static<typeof ParticipantSchema>;
export type StepInput = Static<typeof StepSchema>;
export type UseCaseSidecar = Static<typeof UseCaseSidecarSchema>;
