# UI Integration

Integrate the service catalog UI components into your SvelteKit application.

## Prerequisites

- SvelteKit 2.x
- Svelte 5.x
- Tailwind CSS 4.x

## Installation

```bash
pnpm add @cwygoda/service-catalog-core @cwygoda/service-catalog-ui
pnpm add -D @cwygoda/service-catalog-cli
```

Peer dependencies (if not already installed):

```bash
pnpm add bpmn-js d3
```

## Setup

### 1. Configure Tailwind

The UI components use Tailwind CSS. Add a `@source` directive to scan the package:

**src/app.css:**

```css
@import 'tailwindcss';
@source "../node_modules/@cwygoda/service-catalog-ui/dist";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-primary-50: oklch(0.97 0.02 250);
  --color-primary-100: oklch(0.94 0.04 250);
  --color-primary-200: oklch(0.88 0.08 250);
  --color-primary-300: oklch(0.78 0.12 250);
  --color-primary-400: oklch(0.68 0.16 250);
  --color-primary-500: oklch(0.58 0.18 250);
  --color-primary-600: oklch(0.48 0.18 250);
  --color-primary-700: oklch(0.4 0.16 250);
  --color-primary-800: oklch(0.32 0.12 250);
  --color-primary-900: oklch(0.24 0.08 250);
}
```

### 2. Build Script

Add catalog build to your workflow:

**package.json:**

```json
{
  "scripts": {
    "build:catalog": "service-catalog build -i catalog -o static",
    "dev": "pnpm build:catalog && vite dev",
    "build": "pnpm build:catalog && vite build"
  }
}
```

### 3. Load Catalog Data

Create a layout load function to fetch the catalog:

**src/routes/+layout.ts:**

```typescript
import { fetchCatalog } from '@cwygoda/service-catalog-ui';

export const prerender = true;

export async function load({ fetch }) {
  const catalog = await fetchCatalog(fetch);
  return { catalog };
}
```

### 4. Initialize Theme

Set up the theme store in your layout:

**src/routes/+layout.svelte:**

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';
  import { Header, theme } from '@cwygoda/service-catalog-ui';
  import type { LayoutData } from './$types';
  import type { Snippet } from 'svelte';

  let { children, data }: { children: Snippet; data: LayoutData } = $props();

  onMount(() => {
    theme.init();
  });
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950">
  <Header />
  <main>
    {@render children()}
  </main>
</div>
```

## Components

### Header

Navigation header with theme toggle.

```svelte
<script>
  import { Header } from '@cwygoda/service-catalog-ui';
</script>

<Header />
```

### ServiceCard

Display a service summary.

```svelte
<script>
  import { ServiceCard } from '@cwygoda/service-catalog-ui';
  import type { Service } from '@cwygoda/service-catalog-core/domain';

  let { service }: { service: Service } = $props();
</script>

<ServiceCard {service} />
```

### UseCaseCard

Display a use case summary.

```svelte
<script>
  import { UseCaseCard } from '@cwygoda/service-catalog-ui';
  import type { UseCase } from '@cwygoda/service-catalog-core/domain';

  let { useCase }: { useCase: UseCase } = $props();
</script>

<UseCaseCard {useCase} />
```

### DomainCard

Display a domain summary with counts.

```svelte
<script>
  import { DomainCard } from '@cwygoda/service-catalog-ui';
  import type { Domain } from '@cwygoda/service-catalog-core/domain';

  let {
    domain,
    useCaseCount,
    serviceCount,
  }: {
    domain: Domain;
    useCaseCount: number;
    serviceCount: number;
  } = $props();
</script>

<DomainCard {domain} {useCaseCount} {serviceCount} />
```

### ServiceGraph

Interactive D3-based service dependency graph.

```svelte
<script>
  import { ServiceGraph } from '@cwygoda/service-catalog-ui';
  import type { ServiceGraph as GraphType } from '@cwygoda/service-catalog-core/domain';

  let { graph }: { graph: GraphType } = $props();
</script>

<div class="h-96">
  <ServiceGraph {graph} />
</div>
```

### BpmnDiagram

Render BPMN process diagrams.

```svelte
<script>
  import { BpmnDiagram } from '@cwygoda/service-catalog-ui';

  let { bpmnPath }: { bpmnPath: string } = $props();
</script>

<BpmnDiagram src={bpmnPath} />
```

### NavTree

Hierarchical navigation tree.

```svelte
<script>
  import { NavTree } from '@cwygoda/service-catalog-ui';

  let { domains, useCases, services } = $props();
</script>

<NavTree {domains} {useCases} {services} />
```

### Breadcrumbs

Navigation breadcrumbs.

```svelte
<script>
  import { Breadcrumbs } from '@cwygoda/service-catalog-ui';
</script>

<Breadcrumbs
  items={[
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Orders Service' },
  ]}
/>
```

## Stores

### theme

Manages light/dark theme with localStorage persistence.

```typescript
import { theme } from '@cwygoda/service-catalog-ui';

// Initialize (call once in layout onMount)
theme.init();

// Get current theme
console.log(theme.current); // 'light' | 'dark' | 'system'
console.log(theme.resolved); // 'light' | 'dark'

// Set theme
theme.set('dark');

// Toggle
theme.toggle();
```

### navModeStore

Toggle between flat list and tree navigation.

```typescript
import { navModeStore } from '@cwygoda/service-catalog-ui';

// Get mode
console.log(navModeStore.mode); // 'flat' | 'tree'

// Toggle
navModeStore.toggle();
```

## Types

Import domain types from `@cwygoda/service-catalog-core`:

```typescript
import type {
  Catalog,
  Domain,
  Service,
  UseCase,
  ServiceGraph,
} from '@cwygoda/service-catalog-core/domain';
```

## Example Pages

### Services List

**src/routes/services/+page.svelte:**

```svelte
<script lang="ts">
  import { ServiceCard } from '@cwygoda/service-catalog-ui';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
</script>

<h1>Services</h1>
<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {#each data.catalog.services as service (service.id)}
    <ServiceCard {service} />
  {/each}
</div>
```

### Service Detail

**src/routes/services/[id]/+page.ts:**

```typescript
import { findService } from '@cwygoda/service-catalog-core/domain';
import { error } from '@sveltejs/kit';

export async function load({ params, parent }) {
  const { catalog } = await parent();
  const service = findService(catalog, params.id);

  if (!service) {
    error(404, 'Service not found');
  }

  return { service };
}
```

## Static Site Generation

For static hosting, configure the adapter:

**svelte.config.js:**

```javascript
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      fallback: undefined,
      precompress: false,
    }),
    prerender: {
      entries: ['*'],
    },
  },
};
```
