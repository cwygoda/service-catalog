# Demo Service Catalog

Demo dataset for development and showcase. **Use cases first.**

## Use Cases (Primary)

The catalog is organized around business scenarios, not infrastructure.

### UC-001: Customer Checkout

**Domain:** Commerce

Customer places an order for catalog products with payment processing.

**Participants:**

| Service | Role |
|---------|------|
| catalog-service | Product lookup |
| orders-service | Order lifecycle |
| billing-service | Payment processing |
| policy-service | Authorization checks |

**Flow:**

```text
1. [Customer] Browse products
2. [catalog-service] GET /products → return product list
3. [Customer] Add to cart
4. [orders-service] POST /cart/items → add item
5. [Customer] Checkout
6. [orders-service] POST /orders → create order (pending)
7. [policy-service] POST /evaluate → check order permissions
8. [billing-service] POST /authorizations → authorize payment
9. [billing-service] EMIT payment.authorized
10. [orders-service] RECEIVE payment.authorized → update order
11. [billing-service] POST /captures → capture payment
12. [billing-service] EMIT payment.captured
13. [orders-service] RECEIVE payment.captured → confirm order
14. [orders-service] EMIT order.confirmed
15. [catalog-service] RECEIVE order.confirmed → update inventory
```

**BPMN:** `use-cases/checkout/flow.bpmn.txt`

**Data Stores Touched:**

- products-db (read) - step 2
- orders-db (write) - steps 4, 6, 10, 13
- payments-db (write) - steps 8, 11

---

### UC-002: Customer Profile Update

**Domain:** Commerce

Customer updates their profile, billing info syncs automatically.

**Participants:**

| Service | Role |
|---------|------|
| crm-service | Profile management |
| billing-service | Payment profile sync |
| orders-service | Customer cache update |

**Flow:**

```text
1. [Customer] Update profile
2. [crm-service] PUT /customers/{id} → update profile
3. [crm-service] EMIT customer.updated
4. [billing-service] RECEIVE customer.updated → sync payment profile
5. [orders-service] RECEIVE customer.updated → invalidate cache
```

**BPMN:** `use-cases/profile-update/flow.bpmn.txt`

---

### UC-003: New Customer Onboarding

**Domain:** Platform

New customer signs up and gets authenticated.

**Participants:**

| Service | Role |
|---------|------|
| auth-service | Identity provider |
| crm-service | Customer record |
| orders-service | Welcome flow |

**Flow:**

```text
1. [Customer] Sign up
2. [auth-service] POST /register → create identity
3. [auth-service] EMIT user.created
4. [crm-service] RECEIVE user.created → create customer record
5. [crm-service] EMIT customer.created
6. [orders-service] RECEIVE customer.created → trigger welcome flow
```

**BPMN:** `use-cases/onboarding/flow.bpmn.txt`

---

## Domains

```text
platform/
├── use-cases/
│   └── onboarding/
├── auth-service
└── policy-service

commerce/
├── use-cases/
│   ├── checkout/
│   └── profile-update/
├── crm-service
├── billing-service
├── catalog-service
└── orders-service
```

## Services (Supporting)

Services exist to implement use cases. Listed by domain.

### Platform Domain

| Service | Purpose | Use Cases |
|---------|---------|-----------|
| auth-service | OIDC identity provider | UC-003 |
| policy-service | AuthZ policy evaluation (OPA) | UC-001 |

### Commerce Domain

| Service | Purpose | Use Cases |
|---------|---------|-----------|
| crm-service | Customer data, change events | UC-002, UC-003 |
| billing-service | Two-stage billing (authorize → capture) | UC-001, UC-002 |
| catalog-service | Product search and browse | UC-001 |
| orders-service | Order lifecycle management | UC-001, UC-002, UC-003 |

## Event Catalog

| Event | Producer | Consumers | Use Cases |
|-------|----------|-----------|-----------|
| user.created | auth-service | crm-service | UC-003 |
| customer.created | crm-service | orders-service | UC-003 |
| customer.updated | crm-service | billing-service, orders-service | UC-002 |
| payment.authorized | billing-service | orders-service | UC-001 |
| payment.captured | billing-service | orders-service | UC-001 |
| order.confirmed | orders-service | catalog-service | UC-001 |

## Data Stores

| Store | Owner | Type | Use Cases |
|-------|-------|------|-----------|
| users-db | auth-service | PostgreSQL | UC-003 |
| sessions-cache | auth-service | Redis | UC-003 |
| policies-store | policy-service | OPA bundle (S3) | UC-001 |
| customers-db | crm-service | PostgreSQL | UC-002, UC-003 |
| payments-db | billing-service | PostgreSQL | UC-001 |
| products-db | catalog-service | PostgreSQL | UC-001 |
| products-search | catalog-service | Elasticsearch | UC-001 |
| orders-db | orders-service | PostgreSQL | UC-001, UC-002 |

---

## Directory Structure

```text
demo-catalog/
├── catalog.toml
├── domains/
│   ├── platform/
│   │   ├── domain.toml
│   │   ├── use-cases/
│   │   │   └── onboarding/
│   │   │       ├── use-case.toml
│   │   │       ├── README.md
│   │   │       └── flow.bpmn.txt
│   │   ├── auth-service/
│   │   │   ├── service.toml
│   │   │   └── README.md
│   │   └── policy-service/
│   │       ├── service.toml
│   │       └── README.md
│   └── commerce/
│       ├── domain.toml
│       ├── use-cases/
│       │   ├── checkout/
│       │   │   ├── use-case.toml
│       │   │   ├── README.md
│       │   │   └── flow.bpmn.txt
│       │   └── profile-update/
│       │       ├── use-case.toml
│       │       ├── README.md
│       │       └── flow.bpmn.txt
│       ├── crm-service/
│       │   ├── service.toml
│       │   └── README.md
│       ├── billing-service/
│       │   ├── service.toml
│       │   └── README.md
│       ├── catalog-service/
│       │   ├── service.toml
│       │   └── README.md
│       └── orders-service/
│           ├── service.toml
│           └── README.md
```

---

## Phase-by-Phase Expansion

### Phase 1: Foundation

- 6 services with minimal sidecars (id, name, description)
- Basic site structure

### Phase 2: Use Cases ⭐

- 3 use cases with BPMN diagrams
- Use case list as primary navigation
- Service → use case linking

### Phase 3: Domains

- 2 domains (platform, commerce)
- Hierarchical navigation

### Phase 4+: Progressive Enhancement

- Service connections graph
- Metadata expansion
- OpenAPI/AsyncAPI specs
- Search
- Data stores
