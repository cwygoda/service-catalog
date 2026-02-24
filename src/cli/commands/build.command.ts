import { Command } from 'commander';
import { resolve } from 'node:path';
import chalk from 'chalk';
import { createFilesystemLoader } from '../../adapters/loaders/filesystem.loader.js';
import { createJsonWriter } from '../../adapters/persistence/json.writer.js';
import { buildServiceGraph } from '../../core/services/graph-builder.js';
import type { BpmnLintLevel } from '../../shared/schemas/catalog-config.schema.js';

interface BuildOptions {
  input: string;
  output: string;
  bpmnLint: BpmnLintLevel;
}

async function build(options: BuildOptions): Promise<void> {
  const inputPath = resolve(options.input);
  const outputPath = resolve(options.output, 'catalog.json');

  console.log(chalk.blue('Building catalog...'));
  console.log(chalk.gray(`  Input:  ${inputPath}`));
  console.log(chalk.gray(`  Output: ${outputPath}`));

  const loader = createFilesystemLoader({ bpmnLint: options.bpmnLint });
  const writer = createJsonWriter();

  try {
    const catalog = await loader.load(inputPath);
    console.log(chalk.gray(`  Found ${String(catalog.services.length)} service(s)`));

    // Build service graph
    const graph = buildServiceGraph(catalog);
    console.log(
      chalk.gray(
        `  Built graph: ${String(graph.nodes.length)} nodes, ${String(graph.edges.length)} edges`
      )
    );

    // Add graph to catalog output
    const catalogWithGraph = { ...catalog, graph };

    await writer.write(catalogWithGraph, outputPath);
    console.log(chalk.green('✓ Catalog built successfully'));
  } catch (error) {
    console.error(chalk.red('✗ Build failed:'));
    console.error(chalk.red(`  ${error instanceof Error ? error.message : String(error)}`));
    process.exit(1);
  }
}

export const buildCommand = new Command('build')
  .description('Build the service catalog from source files')
  .option('-i, --input <path>', 'Input directory containing service definitions', '.')
  .option('-o, --output <path>', 'Output directory for built catalog', 'dist')
  .option('--bpmn-lint <level>', 'BPMN lint level: error, warn, off', 'warn')
  .action(build);
