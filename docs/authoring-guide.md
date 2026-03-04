# Service Authoring Guide

How to document services so your team can actually find, understand, and depend on them.

## Quick Start

Every service needs a `service.yaml` (or `service.toml`) in its own directory:

```
my-catalog/
└── services/
    └── orders-service/
        ├── service.yaml      # metadata + connections
        └── service.md        # optional rich description
```

Minimal `service.yaml`:

```yaml
service:
  id: orders-service
  name: Orders Service
  type: web-service
```

Build with:

```bash
service-catalog build -i my-catalog -o dist
```

That's it. Everything else is optional but useful.

## Service Types

Every service must declare a `type`. Pick the one that best describes what it does:

### web-service

REST/GraphQL API that other services call synchronously.

```yaml
service:
  id: orders-service
  name: Orders Service
  type: web-service
  domain: commerce
  owner: checkout-squad
  tier: critical

  specs:
    openapi: ./openapi.yaml

  connections:
    - target: billing-service
      type: http
      endpoints: ['/authorizations', '/captures']
    - target: inventory-service
      type: grpc
      endpoints: ['inventory.v1.InventoryService/Reserve']
```

### event-producer

Publishes events to a broker (Kafka, RabbitMQ, SNS, etc). Downstream consumers subscribe independently.

```yaml
service:
  id: order-events
  name: Order Events
  type: event-producer
  domain: commerce
  owner: checkout-squad

  specs:
    asyncapi: ./asyncapi.yaml

  connections:
    - target: crm-service
      type: event
      events: ['order.created', 'order.completed', 'order.cancelled']
    - target: analytics-pipeline
      type: event
      events: ['order.created']
```

### event-consumer

Subscribes to events and reacts. Often a worker or queue processor.

```yaml
service:
  id: shipment-processor
  name: Shipment Processor
  type: event-consumer
  domain: logistics
  owner: logistics-team

  specs:
    asyncapi: ./asyncapi.yaml

  connections:
    - target: shipping-api
      type: http
      endpoints: ['POST /shipments']
```

### web-app

Frontend application. No API spec of its own — it calls web-services.

```yaml
service:
  id: storefront
  name: Storefront
  type: web-app
  domain: commerce
  owner: frontend-team
  tier: critical

  links:
    - url: https://store.acme.com
      title: Production
      type: url
    - url: https://grafana.internal/d/storefront
      title: Dashboard
      type: dashboard

  connections:
    - target: orders-service
      type: http
    - target: catalog-service
      type: http
    - target: auth-service
      type: http
```

### library

Shared package consumed as a dependency. No runtime connections.

```yaml
service:
  id: shared-auth
  name: Shared Auth Library
  type: library
  domain: platform
  owner: platform-team
  tier: standard

  repository: https://github.com/acme/shared-auth
  language: [typescript]
  framework: express
```

## Field Reference

### Required Fields

| Field  | Description                                                                     |
| ------ | ------------------------------------------------------------------------------- |
| `id`   | Unique kebab-case identifier. Must match across the catalog.                    |
| `name` | Human-readable display name.                                                    |
| `type` | `web-service` \| `event-consumer` \| `event-producer` \| `web-app` \| `library` |

### Organizational

| Field       | Default  | Description                                                             |
| ----------- | -------- | ----------------------------------------------------------------------- |
| `domain`    | —        | Domain ID this service belongs to. Links to `domain.yaml`.              |
| `owner`     | —        | Team or person responsible. Free-form string.                           |
| `lifecycle` | `active` | `experimental` \| `active` \| `deprecated` \| `sunset`                  |
| `tier`      | —        | `critical` (pages on-call) \| `standard` (business hours) \| `internal` |
| `tags`      | —        | Freeform labels for filtering. `["commerce", "core", "pci"]`            |

### Technical

| Field        | Description                                                  |
| ------------ | ------------------------------------------------------------ |
| `repository` | Source code URL.                                             |
| `language`   | Array of languages. `["typescript", "go"]`                   |
| `framework`  | Primary framework. `"nestjs"`, `"spring-boot"`, `"fastapi"`. |

### Links and Contacts

```yaml
service:
  links:
    - url: https://grafana.internal/d/orders
      title: Grafana Dashboard
      type: dashboard # optional classifier
    - url: https://wiki.internal/orders-runbook
      title: Runbook
      type: runbook
    - url: https://pagerduty.com/services/P123
      title: PagerDuty
      type: pagerduty

  contacts:
    - type: slack
      value: '#commerce-eng'
    - type: email
      value: commerce-team@acme.com
    - type: pagerduty
      value: commerce-oncall
```

Well-known link types: `dashboard`, `runbook`, `documentation`, `repository`, `pagerduty`, `logs`.
Well-known contact types: `slack`, `email`, `pagerduty`, `teams`, `opsgenie`.

You can use any string — these are conventions, not enforced.

### Spec References

Point to API specifications for automatic endpoint extraction:

```yaml
service:
  specs:
    openapi: ./openapi.yaml # local file
    asyncapi: github://acme/orders-service/main/async.yaml # remote
```

Supported URL schemes:

| Scheme      | Example                                      | Notes                        |
| ----------- | -------------------------------------------- | ---------------------------- |
| relative    | `./openapi.yaml`                             | Relative to service dir      |
| `https://`  | `https://raw.githubusercontent.com/.../spec` | Fetched at build time        |
| `github://` | `github://owner/repo/ref/path`               | Uses GitHub API, needs token |

## Connections

