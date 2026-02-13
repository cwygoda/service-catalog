import { describe, expect, it } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import {
  UseCaseSidecarSchema,
  ParticipantSchema,
  StepSchema,
  type UseCaseSidecar,
} from './use-case.schema.js';

describe('ParticipantSchema', () => {
  it('validates valid participant', () => {
    const participant = { service: 'order-service', role: 'Creates orders' };
    expect(Value.Check(ParticipantSchema, participant)).toBe(true);
  });

  it('rejects empty service', () => {
    const participant = { service: '', role: 'Creates orders' };
    expect(Value.Check(ParticipantSchema, participant)).toBe(false);
  });

  it('rejects empty role', () => {
    const participant = { service: 'order-service', role: '' };
    expect(Value.Check(ParticipantSchema, participant)).toBe(false);
  });

  it('rejects missing fields', () => {
    expect(Value.Check(ParticipantSchema, { service: 'svc' })).toBe(false);
    expect(Value.Check(ParticipantSchema, { role: 'role' })).toBe(false);
    expect(Value.Check(ParticipantSchema, {})).toBe(false);
  });
});

describe('StepSchema', () => {
  it('validates minimal step with actor', () => {
    const step = { sequence: 1, actor: 'Customer', action: 'Submit order' };
    expect(Value.Check(StepSchema, step)).toBe(true);
  });

  it('validates step with service and endpoint', () => {
    const step = {
      sequence: 2,
      service: 'order-service',
      action: 'Validate order',
      endpoint: 'POST /orders',
    };
    expect(Value.Check(StepSchema, step)).toBe(true);
  });

  it('validates step with all fields', () => {
    const step = {
      sequence: 1,
      actor: 'Customer',
      service: 'frontend',
      action: 'Click submit',
      endpoint: 'POST /submit',
    };
    expect(Value.Check(StepSchema, step)).toBe(true);
  });

  it('rejects sequence less than 1', () => {
    const step = { sequence: 0, action: 'Submit' };
    expect(Value.Check(StepSchema, step)).toBe(false);
  });

  it('rejects negative sequence', () => {
    const step = { sequence: -1, action: 'Submit' };
    expect(Value.Check(StepSchema, step)).toBe(false);
  });

  it('rejects missing sequence', () => {
    const step = { action: 'Submit' };
    expect(Value.Check(StepSchema, step)).toBe(false);
  });

  it('rejects missing action', () => {
    const step = { sequence: 1 };
    expect(Value.Check(StepSchema, step)).toBe(false);
  });

  it('rejects empty action', () => {
    const step = { sequence: 1, action: '' };
    expect(Value.Check(StepSchema, step)).toBe(false);
  });
});

describe('UseCaseSidecarSchema', () => {
  const validSidecar: UseCaseSidecar = {
    use_case: {
      id: 'checkout-flow',
      name: 'Customer Checkout',
      description: 'Handles customer checkout process',
      participants: [
        { service: 'order-service', role: 'Creates orders' },
        { service: 'billing-service', role: 'Processes payment' },
      ],
      steps: [
        { sequence: 1, actor: 'Customer', action: 'Submit order' },
        { sequence: 2, service: 'order-service', action: 'Validate', endpoint: 'POST /orders' },
      ],
    },
  };

  it('validates complete use case sidecar', () => {
    expect(Value.Check(UseCaseSidecarSchema, validSidecar)).toBe(true);
  });

  it('validates use case with bpmn path', () => {
    const withBpmn = {
      use_case: {
        ...validSidecar.use_case,
        bpmn: './checkout.bpmn.txt',
      },
    };
    expect(Value.Check(UseCaseSidecarSchema, withBpmn)).toBe(true);
  });

  it('validates minimal use case with empty arrays', () => {
    const minimal = {
      use_case: {
        id: 'simple',
        name: 'Simple Flow',
        description: 'A simple flow',
        participants: [],
        steps: [],
      },
    };
    expect(Value.Check(UseCaseSidecarSchema, minimal)).toBe(true);
  });

  it('rejects empty id', () => {
    const invalid = {
      use_case: { ...validSidecar.use_case, id: '' },
    };
    expect(Value.Check(UseCaseSidecarSchema, invalid)).toBe(false);
  });

  it('rejects empty name', () => {
    const invalid = {
      use_case: { ...validSidecar.use_case, name: '' },
    };
    expect(Value.Check(UseCaseSidecarSchema, invalid)).toBe(false);
  });

  it('rejects missing participants array', () => {
    const { participants: _, ...rest } = validSidecar.use_case;
    const invalid = { use_case: { ...rest, steps: [] } };
    expect(Value.Check(UseCaseSidecarSchema, invalid)).toBe(false);
  });

  it('rejects missing steps array', () => {
    const { steps: _, ...rest } = validSidecar.use_case;
    const invalid = { use_case: { ...rest, participants: [] } };
    expect(Value.Check(UseCaseSidecarSchema, invalid)).toBe(false);
  });

  it('rejects invalid participant in array', () => {
    const invalid = {
      use_case: {
        ...validSidecar.use_case,
        participants: [{ service: '', role: 'role' }],
      },
    };
    expect(Value.Check(UseCaseSidecarSchema, invalid)).toBe(false);
  });

  it('rejects invalid step in array', () => {
    const invalid = {
      use_case: {
        ...validSidecar.use_case,
        steps: [{ sequence: 0, action: 'Invalid' }],
      },
    };
    expect(Value.Check(UseCaseSidecarSchema, invalid)).toBe(false);
  });

  it('rejects missing use_case wrapper', () => {
    expect(Value.Check(UseCaseSidecarSchema, validSidecar.use_case)).toBe(false);
  });
});
