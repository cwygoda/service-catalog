import { Command } from 'commander';
import { resolve } from 'node:path';
import { recommendedConfig } from '@cwygoda/bpmn-txt';
import { FilesystemLoader } from '@cwygoda/service-catalog-core';
import { resolveBpmnlintrc } from '../utils/resolve-bpmnlintrc.js';
import { formatLintDiagnostics } from '../utils/format-lint.js';

interface LintOptions {
  input: string;
  config?: string;
}

async function lintAction(options: LintOptions): Promise<void> {
  const inputPath = resolve(options.input);
  const bpmnLintConfig = (await resolveBpmnlintrc(options.config)) ?? recommendedConfig;

  const loader = new FilesystemLoader({ bpmnLint: 'warn', bpmnLintConfig });
  const { lintDiagnostics } = await loader.loadWithDiagnostics(inputPath);

  if (lintDiagnostics.length > 0) {
    const output = formatLintDiagnostics(lintDiagnostics);
    process.stderr.write(output + '\n');
  }
}

export const lintCommand = new Command('lint')
  .description('Lint BPMN definitions in the catalog')
  .option('-i, --input <path>', 'Input directory containing service definitions', '.')
  .option('--config <path>', 'Path to .bpmnlintrc config file')
  .action(lintAction);
