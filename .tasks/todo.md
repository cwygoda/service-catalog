# Merge to single `@cwygoda/service-catalog` package

## Plan

Merge core/cli/ui into one package. Two build steps (tsc for core+cli, svelte-package for UI).

### Structure

```
packages/service-catalog/
  package.json            # @cwygoda/service-catalog
  tsconfig.json           # tsc: src/core + src/cli → dist/core + dist/cli
  svelte.config.js        # svelte-package: src/lib → dist/ui
  vite.config.ts          # vitest
  bin/service-catalog.js  # CLI entry
  src/
    core/                 # ← packages/core/src/*
    cli/                  # ← packages/cli/src/*
    lib/                  # ← packages/ui/src/lib/* (svelte-package convention)
```

### Exports

```json
{
  ".": "dist/core/index.js",
  "./domain": "dist/core/domain/index.js",
  "./ports": "dist/core/ports/index.js",
  "./adapters": "dist/core/adapters/index.js",
  "./schemas": "dist/core/schemas/index.js",
  "./cli": "dist/cli/index.js",
  "./ui": "dist/ui/index.js",
  "./ui/components": "dist/ui/components/index.js",
  "./ui/stores": "dist/ui/stores/index.js"
}
```

### Import rewrites

- CLI → core: relative imports (`../core/...`)
- UI → core: self-referencing (`@cwygoda/service-catalog/domain`)
- Demo → all: `@cwygoda/service-catalog` + `/ui`

## Tasks

- [ ] Create packages/service-catalog/ with package.json, configs
- [ ] Move source files (core, cli, ui)
- [ ] Rewrite internal imports (cli→core, ui→core)
- [ ] Delete old packages (core, cli, ui)
- [ ] Update demo app imports
- [ ] Update .releaserc for single package publish
- [ ] Update root package.json scripts
- [ ] Verify: pnpm install + pnpm verify
- [ ] Publish @cwygoda/service-catalog@0.18.0
- [ ] Deprecate old package names entirely
- [ ] Commit + push
