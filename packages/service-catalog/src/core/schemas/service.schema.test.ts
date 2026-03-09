import { describe, it, expect } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import {
  ServiceSidecarSchema,
  ServiceTypeSchema,
  LifecycleSchema,
  TierSchema,
  LinkSchema,
  ContactSchema,
  SpecRefsSchema,
} from './service.schema.js';

describe('ServiceTypeSchema', () => {
  it.each([
    'web-service',
    'event-consumer',
    'event-producer',
    'event-transformer',
    'web-app',
    'library',
  ])('validates %s', (type) => {
    expect(Value.Check(ServiceTypeSchema, type)).toBe(true);
  });

  it('rejects invalid type', () => {
    expect(Value.Check(ServiceTypeSchema, 'microservice')).toBe(false);
  });
});

describe('LifecycleSchema', () => {
  it.each(['experimental', 'active', 'deprecated', 'sunset'])('validates %s', (lc) => {
    expect(Value.Check(LifecycleSchema, lc)).toBe(true);
  });

  it('rejects invalid lifecycle', () => {
    expect(Value.Check(LifecycleSchema, 'retired')).toBe(false);
  });
});

describe('TierSchema', () => {
  it.each(['critical', 'standard', 'internal'])('validates %s', (tier) => {
    expect(Value.Check(TierSchema, tier)).toBe(true);
  });

  it('rejects invalid tier', () => {
    expect(Value.Check(TierSchema, 'premium')).toBe(false);
  });
});

describe('LinkSchema', () => {
  it('validates complete link', () => {
    expect(
      Value.Check(LinkSchema, { url: 'https://dash.io', title: 'Dashboard', type: 'dashboard' })
    ).toBe(true);
  });

  it('validates link without type', () => {
    expect(Value.Check(LinkSchema, { url: 'https://dash.io', title: 'Dashboard' })).toBe(true);
  });

  it('rejects empty url', () => {
    expect(Value.Check(LinkSchema, { url: '', title: 'Dashboard' })).toBe(false);
  });

  it('rejects empty title', () => {
    expect(Value.Check(LinkSchema, { url: 'https://dash.io', title: '' })).toBe(false);
  });
});

describe('ContactSchema', () => {
  it('validates contact', () => {
    expect(Value.Check(ContactSchema, { type: 'slack', value: '#eng' })).toBe(true);
  });

  it('rejects empty type', () => {
    expect(Value.Check(ContactSchema, { type: '', value: '#eng' })).toBe(false);
  });

  it('rejects empty value', () => {
    expect(Value.Check(ContactSchema, { type: 'slack', value: '' })).toBe(false);
  });
});

describe('SpecRefsSchema', () => {
  it('validates with both specs', () => {
    expect(
      Value.Check(SpecRefsSchema, {
        openapi: './openapi.yaml',
        asyncapi: 'github://acme/svc/main/asyncapi.yaml',
      })
    ).toBe(true);
  });

  it('validates with only openapi', () => {
    expect(Value.Check(SpecRefsSchema, { openapi: './openapi.yaml' })).toBe(true);
  });

  it('validates empty object', () => {
    expect(Value.Check(SpecRefsSchema, {})).toBe(true);
  });

  it('rejects empty string spec ref', () => {
    expect(Value.Check(SpecRefsSchema, { openapi: '' })).toBe(false);
  });
});

describe('ServiceSidecarSchema', () => {
  const minimalSidecar = {
    service: {
      id: 'orders-service',
      name: 'Orders Service',
    },
  };

  it('validates minimal sidecar (id + name only)', () => {
    expect(Value.Check(ServiceSidecarSchema, minimalSidecar)).toBe(true);
  });

  it('validates full sidecar', () => {
    const full = {
      service: {
        id: 'orders-service',
        name: 'Orders Service',
        description: 'Handles orders',
        domain: 'commerce',
        type: 'web-service',
        lifecycle: 'active',
        owner: 'commerce-team',
        tags: ['commerce', 'core'],
        links: [
          { url: 'https://grafana.internal/d/orders', title: 'Dashboard', type: 'dashboard' },
        ],
        repository: 'https://github.com/acme/orders-service',
        tier: 'critical',
        contacts: [{ type: 'slack', value: '#commerce-eng' }],
        language: ['typescript'],
        frameworks: ['nestjs'],
        dataStores: [{ target: 'orders-db', access: 'rw' }],
        specs: { openapi: './openapi.yaml' },
        connections: [{ target: 'billing-service', type: 'http', endpoints: ['/authorizations'] }],
      },
    };
    expect(Value.Check(ServiceSidecarSchema, full)).toBe(true);
  });

  it('rejects empty id', () => {
    const invalid = { service: { ...minimalSidecar.service, id: '' } };
    expect(Value.Check(ServiceSidecarSchema, invalid)).toBe(false);
  });

  it('rejects empty name', () => {
    const invalid = { service: { ...minimalSidecar.service, name: '' } };
    expect(Value.Check(ServiceSidecarSchema, invalid)).toBe(false);
  });

  it('rejects invalid type', () => {
    const invalid = { service: { ...minimalSidecar.service, type: 'microservice' } };
    expect(Value.Check(ServiceSidecarSchema, invalid)).toBe(false);
  });

  it('rejects invalid lifecycle', () => {
    const invalid = { service: { ...minimalSidecar.service, lifecycle: 'retired' } };
    expect(Value.Check(ServiceSidecarSchema, invalid)).toBe(false);
  });

  it('rejects invalid tier', () => {
    const invalid = { service: { ...minimalSidecar.service, tier: 'premium' } };
    expect(Value.Check(ServiceSidecarSchema, invalid)).toBe(false);
  });

  it('rejects missing service wrapper', () => {
    expect(Value.Check(ServiceSidecarSchema, minimalSidecar.service)).toBe(false);
  });
});
