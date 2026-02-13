# Service Catalog

**Use-case-driven service catalog.** Document business flows first, connect them to services, APIs, events, and data stores. Bridge the gap between product requirements and technical implementation.

## What Sets This Apart

Most service catalogs are **infrastructure-up**: list services, show their APIs, maybe draw some arrows. This catalog is **product-down**:

1. **Start with use cases** — What does the business need to accomplish?
2. **Map to services** — Which services participate in each flow?
3. **Drill into APIs** — What endpoints, events, and data are involved?
4. **Trace the path** — Visualize the full journey from user action to system response

This brings **product engineering perspective** to technical documentation. Engineers understand *why* services exist, not just *what* they do.

## Core Concepts

### Use Cases (Primary)

**The heart of the catalog.** Business scenarios that span multiple services.

Components:

- **Business description** (markdown) — What problem does this solve?
- **BPMN2 diagram** — Visual flow with lanes per service/actor
- **Step-by-step flow** — Sequence of service/endpoint/event invocations
- **Participants** — Services, data stores, external actors
- **Success criteria** — Expected outcomes
- **Error scenarios** — Failure modes and handling

Use cases:

- Belong to domains
- Link to services, endpoints, events, data stores
- Auto-infer service links from BPMN participants (manual override supported)
- Versioned alongside services
- Searchable, browseable, primary navigation path

**Example:** "Customer Checkout" use case shows order-service calling billing-service, emitting events to catalog-service, all in one coherent flow.

### Domains & Bounded Contexts

Business domains that group related use cases and services. Hierarchical — domains contain subdomains.

Domain metadata:

- Owner team
- Description
- Related documentation
- Use cases (primary)
- Services (supporting)

Visualization shows domain boundaries with service-level connection detail.

### Services

Technical components that implement use cases. Defined by **sidecar file** (`service.toml`):

- Metadata: version, GitHub repo, team contacts, languages, lifecycle status
- Pointers to OpenAPI/AsyncAPI specs
- Pointers to markdown description files
- Endpoint relations (if not in spec extensions)
- Data store ownership
- **Use case participation** — Which use cases involve this service?

**Lifecycle states:** active, deprecated, sunset

### Data Stores

Infrastructure components. Types: databases, caches, object stores, search indexes, queues.

**Ownership model:** Primary service owns the definition, other services reference.

Connection to use cases: which flows read/write which stores.

## OpenAPI/AsyncAPI Extensions

Standardized `x-service-catalog-*` extensions with strict schema for marking:

- Endpoint connections (this endpoint calls X, produces message Y)
- Consumer relationships
- Data store access

No arbitrary user-defined extensions - single canonical schema.

## Sidecar Format

**TOML only** (`service.toml`)

JSON Schema validation with auto-detect dialect (Draft 2020-12 or Draft-07).

Circular `$ref` in specs: **fail validation** - not supported.

## Repository Structure

Support both:

- **Monorepo:** All services in one catalog repo
- **Multi-repo:** Services in own repos, catalog pulls sidecars remotely

### Remote Sidecars

- Auth: Single global GitHub token (PAT)
- Fetch: Build-time only (manual trigger)
- Failure handling: **Hard fail** - build fails if any remote is unreachable

## Configuration

**Central config + local overrides**

Root `catalog.toml` with global defaults. Domains/services can extend/override locally.

## Build & Output

### Build Tool

Node CLI only (`npm run build`). Users wire into their own CI.

### Error Handling

Configurable: Strict by default (any validation error fails), `--lenient` flag for partial builds.

### Output

- Static HTML site (SvelteKit)
- Filesystem-based version snapshots: `/v/2024-01-15/`, `/v/latest/`

No JSON API dump or PDF export - HTML only.

## Hosting & Runtime

### Static Site

Edge-capable hosting (Cloudflare, Vercel). Supports optional edge functions for:

- Search API
- Auth (private catalogs)

### Authentication

Generic OIDC provider (works with Okta, Auth0, Azure AD, etc.)

## Architecture

### Language & Runtime

- **TypeScript** - strict mode, ESM only
- **Node.js 20+** - native fetch, modern ESM support
- **pnpm** - package manager

### Package Structure

Single package with internal modules, following **hexagonal architecture** (ports & adapters):

