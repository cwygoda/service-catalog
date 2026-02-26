import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import type { CatalogLoaderPort } from '../../ports/catalog-loader.port.js';
import type { Catalog } from '../../domain/catalog.js';
import type { Service } from '../../domain/service.js';
import type { UseCase } from '../../domain/use-case.js';
import type { Domain } from '../../domain/domain.js';
import { createCatalog } from '../../domain/catalog.js';
import {
  parseToml,
  sidecarToService,
  parseUseCaseToml,
  sidecarToUseCase,
  parseDomainToml,
  sidecarToDomain,
} from '../parsers/toml.parser.js';
import { parseBpmnTxt } from '../parsers/bpmn-txt.parser.js';
import { parseUseCaseMarkdown, markdownToUseCase } from '../parsers/markdown.parser.js';
import {
  parse as parseBpmnTxtAst,
  toBpmnXmlAsync,
  extractDocLinks,
  extractServiceRefs,
} from 'bpmn-txt';
import type { DocLink, ServiceRef } from '../../domain/use-case.js';
import type { BpmnLintLevel } from '../../schemas/catalog-config.schema.js';

const SERVICE_FILENAME = 'service.toml';
const USE_CASE_FILENAME = 'use-case.toml';
const USE_CASE_MD_FILENAME = 'use-case.md';
const DOMAIN_FILENAME = 'domain.toml';

export interface LoaderOptions {
  bpmnLint?: BpmnLintLevel;
}

async function findFiles(dir: string, filename: string): Promise<string[]> {
  const files: string[] = [];

  async function walk(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && entry.name === filename) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

export class FilesystemLoader implements CatalogLoaderPort {
  private options: LoaderOptions;

  constructor(options: LoaderOptions = {}) {
    this.options = options;
  }

  async load(path: string): Promise<Catalog> {
    const stats = await stat(path);

    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${path}`);
    }

    // Load services
    const serviceFiles = await findFiles(path, SERVICE_FILENAME);
    const services: Service[] = [];

    for (const filePath of serviceFiles) {
      const content = await readFile(filePath, 'utf-8');
      const sidecar = parseToml(content, filePath);
      services.push(sidecarToService(sidecar));
    }

    // Load use cases (markdown takes precedence over TOML per directory)
    const useCaseTomlFiles = await findFiles(path, USE_CASE_FILENAME);
    const useCaseMdFiles = await findFiles(path, USE_CASE_MD_FILENAME);

    // Build set of directories with markdown use cases
    const mdDirs = new Set(useCaseMdFiles.map((f) => dirname(f)));

    const useCases: UseCase[] = [];

    // Load markdown use cases
    for (const filePath of useCaseMdFiles) {
      const useCase = await this.loadMarkdownUseCase(filePath);
      useCases.push(useCase);
    }

    // Load TOML use cases (skip dirs that have markdown)
    for (const filePath of useCaseTomlFiles) {
      if (mdDirs.has(dirname(filePath))) continue;

      const content = await readFile(filePath, 'utf-8');
      const sidecar = parseUseCaseToml(content, filePath);
      const useCase = sidecarToUseCase(sidecar);

      const processedUseCase = await this.processBpmnSource(useCase, dirname(filePath));
      useCases.push(processedUseCase);
    }

    // Load domains
    const domainFiles = await findFiles(path, DOMAIN_FILENAME);
    const domains: Domain[] = [];

    for (const filePath of domainFiles) {
      const content = await readFile(filePath, 'utf-8');
      const sidecar = parseDomainToml(content, filePath);
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
      }
    }

    const options: { bpmnXml?: string; docLinks?: DocLink[]; serviceRefs?: ServiceRef[] } = {};
    if (bpmnXml) options.bpmnXml = bpmnXml;
    if (docLinks) options.docLinks = docLinks;
    if (serviceRefs) options.serviceRefs = serviceRefs;

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
    const result = await parseBpmnTxt(content, filePath, lintLevel);
    return { ...useCase, bpmn: result.xml };
  }
}

export function createFilesystemLoader(options?: LoaderOptions): CatalogLoaderPort {
  return new FilesystemLoader(options);
}
