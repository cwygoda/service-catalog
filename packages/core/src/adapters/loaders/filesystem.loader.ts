import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import type { CatalogLoaderPort } from '../../ports/catalog-loader.port.js';
import type { Catalog } from '../../domain/catalog.js';
import type { Service } from '../../domain/service.js';
import type { UseCase } from '../../domain/use-case.js';
import type { Domain } from '../../domain/domain.js';
import { createCatalog } from '../../domain/catalog.js';
import { parseToml, parseUseCaseToml, parseDomainToml } from '../parsers/toml.parser.js';
import { parseYaml, parseUseCaseYaml, parseDomainYaml } from '../parsers/yaml.parser.js';
import {
  sidecarToService,
  sidecarToUseCase,
  sidecarToDomain,
} from '../parsers/sidecar.transforms.js';
import { parseBpmnTxt } from '../parsers/bpmn-txt.parser.js';
import { parseUseCaseMarkdown, markdownToUseCase } from '../parsers/markdown.parser.js';
import { extractSteps } from '../parsers/bpmn-steps.js';
import {
  parse as parseBpmnTxtAst,
  toBpmnXmlAsync,
  extractDocLinks,
  extractServiceRefs,
  lint,
} from '@cwygoda/bpmn-txt';
import type { LinterConfig, LintResult } from '@cwygoda/bpmn-txt';
import type { DocLink, ServiceRef, Step } from '../../domain/use-case.js';
import type { BpmnLintLevel } from '../../schemas/catalog-config.schema.js';

// Filenames in priority order (first match wins per directory)
const SERVICE_FILES = ['service.yaml', 'service.toml'] as const;
const USE_CASE_FILES = ['use-case.md', 'use-case.yaml', 'use-case.toml'] as const;
const DOMAIN_FILES = ['domain.yaml', 'domain.toml'] as const;

export interface LoaderOptions {
  bpmnLint?: BpmnLintLevel;
  bpmnLintConfig?: LinterConfig;
}

export interface LintDiagnostic {
  filePath: string;
  results: LintResult[];
}

export interface LoadResult {
  catalog: Catalog;
  lintDiagnostics: LintDiagnostic[];
}

/**
 * Walk directory tree, returning at most one match per directory
 * based on priority order of filenames.
 */
async function findFilesWithPriority(dir: string, filenames: readonly string[]): Promise<string[]> {
  const results: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });
    const entryNames = new Set<string>();

    for (const entry of entries) {
      if (entry.isDirectory()) {
        await walk(join(currentDir, entry.name));
      } else if (entry.isFile()) {
        entryNames.add(entry.name);
      }
    }

    // Pick highest-priority match
    for (const candidate of filenames) {
      if (entryNames.has(candidate)) {
        results.push(join(currentDir, candidate));
        break;
      }
    }
  }

  await walk(dir);
  return results;
}

export class FilesystemLoader implements CatalogLoaderPort {
  private options: LoaderOptions;
  private lintDiagnostics: LintDiagnostic[] = [];

  constructor(options: LoaderOptions = {}) {
    this.options = options;
  }

  async loadWithDiagnostics(path: string): Promise<LoadResult> {
    this.lintDiagnostics = [];
    const catalog = await this.load(path);
    return { catalog, lintDiagnostics: this.lintDiagnostics };
  }

