import { describe, it, expect } from 'vitest';
import { Value } from '@sinclair/typebox/value';
import { ConnectionSchema } from './connection.schema.js';

describe('ConnectionSchema', () => {
  describe('valid connections', () => {
    it('validates http connection with endpoints', () => {
      const conn = {
        target: 'billing-service',
        type: 'http',
        endpoints: ['/payments', '/refunds'],
      };
      expect(Value.Check(ConnectionSchema, conn)).toBe(true);
    });

    it('validates event connection with events', () => {
      const conn = {
        target: 'crm-service',
        type: 'event',
        events: ['order.created', 'order.shipped'],
      };
      expect(Value.Check(ConnectionSchema, conn)).toBe(true);
    });

    it('validates grpc connection with endpoints', () => {
      const conn = {
        target: 'billing-service',
        type: 'grpc',
        endpoints: ['billing.v1.BillingService/Charge'],
      };
      expect(Value.Check(ConnectionSchema, conn)).toBe(true);
    });

    it('validates minimal connection', () => {
      const conn = {
        target: 'auth-service',
        type: 'http',
      };
      expect(Value.Check(ConnectionSchema, conn)).toBe(true);
    });

    it('validates connection with empty arrays', () => {
      const conn = {
        target: 'service',
        type: 'http',
        endpoints: [],
      };
      expect(Value.Check(ConnectionSchema, conn)).toBe(true);
    });
  });

  describe('invalid connections', () => {
    it('rejects missing target', () => {
      const conn = { type: 'http' };
      expect(Value.Check(ConnectionSchema, conn)).toBe(false);
    });

    it('rejects empty target', () => {
      const conn = { target: '', type: 'http' };
      expect(Value.Check(ConnectionSchema, conn)).toBe(false);
    });

    it('rejects missing type', () => {
      const conn = { target: 'service' };
      expect(Value.Check(ConnectionSchema, conn)).toBe(false);
    });

    it('rejects invalid type', () => {
      const conn = { target: 'service', type: 'websocket' };
      expect(Value.Check(ConnectionSchema, conn)).toBe(false);
    });

    it('rejects non-array endpoints', () => {
      const conn = { target: 'service', type: 'http', endpoints: '/path' };
      expect(Value.Check(ConnectionSchema, conn)).toBe(false);
    });

    it('rejects non-string in endpoints array', () => {
      const conn = { target: 'service', type: 'http', endpoints: [123] };
      expect(Value.Check(ConnectionSchema, conn)).toBe(false);
    });

    it('rejects non-array events', () => {
      const conn = { target: 'service', type: 'event', events: 'topic' };
      expect(Value.Check(ConnectionSchema, conn)).toBe(false);
    });

    it('rejects non-string in events array', () => {
      const conn = { target: 'service', type: 'event', events: [null] };
      expect(Value.Check(ConnectionSchema, conn)).toBe(false);
    });
  });
});
