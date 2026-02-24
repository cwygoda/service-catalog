import { parse, toBpmnXmlAsync, lint, type ParseError, type LintResult } from 'bpmn-txt';
import type { BpmnLintLevel } from '../../schemas/catalog-config.schema.js';

export interface BpmnTxtParseResult {
  xml: string;
  lintResults: LintResult[];
}

export class BpmnTxtParseError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly errors: ParseError[]
  ) {
    super(message);
    this.name = 'BpmnTxtParseError';
  }

  override toString(): string {
    const errorDetails = this.errors
      .map((e) => `  Line ${String(e.line)}:${String(e.column)}: ${e.message}`)
      .join('\n');
    return `${this.name}: ${this.message} at ${this.filePath}\n${errorDetails}`;
  }
}

export class BpmnLintError extends Error {
  constructor(
    message: string,
    public readonly filePath: string,
    public readonly results: LintResult[]
  ) {
    super(message);
    this.name = 'BpmnLintError';
  }

  override toString(): string {
    const errorDetails = this.results
      .map((r) => `  [${r.category}] ${r.id}: ${r.message} (${r.rule})`)
      .join('\n');
    return `${this.name}: ${this.message} at ${this.filePath}\n${errorDetails}`;
  }
}

export function detectBpmnTxtContent(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith('process:') || trimmed.startsWith('collaboration:');
}

export async function parseBpmnTxt(
  content: string,
  filePath: string,
  lintLevel: BpmnLintLevel = 'warn'
): Promise<BpmnTxtParseResult> {
  const result = parse(content);

  if (result.errors.length > 0 || !result.document) {
    throw new BpmnTxtParseError('Failed to parse bpmn-txt', filePath, result.errors);
  }

  const xml = await toBpmnXmlAsync(result.document, { includeDiagram: true });

  let lintResults: LintResult[] = [];
  if (lintLevel !== 'off') {
    lintResults = await lint(xml);

    if (lintLevel === 'error') {
      const errors = lintResults.filter((r) => r.category === 'error');
      if (errors.length > 0) {
        throw new BpmnLintError('BPMN lint errors found', filePath, errors);
      }
    }
  }

  return { xml, lintResults };
}
