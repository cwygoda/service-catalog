# Getting Started

Create a use-case-driven service catalog in minutes.

## Prerequisites

- Node.js 20+
- pnpm (recommended) or npm

## Installation

```bash
pnpm add @service-catalog/core @service-catalog/cli
```

For the web UI:

```bash
pnpm add @service-catalog/ui
```

## Create Your Catalog

### 1. Directory Structure

```
my-catalog/
├── domains/
│   └── commerce/
│       └── domain.toml
├── services/
│   ├── orders-service/
│   │   └── service.toml
│   └── billing-service/
│       └── service.toml
└── use-cases/
    └── checkout/
        └── use-case.toml
```

### 2. Define a Domain

`domains/commerce/domain.toml`:

```toml
[domain]
id = "commerce"
name = "Commerce"
description = "E-commerce capabilities"
```

### 3. Define Services

`services/orders-service/service.toml`:

```toml
[service]
id = "orders-service"
name = "Orders Service"
description = "Order lifecycle management"
domain = "commerce"

[service.metadata]
version = "1.0.0"
```

### 4. Define Use Cases

`use-cases/checkout/use-case.toml`:

```toml
[use_case]
id = "checkout"
name = "Customer Checkout"
description = "Complete purchase flow"
domain = "commerce"

[[use_case.participants]]
service = "orders-service"
role = "Creates and manages orders"

[[use_case.participants]]
service = "billing-service"
role = "Processes payment"

[[use_case.steps]]
sequence = 1
actor = "Customer"
action = "Initiates checkout"

[[use_case.steps]]
sequence = 2
service = "orders-service"
action = "Creates pending order"
endpoint = "POST /orders"

[[use_case.steps]]
sequence = 3
service = "billing-service"
action = "Processes payment"
endpoint = "POST /payments"
```

### 5. Build the Catalog

```bash
npx service-catalog build -i my-catalog -o static
```

Output: `static/catalog.json`

## Integrate with SvelteKit

See [UI Integration](./ui-integration.md) for setting up the web interface.

## Next Steps

- [Catalog Format](./catalog-format.md) - Full TOML schema reference
- [CLI Reference](./cli.md) - Build command options
- [UI Integration](./ui-integration.md) - SvelteKit components
