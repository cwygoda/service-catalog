import { describe, it, expect } from 'vitest';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { DataStoreSidecarSchema } from './data-store.schema.js';

const compiled = TypeCompiler.Compile(DataStoreSidecarSchema);

describe('DataStoreSidecarSchema', () => {
  it('validates minimal data store', () => {
    const data = {
      data_store: {
        id: 'orders-db',
        name: 'Orders Database',
        type: 'database',
      },
    };
    expect(compiled.Check(data)).toBe(true);
  });

  it('validates full data store', () => {
    const data = {
      data_store: {
        id: 'orders-db',
        name: 'Orders Database',
        description: 'Primary database for order data',
        type: 'database',
        domain: 'commerce',
        owner: 'orders-service',
        technology: 'PostgreSQL',
        links: [{ url: 'https://dash.io', title: 'Dashboard', type: 'dashboard' }],
      },
    };
    expect(compiled.Check(data)).toBe(true);
  });

  it('rejects empty id', () => {
    const data = {
      data_store: {
        id: '',
        name: 'Test',
        type: 'database',
      },
    };
    expect(compiled.Check(data)).toBe(false);
  });

  it('rejects missing type', () => {
    const data = {
      data_store: {
        id: 'test',
        name: 'Test',
      },
    };
    expect(compiled.Check(data)).toBe(false);
  });

  it('rejects invalid type', () => {
    const data = {
      data_store: {
        id: 'test',
        name: 'Test',
        type: 'nosql',
      },
    };
    expect(compiled.Check(data)).toBe(false);
  });

  it('validates all valid types', () => {
    const types = ['database', 'cache', 'queue', 'search-index', 'object-store'];
    for (const type of types) {
      const data = { data_store: { id: 'test', name: 'Test', type } };
      expect(compiled.Check(data)).toBe(true);
    }
  });
});
