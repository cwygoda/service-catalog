export interface Participant {
  service: string;
  role: string;
}

export interface Step {
  sequence: number;
  actor?: string;
  service?: string;
  action: string;
  endpoint?: string;
}

export interface UseCase {
  id: string;
  name: string;
  description: string;
  bpmn?: string;
  participants: Participant[];
  steps: Step[];
}

export function createUseCase(
  id: string,
  name: string,
  description: string,
  participants: Participant[] = [],
  steps: Step[] = [],
  bpmn?: string
): UseCase {
  return {
    id,
    name,
    description,
    ...(bpmn !== undefined && { bpmn }),
    participants,
    steps,
  };
}

export function isParticipant(value: unknown): value is Participant {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;
  return typeof obj['service'] === 'string' && typeof obj['role'] === 'string';
}

export function isStep(value: unknown): value is Step {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  if (typeof obj['sequence'] !== 'number') return false;
  if (typeof obj['action'] !== 'string') return false;

  // Optional fields
  if ('actor' in obj && obj['actor'] !== undefined && typeof obj['actor'] !== 'string')
    return false;
  if ('service' in obj && obj['service'] !== undefined && typeof obj['service'] !== 'string')
    return false;
  if ('endpoint' in obj && obj['endpoint'] !== undefined && typeof obj['endpoint'] !== 'string')
    return false;

  return true;
}

export function isUseCase(value: unknown): value is UseCase {
  if (typeof value !== 'object' || value === null) return false;
  const obj = value as Record<string, unknown>;

  // Required fields
  if (typeof obj['id'] !== 'string') return false;
  if (typeof obj['name'] !== 'string') return false;
  if (typeof obj['description'] !== 'string') return false;

  // Optional bpmn
  if ('bpmn' in obj && obj['bpmn'] !== undefined && typeof obj['bpmn'] !== 'string') return false;

  // Required arrays
  if (!Array.isArray(obj['participants'])) return false;
  if (!Array.isArray(obj['steps'])) return false;

  // Validate array contents
  for (const p of obj['participants']) {
    if (!isParticipant(p)) return false;
  }
  for (const s of obj['steps']) {
    if (!isStep(s)) return false;
  }

  return true;
}
