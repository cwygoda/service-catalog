import { parse, YAMLParseError } from 'yaml';
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

// Re-export shared transforms for convenience
export {
  ValidationError,
  sidecarToService,
  sidecarToUseCase,
  sidecarToDomain,
  sidecarToDataStore,
} from './sidecar.transforms.js';

export class YamlParseError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly line?: number,
    public readonly column?: number
  ) {
    super(message);
    this.name = 'YamlParseError';
  }

  override toString(): string {
    const location = this.line
      ? `:${String(this.line)}${this.column ? `:${String(this.column)}` : ''}`
      : '';
    return `${this.name}: ${this.message} at ${this.filePath}${location}`;
  }
}

function parseYamlContent(content: string, filePath: string): unknown {
  try {
    return parse(content);
  } catch (error) {
    if (error instanceof YAMLParseError) {
      const pos = error.linePos?.[0];
      throw new YamlParseError(error.message, filePath, pos?.line, pos?.col);
    }
    throw new YamlParseError(
      error instanceof Error ? error.message : 'Unknown parse error',
      filePath
    );
  }
}

export function parseYaml(content: string, filePath: string): ServiceSidecar {
  const parsed = parseYamlContent(content, filePath);

  if (!compiledServiceSchema.Check(parsed)) {
    const errors = [...compiledServiceSchema.Errors(parsed)].map(
      (e) => `${e.path}: ${e.message} (got ${JSON.stringify(e.value)})`
    );
    throw new ValidationError('Invalid service sidecar', filePath, errors);
  }

  return parsed;
}

export function parseUseCaseYaml(content: string, filePath: string): UseCaseSidecar {
  const parsed = parseYamlContent(content, filePath);

  if (!compiledUseCaseSchema.Check(parsed)) {
    const errors = [...compiledUseCaseSchema.Errors(parsed)].map(
      (e) => `${e.path}: ${e.message} (got ${JSON.stringify(e.value)})`
    );
    throw new ValidationError('Invalid use case sidecar', filePath, errors);
  }

  return parsed;
}

export function parseDomainYaml(content: string, filePath: string): DomainSidecar {
  const parsed = parseYamlContent(content, filePath);

  if (!compiledDomainSchema.Check(parsed)) {
    const errors = [...compiledDomainSchema.Errors(parsed)].map(
      (e) => `${e.path}: ${e.message} (got ${JSON.stringify(e.value)})`
    );
    throw new ValidationError('Invalid domain sidecar', filePath, errors);
  }

  return parsed;
}

export function parseDataStoreYaml(content: string, filePath: string): DataStoreSidecar {
  const parsed = parseYamlContent(content, filePath);

  if (!compiledDataStoreSchema.Check(parsed)) {
    const errors = [...compiledDataStoreSchema.Errors(parsed)].map(
      (e) => `${e.path}: ${e.message} (got ${JSON.stringify(e.value)})`
    );
    throw new ValidationError('Invalid data store sidecar', filePath, errors);
  }

  return parsed;
}
