import { describe, it, expect } from 'vitest';
import { detectBpmnTxtContent, parseBpmnTxt, BpmnTxtParseError } from './bpmn-txt.parser.js';

describe('bpmn-txt.parser', () => {
  describe('detectBpmnTxtContent', () => {
    it('detects process: prefix', () => {
      expect(detectBpmnTxtContent('process: my-process\n')).toBe(true);
    });

    it('detects collaboration: prefix', () => {
      expect(detectBpmnTxtContent('collaboration: my-collab\n')).toBe(true);
    });

    it('handles whitespace before content', () => {
      expect(detectBpmnTxtContent('  \n  process: test\n')).toBe(true);
    });

    it('returns false for XML content', () => {
      expect(detectBpmnTxtContent('<?xml version="1.0"?>\n<bpmn:definitions')).toBe(false);
    });

    it('returns false for file paths', () => {
      expect(detectBpmnTxtContent('/bpmn/checkout.bpmn')).toBe(false);
    });

    it('returns false for empty content', () => {
      expect(detectBpmnTxtContent('')).toBe(false);
    });
  });

  describe('parseBpmnTxt', () => {
    it('parses valid bpmn-txt to XML', async () => {
      const input = `process: test
  start: begin
    -> finish
  end: finish
`;
      const result = await parseBpmnTxt(input, 'test.bpmn.txt', 'off');
      expect(result.xml).toContain('<?xml');
      expect(result.xml).toContain('bpmn:definitions');
      expect(result.xml).toContain('bpmn:startEvent');
      expect(result.xml).toContain('bpmn:endEvent');
    });

    it('returns lint results when linting enabled', async () => {
      const input = `process: test
  task: lonely-task
    name: "No connections"
`;
      const result = await parseBpmnTxt(input, 'test.bpmn.txt', 'warn');
      expect(result.lintResults.length).toBeGreaterThan(0);
    });

    it('skips linting when lint level is off', async () => {
      const input = `process: test
  task: lonely-task
`;
      const result = await parseBpmnTxt(input, 'test.bpmn.txt', 'off');
      expect(result.lintResults).toHaveLength(0);
    });

    it('throws BpmnTxtParseError for invalid syntax', async () => {
      const input = `invalid syntax here`;
      await expect(parseBpmnTxt(input, 'bad.bpmn.txt', 'off')).rejects.toThrow(BpmnTxtParseError);
    });

    it('includes file path in parse error', async () => {
      const input = `process: test
  invalid-keyword: foo
`;
      try {
        await parseBpmnTxt(input, 'my-file.bpmn.txt', 'off');
        expect.fail('Should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(BpmnTxtParseError);
        expect((e as BpmnTxtParseError).filePath).toBe('my-file.bpmn.txt');
      }
    });
  });
});
