# Catalog Format

Service catalogs are defined using TOML sidecar files.

## Directory Structure

```
my-catalog/
├── domains/
│   └── {domain-id}/
│       └── domain.toml
├── services/
│   └── {service-id}/
│       └── service.toml
└── use-cases/
    └── {use-case-id}/
        ├── use-case.toml
        └── flow.bpmn          # Optional BPMN diagram
```

## Domain

Domains group related services and use cases.

**File:** `domains/{id}/domain.toml`

```toml
[domain]
id = "commerce"           # Required. Unique identifier (kebab-case)
name = "Commerce"         # Required. Display name
description = "..."       # Required. Brief description
parent = "platform"       # Optional. Parent domain ID for hierarchy
```

### Fields

| Field         | Type   | Required | Description                         |
| ------------- | ------ | -------- | ----------------------------------- |
| `id`          | string | Yes      | Unique identifier, kebab-case       |
| `name`        | string | Yes      | Human-readable name                 |
| `description` | string | Yes      | Brief description                   |
| `parent`      | string | No       | Parent domain ID for nested domains |

## Service

Services are technical components that implement use cases.

**File:** `services/{id}/service.toml`

```toml
[service]
id = "orders-service"     # Required. Unique identifier
name = "Orders Service"   # Required. Display name
description = "..."       # Required. Brief description
domain = "commerce"       # Optional. Domain ID

[service.metadata]        # Optional. Arbitrary key-value pairs
version = "2.1.0"
team = "checkout-squad"
repo = "https://github.com/org/orders-service"

[[service.connections]]   # Optional. Service dependencies
target = "billing-service"
type = "http"             # http, grpc, event, database
description = "Payment processing"
```

### Fields

| Field         | Type   | Required | Description                    |
| ------------- | ------ | -------- | ------------------------------ |
| `id`          | string | Yes      | Unique identifier              |
| `name`        | string | Yes      | Human-readable name            |
| `description` | string | Yes      | Brief description              |
| `domain`      | string | No       | Domain this service belongs to |
| `metadata`    | object | No       | Arbitrary key-value metadata   |
| `connections` | array  | No       | Dependencies on other services |

### Connection Fields

| Field         | Type   | Required | Description                            |
| ------------- | ------ | -------- | -------------------------------------- |
| `target`      | string | Yes      | Target service ID                      |
| `type`        | string | Yes      | `http`, `grpc`, `event`, or `database` |
| `description` | string | No       | Description of the connection          |

## Use Case

Use cases define business flows implemented by services.

**File:** `use-cases/{id}/use-case.toml`

```toml
[use_case]
id = "checkout"              # Required. Unique identifier
name = "Customer Checkout"   # Required. Display name
description = "..."          # Required. Brief description
domain = "commerce"          # Optional. Domain ID
bpmn = "/bpmn/checkout.bpmn" # Optional. Path to BPMN diagram

[[use_case.participants]]    # Required. At least one participant
service = "orders-service"   # Service ID
role = "Creates orders"      # Role in this use case

[[use_case.steps]]           # Optional. Ordered flow steps
sequence = 1
actor = "Customer"           # External actor (no service)
action = "Initiates checkout"

[[use_case.steps]]
sequence = 2
service = "orders-service"   # Service performing the action
action = "Creates pending order"
endpoint = "POST /orders"    # Optional. API endpoint
```

### Fields

| Field          | Type   | Required | Description                     |
| -------------- | ------ | -------- | ------------------------------- |
| `id`           | string | Yes      | Unique identifier               |
| `name`         | string | Yes      | Human-readable name             |
| `description`  | string | Yes      | Brief description               |
| `domain`       | string | No       | Domain this use case belongs to |
| `bpmn`         | string | No       | Path to BPMN diagram file       |
| `participants` | array  | Yes      | Services involved               |
| `steps`        | array  | No       | Ordered sequence of actions     |

### Participant Fields

| Field     | Type   | Required | Description           |
| --------- | ------ | -------- | --------------------- |
| `service` | string | Yes      | Service ID            |
| `role`    | string | Yes      | Role in this use case |

### Step Fields

| Field      | Type   | Required | Description                         |
| ---------- | ------ | -------- | ----------------------------------- |
| `sequence` | number | Yes      | Order in the flow (1-based)         |
| `action`   | string | Yes      | Description of the action           |
| `service`  | string | No\*     | Service performing the action       |
| `actor`    | string | No\*     | External actor (e.g., "Customer")   |
| `endpoint` | string | No       | API endpoint (e.g., "POST /orders") |

\*Either `service` or `actor` must be specified.

## BPMN Diagrams

Use cases can include BPMN diagrams for visual process flows.

### Standard BPMN

Reference a `.bpmn` XML file:

```toml
[use_case]
bpmn = "/bpmn/checkout.bpmn"
```

Place the file in your static directory (e.g., `static/bpmn/checkout.bpmn`).

### BPMN-txt DSL

For simpler diagrams, use the text-based DSL:

**File:** `use-cases/checkout/checkout.bpmn.txt`

```
pool Customer
  lane User
    start -> browse: Start
    browse -> cart: Browse Products
    cart -> checkout: Add to Cart
    checkout -> end: Complete Purchase

pool Backend
  lane Orders
    receive_order -> process: Receive Order
    process -> ship: Process
    ship -> end: Ship
```

Reference in TOML:

```toml
[use_case]
bpmn = "./checkout.bpmn.txt"
```

The CLI compiles `.bpmn.txt` files to standard BPMN XML.

## Output: catalog.json

The CLI builds all TOML files into a single `catalog.json`:

```json
{
  "domains": [...],
  "services": [...],
  "useCases": [...],
  "graph": {
    "nodes": [...],
    "edges": [...]
  }
}
```

The `graph` is auto-generated from service connections for visualization.
