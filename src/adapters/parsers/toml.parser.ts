import { parse, TomlError } from 'smol-toml';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { ServiceSidecarSchema, type ServiceSidecar } from '../../shared/schemas/service.schema.js';
import { UseCaseSidecarSchema, type UseCaseSidecar } from '../../shared/schemas/use-case.schema.js';
import { DomainSidecarSchema, type DomainSidecar } from '../../shared/schemas/domain.schema.js';
import type { Service } from '../../core/domain/service.js';
import type { UseCase } from '../../core/domain/use-case.js';
import type { Domain } from '../../core/domain/domain.js';

const compiledServiceSchema = TypeCompiler.Compile(ServiceSidecarSchema);
const compiledUseCaseSchema = TypeCompiler.Compile(UseCaseSidecarSchema);
const compiledDomainSchema = TypeCompiler.Compile(DomainSidecarSchema);

export class TomlParseError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly line?: number,
    public readonly column?: number
  ) {
    super(message);
    this.name = 'TomlParseError';
  }

  override toString(): string {
    const location = this.line
      ? `:${String(this.line)}${this.column ? `:${String(this.column)}` : ''}`
      : '';
    return `${this.name}: ${this.message} at ${this.filePath}${location}`;
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly errors: string[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  override toString(): string {
    return `${this.name}: ${this.message} at ${this.filePath}\n  ${this.errors.join('\n  ')}`;
  }
}

export function parseToml(content: string, filePath: string): ServiceSidecar {
  let parsed: unknown;

  try {
    parsed = parse(content);
  } catch (error) {
    if (error instanceof TomlError) {
      throw new TomlParseError(error.message, filePath, error.line, error.column);
    }
    throw new TomlParseError(
      error instanceof Error ? error.message : 'Unknown parse error',
      filePath
    );
  }

  if (!compiledServiceSchema.Check(parsed)) {
    const errors = [...compiledServiceSchema.Errors(parsed)].map(
      (e) => `${e.path}: ${e.message} (got ${JSON.stringify(e.value)})`
    );
    throw new ValidationError('Invalid service sidecar', filePath, errors);
  }

  return parsed;
}

export function sidecarToService(sidecar: ServiceSidecar): Service {
  const service: Service = {
    id: sidecar.service.id,
    name: sidecar.service.name,
    description: sidecar.service.description,
  };

  if (sidecar.service.domain !== undefined) {
    service.domain = sidecar.service.domain;
  }

  if (sidecar.service.metadata) {
    service.metadata = sidecar.service.metadata;
  }

  return service;
}

export function parseUseCaseToml(content: string, filePath: string): UseCaseSidecar {
  let parsed: unknown;

  try {
    parsed = parse(content);
  } catch (error) {
    if (error instanceof TomlError) {
      throw new TomlParseError(error.message, filePath, error.line, error.column);
    }
    throw new TomlParseError(
      error instanceof Error ? error.message : 'Unknown parse error',
      filePath
    );
  }

  if (!compiledUseCaseSchema.Check(parsed)) {
    const errors = [...compiledUseCaseSchema.Errors(parsed)].map(
      (e) => `${e.path}: ${e.message} (got ${JSON.stringify(e.value)})`
    );
    throw new ValidationError('Invalid use case sidecar', filePath, errors);
  }

  return parsed;
}

export function sidecarToUseCase(sidecar: UseCaseSidecar): UseCase {
  const uc = sidecar.use_case;

  const useCase: UseCase = {
    id: uc.id,
    name: uc.name,
    description: uc.description,
    participants: uc.participants.map((p) => ({
      service: p.service,
      role: p.role,
    })),
    steps: uc.steps.map((s) => ({
      sequence: s.sequence,
      action: s.action,
      ...(s.actor !== undefined && { actor: s.actor }),
      ...(s.service !== undefined && { service: s.service }),
      ...(s.endpoint !== undefined && { endpoint: s.endpoint }),
    })),
  };

  if (uc.domain !== undefined) {
    useCase.domain = uc.domain;
  }

  if (uc.bpmn !== undefined) {
    useCase.bpmn = uc.bpmn;
  }

  return useCase;
}

export function parseDomainToml(content: string, filePath: string): DomainSidecar {
  let parsed: unknown;

  try {
    parsed = parse(content);
  } catch (error) {
    if (error instanceof TomlError) {
      throw new TomlParseError(error.message, filePath, error.line, error.column);
    }
    throw new TomlParseError(
      error instanceof Error ? error.message : 'Unknown parse error',
      filePath
    );
  }

  if (!compiledDomainSchema.Check(parsed)) {
    const errors = [...compiledDomainSchema.Errors(parsed)].map(
      (e) => `${e.path}: ${e.message} (got ${JSON.stringify(e.value)})`
    );
    throw new ValidationError('Invalid domain sidecar', filePath, errors);
  }

  return parsed;
}

export function sidecarToDomain(sidecar: DomainSidecar): Domain {
  const d = sidecar.domain;

  const domain: Domain = {
    id: d.id,
    name: d.name,
    description: d.description,
  };

  if (d.parent !== undefined) {
    domain.parent = d.parent;
  }

  return domain;
}
