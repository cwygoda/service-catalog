# Phase 2: Use Cases + BPMN ⭐

**Goal:** Use-case-first navigation — the core differentiator.

Use cases are the heart of the catalog. Business scenarios that span multiple services, visualized with BPMN diagrams.

---

## 1. Use Case Domain Entity ✅

- [x] Create `src/core/domain/use-case.ts`:

  ```typescript
  export interface UseCase {
    id: string;
    name: string;
    description: string; // markdown content or path
    bpmn?: string; // path to .bpmn.txt file
    participants: Participant[];
    steps: Step[];
  }

  export interface Participant {
    service: string; // service id
    role: string;
  }

  export interface Step {
    sequence: number;
    actor?: string; // external actor
    service?: string; // service id
    action: string;
    endpoint?: string; // e.g. "POST /orders"
  }
  ```

- [x] Create factory function `createUseCase()`
- [x] Create type guard `isUseCase()`
- [x] Unit tests for use case domain (27 tests)

## 2. Use Case TypeBox Schema ✅

- [x] Create `src/shared/schemas/use-case.schema.ts`:

  ```typescript
  export const UseCaseSchema = Type.Object({
    use_case: Type.Object({
      id: Type.String({ minLength: 1 }),
      name: Type.String({ minLength: 1 }),
      description: Type.String(),
      bpmn: Type.Optional(Type.String()),
      participants: Type.Array(ParticipantSchema),
      steps: Type.Array(StepSchema),
    }),
  });
  ```

- [x] Export from `src/shared/schemas/index.ts`
- [x] Unit tests for schema validation (22 tests)

## 3. Use Case TOML Parser ✅

- [x] Extend `src/adapters/parsers/toml.parser.ts` to handle use case sidecars
- [x] Create `parseUseCaseToml()` function
- [x] Unit tests with fixtures (5 tests):
  - `tests/fixtures/valid-use-case.toml`
  - `tests/fixtures/invalid-use-case.toml`

## 4. Catalog Domain Extension ✅

- [x] Update `src/core/domain/catalog.ts`:

  ```typescript
  export interface Catalog {
    services: Service[];
    useCases: UseCase[];
  }
  ```

- [x] Update `createCatalog()` to accept use cases
- [x] Add `findUseCase(catalog, id)` function
- [x] Add `getServiceUseCases(catalog, serviceId)` - returns use cases a service participates in
- [x] Update existing tests (16 tests total)

## 5. Filesystem Loader Extension ✅

- [x] Update `FilesystemLoader` to find `use-case.toml` files
- [x] Load use cases alongside services
- [x] Integration tests (10 tests total, 3 new)

## 6. BPMN Sketch Miner Parser ⏭️ (Deferred)

> **TODO (Future):** BPMN Sketch Miner has no npm package - it's web-only.
> When needed, implement a simple line-based DSL parser for `.bpmn.txt` files.
> For now, use standard BPMN 2.0 XML files with bpmn-js.

- [x] Research bpmn-sketch-miner library (no npm package available)
- [ ] ~~Create DSL parser~~ → Deferred to future phase
- [x] Decision: Use bpmn-js with BPMN 2.0 XML only

## 7. BPMN Renderer ✅

- [x] Install `bpmn-js` for rendering
- [x] Create `src/lib/components/BpmnDiagram.svelte`:
  - Accept BPMN XML as prop
  - Render with bpmn-js NavigatedViewer
  - Optional interactive mode (zoom/pan)
  - Error handling for invalid XML
- [ ] Component tests (deferred - bpmn-js requires browser, test via E2E)

## 8. Use Case List Page

- [ ] Create `src/routes/use-cases/+page.svelte`:
  - Grid of use case cards
  - Show name, description preview, participant count
- [ ] Create `src/routes/use-cases/+page.ts` loader
- [ ] Create `src/lib/components/UseCaseCard.svelte`
- [ ] Component tests for UseCaseCard

## 9. Use Case Detail Page

- [ ] Create `src/routes/use-cases/[id]/+page.svelte`:
  - Business description (markdown rendered)
  - BPMN diagram
  - Step-by-step flow table
  - Participating services (linked to service pages)
- [ ] Create `src/routes/use-cases/[id]/+page.ts` loader
- [ ] Handle 404 for unknown use case

## 10. Service → Use Case Linking

- [ ] Update `src/routes/services/[id]/+page.svelte`:
  - Add "Participates in Use Cases" section
  - List use cases with links
- [ ] Update service detail loader to include use cases

## 11. Auto-link BPMN Participants

- [ ] Parse BPMN lanes/participants
- [ ] Match participant names to service IDs
- [ ] Warn on unmatched participants (build output)

## 12. Navigation Updates

- [ ] Update `src/lib/components/Header.svelte`:
  - Add "Use Cases" nav link (prominent position)
- [ ] Update mobile nav

## 13. Home Page Updates

- [ ] Update `src/routes/+page.svelte`:
  - Add "Featured Use Cases" section
  - Show use case count
  - Use cases above services in visual hierarchy

## 14. Demo Use Cases

- [ ] Create `demo-catalog/use-cases/checkout/`:
  - `use-case.toml`
  - `checkout.md` (description)
  - `checkout.bpmn.txt` (BPMN diagram)
- [ ] Create `demo-catalog/use-cases/profile-update/`
- [ ] Create `demo-catalog/use-cases/customer-onboarding/`
- [ ] Verify build includes use cases

## 15. JSON Output Extension

- [ ] Update `JsonWriter` to include use cases in `catalog.json`
- [ ] Update `CatalogSchema` for validation
- [ ] Update `fetchCatalog` utility

## 16. E2E Tests

- [ ] Create `tests/e2e/use-cases.spec.ts`:
  - Use case list page loads
  - Shows correct count
  - Navigate to use case detail
  - BPMN diagram renders
  - Participating services linked
  - Service detail shows use cases

---

## Verification Commands

```bash
pnpm verify  # All checks must pass
```

## Acceptance Criteria

- [ ] Use case list page shows 3 demo use cases
- [ ] Use case detail renders BPMN diagram
- [ ] Step-by-step flow displays correctly
- [ ] Services link to their use cases
- [ ] Use cases link to participating services
- [ ] Navigation highlights use cases prominently
- [ ] All E2E tests pass

---

## Sidecar Format v0.2

```toml
[use_case]
id = "checkout-flow"
name = "Customer Checkout"
description = "./checkout.md"
bpmn = "./checkout.bpmn.txt"

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
```

---

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

## Acceptance Criteria Met

- ✅ `pnpm verify` passes
- ✅ Site displays 6 demo services
- ✅ Dark mode toggle works
- ✅ Mobile responsive
- ✅ Test coverage >80% for core (100%)
- ✅ Zero lint/type errors
- ✅ Hexagonal architecture enforced

</details>
