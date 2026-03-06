# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Vision

**Use-case-driven service catalog.** Product-down, not infrastructure-up. Use cases are primary; services implement them.

## Commands

```bash
# Full verification (run before commit)
pnpm verify          # typecheck → lint → format:check → test:unit → build → test:e2e

# Individual checks
pnpm typecheck       # tsc + svelte-check
pnpm lint            # eslint
pnpm format:check    # prettier --check
pnpm test:unit       # vitest run
pnpm test:e2e        # playwright (requires build)

# Single test file
pnpm test:unit src/core/domain/service.test.ts
pnpm test:e2e -g "service detail"

# Development
pnpm dev             # builds CLI + catalog, then Vite dev server
pnpm build           # full production build
pnpm preview         # preview built site at localhost:4173
```

## Build Pipeline

Two-step build (order matters):

1. `pnpm build:cli` — TypeScript → `dist/cli/`
2. `pnpm build:catalog` — CLI parses `demo-catalog/` → `static/catalog.json`
3. SvelteKit reads `static/catalog.json` at build time

## Architecture

### Hexagonal (Ports & Adapters)

```text
src/
├── core/           # Pure domain logic, ZERO I/O
│   ├── domain/     # Entities: Service, UseCase, Domain, Catalog, Connection
│   ├── ports/      # Interfaces for external deps
│   └── services/   # Domain services (graph-builder)
├── adapters/       # Implement ports (parsers, loaders, renderers)
├── cli/            # CLI adapter (commander)
├── lib/            # SvelteKit frontend
│   ├── adapters/   # Static JSON adapter
│   ├── components/ # Svelte components
│   └── stores/     # State (theme)
├── routes/         # SvelteKit pages
└── shared/         # TypeBox schemas
```

**Rules:**

- `core/` imports NOTHING from `adapters/`, `cli/`, `lib/`, `routes/`
- `core/` has no `fs`, `fetch`, `process`, framework imports
- Dependency injection via factory functions

### Data Flow

```text
TOML sidecars → CLI parse → catalog.json → SvelteKit static build
```

### Domain Entities

- **Catalog** — root container with domains, services, use cases, graph
- **Domain** — business domain grouping (commerce, platform)
- **Service** — technical component with metadata, connections
- **UseCase** — business flow with BPMN diagram, steps, participants
- **Connection** — service-to-service link (http/event types)

### Result Pattern

Recoverable errors use `Result<T, E>` from `src/core/domain/result.ts`. Throw only for programming errors.

## Key Files

| File            | Purpose                                    |
| --------------- | ------------------------------------------ |
| `SPEC.md`       | Full specification, all phases             |
| `TASKS.md`      | Current phase tasks (update before commit) |
| `demo-catalog/` | Example catalog (6 services, 3 use cases)  |

### TOML Sidecars

- `catalog.toml` — root config
- `*/service.toml` — service definition
- `*/use-case.toml` — use case with BPMN

## Conventions

### Files

- Lowercase kebab-case: `catalog-loader.port.ts`
- Suffix by type: `.port.ts`, `.adapter.ts`, `.schema.ts`, `.test.ts`
- Co-locate tests: `foo.ts` → `foo.test.ts`
- Keep files < 500 LOC

### Code

- Explicit types, no `any`
- Prefer `interface` over `type` for objects
- Use `Result<T, E>` for recoverable errors
- Throw only for programming errors

### Commits

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- **ALWAYS update TASKS.md** — mark completed items with `[x]`

## Testing

- **Unit tests** for `core/` — pure functions, >80% coverage
- **Integration tests** for adapters — real files, temp dirs
- **E2E tests** for web — Playwright against built site

## Error Messages

Include file path, line number, field path, expected vs actual:

```text
Error: Invalid service.toml at demo-catalog/orders-service/service.toml:12
  Missing required field: service.id
```

## Don't

- Add deps without checking health
- Put I/O in `core/`
- Skip tests for "simple" changes
- Use `any` or `@ts-ignore`
- Commit with failing `pnpm verify`

## Design Context

### Users

Product managers and engineers, working together. PMs explore business flows and use cases to understand system behavior. Engineers look up service dependencies, APIs, connections, and trace paths during development and debugging. Both need to quickly find information and understand relationships.

### Brand Personality

**Warm, Approachable, Polished.** The catalog should feel welcoming to non-technical users while earning trust from engineers through precision. Not a cold developer tool — a shared artifact that brings product and engineering closer.

### Aesthetic Direction

- **Visual tone:** Clean, generous whitespace, excellent typography. Professional but not sterile.
- **References:** Stripe Docs, Notion — approachable polish, clear hierarchy, content-first.
- **Anti-references:** Cluttered enterprise dashboards, raw Bootstrap/Material defaults, overly playful SaaS marketing.
- **Theme:** Light + dark mode (class-based `.dark` toggle, system preference detection).
- **Color:** Custom primary palette at oklch hue 250 (blue). Semantic amber for warnings/deprecated states. Gray scale for structure.

### Design System

- **Framework:** Tailwind CSS 4 with `@theme` tokens in `apps/demo/src/app.css`
- **Components:** `packages/ui/` — Svelte 5 component library (Header, cards, search modal, nav tree, BPMN viewer, service graph)
- **Layout:** max-w-7xl container, responsive grid (sm/md/lg breakpoints), sidebar nav tree (optional)
- **Cards:** Bordered, subtle shadow, hover elevation. Rounded-lg corners.
- **Typography:** System font stack (Tailwind defaults). Bold headings, text-sm for metadata.
- **Icons:** Inline SVG, stroke-based, 24x24 viewBox.

### Accessibility

- **Target:** WCAG AA compliance
- **Contrast:** 4.5:1 minimum for text, 3:1 for large text and UI components
- **Keyboard:** Full keyboard navigation, visible focus rings (`focus-visible:outline-2`)
- **Screen readers:** aria-labels on interactive elements, sr-only text for icon-only buttons, aria-live for dynamic state
- **Motion:** Respect `prefers-reduced-motion` for transitions and animations

### Design Principles

1. **Content first** — Information hierarchy drives layout. Every pixel serves comprehension.
2. **Bridge the gap** — Equally useful for product and engineering. No jargon gatekeeping, no oversimplification.
3. **Progressive disclosure** — Overview → detail. Cards summarize, detail pages go deep. Never overwhelm.
4. **Consistent vocabulary** — Visual patterns map 1:1 to domain concepts. A card always means a navigable entity. Colors always mean the same thing.
5. **Quiet confidence** — Polish through restraint. No decoration without purpose. Let the content breathe.
