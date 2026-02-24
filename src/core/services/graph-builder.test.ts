import { describe, it, expect } from 'vitest';
import { buildServiceGraph, deriveConnectionsFromUseCases } from './graph-builder.js';
import type { Catalog } from '../domain/catalog.js';

describe('graph-builder', () => {
  describe('deriveConnectionsFromUseCases', () => {
    it('derives connections from sequential steps', () => {
      const catalog: Catalog = {
        services: [],
        useCases: [
          {
            id: 'checkout',
            name: 'Checkout',
            description: 'Checkout flow',
            participants: [],
            steps: [
              { sequence: 1, service: 'orders', action: 'Create order' },
              { sequence: 2, service: 'billing', action: 'Charge', endpoint: 'POST /charge' },
              { sequence: 3, service: 'inventory', action: 'Reserve' },
            ],
          },
        ],
        domains: [],
      };

      const connections = deriveConnectionsFromUseCases(catalog);

      expect(connections.get('orders')).toEqual([
        { target: 'billing', type: 'http', endpoints: ['POST /charge'] },
      ]);
      expect(connections.get('billing')).toEqual([{ target: 'inventory', type: 'event' }]);
    });

    it('skips steps without service', () => {
      const catalog: Catalog = {
        services: [],
        useCases: [
          {
            id: 'uc1',
            name: 'UC1',
            description: 'desc',
            participants: [],
            steps: [
              { sequence: 1, actor: 'User', action: 'Click button' },
              { sequence: 2, service: 'api', action: 'Process' },
            ],
          },
        ],
        domains: [],
      };

      const connections = deriveConnectionsFromUseCases(catalog);

      expect(connections.size).toBe(0);
    });

    it('skips same-service transitions', () => {
      const catalog: Catalog = {
        services: [],
        useCases: [
          {
            id: 'uc1',
            name: 'UC1',
            description: 'desc',
            participants: [],
            steps: [
              { sequence: 1, service: 'api', action: 'Step 1' },
              { sequence: 2, service: 'api', action: 'Step 2' },
            ],
          },
        ],
        domains: [],
      };

      const connections = deriveConnectionsFromUseCases(catalog);

      expect(connections.size).toBe(0);
    });

    it('merges endpoints for same connection', () => {
      const catalog: Catalog = {
        services: [],
        useCases: [
          {
            id: 'uc1',
            name: 'UC1',
            description: 'desc',
            participants: [],
            steps: [
              { sequence: 1, service: 'a', action: 'Step 1' },
              { sequence: 2, service: 'b', action: 'Step 2', endpoint: '/foo' },
            ],
          },
          {
            id: 'uc2',
            name: 'UC2',
            description: 'desc',
            participants: [],
            steps: [
              { sequence: 1, service: 'a', action: 'Step 1' },
              { sequence: 2, service: 'b', action: 'Step 2', endpoint: '/bar' },
            ],
          },
        ],
        domains: [],
      };

      const connections = deriveConnectionsFromUseCases(catalog);

      expect(connections.get('a')).toEqual([
        { target: 'b', type: 'http', endpoints: ['/foo', '/bar'] },
      ]);
    });
  });

  describe('buildServiceGraph', () => {
    it('builds nodes from services', () => {
      const catalog: Catalog = {
        services: [
          { id: 'svc1', name: 'Service 1', description: 'desc', domain: 'domain1' },
          { id: 'svc2', name: 'Service 2', description: 'desc' },
        ],
        useCases: [],
        domains: [],
      };

      const graph = buildServiceGraph(catalog);

      expect(graph.nodes).toEqual([
        { id: 'svc1', name: 'Service 1', domain: 'domain1' },
        { id: 'svc2', name: 'Service 2' },
      ]);
    });

    it('builds edges from explicit connections', () => {
      const catalog: Catalog = {
        services: [
          {
            id: 'svc1',
            name: 'Service 1',
            description: 'desc',
            connections: [{ target: 'svc2', type: 'http', endpoints: ['/api'] }],
          },
          { id: 'svc2', name: 'Service 2', description: 'desc' },
        ],
        useCases: [],
        domains: [],
      };

      const graph = buildServiceGraph(catalog);

      expect(graph.edges).toEqual([
        { source: 'svc1', target: 'svc2', type: 'http', endpoints: ['/api'] },
      ]);
    });

    it('builds edges from derived connections', () => {
      const catalog: Catalog = {
        services: [
          { id: 'orders', name: 'Orders', description: 'desc' },
          { id: 'billing', name: 'Billing', description: 'desc' },
        ],
        useCases: [
          {
            id: 'checkout',
            name: 'Checkout',
            description: 'desc',
            participants: [],
            steps: [
              { sequence: 1, service: 'orders', action: 'Create' },
              { sequence: 2, service: 'billing', action: 'Charge', endpoint: 'POST /charge' },
            ],
          },
        ],
        domains: [],
      };

      const graph = buildServiceGraph(catalog);

      expect(graph.edges).toEqual([
        { source: 'orders', target: 'billing', type: 'http', endpoints: ['POST /charge'] },
      ]);
    });

    it('merges explicit and derived connections', () => {
      const catalog: Catalog = {
        services: [
          {
            id: 'orders',
            name: 'Orders',
            description: 'desc',
            connections: [{ target: 'billing', type: 'http', endpoints: ['/refund'] }],
          },
          { id: 'billing', name: 'Billing', description: 'desc' },
        ],
        useCases: [
          {
            id: 'checkout',
            name: 'Checkout',
            description: 'desc',
            participants: [],
            steps: [
              { sequence: 1, service: 'orders', action: 'Create' },
              { sequence: 2, service: 'billing', action: 'Charge', endpoint: 'POST /charge' },
            ],
          },
        ],
        domains: [],
      };

      const graph = buildServiceGraph(catalog);

      // Explicit takes precedence, derived endpoints merged in
      expect(graph.edges).toEqual([
        {
          source: 'orders',
          target: 'billing',
          type: 'http',
          endpoints: ['/refund', 'POST /charge'],
        },
      ]);
    });

    it('excludes edges to non-existent services', () => {
      const catalog: Catalog = {
        services: [
          {
            id: 'svc1',
            name: 'Service 1',
            description: 'desc',
            connections: [{ target: 'nonexistent', type: 'http' }],
          },
        ],
        useCases: [],
        domains: [],
      };

      const graph = buildServiceGraph(catalog);

      expect(graph.edges).toEqual([]);
    });
  });
});
