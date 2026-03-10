# [0.19.0](https://github.com/cwygoda/service-catalog/compare/v0.18.0...v0.19.0) (2026-03-10)

### Features

- **demo:** improve graph UX on service detail and full graph pages ([cd42a32](https://github.com/cwygoda/service-catalog/commit/cd42a323688f621ec3b2ee45782ddad95bfaf990))
- **graph:** replace D3 force simulation with ELK layered layout ([97ab27c](https://github.com/cwygoda/service-catalog/commit/97ab27cc95c89a56cc62839b60bbd7a9013c8ec3))

# [0.18.0](https://github.com/cwygoda/service-catalog/compare/v0.17.1...v0.18.0) (2026-03-09)

### Features

- merge core/cli/ui into single @cwygoda/service-catalog package ([ac66d4c](https://github.com/cwygoda/service-catalog/commit/ac66d4c74caef8b754023066083b025285a103ef))

## [0.17.1](https://github.com/cwygoda/service-catalog/compare/v0.17.0...v0.17.1) (2026-03-09)

### Bug Fixes

- **core:** pass role and description through sidecar transform ([#7](https://github.com/cwygoda/service-catalog/issues/7)) ([84ceec6](https://github.com/cwygoda/service-catalog/commit/84ceec6c6fef6f8d31c00b7a5f78398e77947833))

# [0.17.0](https://github.com/cwygoda/service-catalog/compare/v0.16.0...v0.17.0) (2026-03-09)

### Features

- **core:** add role and description fields to connections and data stores ([#6](https://github.com/cwygoda/service-catalog/issues/6)) ([b689a40](https://github.com/cwygoda/service-catalog/commit/b689a4014d375c7e404a97c91011a24d947d6c92))

# [0.16.0](https://github.com/cwygoda/service-catalog/compare/v0.15.1...v0.16.0) (2026-03-06)

### Bug Fixes

- harden UI accessibility — focus traps, motion, ARIA, focus rings ([30ae4cb](https://github.com/cwygoda/service-catalog/commit/30ae4cbb7735cb85189eb2b29f4096b244d6e4f7))
- improve responsive adaptation — touch feedback, fluid type, grid breakpoints ([fe37b2b](https://github.com/cwygoda/service-catalog/commit/fe37b2bc3c2a812fee0abaa6006f81be2981114e))
- improve Shield color contrast for similar labels ([a04eecb](https://github.com/cwygoda/service-catalog/commit/a04eecbe1558ef05159e43a398ca7bd8b065b016))
- move BPMN pill to metadata row in UseCaseCard ([5c113ec](https://github.com/cwygoda/service-catalog/commit/5c113eceabf4bf016d389351615dc210f9ccafe3))
- normalize UI against design system — cards, focus, layout ([6570401](https://github.com/cwygoda/service-catalog/commit/65704010839e254d203c79419fe8d706967424b9))

### Features

- add Shield components for service type and data store cards ([c18e1d5](https://github.com/cwygoda/service-catalog/commit/c18e1d572550a0e284f7cf1ebbee5c88f382d153))
- add Shield to DomainCard and UseCaseCard for visual consistency ([ad50cba](https://github.com/cwygoda/service-catalog/commit/ad50cba14f264295a33b10ec07bc1704a4573c05))

### Performance Improvements

- enable precompress, use parent() loaders, add lookup maps ([63205c2](https://github.com/cwygoda/service-catalog/commit/63205c27f320dc49589ab96f956c51d1438ff7e2))

## [0.15.1](https://github.com/cwygoda/service-catalog/compare/v0.15.0...v0.15.1) (2026-03-06)

### Bug Fixes

- resolve CATALOG_DIR to absolute path at root script level ([1bd7874](https://github.com/cwygoda/service-catalog/commit/1bd7874336c9a736387a3c573b49ba398b3f2d2b))

# [0.15.0](https://github.com/cwygoda/service-catalog/compare/v0.14.0...v0.15.0) (2026-03-06)

### Features

- resolve CLI input paths relative to caller's cwd via INIT_CWD ([8256975](https://github.com/cwygoda/service-catalog/commit/825697525acab802fd3bbc3f0b79154c5673f3f2))
- support CATALOG_DIR env var for custom catalog input ([00f07c6](https://github.com/cwygoda/service-catalog/commit/00f07c6bab61d34ddc7f78b557824320b2242302))

# [0.14.0](https://github.com/cwygoda/service-catalog/compare/v0.13.0...v0.14.0) (2026-03-06)

- feat!: update dependencies and CI to Node 24, pnpm 10, ESLint 10 ([ff79438](https://github.com/cwygoda/service-catalog/commit/ff7943873ad6e61bb9f58ee91de7f0c94939b85e))

### BREAKING CHANGES

- requires Node.js >= 24

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

# [0.13.0](https://github.com/cwygoda/service-catalog/compare/v0.12.0...v0.13.0) (2026-03-06)

- feat!: add event-transformer type, frameworks array, dataStores connections ([d555383](https://github.com/cwygoda/service-catalog/commit/d55538339bbd7ba646f2c9ee65e8396fb1a2865e))

### BREAKING CHANGES

- `framework` field renamed to `frameworks` (string[])

* Add `event-transformer` to ServiceType for consumer+producer services
* Rename `framework: string` → `frameworks: string[]` for multi-framework support
* Add `dataStores` array with target/access (r|rw) for explicit data store connections
* Bump all packages to 0.12.0

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

# [0.12.0](https://github.com/cwygoda/service-catalog/compare/v0.11.0...v0.12.0) (2026-03-05)

### Bug Fixes

- **demo:** resolve BPMN lint errors in customer-onboarding gateway ([08c86f0](https://github.com/cwygoda/service-catalog/commit/08c86f06f697ef05d50329a9ced988320eecd5c7))
- **ui:** resolve Svelte 5 reactivity and a11y warnings ([e966d08](https://github.com/cwygoda/service-catalog/commit/e966d08892b8d9c110b1569d3d99b470fbe8a457))

### Features

- **core,ui:** add DataStore entity across all layers ([15b849f](https://github.com/cwygoda/service-catalog/commit/15b849f5f4e178277bdbc12958cfac6164158b08))

# [0.11.0](https://github.com/cwygoda/service-catalog/compare/v0.10.0...v0.11.0) (2026-03-05)

### Features

- **ui:** add Pagefind search with Cmd+K modal ([c72d34d](https://github.com/cwygoda/service-catalog/commit/c72d34dd916403260d12f69c6c7d306d630d7b87))

# [0.10.0](https://github.com/cwygoda/service-catalog/compare/v0.9.1...v0.10.0) (2026-03-05)

### Bug Fixes

- **release:** re-publish with resolved workspace protocols ([7b56031](https://github.com/cwygoda/service-catalog/commit/7b56031dcff6a9a1b329449b82cf1a5dcb0de4a5))

### Features

- **core:** add YAML parser and dual-format loader ([bd049bd](https://github.com/cwygoda/service-catalog/commit/bd049bdd209933ac0c05b975d913e3e8eb0f0125))
- **core:** expand service metadata schema with type, lifecycle, and rich fields ([26764fd](https://github.com/cwygoda/service-catalog/commit/26764fd05f8fc4b27b641352db67a9f626a0c497))
- **demo:** migrate all TOML sidecars to YAML ([5f16433](https://github.com/cwygoda/service-catalog/commit/5f16433585ba805b8b2bca155ec61db82cc80753))

### BREAKING CHANGES

- **core:** Service.metadata removed; Service.type and Service.lifecycle
  now required (defaults: web-service, active).

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>

## [0.9.1](https://github.com/cwygoda/service-catalog/compare/v0.9.0...v0.9.1) (2026-03-03)

### Bug Fixes

- **deps:** bump @cwygoda/bpmn-txt to ^0.14.0 ([968b5b1](https://github.com/cwygoda/service-catalog/commit/968b5b11986333fedb101d95d71f3be6fc926a35))

# [0.9.0](https://github.com/cwygoda/service-catalog/compare/v0.8.0...v0.9.0) (2026-03-03)

### Features

- **ui:** responsive BPMN diagram sizing with class override ([f973ab1](https://github.com/cwygoda/service-catalog/commit/f973ab1574b7b16b39c66f15b3d03f68695d8f90))

# [0.8.0](https://github.com/cwygoda/service-catalog/compare/v0.7.3...v0.8.0) (2026-03-03)

### Bug Fixes

- **demo:** add networkidle wait to breadcrumb E2E test ([9d5e813](https://github.com/cwygoda/service-catalog/commit/9d5e813fddd36cac41506cf548ce3d32eb8d56cd))

### Features

- **core:** auto-extract steps from BPMN tasks ([1e3fd28](https://github.com/cwygoda/service-catalog/commit/1e3fd2810d4e2adb80fc94941fa7385c6b925019))

## [0.7.3](https://github.com/cwygoda/service-catalog/compare/v0.7.2...v0.7.3) (2026-03-02)

### Bug Fixes

- update @cwygoda/bpmn-txt to ^0.13.3 ([100dc1d](https://github.com/cwygoda/service-catalog/commit/100dc1d001c8163222f0f8b9506d94cc55a07893))

## [0.7.2](https://github.com/cwygoda/service-catalog/compare/v0.7.1...v0.7.2) (2026-03-02)

### Bug Fixes

- update @cwygoda/bpmn-txt to ^0.13.2 for lane stacking fix ([f3e8535](https://github.com/cwygoda/service-catalog/commit/f3e853572fd161ef78927722573c8a0569e1b52e))

## [0.7.1](https://github.com/cwygoda/service-catalog/compare/v0.7.0...v0.7.1) (2026-03-02)

### Bug Fixes

- **ui:** BPMN fullscreen overlay not covering viewport ([fcbcfe2](https://github.com/cwygoda/service-catalog/commit/fcbcfe2c1f7995af093310cb0883392b72035a99))
- **ui:** rewrite message flow label centering to match bpmn-js structure ([d3edc4e](https://github.com/cwygoda/service-catalog/commit/d3edc4e7396ea9e22f268a7b9206a7336ef6b456))

# [0.7.0](https://github.com/cwygoda/service-catalog/compare/v0.6.2...v0.7.0) (2026-03-02)

### Features

- **ui:** replace native fullscreen with fixed-viewport overlay ([5ff420e](https://github.com/cwygoda/service-catalog/commit/5ff420eb96c320b1175b2f6176f9b8c3dcf9061c))

## [0.6.2](https://github.com/cwygoda/service-catalog/compare/v0.6.1...v0.6.2) (2026-03-02)

### Bug Fixes

- center message flow labels in BPMN diagram ([9c891ab](https://github.com/cwygoda/service-catalog/commit/9c891ab0fc0414e7af9ce86b5fc54f3c1f675d95))

## [0.6.1](https://github.com/cwygoda/service-catalog/compare/v0.6.0...v0.6.1) (2026-03-02)

### Bug Fixes

- update @cwygoda/bpmn-txt to ^0.13.0 ([432397a](https://github.com/cwygoda/service-catalog/commit/432397a4dc6e8b57a5b59d6ccd51e272e932e356))

# [0.6.0](https://github.com/cwygoda/service-catalog/compare/v0.5.1...v0.6.0) (2026-03-02)

### Features

- update bpmn-txt to 0.12.0 for message flow envelope support ([8f6b5b7](https://github.com/cwygoda/service-catalog/commit/8f6b5b764d359d2c609240937b09251197231d0c))

## [0.5.1](https://github.com/cwygoda/service-catalog/compare/v0.5.0...v0.5.1) (2026-03-02)

### Bug Fixes

- update bpmn-txt to 0.11.1 for XML flow reference fix ([37c3da8](https://github.com/cwygoda/service-catalog/commit/37c3da8d76b0217777a103abfe999e71990d774e))

# [0.5.0](https://github.com/cwygoda/service-catalog/compare/v0.4.0...v0.5.0) (2026-03-02)

### Features

- add lint command, surface bpmnlint diagnostics ([f4d85f4](https://github.com/cwygoda/service-catalog/commit/f4d85f4c5dd5c604614a867e09d55e2e14e1c453))

# [0.4.0](https://github.com/cwygoda/service-catalog/compare/v0.3.3...v0.4.0) (2026-03-02)

### Features

- **core:** update @cwygoda/bpmn-txt to ^0.10.0 for improved line layouts ([0138d23](https://github.com/cwygoda/service-catalog/commit/0138d23a2ff03b9e5b98fe0269906391911cac45))

## [0.3.3](https://github.com/cwygoda/service-catalog/compare/v0.3.2...v0.3.3) (2026-02-27)

### Bug Fixes

- **core:** bump @cwygoda/bpmn-txt to ^0.9.1 ([224b6bd](https://github.com/cwygoda/service-catalog/commit/224b6bdcbef5e6622fd9cfef2bd351d3154a0b0e))

## [0.3.2](https://github.com/cwygoda/service-catalog/compare/v0.3.1...v0.3.2) (2026-02-27)

### Bug Fixes

- **core:** update @cwygoda/bpmn-txt to ^0.9.1 ([039923f](https://github.com/cwygoda/service-catalog/commit/039923f4fbfe0d93c34780c34e57ddb6473f2a28))

## [0.3.1](https://github.com/cwygoda/service-catalog/compare/v0.3.0...v0.3.1) (2026-02-27)

### Bug Fixes

- **core:** switch bpmn-txt from GitHub tarball to @cwygoda/bpmn-txt npm package ([5037f40](https://github.com/cwygoda/service-catalog/commit/5037f40b4ebe1f5b3706dcdc456a3a4202e20fc0))

# [0.3.0](https://github.com/cwygoda/service-catalog/compare/v0.2.0...v0.3.0) (2026-02-26)

### Features

- **core:** warn on BPMN parse errors and update bpmn-txt to v0.6.0 ([401cbe9](https://github.com/cwygoda/service-catalog/commit/401cbe903f7addc82e613138a2c1d54ee6c8806c))

# [0.2.0](https://github.com/cwygoda/service-catalog/compare/v0.1.3...v0.2.0) (2026-02-26)

### Bug Fixes

- align ElementClickEvent with exactOptionalPropertyTypes ([261296c](https://github.com/cwygoda/service-catalog/commit/261296c426484738fabae629c274637d6b727eb8))
- regenerate lockfile after removing root bpmn-txt link ([63d813f](https://github.com/cwygoda/service-catalog/commit/63d813f50ed08d3f0faf4750457f41cc8b52c4f0))

### Features

- add markdown use-case format with inline BPMN and doc links ([465a408](https://github.com/cwygoda/service-catalog/commit/465a408c81318e88b56920e7c59878011935b7c0))

## [0.1.3](https://github.com/cwygoda/service-catalog/compare/v0.1.2...v0.1.3) (2026-02-26)

### Bug Fixes

- **a11y:** harden UI for WCAG AAA compliance ([4b863fc](https://github.com/cwygoda/service-catalog/commit/4b863fc7778885e29e14d47ba94891963cb3cd97))
- **ui:** normalize theme colors to design system palette ([51173e3](https://github.com/cwygoda/service-catalog/commit/51173e35de81fca0bf7ef493248fa654d9240ef1))
- **ui:** responsive adaptation for mobile and tablet viewports ([1ef31ce](https://github.com/cwygoda/service-catalog/commit/1ef31ce1fe66300f5091070914bbffee679b95cf))

### Performance Improvements

- **ui:** optimize D3 tree-shaking, derived reactivity, and graph rendering ([1ccafd3](https://github.com/cwygoda/service-catalog/commit/1ccafd38b2cc60f826f2638dabe6707bffa983d0))

## [0.1.2](https://github.com/cwygoda/service-catalog/compare/v0.1.1...v0.1.2) (2026-02-25)

### Bug Fixes

- ship Tailwind v4 [@source](https://github.com/source) declaration via CSS export ([9586f9a](https://github.com/cwygoda/service-catalog/commit/9586f9ad281d113ae6ce79bd2d83c402cecf75a8))

## [0.1.1](https://github.com/cwygoda/service-catalog/compare/v0.1.0...v0.1.1) (2026-02-24)

### Bug Fixes

- **ci:** update Playwright install to use correct package name ([93b15bd](https://github.com/cwygoda/service-catalog/commit/93b15bd509badd14fd0375697b5b6b347eee43b3))
- correct package names to [@cwygoda](https://github.com/cwygoda) scope ([0c4df36](https://github.com/cwygoda/service-catalog/commit/0c4df363a70243d2358bb27b08070c3dc10ec4b0))

# 0.1.0 (2026-02-24)

### Bug Fixes

- add runtime validation and error handling to route loaders ([c18458d](https://github.com/cwygoda/service-catalog/commit/c18458d8ccf36cf99b439722c89fcc5782cf1cfb))
- **ci:** add postinstall to build bpmn-txt dependency ([34a7e23](https://github.com/cwygoda/service-catalog/commit/34a7e2384da3b783739d37003cefc638265dc56f))
- **ci:** build packages before typecheck ([403ea57](https://github.com/cwygoda/service-catalog/commit/403ea57ffba3bba61cf86e7fffbcb44cd9eb57e8))
- **ci:** enable bpmn-txt build in CI ([2d1119c](https://github.com/cwygoda/service-catalog/commit/2d1119ccd256e61149a473b8f2f1134c67df5561))
- **ci:** format generated files after build ([6bb8304](https://github.com/cwygoda/service-catalog/commit/6bb83049478e16e6c325c381445e6fb6a85c4c08))
- enable class-based dark mode in Tailwind v4 ([e6595d5](https://github.com/cwygoda/service-catalog/commit/e6595d56d9ec5cdf0ad3c802707b74b0aea532f8))
- improve theme store SSR compatibility ([c62de12](https://github.com/cwygoda/service-catalog/commit/c62de12a6f6cc9a3a86eb10ec6083f40f830f984))
- resolve E2E test failures ([e1410f9](https://github.com/cwygoda/service-catalog/commit/e1410f9fbc972542767e30ad40a44561e5db9604))

### Features

- add BpmnDiagram component with bpmn-js ([d322799](https://github.com/cwygoda/service-catalog/commit/d3227993a35f266bab9898a51344cc998bc1ccaf))
- add breadcrumb navigation to detail pages ([e3bac92](https://github.com/cwygoda/service-catalog/commit/e3bac925e2311b457dd08ff1c367701a42728d0c))
- add dark mode with persistence ([6164604](https://github.com/cwygoda/service-catalog/commit/6164604a5ea1133741c779f1dde3d6e5a4ab9ca3))
- add demo domains and assign services/use cases ([adfcf9e](https://github.com/cwygoda/service-catalog/commit/adfcf9ef285d323f8d9d14c5c736854ffa1c9164))
- add Domain entity for Phase 3 ([1371704](https://github.com/cwygoda/service-catalog/commit/13717041f32f466eb8b6a52387836d4ce84e4fd6))
- add domain field to Service and UseCase ([e64a39f](https://github.com/cwygoda/service-catalog/commit/e64a39f48d4e63411e27cd93aaab690987c4b3a4))
- add domain list and detail pages with navigation ([c0c18ab](https://github.com/cwygoda/service-catalog/commit/c0c18ab8a8ab9fd09a52357a64fbdb7dcb4470a9))
- add Domain TOML parser ([dbd55e3](https://github.com/cwygoda/service-catalog/commit/dbd55e3937d76e9f80af04465a7612f2751bd0af))
- add Domain TypeBox schema ([6fbfe91](https://github.com/cwygoda/service-catalog/commit/6fbfe91199fdfaeacfd5cce031bc1a9d3a7221fc))
- add hierarchical tree navigation with toggle ([7ba7cba](https://github.com/cwygoda/service-catalog/commit/7ba7cba00a2552ea239df9fd8b6d761484f17bbc))
- add mobile responsive navigation ([79b9785](https://github.com/cwygoda/service-catalog/commit/79b9785031eb2fb7c9d965752a93ed892e0e3a23))
- add service catalog web UI ([11443db](https://github.com/cwygoda/service-catalog/commit/11443db5c59baccae6f55d0d652d0daa1941d74a))
- add service connections graph with use case overlay ([5743e98](https://github.com/cwygoda/service-catalog/commit/5743e98dda8d9112cf42ab7606413495d7ce11a7))
- add SvelteKit with Tailwind CSS v4 ([c2caf23](https://github.com/cwygoda/service-catalog/commit/c2caf23229a7fb569c58406f642bd5bf1fee504a))
- add use case schema, TOML parser, and catalog extension ([c9f22e2](https://github.com/cwygoda/service-catalog/commit/c9f22e28d639f36754e321031bd9cb3aeb9cc2cb))
- add UseCase domain entity with type guards ([c08943b](https://github.com/cwygoda/service-catalog/commit/c08943b2755f97b8766629fa9e922e1461ac3a2b))
- **bpmn:** add bpmn-txt DSL support with linting ([64e8927](https://github.com/cwygoda/service-catalog/commit/64e8927ec782b648e7f85a1aefd747e905f22d1e))
- extend Catalog with domains support ([975a0f2](https://github.com/cwygoda/service-catalog/commit/975a0f2d82c260bed6da6dddf65539220b33f599))
- extend FilesystemLoader to load domains ([393bc0c](https://github.com/cwygoda/service-catalog/commit/393bc0c8886766356195db92b9da19bb9aa9156a))
- extend FilesystemLoader to load use cases ([90a95ee](https://github.com/cwygoda/service-catalog/commit/90a95eecf0a66d07a9e87b9ac02688870aa04fe0))
- implement Phase 2 use cases UI and demo content ([dbdc552](https://github.com/cwygoda/service-catalog/commit/dbdc5522598ab7dc0307df27102ca0c57d6b863d))
- phase 1 core foundation ([7542e2b](https://github.com/cwygoda/service-catalog/commit/7542e2b3cc015a2e530dd62f55c5bf9818f94f80))
- wire up BPMN diagram rendering for use cases ([81bb6b2](https://github.com/cwygoda/service-catalog/commit/81bb6b2a696498071508005092d10dd1ef6da927))
