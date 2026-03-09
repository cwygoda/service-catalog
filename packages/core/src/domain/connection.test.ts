import { describe, it, expect } from 'vitest';
import { createConnection, isConnection, type Connection } from './connection.js';

describe('Connection entity', () => {
  describe('createConnection', () => {
    it('creates http connection with endpoints', () => {
      const conn = createConnection({
        target: 'billing-service',
        type: 'http',
        endpoints: ['/payments', '/refunds'],
      });

      expect(conn.target).toBe('billing-service');
      expect(conn.type).toBe('http');
      expect(conn.endpoints).toEqual(['/payments', '/refunds']);
      expect(conn.events).toBeUndefined();
    });

    it('creates event connection with events', () => {
      const conn = createConnection({
        target: 'crm-service',
        type: 'event',
        events: ['order.created', 'order.shipped'],
      });

      expect(conn.target).toBe('crm-service');
      expect(conn.type).toBe('event');
      expect(conn.events).toEqual(['order.created', 'order.shipped']);
      expect(conn.endpoints).toBeUndefined();
    });

    it('creates grpc connection with endpoints', () => {
      const conn = createConnection({
        target: 'billing-service',
        type: 'grpc',
        endpoints: ['billing.v1.BillingService/Charge'],
      });

      expect(conn.target).toBe('billing-service');
      expect(conn.type).toBe('grpc');
      expect(conn.endpoints).toEqual(['billing.v1.BillingService/Charge']);
    });

    it('creates minimal connection without optional fields', () => {
      const conn = createConnection({
        target: 'auth-service',
        type: 'http',
      });

      expect(conn.target).toBe('auth-service');
      expect(conn.type).toBe('http');
      expect(conn.endpoints).toBeUndefined();
      expect(conn.events).toBeUndefined();
      expect(conn.role).toBeUndefined();
      expect(conn.description).toBeUndefined();
    });

    it('creates event connection with role and description', () => {
      const conn = createConnection({
        target: 'notifications-service',
        type: 'event',
        role: 'producer',
        events: ['order.expired'],
        description: 'Sends expiration notifications via SQS',
      });

      expect(conn.target).toBe('notifications-service');
      expect(conn.type).toBe('event');
      expect(conn.role).toBe('producer');
      expect(conn.events).toEqual(['order.expired']);
      expect(conn.description).toBe('Sends expiration notifications via SQS');
    });

    it('creates consumer event connection', () => {
      const conn = createConnection({
        target: 'otm-service',
        type: 'event',
        role: 'consumer',
      });

      expect(conn.role).toBe('consumer');
    });
  });

  describe('isConnection', () => {
    it('returns true for valid http connection', () => {
      const conn: Connection = {
        target: 'billing-service',
        type: 'http',
        endpoints: ['/payments'],
      };
      expect(isConnection(conn)).toBe(true);
    });

    it('returns true for valid event connection', () => {
      const conn: Connection = {
        target: 'crm-service',
        type: 'event',
        events: ['user.created'],
      };
      expect(isConnection(conn)).toBe(true);
    });

    it('returns true for valid grpc connection', () => {
      const conn: Connection = {
        target: 'billing-service',
        type: 'grpc',
        endpoints: ['billing.v1.BillingService/Charge'],
      };
      expect(isConnection(conn)).toBe(true);
    });

    it('returns true for minimal connection', () => {
      const conn: Connection = {
        target: 'auth-service',
        type: 'http',
      };
      expect(isConnection(conn)).toBe(true);
    });

    it('returns false for null', () => {
      expect(isConnection(null)).toBe(false);
    });

    it('returns false for non-object', () => {
      expect(isConnection('string')).toBe(false);
      expect(isConnection(123)).toBe(false);
      expect(isConnection(undefined)).toBe(false);
    });

    it('returns false for missing target', () => {
      expect(isConnection({ type: 'http' })).toBe(false);
    });

    it('returns false for empty target', () => {
      expect(isConnection({ target: '', type: 'http' })).toBe(false);
    });

    it('returns false for invalid type', () => {
      expect(isConnection({ target: 'svc', type: 'websocket' })).toBe(false);
      expect(isConnection({ target: 'svc', type: '' })).toBe(false);
    });

    it('returns false for non-array endpoints', () => {
      expect(isConnection({ target: 'svc', type: 'http', endpoints: '/path' })).toBe(false);
    });

    it('returns false for non-string endpoints', () => {
      expect(isConnection({ target: 'svc', type: 'http', endpoints: [123] })).toBe(false);
    });

    it('returns false for non-array events', () => {
      expect(isConnection({ target: 'svc', type: 'event', events: 'topic' })).toBe(false);
    });

    it('returns false for non-string events', () => {
      expect(isConnection({ target: 'svc', type: 'event', events: [{}] })).toBe(false);
    });

    it('returns true for valid role', () => {
      expect(isConnection({ target: 'svc', type: 'event', role: 'producer' })).toBe(true);
      expect(isConnection({ target: 'svc', type: 'event', role: 'consumer' })).toBe(true);
    });

    it('returns false for invalid role', () => {
      expect(isConnection({ target: 'svc', type: 'event', role: 'observer' })).toBe(false);
      expect(isConnection({ target: 'svc', type: 'event', role: 123 })).toBe(false);
    });

    it('returns true for valid description', () => {
      expect(isConnection({ target: 'svc', type: 'http', description: 'Some desc' })).toBe(true);
    });

    it('returns false for non-string description', () => {
      expect(isConnection({ target: 'svc', type: 'http', description: 123 })).toBe(false);
    });
  });
});