  async load(path: string): Promise<Catalog> {
    const stats = await stat(path);

    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${path}`);
    }

    // Load services (yaml > toml)
    const serviceFiles = await findFilesWithPriority(path, SERVICE_FILES);
    const services: Service[] = [];

    for (const filePath of serviceFiles) {
      const content = await readFile(filePath, 'utf-8');
      const sidecar =
        extname(filePath) === '.yaml' ? parseYaml(content, filePath) : parseToml(content, filePath);
      services.push(sidecarToService(sidecar));
    }

    // Load use cases (md > yaml > toml)
    const useCaseFiles = await findFilesWithPriority(path, USE_CASE_FILES);
    const useCases: UseCase[] = [];

    for (const filePath of useCaseFiles) {
      const ext = extname(filePath);

      if (ext === '.md') {
        const useCase = await this.loadMarkdownUseCase(filePath);
        useCases.push(useCase);
      } else {
        const content = await readFile(filePath, 'utf-8');
        const sidecar =
          ext === '.yaml'
            ? parseUseCaseYaml(content, filePath)
            : parseUseCaseToml(content, filePath);
        const useCase = sidecarToUseCase(sidecar);
        const processedUseCase = await this.processBpmnSource(useCase, dirname(filePath));
        useCases.push(processedUseCase);
      }
    }

    // Load domains (yaml > toml)
    const domainFiles = await findFilesWithPriority(path, DOMAIN_FILES);
    const domains: Domain[] = [];

    for (const filePath of domainFiles) {
      const content = await readFile(filePath, 'utf-8');
      const sidecar =
        extname(filePath) === '.yaml'
          ? parseDomainYaml(content, filePath)
          : parseDomainToml(content, filePath);
      domains.push(sidecarToDomain(sidecar));
    }

    return createCatalog(services, useCases, domains);
  }

  private async loadMarkdownUseCase(filePath: string): Promise<UseCase> {
    const raw = await readFile(filePath, 'utf-8');
    const parsed = parseUseCaseMarkdown(raw);

    let bpmnXml: string | undefined;
    let docLinks: DocLink[] | undefined;
    let serviceRefs: ServiceRef[] | undefined;
    let steps: Step[] | undefined;

    if (parsed.bpmnBlocks.length > 0) {
      const bpmnContent = parsed.bpmnBlocks[0] ?? '';
      const parseResult = parseBpmnTxtAst(bpmnContent);

      if (parseResult.errors.length > 0) {
        console.warn(`BPMN parse errors in ${filePath}:`);
        for (const err of parseResult.errors) {
          console.warn(`  Line ${String(err.line)}:${String(err.column)}: ${err.message}`);
        }
      }

      if (parseResult.document) {
        bpmnXml = await toBpmnXmlAsync(parseResult.document, { includeDiagram: true });
        docLinks = extractDocLinks(parseResult.document);
        serviceRefs = extractServiceRefs(parseResult.document);
        steps = extractSteps(parseResult.document);

        if (bpmnXml && this.options.bpmnLint !== 'off') {
          const lintResults = await lint(bpmnXml, this.options.bpmnLintConfig);
          if (lintResults.length > 0) {
            this.lintDiagnostics.push({ filePath, results: lintResults });
          }
        }
      }
    }

    const options: {
      bpmnXml?: string;
      docLinks?: DocLink[];
      serviceRefs?: ServiceRef[];
      steps?: Step[];
    } = {};
    if (bpmnXml) options.bpmnXml = bpmnXml;
    if (docLinks) options.docLinks = docLinks;
    if (serviceRefs) options.serviceRefs = serviceRefs;
    if (steps?.length) options.steps = steps;

    return markdownToUseCase(parsed, options);
  }

  private async processBpmnSource(useCase: UseCase, useCaseDir: string): Promise<UseCase> {
    if (!useCase.bpmnSource) {
      return useCase;
    }

    const source = useCase.bpmnSource;

    if (source.type === 'xml') {
      return useCase;
    }

    // source.type === 'bpmn-txt'
    let content: string;
    let filePath: string;

    if (source.content) {
      content = source.content;
      filePath = `${useCase.id} (inline bpmn)`;
    } else if (source.path) {
      const resolvedPath = join(useCaseDir, source.path);
      content = await readFile(resolvedPath, 'utf-8');
      filePath = source.path;
    } else {
      return useCase;
    }

    const lintLevel = this.options.bpmnLint ?? 'warn';
    const result = await parseBpmnTxt(content, filePath, lintLevel, this.options.bpmnLintConfig);
    if (result.lintResults.length > 0) {
      this.lintDiagnostics.push({ filePath, results: result.lintResults });
    }
    return { ...useCase, bpmn: result.xml };
  }
}

export function createFilesystemLoader(options?: LoaderOptions): CatalogLoaderPort {
  return new FilesystemLoader(options);
}
