import matter from 'gray-matter';
import { TypeCompiler } from '@sinclair/typebox/compiler';
import { UseCaseMarkdownFrontmatterSchema } from '../../schemas/use-case.schema.js';
import type { UseCase, Participant, DocLink, ServiceRef } from '../../domain/use-case.js';

const FrontmatterCheck = TypeCompiler.Compile(UseCaseMarkdownFrontmatterSchema);

export interface ParsedUseCaseMarkdown {
  frontmatter: {
    id: string;
    name: string;
    domain?: string;
    participants?: Participant[];
  };
  bpmnBlocks: string[];
  content: string;
  description: string;
}

const BPMN_FENCE_RE = /```bpmn\s*\n([\s\S]*?)```/g;

/** Parse use-case.md — pure string parsing, no I/O */
export function parseUseCaseMarkdown(raw: string): ParsedUseCaseMarkdown {
  const { data, content: bodyWithBpmn } = matter(raw);

  if (!FrontmatterCheck.Check(data)) {
    const errors = [...FrontmatterCheck.Errors(data)];
    const msg = errors.map((e) => `${e.path}: ${e.message}`).join('; ');
    throw new Error(`Invalid use-case.md frontmatter: ${msg}`);
  }

  // Extract bpmn fenced blocks
  const bpmnBlocks: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = BPMN_FENCE_RE.exec(bodyWithBpmn)) !== null) {
    if (match[1] !== undefined) bpmnBlocks.push(match[1]);
  }

  // Strip bpmn blocks from content
  const content = bodyWithBpmn.replace(BPMN_FENCE_RE, '').trim();

  // Extract description: first paragraph or # Overview section
  const description = extractDescription(content);

  return {
    frontmatter: data,
    bpmnBlocks,
    content,
    description,
  };
}

function extractDescription(content: string): string {
  // Try # Overview section first
  const overviewMatch = /^#\s+Overview\s*\n([\s\S]*?)(?=\n#\s|\n$|$)/m.exec(content);
  if (overviewMatch?.[1]) {
    return overviewMatch[1].trim();
  }

  // Fallback: first paragraph (text before first blank line or heading)
  const firstPara = /^([^\n#][^\n]*(?:\n(?![#\n])[^\n]*)*)/.exec(content);
  return firstPara?.[1]?.trim() ?? '';
}

/** Convert parsed markdown to UseCase domain object */
export function markdownToUseCase(
  parsed: ParsedUseCaseMarkdown,
  options?: {
    bpmnXml?: string;
    docLinks?: DocLink[];
    serviceRefs?: ServiceRef[];
  }
): UseCase {
  const { frontmatter, content, description } = parsed;

  // Derive participants from service refs
  const derivedParticipants: Participant[] = [];
  if (options?.serviceRefs) {
    const seen = new Set<string>();
    for (const ref of options.serviceRefs) {
      if (!seen.has(ref.serviceId)) {
        seen.add(ref.serviceId);
        derivedParticipants.push({
          service: ref.serviceId,
          role: 'bpmn-participant',
        });
      }
    }
  }

  // Merge: frontmatter participants override derived ones
  const overrides = frontmatter.participants ?? [];
  const overrideServices = new Set(overrides.map((p) => p.service));
  const participants = [
    ...derivedParticipants.filter((p) => !overrideServices.has(p.service)),
    ...overrides,
  ];

  const useCase: UseCase = {
    id: frontmatter.id,
    name: frontmatter.name,
    description,
    participants,
    steps: [],
  };

  if (frontmatter.domain) useCase.domain = frontmatter.domain;
  if (options?.bpmnXml) useCase.bpmn = options.bpmnXml;
  if (content) useCase.content = content;
  if (options?.docLinks?.length) useCase.docLinks = options.docLinks;
  if (options?.serviceRefs?.length) useCase.serviceRefs = options.serviceRefs;

  return useCase;
}
