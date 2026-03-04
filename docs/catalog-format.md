# Catalog Format

Service catalogs are defined using YAML (or TOML) sidecar files. When both formats exist in a directory, YAML takes precedence.

For a practical walkthrough with examples, see the [Authoring Guide](./authoring-guide.md).

## Directory Structure

```
my-catalog/
├── domains/
│   └── {domain-id}/
│       ├── domain.yaml       # or domain.toml
│       └── domain.md         # optional rich description
├── services/
│   └── {service-id}/
│       ├── service.yaml      # or service.toml
│       └── service.md        # optional rich description
└── use-cases/
    └── {use-case-id}/
        ├── use-case.md       # markdown-first (preferred)
        ├── use-case.yaml     # or use-case.toml
        └── flow.bpmn.txt     # optional BPMN diagram
```

File priority per directory:

- `service.yaml` > `service.toml`
- `domain.yaml` > `domain.toml`
- `use-case.md` > `use-case.yaml` > `use-case.toml`
- `catalog.yaml` > `catalog.toml`

## Domain

Domains group related services and use cases by business capability.

**File:** `domains/{id}/domain.yaml`

```yaml
domain:
  id: commerce
  name: Commerce
  description: 'Order management, payments, and fulfillment'
  parent: platform # optional — for nested domains
```

| Field         | Type   | Required | Description                         |
| ------------- | ------ | -------- | ----------------------------------- |
| `id`          | string | Yes      | Unique identifier, kebab-case       |
| `name`        | string | Yes      | Human-readable name                 |
| `description` | string | Yes      | Brief description                   |
| `parent`      | string | No       | Parent domain ID for nested domains |

Optional `domain.md` companion: first paragraph becomes `description` (if not set in YAML), full body becomes `content`.

## Service

Services are technical components that implement use cases.

**File:** `services/{id}/service.yaml`

```yaml
service:
  id: orders-service
  name: Orders Service
  type: web-service
  lifecycle: active
  domain: commerce
  owner: checkout-squad
  tier: critical
  tags: [commerce, core]
  repository: https://github.com/acme/orders-service
  language: [typescript]
  framework: nestjs

  links:
    - url: https://grafana.internal/d/orders
      title: Dashboard
      type: dashboard

  contacts:
    - type: slack
      value: '#commerce-eng'

  specs:
    openapi: ./openapi.yaml
    asyncapi: github://acme/orders-service/main/asyncapi.yaml

  connections:
    - target: billing-service
      type: http
      endpoints: ['/authorizations']
    - target: crm-service
      type: event
      events: ['order.created']
```

### Service Fields

| Field         | Type      | Required | Default  | Description                                                                     |
| ------------- | --------- | -------- | -------- | ------------------------------------------------------------------------------- |
| `id`          | string    | Yes      | —        | Unique identifier                                                               |
| `name`        | string    | Yes      | —        | Human-readable name                                                             |
| `type`        | enum      | Yes      | —        | `web-service` \| `event-consumer` \| `event-producer` \| `web-app` \| `library` |
| `lifecycle`   | enum      | No       | `active` | `experimental` \| `active` \| `deprecated` \| `sunset`                          |
| `domain`      | string    | No       | —        | Domain ID                                                                       |
| `owner`       | string    | No       | —        | Owning team or person                                                           |
| `tier`        | enum      | No       | —        | `critical` \| `standard` \| `internal`                                          |
| `tags`        | string[]  | No       | —        | Freeform labels                                                                 |
| `repository`  | string    | No       | —        | Source code URL                                                                 |
| `language`    | string[]  | No       | —        | Programming languages                                                           |
| `framework`   | string    | No       | —        | Primary framework                                                               |
| `links`       | Link[]    | No       | —        | Related URLs (dashboards, runbooks, docs)                                       |
| `contacts`    | Contact[] | No       | —        | Team contacts (Slack, email, PagerDuty)                                         |
| `specs`       | object    | No       | —        | API spec references (`openapi`, `asyncapi`)                                     |
| `connections` | Conn[]    | No       | —        | Dependencies on other services                                                  |

