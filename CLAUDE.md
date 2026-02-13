# CLAUDE.md

First principles for the Service Catalog project.

## Vision

**Use-case-driven service catalog.** Product-down, not infrastructure-up.

The catalog answers "what does the business do?" before "what services exist?" Use cases are primary; services implement them.

## Architecture

### Hexagonal (Ports & Adapters)

```text
src/
├── core/           # Pure domain logic, ZERO I/O
│   ├── domain/     # Entities (Service, UseCase, Domain, DataStore)
│   ├── ports/      # Interfaces for external deps
│   └── services/   # Domain services
├── adapters/       # Implement ports (parsers, loaders, renderers)
├── cli/            # CLI adapter
├── web/            # SvelteKit adapter
└── shared/         # Schemas, types
```

**Rules:**

- `core/` imports NOTHING from `adapters/`, `cli/`, `web/`
- `core/` has no `fs`, `fetch`, `process`, framework imports
- Dependency injection via factory functions
- Easy to test: mock adapters for unit tests

### Data Flow

```text
TOML sidecars → CLI parse → JSON intermediary → SvelteKit static build
```

## Tech Stack

- **TypeScript** strict, ESM only, Node 20+
- **pnpm** package manager
- **SvelteKit** static site generation
- **Tailwind CSS** styling
- **TypeBox** schema validation
- **Vitest** unit/integration tests
- **Playwright** E2E tests

## Code Principles

1. **Use cases first** — Every feature should enhance use case documentation
2. **No I/O in core** — Domain logic is pure, testable, portable
3. **Fail fast** — Validate early, clear error messages with file/line info
4. **Static by default** — No runtime dependencies for the built site
5. **Minimal deps** — Prefer built-in Node APIs, audit before adding packages

## Conventions

### Files

- Lowercase kebab-case: `catalog-loader.port.ts`
- Suffix by type: `.port.ts`, `.adapter.ts`, `.schema.ts`, `.test.ts`
- Co-locate tests: `foo.ts` → `foo.test.ts`
- Keep files < 500 LOC

### Code

- Explicit types, no `any`
- Prefer `interface` over `type` for objects
- Use `Result<T, E>` pattern for recoverable errors
- Throw only for programming errors

### Commits

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Present tense, imperative mood
- Reference issue/task if applicable
- Don't commit unless asked to
- **ALWAYS update TASKS.md before committing** — mark completed items with `[x]`

## Commands

```bash
# Verification (run before commit)
pnpm verify          # All checks

# Individual checks
pnpm typecheck       # tsc --noEmit
pnpm lint            # eslint
pnpm format:check    # prettier --check
pnpm test:unit       # vitest run
pnpm test:integration
pnpm test:e2e        # playwright (requires build)

# Development
pnpm dev             # SvelteKit dev server
pnpm build           # Full build
pnpm preview         # Preview built site
```

## Key Files

| File            | Purpose                                       |
| --------------- | --------------------------------------------- |
| `SPEC.md`       | Full specification, phases, architecture      |
| `DEMO.md`       | Demo catalog design (6 services, 3 use cases) |
| `TASKS.md`      | Current phase tasks                           |
| `catalog.toml`  | Catalog configuration (root)                  |
| `service.toml`  | Service sidecar                               |
| `use-case.toml` | Use case definition                           |

## Testing Strategy

- **Unit tests** for `core/` — pure functions, high coverage (>80%)
- **Integration tests** for adapters — real files, temp dirs
- **E2E tests** for web — Playwright against built site

Always verify with `pnpm verify` before committing.

## Error Messages

Good:

```text
Error: Invalid service.toml at demo-catalog/orders-service/service.toml:12
  Missing required field: service.id
```

Bad:

```text
Error: Validation failed
```

Include file path, line number, field path, expected vs actual.

## Don't

- Add deps without checking health (recent commits, adoption)
- Put I/O in `core/`
- Skip tests for "simple" changes
- Use `any` or `@ts-ignore`
- Commit with failing `pnpm verify`
- Over-engineer — keep it simple until complexity is proven needed