```text
src/
├── core/                    # Domain layer (pure, no I/O)
│   ├── domain/              # Entities: Service, Domain, DataStore, UseCase
│   ├── ports/               # Interfaces for external dependencies
│   │   ├── catalog-loader.port.ts
│   │   ├── spec-parser.port.ts
│   │   └── renderer.port.ts
│   └── services/            # Domain services, use cases
│
├── adapters/                # Infrastructure adapters (implement ports)
│   ├── parsers/             # TOML, OpenAPI, AsyncAPI, BPMN parsers
│   ├── loaders/             # Filesystem, GitHub (Octokit)
│   ├── renderers/           # Mermaid, PlantUML, bpmn-js
│   └── persistence/         # JSON intermediary output
│
├── cli/                     # CLI adapter (commander)
│   └── commands/
│
├── web/                     # SvelteKit app (UI adapter)
│   ├── lib/
│   │   ├── ports/           # Frontend ports (data access)
│   │   ├── stores/          # Svelte stores (application state)
│   │   └── components/      # UI components
│   └── routes/
│
└── shared/                  # Shared types, utilities
    ├── schemas/             # TypeBox schemas
    └── types/               # Generated types
```text

**Hexagonal principles:**

- `core/` has zero external dependencies (no I/O, no frameworks)
- `core/ports/` define interfaces; `adapters/` implement them
- Dependency injection via factory functions
- Easy to test: mock adapters for unit tests
- Web app uses its own ports for data access (static JSON, edge API)

### Data Flow

```text
catalog sources (TOML, specs, markdown)
    ↓ CLI parse + validate
JSON intermediary (typed via TypeBox schemas)
    ↓ auto-generated TS types
SvelteKit static build
    ↓
HTML + assets
```text

### Key Libraries

| Concern | Library |
|---------|---------|
| Schema validation | **TypeBox** (JSON Schema + TS types) |
| OpenAPI parsing | **@apidevtools/swagger-parser** |
| AsyncAPI parsing | **@asyncapi/parser** |
| Graph data | **graphology** (in-memory graph) |
| BPMN parsing | Adapt **bpmn-sketch-miner** |
| Diagram rendering | **mermaid**, **plantuml-encoder** (JS in-process) |
| GitHub API | **octokit** |
| CLI framework | **commander** + **chalk** |
| Frontend | **SvelteKit**, **Tailwind CSS**, **D3.js** |
| State management | **TanStack Query** (async/caching for edge search) |
| Search index | **Pagefind** (build-time static) |

### Plugin System

Plugins listed in `catalog.toml`, bundled at build time (static imports, no dynamic `import()`).

Content transform API:

```typescript
interface Plugin {
  name: string;
  transformMarkdown?(content: string, context: TransformContext): string;
  transformSchema?(schema: JSONSchema, context: TransformContext): JSONSchema;
  transformSpec?(spec: OpenAPISpec | AsyncAPISpec, context: TransformContext): typeof spec;
}
```text

### Build Pipeline

```text
1. Load catalog.toml + resolve plugins
2. Discover sources (local + remote via Octokit)
3. Parse sidecars (TOML → TypeBox validation)
4. Parse specs (OpenAPI/AsyncAPI)
5. Build graph (graphology)
6. Run plugin transforms
7. Render diagrams (Mermaid, PlantUML, BPMN → SVG)
8. Generate JSON intermediary
9. Generate TS types from JSON schemas
10. SvelteKit static build
11. Pagefind index generation
12. Output to versioned directory
```text

### File Watching

Rely on SvelteKit/Vite native file watching during development. No custom chokidar setup.

## Tech Stack

### Frontend

- **SvelteKit** - static site generation
- **Tailwind CSS** - full customization (custom config, component CSS overrides)
- **D3.js** - service connection graph visualization
- **TanStack Query** - async state management (edge search)

### Search

Build-time static index (Pagefind). No external service dependency.

### BPMN Rendering

**Hybrid approach:**

- Pre-rendered static SVG for fast load
- Optional interactive mode (bpmn-js) for zoom/pan

**Format support:**

- Primary: BPMN Sketch Miner syntax (`.bpmn.txt`)
- Fallback: BPMN 2.0 XML (`.bpmn`)

Rendering pipeline:

```text
.bpmn.txt (Sketch Miner DSL)
    ↓ parse (adapted bpmn-sketch-miner)
BPMN 2.0 XML
    ↓ bpmn-js (in-process)
SVG (embedded in catalog)
```text

### OpenAPI/AsyncAPI Rendering

