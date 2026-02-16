# Phase 3: Domains + Hierarchy

**Goal:** Organize use cases and services into business domains with hierarchical navigation.

---

## 1. Domain Entity ✅

- [x] Create `src/core/domain/domain.ts`:

  ```typescript
  export interface Domain {
    id: string;
    name: string;
    description: string;
    parent?: string; // optional subdomain
  }
  ```

- [x] Create factory function `createDomain()`
- [x] Create type guard `isDomain()`
- [x] Unit tests for domain entity

## 2. Domain TypeBox Schema ✅

- [x] Create `src/shared/schemas/domain.schema.ts`:

  ```typescript
  export const DomainSchema = Type.Object({
    domain: Type.Object({
      id: Type.String({ minLength: 1 }),
      name: Type.String({ minLength: 1 }),
      description: Type.String(),
      parent: Type.Optional(Type.String()),
    }),
  });
  ```

- [x] Export from `src/shared/schemas/index.ts`
- [x] Unit tests for schema validation

## 3. Extend Service/UseCase with Domain ✅

- [x] Update `Service` interface: add `domain?: string`
- [x] Update `UseCase` interface: add `domain?: string`
- [x] Update TypeBox schemas for both
- [x] Update parsers to handle domain field
- [x] Update existing tests

## 4. Domain TOML Parser ✅

- [x] Create `parseDomainToml()` function
- [x] Support `domain.toml` sidecar files
- [x] Unit tests with fixtures

## 5. Catalog Domain Extension ✅

- [x] Update `src/core/domain/catalog.ts`:

  ```typescript
  export interface Catalog {
    services: Service[];
    useCases: UseCase[];
    domains: Domain[];
  }
  ```

- [x] Add `findDomain(catalog, id)` function
- [x] Add `getDomainUseCases(catalog, domainId)` function
- [x] Add `getDomainServices(catalog, domainId)` function
- [x] Add `getChildDomains(catalog, parentId)` function
- [x] Update existing tests

## 6. Filesystem Loader Extension ✅

- [x] Update `FilesystemLoader` to find `domain.toml` files
- [x] Load domains alongside services and use cases
- [x] Integration tests

## 7. Demo Domains ✅

- [x] Create domain structure in demo-catalog:
  - `demo-catalog/domains/commerce/domain.toml`
  - `demo-catalog/domains/platform/domain.toml`
- [x] Assign existing services to domains
- [x] Assign existing use cases to domains

## 8. Domain List Page ✅

- [x] Create `src/routes/domains/+page.svelte`:
  - Grid of domain cards
  - Show name, description, use case count, service count
- [x] Create `src/routes/domains/+page.ts` loader
- [x] Create `src/lib/components/DomainCard.svelte`

## 9. Domain Detail Page ✅

- [x] Create `src/routes/domains/[id]/+page.svelte`:
  - Domain description
  - **Use cases first** (primary content)
  - Services list (secondary)
  - Child domains (if any)
- [x] Create `src/routes/domains/[id]/+page.ts` loader
- [x] Handle 404 for unknown domain

## 10. Hierarchical Navigation ✅

- [x] Create `src/lib/components/NavTree.svelte`:
  - Collapsible tree view
  - Domains → Use Cases → Services hierarchy
- [x] Add tree/flat toggle to header
- [x] Persist preference in localStorage

## 11. Breadcrumb Navigation ✅

- [x] Create `src/lib/components/Breadcrumbs.svelte`
- [x] Add breadcrumbs to:
  - Domain detail pages
  - Use case detail pages (when in domain)
  - Service detail pages (when in domain)
- [x] Support nested domains (parent chain)

## 12. URL Structure Update

- [ ] Add routes:
  - `/domains` - domain list
  - `/domains/[id]` - domain detail
  - `/domains/[id]/use-cases/[ucId]` - use case within domain context
  - `/domains/[id]/services/[svcId]` - service within domain context
- [ ] Keep existing flat routes working (`/use-cases/[id]`, `/services/[id]`)
- [ ] Canonical URLs for SEO

## 13. Navigation Updates ✅

- [x] Update `Header.svelte`:
  - Add "Domains" nav link
  - Reorder: Domains > Use Cases > Services
- [x] Update home page:
  - Show domain overview
  - Maintain use-case-first emphasis

## 14. JSON Output Extension ✅

- [x] Update `CatalogSchema` to include `domains` array
- [x] Ensure JSON writer handles domains
- [x] Update `fetchCatalog` for web

## 15. E2E Tests ✅

- [x] Create `tests/e2e/domains.spec.ts`:
  - Domain list page loads
  - Domain detail shows use cases first
  - [x] Domain → use case → service drill-down
  - [x] Flat routes still work
  - [x] Breadcrumbs work correctly
  - [x] Tree navigation works
  - [x] Tree/flat toggle persists

---

## Verification Commands

```bash
pnpm verify  # All checks must pass
```

## Acceptance Criteria

- [ ] Domain list page shows demo domains
- [ ] Domain detail shows use cases prominently (before services)
- [ ] Hierarchical tree navigation works
- [ ] Breadcrumbs show full path
- [ ] All E2E tests pass
- [ ] Flat routes (`/services/[id]`) remain functional

---

## Sidecar Format v0.3

```toml
# domain.toml
[domain]
id = "commerce"
name = "Commerce"
description = "E-commerce domain"
parent = "platform"  # optional subdomain
```

```toml
# service.toml (extended)
[service]
id = "order-service"
name = "Order Service"
domain = "commerce"  # NEW
```

```toml
# use-case.toml (extended)
[use_case]
id = "checkout-flow"
name = "Customer Checkout"
domain = "commerce"  # NEW
```

---

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
