import { describe, expect, it } from 'vitest';
import {
  createUseCase,
  isUseCase,
  isParticipant,
  isStep,
  type UseCase,
  type Participant,
  type Step,
} from './use-case.js';

describe('Participant', () => {
  describe('isParticipant', () => {
    it('returns true for valid participant', () => {
      const participant: Participant = {
        service: 'order-service',
        role: 'Creates orders',
      };
      expect(isParticipant(participant)).toBe(true);
    });

    it('returns false for missing service', () => {
      expect(isParticipant({ role: 'Creates orders' })).toBe(false);
    });

    it('returns false for missing role', () => {
      expect(isParticipant({ service: 'order-service' })).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isParticipant(null)).toBe(false);
      expect(isParticipant('string')).toBe(false);
      expect(isParticipant(123)).toBe(false);
    });
  });
});

describe('Step', () => {
  describe('isStep', () => {
    it('returns true for minimal valid step', () => {
      const step: Step = {
        sequence: 1,
        action: 'Submit order',
      };
      expect(isStep(step)).toBe(true);
    });

    it('returns true for step with actor', () => {
      const step: Step = {
        sequence: 1,
        actor: 'Customer',
        action: 'Submit order',
      };
      expect(isStep(step)).toBe(true);
    });

    it('returns true for step with service and endpoint', () => {
      const step: Step = {
        sequence: 2,
        service: 'order-service',
        action: 'Validate order',
        endpoint: 'POST /orders',
      };
      expect(isStep(step)).toBe(true);
    });

    it('returns false for missing sequence', () => {
      expect(isStep({ action: 'Submit order' })).toBe(false);
    });

    it('returns false for missing action', () => {
      expect(isStep({ sequence: 1 })).toBe(false);
    });

    it('returns false for non-number sequence', () => {
      expect(isStep({ sequence: '1', action: 'Submit' })).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isStep(null)).toBe(false);
      expect(isStep('string')).toBe(false);
    });
  });
});

describe('UseCase', () => {
  const validParticipants: Participant[] = [
    { service: 'order-service', role: 'Creates orders' },
    { service: 'billing-service', role: 'Processes payment' },
  ];

  const validSteps: Step[] = [
    { sequence: 1, actor: 'Customer', action: 'Submit order' },
    { sequence: 2, service: 'order-service', action: 'Validate', endpoint: 'POST /orders' },
  ];

  describe('createUseCase', () => {
    it('creates use case with required fields', () => {
      const useCase = createUseCase('checkout', 'Checkout Flow', 'Customer checkout process');

      expect(useCase).toEqual({
        id: 'checkout',
        name: 'Checkout Flow',
        description: 'Customer checkout process',
        participants: [],
        steps: [],
      });
    });

    it('creates use case with participants and steps', () => {
      const useCase = createUseCase(
        'checkout',
        'Checkout Flow',
        'Customer checkout process',
        validParticipants,
        validSteps
      );

      expect(useCase.participants).toEqual(validParticipants);
      expect(useCase.steps).toEqual(validSteps);
    });

    it('creates use case with bpmn path', () => {
      const useCase = createUseCase(
        'checkout',
        'Checkout Flow',
        'Description',
        [],
        [],
        './checkout.bpmn.txt'
      );

      expect(useCase.bpmn).toBe('./checkout.bpmn.txt');
    });

    it('omits bpmn key when undefined', () => {
      const useCase = createUseCase('checkout', 'Checkout', 'Desc');

      expect('bpmn' in useCase).toBe(false);
    });
  });

  describe('isUseCase', () => {
    it('returns true for valid use case', () => {
      const useCase: UseCase = {
        id: 'checkout',
        name: 'Checkout Flow',
        description: 'Customer checkout process',
        participants: validParticipants,
        steps: validSteps,
      };
      expect(isUseCase(useCase)).toBe(true);
    });

    it('returns true for use case with bpmn', () => {
      const useCase: UseCase = {
        id: 'checkout',
        name: 'Checkout Flow',
        description: 'Description',
        bpmn: './checkout.bpmn.txt',
        participants: [],
        steps: [],
      };
      expect(isUseCase(useCase)).toBe(true);
    });

    it('returns true for use case with empty arrays', () => {
      const useCase: UseCase = {
        id: 'checkout',
        name: 'Checkout',
        description: 'Desc',
        participants: [],
        steps: [],
      };
      expect(isUseCase(useCase)).toBe(true);
    });

    it('returns false for missing id', () => {
      expect(
        isUseCase({
          name: 'Checkout',
          description: 'Desc',
          participants: [],
          steps: [],
        })
      ).toBe(false);
    });

    it('returns false for missing name', () => {
      expect(
        isUseCase({
          id: 'checkout',
          description: 'Desc',
          participants: [],
          steps: [],
        })
      ).toBe(false);
    });

    it('returns false for missing description', () => {
      expect(
        isUseCase({
          id: 'checkout',
          name: 'Checkout',
          participants: [],
          steps: [],
        })
      ).toBe(false);
    });

    it('returns false for missing participants array', () => {
      expect(
        isUseCase({
          id: 'checkout',
          name: 'Checkout',
          description: 'Desc',
          steps: [],
        })
      ).toBe(false);
    });

    it('returns false for missing steps array', () => {
      expect(
        isUseCase({
          id: 'checkout',
          name: 'Checkout',
          description: 'Desc',
          participants: [],
        })
      ).toBe(false);
    });

    it('returns false for invalid participant in array', () => {
      expect(
        isUseCase({
          id: 'checkout',
          name: 'Checkout',
          description: 'Desc',
          participants: [{ service: 'svc' }], // missing role
          steps: [],
        })
      ).toBe(false);
    });

    it('returns false for invalid step in array', () => {
      expect(
        isUseCase({
          id: 'checkout',
          name: 'Checkout',
          description: 'Desc',
          participants: [],
          steps: [{ action: 'Submit' }], // missing sequence
        })
      ).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isUseCase(null)).toBe(false);
      expect(isUseCase('string')).toBe(false);
      expect(isUseCase(123)).toBe(false);
      expect(isUseCase(undefined)).toBe(false);
    });

    it('returns false for non-string bpmn', () => {
      expect(
        isUseCase({
          id: 'checkout',
          name: 'Checkout',
          description: 'Desc',
          bpmn: 123,
          participants: [],
          steps: [],
        })
      ).toBe(false);
    });
  });
});
