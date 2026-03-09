import { relative } from 'node:path';
import chalk from 'chalk';
import type { LintDiagnostic } from '../../core/index.js';

export function formatLintDiagnostics(diagnostics: LintDiagnostic[]): string {
  if (diagnostics.length === 0) return '';

  let errorCount = 0;
  let warnCount = 0;
  const lines: string[] = [];

  for (const diag of diagnostics) {
    const relPath = relative(process.cwd(), diag.filePath);
    lines.push(chalk.underline(relPath));

    for (const result of diag.results) {
      if (result.category === 'error') {
        errorCount++;
        lines.push(
          `  ${chalk.red('✗')} ${result.id}: ${result.message} ${chalk.gray(`(${result.rule})`)}`
        );
      } else {
        warnCount++;
        lines.push(
          `  ${chalk.yellow('⚠')} ${result.id}: ${result.message} ${chalk.gray(`(${result.rule})`)}`
        );
      }
    }

    lines.push('');
  }

  const total = errorCount + warnCount;
  const parts: string[] = [];
  if (errorCount > 0)
    parts.push(chalk.red(`${String(errorCount)} error${errorCount !== 1 ? 's' : ''}`));
  if (warnCount > 0)
    parts.push(chalk.yellow(`${String(warnCount)} warning${warnCount !== 1 ? 's' : ''}`));
  lines.push(`${String(total)} problem${total !== 1 ? 's' : ''} (${parts.join(', ')})`);

  return lines.join('\n');
}
