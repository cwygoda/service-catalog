# Getting Started

Create a use-case-driven service catalog in minutes.

## Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

## Installation

```bash
pnpm add @cwygoda/service-catalog-core @cwygoda/service-catalog-cli
```

For the web UI:

```bash
pnpm add @cwygoda/service-catalog-ui
```

## Create Your Catalog

### 1. Directory Structure

```
my-catalog/
├── domains/
│   └── commerce/
│       └── domain.yaml
├── services/
│   ├── orders-service/
│   │   └── service.yaml
│   └── billing-service/
│       └── service.yaml
└── use-cases/
    └── checkout/
        └── use-case.md
```

### 2. Define a Domain

`domains/commerce/domain.yaml`:

```yaml
domain:
  id: commerce
  name: Commerce
  description: 'E-commerce capabilities'
```

### 3. Define Services

`services/orders-service/service.yaml`:

```yaml
service:
  id: orders-service
  name: Orders Service
  type: web-service
  domain: commerce
  owner: checkout-squad

  connections:
    - target: billing-service
      type: http
      endpoints: ['POST /payments']
```

### 4. Define Use Cases

`use-cases/checkout/use-case.md`:

````markdown
---
id: checkout
name: Customer Checkout
domain: commerce
---

Customer completes a purchase through the storefront.

\```bpmn
process: checkout
start: begin
-> create_order
task: create_order
name: "Create Order"
service: orders-service
-> pay
task: pay
name: "Process Payment"
service: billing-service
-> finish
end: finish
\```
````

### 5. Build the Catalog

```bash
npx service-catalog build -i my-catalog -o static
```

Output: `static/catalog.json`

## Integrate with SvelteKit

See [UI Integration](./ui-integration.md) for setting up the web interface.

## Next Steps

- [Authoring Guide](./authoring-guide.md) - Complete walkthrough with examples per service type
- [Catalog Format](./catalog-format.md) - Full schema reference
- [CLI Reference](./cli.md) - Build command options
- [UI Integration](./ui-integration.md) - SvelteKit components
