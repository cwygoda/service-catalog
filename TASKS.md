# Phase 4: Service Connections Graph

**Status:** Complete

**Goal:** Visualize service dependencies derived from use cases.

---

## Summary

- Connection entity with type guards and factory functions
- Connection TypeBox schema with validation
- Service extended with optional connections array
- Graph builder service deriving connections from use case steps
- D3 force-directed graph with zoom/pan/fullscreen
- Use case overlay highlighting participants
- Service detail mini-graph with connection lists
- /graph page with domain legend
- 38 E2E tests passing

## Completed Tasks

1. ✅ Connection Entity (`src/core/domain/connection.ts`)
2. ✅ Connection TypeBox Schema (`src/shared/schemas/connection.schema.ts`)
3. ✅ Extended Service with connections
4. ✅ Graph Builder Service (`src/core/services/graph-builder.ts`)
5. ✅ Installed D3 dependencies
6. ✅ Graph model with nodes/edges
7. ✅ Serializable graph output in catalog.json
8. ✅ D3 Force-Directed Graph Component (`ServiceGraph.svelte`)
9. ✅ Graph interactions (click→nav, hover tooltip, zoom/pan, fullscreen)
10. ✅ Use case overlay with dropdown filter
11. ✅ Service detail mini-graph + connection lists
12. ✅ Graph page with domain legend
13. ✅ JSON output includes graph field (6 nodes, 7 edges)
14. ✅ E2E tests (38 tests passing)

## Deferred

- Demo sidecar explicit connections (using derived connections instead)
- Reset view button (zoom/pan sufficient)

---

<details>
<summary>📦 Phase 3 Archive (Complete)</summary>

# Phase 3: Domains + Hierarchy ✅

**Status:** Complete

**Goal:** Organize use cases and services into business domains with hierarchical navigation.

## Summary

- Domain entity, schema, parser
- Domain list/detail pages
- Hierarchical tree navigation with toggle
- Breadcrumb navigation
- 38 E2E tests passing

## Completed Tasks

1. ✅ Domain entity (with createDomain, isDomain)
2. ✅ Domain TypeBox schema
3. ✅ Service/UseCase domain field extension
4. ✅ Domain TOML parser
5. ✅ Catalog domain extension (find, get, child functions)
6. ✅ Filesystem loader extension
7. ✅ Demo domains (commerce, platform)
8. ✅ Domain list page
9. ✅ Domain detail page (use cases first)
10. ✅ Hierarchical nav tree with toggle
11. ✅ Breadcrumb navigation
12. ✅ Navigation updates (Domains > Use Cases > Services)
13. ✅ JSON output extension
14. ✅ E2E tests (38 tests)

</details>

<details>
<summary>📦 Phase 2 Archive (Complete)</summary>

# Phase 2: Use Cases + BPMN ✅

**Status:** Complete (BPMN XML rendering parked)

## Summary

- Use case domain entity, schema, parser
- Use case list/detail pages
- Service ↔ UseCase bidirectional linking
- Navigation and home page updates
- 9 E2E tests passing

## Parked Items

- BPMN XML file creation for demo use cases
- BPMN diagram rendering verification (component built, needs real XML)
- BPMN Sketch Miner DSL parser (no npm package)
- Auto-link BPMN participants to services

## Completed Tasks

1. ✅ Use case domain entity (27 tests)
2. ✅ Use case TypeBox schema (22 tests)
3. ✅ Use case TOML parser (5 tests)
4. ✅ Catalog domain extension (16 tests)
5. ✅ Filesystem loader extension (10 tests)
6. ⏸️ BPMN Sketch Miner parser (deferred)
7. ✅ BPMN renderer component (bpmn-js)
8. ✅ Use case list page (10 tests)
9. ✅ Use case detail page
10. ✅ Service → Use Case linking
11. ⏸️ Auto-link BPMN participants (deferred)
12. ✅ Navigation updates
13. ✅ Home page updates
14. ✅ Demo use cases (3)
15. ✅ JSON output extension
16. ✅ E2E tests (9 tests)

</details>

<details>
<summary>📦 Phase 1 Archive (Complete)</summary>

# Phase 1: Foundation + MVP ✅

**Status:** Complete

## Summary

- Project setup with hexagonal architecture
- CLI with TOML parsing and JSON output
- SvelteKit static site with service list/detail
- Dark mode, responsive layout
- Full test suite (39 unit + 15 e2e)
- Core domain coverage 100%

## Completed Tasks

1. ✅ Project initialization (pnpm, TypeScript, hexagonal structure)
2. ✅ TypeScript configuration (strict, ESM, dual configs)
3. ✅ Linting & formatting (ESLint 9, Prettier, husky + lint-staged)
4. ✅ Testing setup (Vitest, Playwright)
5. ✅ Verify script
6. ✅ Core domain types (Service, Catalog)
7. ✅ Core ports (CatalogLoader, CatalogWriter)
8. ✅ TypeBox schemas
9. ✅ TOML parser adapter
10. ✅ Filesystem loader adapter
11. ✅ JSON writer adapter
12. ✅ CLI implementation
13. ✅ SvelteKit setup
14. ✅ Tailwind CSS v4
15. ✅ Web data loading (static-json adapter)
16. ✅ Dark mode with persistence
17. ✅ Layout & navigation (responsive)
18. ✅ Routes & pages (home, services list, service detail)
19. ✅ Demo catalog (6 services)
20. ✅ Build integration
21. ✅ E2E tests (15 tests)
22. ✅ Documentation (README)

</details>
