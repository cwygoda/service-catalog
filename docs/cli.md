# CLI Reference

The `@service-catalog/cli` package provides the `service-catalog` command for building catalogs.

## Installation

```bash
pnpm add -D @service-catalog/cli
```

Or run directly with npx:

```bash
npx service-catalog build
```

## Commands

### build

Build the service catalog from TOML source files.

```bash
service-catalog build [options]
```

#### Options

| Option                | Default | Description                                 |
| --------------------- | ------- | ------------------------------------------- |
| `-i, --input <path>`  | `.`     | Input directory containing TOML definitions |
| `-o, --output <path>` | `dist`  | Output directory for `catalog.json`         |
| `--bpmn-lint <level>` | `warn`  | BPMN lint level: `error`, `warn`, `off`     |

#### Examples

```bash
# Build from current directory to dist/
service-catalog build

# Build from specific directory
service-catalog build -i ./my-catalog -o ./static

# Fail on BPMN errors
service-catalog build --bpmn-lint error

# Disable BPMN linting
service-catalog build --bpmn-lint off
```

#### Output

The command outputs `catalog.json` to the specified directory:

```
$ service-catalog build -i my-catalog -o static
Building catalog...
  Input:  /path/to/my-catalog
  Output: /path/to/static/catalog.json
  Found 6 service(s)
  Built graph: 6 nodes, 8 edges
✓ Catalog built successfully
```

#### Exit Codes

| Code | Description                                                |
| ---- | ---------------------------------------------------------- |
| 0    | Success                                                    |
| 1    | Build failed (invalid TOML, missing required fields, etc.) |

## Integration with Build Tools

### package.json scripts

```json
{
  "scripts": {
    "build:catalog": "service-catalog build -i catalog -o static",
    "build": "pnpm build:catalog && vite build"
  }
}
```

### CI/CD

```yaml
# GitHub Actions
- name: Build catalog
  run: npx service-catalog build -i catalog -o static --bpmn-lint error
```

## Programmatic Usage

For advanced use cases, use `@service-catalog/core` directly:

```typescript
import { createFilesystemLoader, createJsonWriter, buildServiceGraph } from '@service-catalog/core';

const loader = createFilesystemLoader({ bpmnLint: 'warn' });
const writer = createJsonWriter();

const catalog = await loader.load('./my-catalog');
const graph = buildServiceGraph(catalog);
await writer.write({ ...catalog, graph }, './static/catalog.json');
```
