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
        dataStores: [],
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
        dataStores: [],
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
        dataStores: [],
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
        dataStores: [],
      };

      const connections = deriveConnectionsFromUseCases(catalog);

      expect(connections.get('a')).toEqual([
        { target: 'b', type: 'http', endpoints: ['/foo', '/bar'] },
      ]);
    });
  });

  describe('buildServiceGraph', () => {
    it('builds nodes from services with type and lifecycle', () => {
      const catalog: Catalog = {
        services: [
          {
            id: 'svc1',
            name: 'Service 1',
            description: 'desc',
            type: 'web-service',
            lifecycle: 'active',
            domain: 'domain1',
          },
          {
            id: 'svc2',
            name: 'Service 2',
            description: 'desc',
            type: 'event-producer',
            lifecycle: 'deprecated',
          },
        ],
        useCases: [],
        domains: [],
        dataStores: [],
      };

      const graph = buildServiceGraph(catalog);

      expect(graph.nodes).toEqual([
        {
          id: 'svc1',
          name: 'Service 1',
          domain: 'domain1',
          type: 'web-service',
          lifecycle: 'active',
          partition: 1,
        },
        {
          id: 'svc2',
          name: 'Service 2',
          type: 'event-producer',
          lifecycle: 'deprecated',
          partition: 2,
        },
      ]);
    });

    it('builds edges from explicit connections', () => {
      const catalog: Catalog = {
        services: [
          {
            id: 'svc1',
            name: 'Service 1',
            description: 'desc',
            type: 'web-service',
            lifecycle: 'active',
            connections: [{ target: 'svc2', type: 'http', endpoints: ['/api'] }],
          },
          {
            id: 'svc2',
            name: 'Service 2',
            description: 'desc',
            type: 'web-service',
            lifecycle: 'active',
          },
        ],
        useCases: [],
        domains: [],
        dataStores: [],
      };

      const graph = buildServiceGraph(catalog);

      expect(graph.edges).toEqual([
        { source: 'svc1', target: 'svc2', type: 'http', endpoints: ['/api'] },
      ]);
    });

    it('builds edges from derived connections', () => {
      const catalog: Catalog = {
        services: [
          {
            id: 'orders',
            name: 'Orders',
            description: 'desc',
            type: 'web-service',
            lifecycle: 'active',
          },
          {
            id: 'billing',
            name: 'Billing',
            description: 'desc',
            type: 'web-service',
            lifecycle: 'active',
          },
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
        dataStores: [],
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
            type: 'web-service',
            lifecycle: 'active',
            connections: [{ target: 'billing', type: 'http', endpoints: ['/refund'] }],
          },
          {
            id: 'billing',
            name: 'Billing',
            description: 'desc',
            type: 'web-service',
            lifecycle: 'active',
          },
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
        dataStores: [],
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
            type: 'web-service',
            lifecycle: 'active',
            connections: [{ target: 'nonexistent', type: 'http' }],
          },
        ],
        useCases: [],
        domains: [],
        dataStores: [],
      };

      const graph = buildServiceGraph(catalog);

      expect(graph.edges).toEqual([]);
    });

    it('builds edges for event connections with events field', () => {
      const catalog: Catalog = {
        services: [
          {
            id: 'svc1',
            name: 'Service 1',
            description: 'desc',
            type: 'web-service',
            lifecycle: 'active',
            connections: [
              { target: 'svc2', type: 'event', events: ['order.created', 'order.updated'] },
            ],
          },
          {
            id: 'svc2',
            name: 'Service 2',
            description: 'desc',
            type: 'event-consumer',
            lifecycle: 'active',
          },
        ],
        useCases: [],
        domains: [],
        dataStores: [],
      };

      const graph = buildServiceGraph(catalog);

      expect(graph.edges).toEqual([
        {
          source: 'svc1',
          target: 'svc2',
          type: 'event',
          events: ['order.created', 'order.updated'],
        },
      ]);
    });

    it('passes role and description through to edges', () => {
      const catalog: Catalog = {
        services: [
          {
            id: 'otm',
            name: 'OTM',
            description: 'desc',
            type: 'web-service',
            lifecycle: 'active',
            connections: [
              {
                target: 'notifications',
                type: 'event',
                role: 'producer',
                events: ['order.expired'],
                description: 'Sends expiration notifications via SQS',
              },
            ],
          },
          {
            id: 'notifications',
            name: 'Notifications',
            description: 'desc',
            type: 'event-consumer',
            lifecycle: 'active',
            connections: [
              {
                target: 'otm',
                type: 'event',
                role: 'consumer',
              },
            ],
          },
        ],
        useCases: [],
        domains: [],
        dataStores: [],
      };

      const graph = buildServiceGraph(catalog);

      expect(graph.edges).toEqual([
        {
          source: 'otm',
          target: 'notifications',
          type: 'event',
          role: 'producer',
          events: ['order.expired'],
          description: 'Sends expiration notifications via SQS',
        },
        {
          source: 'notifications',
          target: 'otm',
          type: 'event',
          role: 'consumer',
        },
      ]);
    });

    it('builds edges for grpc connections', () => {
      const catalog: Catalog = {
        services: [
          {
            id: 'svc1',
            name: 'Service 1',
            description: 'desc',
            type: 'web-service',
            lifecycle: 'active',
            connections: [{ target: 'svc2', type: 'grpc', endpoints: ['Billing/Charge'] }],
          },
          {
            id: 'svc2',
            name: 'Service 2',
            description: 'desc',
            type: 'web-service',
            lifecycle: 'active',
          },
        ],
        useCases: [],
        domains: [],
        dataStores: [],
      };

      const graph = buildServiceGraph(catalog);

      expect(graph.edges).toEqual([
        { source: 'svc1', target: 'svc2', type: 'grpc', endpoints: ['Billing/Charge'] },
      ]);
    });

    it('sets partitions on service nodes by type', () => {
      const catalog: Catalog = {
        services: [
          { id: 'ui', name: 'UI', description: 'desc', type: 'web-app', lifecycle: 'active' },
          { id: 'api', name: 'API', description: 'desc', type: 'web-service', lifecycle: 'active' },
          {
            id: 'worker',
            name: 'Worker',
            description: 'desc',
            type: 'event-consumer',
            lifecycle: 'active',
          },
          { id: 'lib', name: 'Lib', description: 'desc', type: 'library', lifecycle: 'active' },
        ],
        useCases: [],
        domains: [],
        dataStores: [],
      };

      const graph = buildServiceGraph(catalog);

      expect(graph.nodes.map((n) => ({ id: n.id, partition: n.partition }))).toEqual([
        { id: 'ui', partition: 0 },
        { id: 'api', partition: 1 },
        { id: 'worker', partition: 2 },
        { id: 'lib', partition: 3 },
      ]);
    });

    it('includes shared data-store nodes and edges', () => {
      const catalog: Catalog = {
        services: [
          {
            id: 'svc1',
            name: 'Service 1',
            description: 'desc',
            type: 'web-service',
            lifecycle: 'active',
            dataStores: [{ target: 'shared-db', access: 'rw' }],
          },
          {
            id: 'svc2',
            name: 'Service 2',
            description: 'desc',
            type: 'event-consumer',
            lifecycle: 'active',
            dataStores: [{ target: 'shared-db', access: 'r' }],
          },
        ],
        useCases: [],
        domains: [],
        dataStores: [
          { id: 'shared-db', name: 'Shared DB', description: 'Main database', type: 'database' },
        ],
      };

      const graph = buildServiceGraph(catalog);

      // Data-store node present
      const dsNode = graph.nodes.find((n) => n.id === 'shared-db');
      expect(dsNode).toEqual({
        id: 'shared-db',
        name: 'Shared DB',
        type: 'data-store',
        partition: 2, // max of web-service(1) and event-consumer(2)
      });

      // Data-store edges present
      const dsEdges = graph.edges.filter((e) => e.type === 'data-store');
      expect(dsEdges).toEqual([
        {
          source: 'svc1',
          target: 'shared-db',
          type: 'data-store',
          access: 'rw',
          description: 'Main database',
        },
        {
          source: 'svc2',
          target: 'shared-db',
          type: 'data-store',
          access: 'r',
          description: 'Main database',
        },
      ]);
    });

    it('excludes data stores connected to only one service', () => {
      const catalog: Catalog = {
        services: [
          {
            id: 'svc1',
            name: 'Service 1',
            description: 'desc',
            type: 'web-service',
            lifecycle: 'active',
            dataStores: [{ target: 'private-db', access: 'rw' }],
          },
        ],
        useCases: [],
        domains: [],
        dataStores: [
          { id: 'private-db', name: 'Private DB', description: 'Private', type: 'database' },
        ],
      };

      const graph = buildServiceGraph(catalog);

      expect(graph.nodes.find((n) => n.id === 'private-db')).toBeUndefined();
      expect(graph.edges.filter((e) => e.type === 'data-store')).toEqual([]);
    });
  });
});