Connections declare runtime dependencies between services. They're the edges in the service graph.

```yaml
service:
  connections:
    - target: billing-service # required: target service ID
      type: http # required: http | event | grpc
      endpoints: ['/payments'] # optional: for http/grpc
    - target: notification-service
      type: event
      events: ['order.created'] # optional: for event type
```

### When to Declare Connections

**Do declare:**

- Synchronous calls (HTTP, gRPC) your service makes
- Events your service publishes that others consume
- Hard dependencies that would break your service if unavailable

**Don't declare:**

- Connections already captured in use case steps (they're derived automatically)
- Transient dependencies (logging, metrics infrastructure)
- Database connections (not service-to-service)

### Derived vs Explicit

The catalog automatically derives connections from use case steps. If step 1 calls `orders-service` and step 2 calls `billing-service`, an edge is created.

Explicit connections in `service.yaml` take precedence. Endpoints are merged from both sources.

## Markdown Companion (`service.md`)

For richer descriptions, add a `service.md` alongside `service.yaml`:

```
services/orders-service/
├── service.yaml
└── service.md
```

`service.md`:

```markdown
The Orders Service manages the full order lifecycle from cart submission
through fulfillment. It's the central orchestrator for the checkout flow.

## Architecture

Orders are stored in PostgreSQL with an event-sourced audit trail.
State transitions publish domain events via Kafka.

## Key Decisions

- **Idempotency**: All write endpoints accept an idempotency key
- **Soft deletes**: Orders are never hard-deleted for audit compliance
- **Two-phase payment**: Authorization on submit, capture on fulfillment
```

Rules:

- No frontmatter needed — metadata lives in `service.yaml`
- First paragraph becomes `description` (if not set in YAML)
- Full body becomes `content` for rendering in the UI

## Lifecycle Values

| Value          | Meaning                                              | Graph Styling |
| -------------- | ---------------------------------------------------- | ------------- |
| `experimental` | Under development. APIs may change without notice.   | Dashed border |
| `active`       | Production. Stable APIs. Default if omitted.         | Normal        |
| `deprecated`   | Avoid new dependencies. Migration path should exist. | Amber/warning |
| `sunset`       | Being decommissioned. Active migration in progress.  | Red/faded     |

## Domains

Group services by business capability, not infrastructure:

```yaml
# domains/commerce/domain.yaml
domain:
  id: commerce
  name: Commerce
  description: 'Order management, payments, and fulfillment'
```

```yaml
# domains/commerce/payments/domain.yaml
domain:
  id: payments
  name: Payments
  description: 'Payment processing and reconciliation'
  parent: commerce
```

Domains can nest via `parent`. The UI renders them as a tree.

## Common Patterns

### Microservice with API + Events

```yaml
service:
  id: orders-service
  name: Orders Service
  type: web-service
  domain: commerce
  owner: checkout-squad
  lifecycle: active
  tier: critical
  language: [typescript]
  framework: nestjs
  repository: https://github.com/acme/orders-service
  tags: [commerce, core, pci]

  specs:
    openapi: ./openapi.yaml
    asyncapi: ./asyncapi.yaml

  links:
    - url: https://grafana.internal/d/orders
      title: Dashboard
      type: dashboard
    - url: https://wiki.internal/orders-runbook
      title: Runbook
      type: runbook

  contacts:
    - type: slack
      value: '#checkout-eng'
    - type: pagerduty
      value: checkout-oncall

  connections:
    - target: billing-service
      type: http
      endpoints: ['/authorizations', '/captures']
    - target: inventory-service
      type: grpc
      endpoints: ['inventory.v1.InventoryService/Reserve']
    - target: crm-service
      type: event
      events: ['order.created', 'order.completed']
```

### BFF (Backend for Frontend)

```yaml
service:
  id: mobile-bff
  name: Mobile BFF
  type: web-service
  domain: commerce
  owner: mobile-team
  tier: critical
  language: [typescript]
  framework: express

  connections:
    - target: orders-service
      type: http
    - target: catalog-service
      type: http
    - target: auth-service
      type: http
```

### Internal Tool

```yaml
service:
  id: admin-panel
  name: Admin Panel
  type: web-app
  domain: platform
  owner: internal-tools
  lifecycle: active
  tier: internal

  links:
    - url: https://admin.internal.acme.com
      title: Production
      type: url

  connections:
    - target: orders-service
      type: http
    - target: crm-service
      type: http
```

## Tips

1. **Start with `type`** — it determines what other fields matter. A library doesn't need connections. A web-app doesn't need specs.

2. **`owner` is the most useful optional field.** When something breaks at 3am, this is what people search for.

3. **Use `tier` to set expectations.** `critical` = paging, SLA commitments. `internal` = best-effort. This drives on-call routing and incident priority.

4. **`lifecycle: deprecated` without a migration path is useless.** Add a link to the migration guide or mention the replacement in `service.md`.

5. **Keep connection lists honest.** If your service calls 15 others, list them. A sparse graph is worse than a busy one — it hides real coupling.

6. **Tags are for cross-cutting concerns.** Domain handles business grouping. Tags handle things like `pci`, `gdpr`, `public-api`, `batch`.

## TOML Format

YAML is preferred, but TOML is fully supported. When both exist, YAML takes precedence.

TOML equivalent of the quick start:

```toml
[service]
id = "orders-service"
name = "Orders Service"
type = "web-service"
```

Connections in TOML:

```toml
[[service.connections]]
target = "billing-service"
type = "http"
endpoints = ["/authorizations"]
```
