import { parse, TomlError } from 'smol-toml';
import type { ServiceSidecar } from '../../schemas/service.schema.js';
import type { UseCaseSidecar } from '../../schemas/use-case.schema.js';
import type { DomainSidecar } from '../../schemas/domain.schema.js';
import type { DataStoreSidecar } from '../../schemas/data-store.schema.js';
import {
  ValidationError,
  compiledServiceSchema,
  compiledUseCaseSchema,
  compiledDomainSchema,
  compiledDataStoreSchema,
} from './sidecar.transforms.js';

// Re-export shared transforms for backward compatibility
export {
  ValidationError,
  sidecarToService,
  sidecarToUseCase,
  sidecarToDomain,
  sidecarToDataStore,
} from './sidecar.transforms.js';

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

export function parseDataStoreToml(content: string, filePath: string): DataStoreSidecar {
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

  if (!compiledDataStoreSchema.Check(parsed)) {
    const errors = [...compiledDataStoreSchema.Errors(parsed)].map(
      (e) => `${e.path}: ${e.message} (got ${JSON.stringify(e.value)})`
    );
    throw new ValidationError('Invalid data store sidecar', filePath, errors);
  }

  return parsed;
}