**Hybrid approach:**

- Custom overview renderer (consistent styling, cross-linking to catalog entities)
- Embedded detail views (Swagger UI / Redoc / AsyncAPI React components)

## Schema Explorer

Aggregated view of all schemas across services.

Features:

- Filter by domain, service, type (request/response/event/entity)
- Search within schemas
- Version comparison: **Visual tree** (collapsible field tree with change highlights)
- Breaking change detection: **Structural + semantic** (field changes, enum values, format constraints, nullability)

## Multi-Diagram Support

Beyond auto-generated service graphs:

- Mermaid
- PlantUML
- C4
- Custom SVG/PNG

Embedded in service docs or standalone.

**Diagram linking:** Hover for service preview, click to navigate to detail page.

## Navigation & URLs

### Navigation Structure

Toggle between:

- Hierarchical tree (domain > subdomain > service)
- Flat filterable list

### URL Scheme

Hierarchical paths:

- `/domains/commerce/services/order-service`
- `/domains/commerce/data-stores/orders-db`
- `/domains/commerce/use-cases/checkout-flow`

### Responsiveness

Full responsive design - first-class mobile experience, touch-friendly.

### Dark Mode

System preference detection + manual override toggle. Persisted in localStorage.

## Search

Full-text search across:

- Services, domains, data stores
- OpenAPI/AsyncAPI specs
- Schemas
- Documentation content
- Use cases

Faceted filtering. Fuzzy matching.

## LLM Context

Generate aggregated markdown (`llms.txt` style) for AI tools.

- Configurable scope: full catalog or per-domain
- Content depth: Structural overview (field names + types + descriptions, no full JSON Schema constraints)

## Service Metadata

### Team/Owner Info

Static display with deep links:

- Name, email, Slack channel
- Links to external tools (PagerDuty, OpsGenie, etc.)

No direct integration - just URLs.

### Runbooks

Both supported:

- Inline markdown (in sidecar or adjacent `.md` files) - preferred
- External URLs (Notion, Confluence, wiki)

### Changelog

Manual `CHANGELOG.md` in service directory. No auto-generation from Git.

### Deprecation Handling

- Inline warnings when deprecated services referenced in use cases, diagrams, other services
- Visual badge on service detail page

## Extensibility

### Plugins (TypeScript modules)

Content transform capability:

- Process/enrich markdown
- Transform schemas
- Modify specs

Plugins registered in `catalog.toml`, statically imported at build time. No dynamic loading.

No custom pages or full pipeline hooks - content transformation only.

## Quality & Performance

### Accessibility

Best-effort: common patterns, keyboard navigation, screen reader support. Not strict WCAG AA compliance.

### Performance

Target Core Web Vitals green scores:

- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

### Linting & Formatting

| Tool | Purpose | Command |
|------|---------|---------|
| **ESLint** | Code quality, TS rules | `pnpm lint` |
| **Prettier** | Code formatting | `pnpm format` |
| **TypeScript** | Type checking | `pnpm typecheck` |
| **svelte-check** | Svelte type checking | `pnpm check` |

Config:

- `eslint.config.js` (flat config)
- `.prettierrc`
- `tsconfig.json` (strict: true)

Pre-commit: lint-staged + husky (optional, not required for CI).

### Testing

Full test pyramid with **Vitest** and **Playwright**:

| Layer | Tool | Location | Command |
|-------|------|----------|---------|
| Unit | Vitest | `**/*.test.ts` | `pnpm test:unit` |
| Integration | Vitest | `tests/integration/` | `pnpm test:integration` |
| E2E | Playwright | `tests/e2e/` | `pnpm test:e2e` |
| All | - | - | `pnpm test` |

**Unit tests:**

- Core domain logic (pure functions)
- Parsers with fixture files
- Schema validation
- Individual Svelte components (`@testing-library/svelte`)

**Integration tests:**

- Full build pipeline with demo catalog
- CLI command execution
- JSON output validation

**E2E tests:**

- Built static site navigation
- Search functionality
- Dark mode toggle
- Responsive layout

**Coverage:** Vitest coverage with v8 provider. Target 80%+ for core/.

**CI verification commands:**

```bash
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint
pnpm format:check     # prettier --check
pnpm test:unit        # vitest run
pnpm test:integration # vitest run tests/integration
pnpm build            # full build
pnpm test:e2e         # playwright test
```text

