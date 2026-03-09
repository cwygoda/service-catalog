import { TypeCompiler } from '@sinclair/typebox/compiler';
import { ServiceSidecarSchema, type ServiceSidecar } from '../../schemas/service.schema.js';
import { UseCaseSidecarSchema, type UseCaseSidecar } from '../../schemas/use-case.schema.js';
import { DomainSidecarSchema, type DomainSidecar } from '../../schemas/domain.schema.js';
import { DataStoreSidecarSchema, type DataStoreSidecar } from '../../schemas/data-store.schema.js';
import type { Service } from '../../domain/service.js';
import type { UseCase, BpmnSource } from '../../domain/use-case.js';
import type { Domain } from '../../domain/domain.js';
import type { DataStore } from '../../domain/data-store.js';
import { detectBpmnTxtContent } from './bpmn-txt.parser.js';

export const compiledServiceSchema = TypeCompiler.Compile(ServiceSidecarSchema);
export const compiledUseCaseSchema = TypeCompiler.Compile(UseCaseSidecarSchema);
export const compiledDomainSchema = TypeCompiler.Compile(DomainSidecarSchema);
export const compiledDataStoreSchema = TypeCompiler.Compile(DataStoreSidecarSchema);

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

export function sidecarToService(sidecar: ServiceSidecar): Service {
  const s = sidecar.service;

  const service: Service = {
    id: s.id,
    name: s.name,
    description: s.description ?? '',
    type: s.type ?? 'web-service',
    lifecycle: s.lifecycle ?? 'active',
  };

  if (s.domain !== undefined) service.domain = s.domain;
  if (s.owner !== undefined) service.owner = s.owner;
  if (s.tags !== undefined) service.tags = s.tags;
  if (s.links !== undefined) service.links = s.links;
  if (s.repository !== undefined) service.repository = s.repository;
  if (s.tier !== undefined) service.tier = s.tier;
  if (s.contacts !== undefined) service.contacts = s.contacts;
  if (s.language !== undefined) service.language = s.language;
  if (s.frameworks !== undefined) service.frameworks = s.frameworks;
  if (s.dataStores !== undefined) service.dataStores = s.dataStores;
  // specs: Spec resolution happens in loader, not parser

  if (s.connections && s.connections.length > 0) {
    service.connections = s.connections.map((c) => ({
      target: c.target,
      type: c.type,
      ...(c.role && { role: c.role }),
      ...(c.endpoints && { endpoints: c.endpoints }),
      ...(c.events && { events: c.events }),
      ...(c.description && { description: c.description }),
    }));
  }

  return service;
}

function detectBpmnSource(bpmnValue: string): BpmnSource {
  if (bpmnValue.endsWith('.bpmn.txt')) {
    return { type: 'bpmn-txt', path: bpmnValue };
  }
  if (bpmnValue.endsWith('.bpmn')) {
    return { type: 'xml', path: bpmnValue };
  }
  if (detectBpmnTxtContent(bpmnValue)) {
    return { type: 'bpmn-txt', content: bpmnValue };
  }
  return { type: 'xml', path: bpmnValue };
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
    useCase.bpmnSource = detectBpmnSource(uc.bpmn);
  }

  return useCase;
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

export function sidecarToDataStore(sidecar: DataStoreSidecar): DataStore {
  const ds = sidecar.data_store;

  const dataStore: DataStore = {
    id: ds.id,
    name: ds.name,
    description: ds.description ?? '',
    type: ds.type,
  };

  if (ds.domain !== undefined) dataStore.domain = ds.domain;
  if (ds.owner !== undefined) dataStore.owner = ds.owner;
  if (ds.technology !== undefined) dataStore.technology = ds.technology;
  if (ds.links !== undefined) dataStore.links = ds.links;

  return dataStore;
}
