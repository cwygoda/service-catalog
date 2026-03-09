import { describe, it, expect } from 'vitest';
import { parseUseCaseMarkdown, markdownToUseCase } from './markdown.parser.js';

const EXAMPLE_MD = `---
id: order-data
name: Order Data Products
domain: data-delivery
participants:
  - service: catalog-ui
    role: frontend
---

# Overview
Customer browses and orders satellite data.

\`\`\`bpmn
process: order-data
  task: browse
    name: "Browse Products"
    type: user
    service: catalog-ui
    doc: browsing

  task: validate-order
    name: "Validate Order"
    type: service
    service: catalog-order-service
    doc: order-validation
\`\`\`

## Browsing {#browsing}

Detailed explanation of the browsing step...

## Order Validation {#order-validation}

The order service checks inventory...
`;

describe('parseUseCaseMarkdown', () => {
  it('extracts frontmatter', () => {
    const result = parseUseCaseMarkdown(EXAMPLE_MD);
    expect(result.frontmatter.id).toBe('order-data');
    expect(result.frontmatter.name).toBe('Order Data Products');
    expect(result.frontmatter.domain).toBe('data-delivery');
    expect(result.frontmatter.participants).toHaveLength(1);
    expect(result.frontmatter.participants?.[0]?.service).toBe('catalog-ui');
  });

  it('extracts bpmn blocks', () => {
    const result = parseUseCaseMarkdown(EXAMPLE_MD);
    expect(result.bpmnBlocks).toHaveLength(1);
    expect(result.bpmnBlocks[0]).toContain('process: order-data');
    expect(result.bpmnBlocks[0]).toContain('task: browse');
  });

  it('strips bpmn from content', () => {
    const result = parseUseCaseMarkdown(EXAMPLE_MD);
    expect(result.content).not.toContain('```bpmn');
    expect(result.content).toContain('## Browsing');
    expect(result.content).toContain('## Order Validation');
  });

  it('extracts description from # Overview', () => {
    const result = parseUseCaseMarkdown(EXAMPLE_MD);
    expect(result.description).toBe('Customer browses and orders satellite data.');
  });

  it('extracts description from first paragraph when no overview', () => {
    const md = `---
id: test
name: Test
---

First paragraph of description.

## Section
Details...
`;
    const result = parseUseCaseMarkdown(md);
    expect(result.description).toBe('First paragraph of description.');
  });

  it('handles missing bpmn blocks', () => {
    const md = `---
id: simple
name: Simple
---

Just prose content.
`;
    const result = parseUseCaseMarkdown(md);
    expect(result.bpmnBlocks).toHaveLength(0);
    expect(result.content).toBe('Just prose content.');
  });

  it('throws on invalid frontmatter', () => {
    const md = `---
name: Missing ID
---

Content
`;
    expect(() => parseUseCaseMarkdown(md)).toThrow('Invalid use-case.md frontmatter');
  });
});

describe('markdownToUseCase', () => {
  it('creates UseCase from parsed markdown', () => {
    const parsed = parseUseCaseMarkdown(EXAMPLE_MD);
    const useCase = markdownToUseCase(parsed);
    expect(useCase.id).toBe('order-data');
    expect(useCase.name).toBe('Order Data Products');
    expect(useCase.domain).toBe('data-delivery');
    expect(useCase.description).toBe('Customer browses and orders satellite data.');
    expect(useCase.steps).toEqual([]);
    expect(useCase.content).toBeTruthy();
  });

  it('derives participants from service refs', () => {
    const parsed = parseUseCaseMarkdown(EXAMPLE_MD);
    const useCase = markdownToUseCase(parsed, {
      serviceRefs: [
        { elementId: 'browse', serviceId: 'catalog-ui' },
        { elementId: 'validate', serviceId: 'catalog-order-service' },
      ],
    });
    // catalog-ui overridden by frontmatter (role: frontend)
    // catalog-order-service derived (role: bpmn-participant)
    expect(useCase.participants).toHaveLength(2);

    const uiParticipant = useCase.participants.find((p) => p.service === 'catalog-ui');
    expect(uiParticipant?.role).toBe('frontend');

    const orderParticipant = useCase.participants.find(
      (p) => p.service === 'catalog-order-service'
    );
    expect(orderParticipant?.role).toBe('bpmn-participant');
  });

  it('passes through bpmn XML and links', () => {
    const parsed = parseUseCaseMarkdown(EXAMPLE_MD);
    const docLinks = [{ elementId: 'browse', anchor: 'browsing' }];
    const serviceRefs = [{ elementId: 'browse', serviceId: 'catalog-ui' }];
    const useCase = markdownToUseCase(parsed, {
      bpmnXml: '<xml/>',
      docLinks,
      serviceRefs,
    });
    expect(useCase.bpmn).toBe('<xml/>');
    expect(useCase.docLinks).toEqual(docLinks);
    expect(useCase.serviceRefs).toEqual(serviceRefs);
  });

  it('accepts steps via options', () => {
    const parsed = parseUseCaseMarkdown(EXAMPLE_MD);
    const steps = [
      { sequence: 1, action: 'Browse Products', service: 'catalog-ui' },
      { sequence: 2, action: 'Validate Order', service: 'catalog-order-service' },
    ];
    const useCase = markdownToUseCase(parsed, { steps });
    expect(useCase.steps).toEqual(steps);
  });
});