All commands must pass for CI green. Single `pnpm verify` runs all checks.

### i18n

English only. No internationalization infrastructure.

## Implementation Phases

Small increments (~1 week each), each producing a deployable output.

**Use cases are the core differentiator — introduced in Phase 2.**

### Phase 1: Foundation + MVP

**Goal:** Demo-able static site with basic service listing.

**Sidecar v0.1:**

```toml
[service]
id = "order-service"
name = "Order Service"
description = "Handles order lifecycle"

[service.metadata]
version = "1.0.0"
```text

**Deliverables:**

- [ ] Project setup: TypeScript, ESM, pnpm, SvelteKit, hexagonal architecture
- [ ] CLI skeleton: `service-catalog build`
- [ ] TOML parser + TypeBox schema (minimal)
- [ ] Basic SvelteKit routes: home, service list, service detail
- [ ] Tailwind setup with dark mode toggle
- [ ] Full linting + testing suite (ESLint, Vitest, Playwright)
- [ ] Static deployment (Vercel/Cloudflare)

---

### Phase 2: Use Cases + BPMN ⭐

**Goal:** Use-case-first navigation — the core differentiator.

**Sidecar v0.2:** (extends v0.1)

```toml
[use_case]
id = "checkout-flow"
name = "Customer Checkout"
description = "./use-cases/checkout.md"
bpmn = "./use-cases/checkout.bpmn.txt"

[[use_case.participants]]
service = "order-service"
role = "Creates and manages order"

[[use_case.participants]]
service = "billing-service"
role = "Processes payment"

[[use_case.steps]]
sequence = 1
actor = "Customer"
action = "Submits order"

[[use_case.steps]]
sequence = 2
service = "order-service"
action = "Validates order"
endpoint = "POST /orders"
```text

**Deliverables:**

- [ ] Use case entity + TypeBox schema
- [ ] BPMN Sketch Miner parser (adapted from existing)
- [ ] bpmn-js rendering (static SVG + interactive toggle)
- [ ] Use case list page (primary navigation!)
- [ ] Use case detail page with:
  - Business description (markdown)
  - BPMN diagram
  - Step-by-step flow
  - Participating services (linked)
- [ ] Auto-link BPMN participants to services
- [ ] Service detail shows "Participates in use cases" section
- [ ] Home page highlights use cases prominently

---

### Phase 3: Domains + Hierarchy

**Goal:** Organize use cases and services into domains.

**Sidecar v0.3:** (extends v0.2)

```toml
[domain]
id = "commerce"
name = "Commerce"
description = "E-commerce domain"
parent = "platform"  # optional subdomain

[service]
domain = "commerce"

[use_case]
domain = "commerce"
```text

**Deliverables:**

- [ ] Domain entity + schema
- [ ] Hierarchical nav tree (domains → use cases → services)
- [ ] Flat/tree view toggle
- [ ] Domain detail pages (lists use cases first, then services)
- [ ] Breadcrumb navigation
- [ ] URL structure: `/domains/{domain}/use-cases/{use-case}`

---

### Phase 4: Service Connections Graph

**Goal:** Visualize service dependencies derived from use cases.

**Sidecar v0.4:** (extends v0.3)

```toml
[[service.connections]]
target = "billing-service"
type = "http"
endpoints = ["/authorizations", "/captures"]

[[service.connections]]
target = "crm-service"
type = "event"
events = ["order.created", "order.confirmed"]
```text

**Deliverables:**

- [ ] graphology graph model
- [ ] D3.js force-directed graph component
- [ ] Domain-colored nodes
- [ ] Click → service page, hover → preview
- [ ] Connection type indicators (http/event)
- [ ] **Use case overlay** — highlight services involved in selected use case
- [ ] Derive connections from use case steps when not explicit

---

### Phase 5: Service Metadata Expansion

**Goal:** Full service metadata, team info, lifecycle.

**Sidecar v0.5:** (extends v0.4)

```toml
[service.metadata]
version = "1.2.0"
repository = "https://github.com/org/order-service"
languages = ["typescript", "go"]
lifecycle = "active"  # active | deprecated | sunset

[service.team]
name = "Commerce Team"
email = "commerce@example.com"
slack = "#commerce-eng"
pagerduty = "https://pagerduty.com/..."

[service.docs]
readme = "./README.md"
runbooks = ["./runbooks/deploy.md"]
changelog = "./CHANGELOG.md"
```text

