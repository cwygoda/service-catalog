import { describe, expect, it } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { DomainSidecarSchema, type DomainSidecar } from './domain.schema.js';

describe('DomainSidecarSchema', () => {
  const validSidecar: DomainSidecar = {
    domain: {
      id: 'commerce',
      name: 'Commerce',
      description: 'E-commerce domain',
    },
  };

  it('validates complete domain sidecar', () => {
    expect(Value.Check(DomainSidecarSchema, validSidecar)).toBe(true);
  });

  it('validates domain with parent', () => {
    const withParent: DomainSidecar = {
      domain: {
        ...validSidecar.domain,
        parent: 'platform',
      },
    };
    expect(Value.Check(DomainSidecarSchema, withParent)).toBe(true);
  });

  it('validates domain with empty description', () => {
    const emptyDesc = {
      domain: {
        id: 'commerce',
        name: 'Commerce',
        description: '',
      },
    };
    expect(Value.Check(DomainSidecarSchema, emptyDesc)).toBe(true);
  });

  it('rejects empty id', () => {
    const invalid = {
      domain: { ...validSidecar.domain, id: '' },
    };
    expect(Value.Check(DomainSidecarSchema, invalid)).toBe(false);
  });

  it('rejects empty name', () => {
    const invalid = {
      domain: { ...validSidecar.domain, name: '' },
    };
    expect(Value.Check(DomainSidecarSchema, invalid)).toBe(false);
  });

  it('rejects empty parent when provided', () => {
    const invalid = {
      domain: { ...validSidecar.domain, parent: '' },
    };
    expect(Value.Check(DomainSidecarSchema, invalid)).toBe(false);
  });

  it('rejects missing id', () => {
    const { id: _, ...rest } = validSidecar.domain;
    const invalid = { domain: rest };
    expect(Value.Check(DomainSidecarSchema, invalid)).toBe(false);
  });

  it('rejects missing name', () => {
    const { name: _, ...rest } = validSidecar.domain;
    const invalid = { domain: rest };
    expect(Value.Check(DomainSidecarSchema, invalid)).toBe(false);
  });

  it('rejects missing description', () => {
    const { description: _, ...rest } = validSidecar.domain;
    const invalid = { domain: rest };
    expect(Value.Check(DomainSidecarSchema, invalid)).toBe(false);
  });

  it('rejects missing domain wrapper', () => {
    expect(Value.Check(DomainSidecarSchema, validSidecar.domain)).toBe(false);
  });

  it('rejects non-string id', () => {
    const invalid = {
      domain: { ...validSidecar.domain, id: 123 },
    };
    expect(Value.Check(DomainSidecarSchema, invalid)).toBe(false);
  });

  it('rejects non-string name', () => {
    const invalid = {
      domain: { ...validSidecar.domain, name: 123 },
    };
    expect(Value.Check(DomainSidecarSchema, invalid)).toBe(false);
  });

  it('rejects non-string parent', () => {
    const invalid = {
      domain: { ...validSidecar.domain, parent: 123 },
    };
    expect(Value.Check(DomainSidecarSchema, invalid)).toBe(false);
  });

  it('rejects null', () => {
    expect(Value.Check(DomainSidecarSchema, null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(Value.Check(DomainSidecarSchema, undefined)).toBe(false);
  });
});