### Connection Fields

| Field       | Type     | Required | Description                           |
| ----------- | -------- | -------- | ------------------------------------- |
| `target`    | string   | Yes      | Target service ID                     |
| `type`      | enum     | Yes      | `http` \| `event` \| `grpc`           |
| `endpoints` | string[] | No       | API endpoints (for `http` and `grpc`) |
| `events`    | string[] | No       | Event topics (for `event` type)       |

### Link Fields

| Field   | Type   | Required | Description                              |
| ------- | ------ | -------- | ---------------------------------------- |
| `url`   | string | Yes      | URL                                      |
| `title` | string | Yes      | Display title                            |
| `type`  | string | No       | Classifier (e.g. `dashboard`, `runbook`) |

### Contact Fields

| Field   | Type   | Required | Description                 |
| ------- | ------ | -------- | --------------------------- |
| `type`  | string | Yes      | Channel type (e.g. `slack`) |
| `value` | string | Yes      | Channel value (e.g. `#eng`) |

Optional `service.md` companion: first paragraph becomes `description` (if not set in YAML), full body becomes `content`.

## Use Case

Use cases define business flows implemented by services.

**File:** `use-cases/{id}/use-case.md` (preferred) or `use-case.yaml`

### Markdown Format (Preferred)

````markdown
---
id: checkout
name: Customer Checkout
domain: commerce
---

Customer completes a purchase through the checkout flow.

\```bpmn
process: checkout
start: begin
-> create_order
task: create_order
name: "Create Order"
service: orders-service
-> process_payment
task: process_payment
name: "Process Payment"
service: billing-service
-> finish
end: finish
\```

## Details

Additional documentation rendered in the UI.
````

### YAML Format

```yaml
use_case:
  id: checkout
  name: Customer Checkout
  description: 'Complete purchase flow'
  domain: commerce
  bpmn: ./checkout.bpmn.txt

  participants:
    - service: orders-service
      role: Creates and manages orders
    - service: billing-service
      role: Processes payment

  steps:
    - sequence: 1
      actor: Customer
      action: Initiates checkout
    - sequence: 2
      service: orders-service
      action: Creates pending order
      endpoint: POST /orders
    - sequence: 3
      service: billing-service
      action: Processes payment
      endpoint: POST /payments
```

### Use Case Fields

| Field          | Type          | Required | Description                 |
| -------------- | ------------- | -------- | --------------------------- |
| `id`           | string        | Yes      | Unique identifier           |
| `name`         | string        | Yes      | Human-readable name         |
| `description`  | string        | Yes      | Brief description           |
| `domain`       | string        | No       | Domain ID                   |
| `bpmn`         | string        | No       | Path to BPMN diagram file   |
| `participants` | Participant[] | Yes      | Services involved           |
| `steps`        | Step[]        | Yes      | Ordered sequence of actions |

### Step Fields

| Field      | Type   | Required | Description                         |
| ---------- | ------ | -------- | ----------------------------------- |
| `sequence` | number | Yes      | Order in the flow (1-based)         |
| `action`   | string | Yes      | Description of the action           |
| `service`  | string | No\*     | Service performing the action       |
| `actor`    | string | No\*     | External actor (e.g., "Customer")   |
| `endpoint` | string | No       | API endpoint (e.g., "POST /orders") |

\*Either `service` or `actor` should be specified.

## Catalog Config

Optional root configuration file.

**File:** `catalog.yaml`

```yaml
catalog:
  name: 'Acme Service Catalog'
  description: 'Production service inventory'
  bpmn_lint: warn # error | warn | off
  resolvers:
    github:
      token_env: GITHUB_TOKEN
```

## Output: catalog.json

The CLI builds all sidecar files into a single `catalog.json`:

```json
{
  "services": [...],
  "useCases": [...],
  "domains": [...],
  "graph": {
    "nodes": [...],
    "edges": [...]
  }
}
```

The `graph` is auto-generated from explicit connections and derived from use case steps. Each graph node includes the service's `type` and `lifecycle` for visual styling.