**Deliverables:**

- [ ] Extended TypeBox schema
- [ ] Team info display component
- [ ] Lifecycle badges + deprecation warnings in use cases
- [ ] Runbook rendering
- [ ] Changelog display

---

### Phase 6: OpenAPI/AsyncAPI Integration

**Goal:** Parse and render API specs, link to use case steps.

**Sidecar v0.6:** (extends v0.5)

```toml
[service.specs]
openapi = "./openapi.yaml"
asyncapi = "./asyncapi.yaml"
```text

**Deliverables:**

- [ ] @apidevtools/swagger-parser integration
- [ ] @asyncapi/parser integration
- [ ] Custom overview renderer (endpoints list)
- [ ] Embedded Swagger UI / Redoc for detail
- [ ] **Use case step linking** — click step → jump to endpoint docs
- [ ] `x-service-catalog-*` extension parsing

---

### Phase 7: Search

**Goal:** Full-text search with use cases prominent.

**Deliverables:**

- [ ] Pagefind integration
- [ ] Build-time index generation
- [ ] Search UI component (Cmd+K)
- [ ] **Use cases as top result category**
- [ ] Faceted filters (type, domain, lifecycle)

---

### Phase 8: Data Stores

**Goal:** First-class data store entities, visible in use cases.

**Sidecar v0.7:** (extends v0.6)

```toml
[[service.data_stores]]
id = "orders-db"
name = "Orders Database"
type = "database"
access = "readwrite"

[[use_case.data_stores]]
store = "orders-db"
access = "write"
step = 3  # linked to step sequence
```text

**Deliverables:**

- [ ] Data store entity + schema
- [ ] Data store detail pages
- [ ] **Use case shows data access** — which stores touched at each step
- [ ] Service ↔ store visualization

---

### Phase 9: Multi-Diagram Support

**Goal:** Embed additional diagrams in use cases and services.

**Sidecar v0.8:** (extends v0.7)

```toml
[[use_case.diagrams]]
type = "mermaid"
source = "./docs/sequence.mmd"
caption = "Sequence diagram"

[[service.diagrams]]
type = "plantuml"
source = "./docs/architecture.puml"
```text

**Deliverables:**

- [ ] Mermaid in-process rendering
- [ ] PlantUML via Kroki
- [ ] SVG/PNG passthrough
- [ ] Diagram → entity linking

---

### Phase 10: Remote Service Fetching

**Goal:** Pull sidecars from external GitHub repos.

**Config:**

```toml
[catalog]
github_token_env = "GITHUB_TOKEN"

[[catalog.remotes]]
repo = "org/payment-service"
path = "service.toml"
ref = "main"
```text

**Deliverables:**

- [ ] Octokit integration
- [ ] Remote sidecar resolution
- [ ] Hard-fail on unreachable
- [ ] Remote use cases supported

---

### Phase 11: Schema Explorer

**Goal:** Aggregated schema view with diff.

**Deliverables:**

- [ ] Schema extraction from OpenAPI/AsyncAPI
- [ ] Schema list view with filters
- [ ] Visual tree diff component
- [ ] Breaking change detection
- [ ] Link schemas to use case steps that use them

---

### Phase 12: Auth + Private Catalogs

**Goal:** OIDC auth for private deployments.

**Deliverables:**

- [ ] Edge function setup (Cloudflare/Vercel)
- [ ] OIDC provider integration
- [ ] Protected routes
- [ ] Login/logout flow

---

### Phase 13: Plugins

**Goal:** Extensible content transforms.

**Deliverables:**

- [ ] Plugin interface definition
- [ ] Static plugin loading
- [ ] Transform hooks (markdown, schema, spec, **use case**)
- [ ] Example plugin

---

### Phase 14: LLM Context + Polish

**Goal:** llms.txt generation, versioning, final polish.

**Deliverables:**

- [ ] llms.txt generator (**use-case-centric** context)
- [ ] Filesystem version snapshots (`/v/YYYY-MM-DD/`)
- [ ] `--lenient` flag for partial builds
- [ ] Mobile responsiveness polish
- [ ] Core Web Vitals optimization

---

### Future Considerations

- Webhook-triggered rebuilds on remote repo changes
- Scheduled sync for remote services
- Additional export formats (JSON API, PDF)
- Runtime health integration
- MCP server for AI tool integration
- Use case templates / scaffolding
