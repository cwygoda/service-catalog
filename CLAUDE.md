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
