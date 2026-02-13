import { parse, TomlError } from 'smol-toml';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { ServiceSidecarSchema, type ServiceSidecar } from '../../shared/schemas/service.schema.js';
import type { Service } from '../../core/domain/service.js';

const compiledSchema = TypeCompiler.Compile(ServiceSidecarSchema);

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

  if (!compiledSchema.Check(parsed)) {
    const errors = [...compiledSchema.Errors(parsed)].map(
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

  if (sidecar.service.metadata) {
    service.metadata = sidecar.service.metadata;
  }

  return service;
}
