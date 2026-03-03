import { describe, it, expect } from 'vitest';
import { parse } from '@cwygoda/bpmn-txt';
import { extractSteps } from './bpmn-steps.js';

function stepsFrom(bpmnTxt: string) {
  const { document } = parse(bpmnTxt);
  if (!document) throw new Error('Parse failed');
  return extractSteps(document);
}

describe('extractSteps', () => {
  it('linear process → steps in order', () => {
    const steps = stepsFrom(`
process: linear
  start: s
    -> a
  task: a
    name: "First"
    service: svc-a
    -> b
  task: b
    name: "Second"
    -> c
  task: c
    name: "Third"
    service: svc-c
    -> e
  end: e
`);
    expect(steps).toEqual([
      { sequence: 1, action: 'First', service: 'svc-a' },
      { sequence: 2, action: 'Second' },
      { sequence: 3, action: 'Third', service: 'svc-c' },
    ]);
  });

  it('process with pools → steps across all pools', () => {
    const steps = stepsFrom(`
process: pooled
  pool: customer
    lane: web
      start: s
        -> browse
      task: browse
        name: "Browse"
        -> finish
  pool: backend
    task: process-order
      name: "Process Order"
      -> done
    end: done
  end: finish
`);
    expect(steps).toHaveLength(2);
    const actions = steps.map((s) => s.action);
    expect(actions).toContain('Browse');
    expect(actions).toContain('Process Order');
  });

  it('process with gateways → tasks from both branches', () => {
    const steps = stepsFrom(`
process: gw
  start: s
    -> g1
  gateway: g1
    type: exclusive
    -> a
    -> b
  task: a
    name: "Branch A"
    -> g2
  task: b
    name: "Branch B"
    -> g2
  gateway: g2
    type: exclusive
    -> c
  task: c
    name: "After Merge"
    -> e
  end: e
`);
    expect(steps).toHaveLength(3);
    // a and b both before c
    const cStep = steps.find((s) => s.action === 'After Merge');
    const aStep = steps.find((s) => s.action === 'Branch A');
    const bStep = steps.find((s) => s.action === 'Branch B');
    expect(cStep).toBeDefined();
    expect(aStep).toBeDefined();
    expect(bStep).toBeDefined();
    expect(aStep?.sequence).toBeLessThan(cStep?.sequence ?? 0);
    expect(bStep?.sequence).toBeLessThan(cStep?.sequence ?? 0);
  });

  it('process with no tasks → empty steps', () => {
    const steps = stepsFrom(`
process: empty
  start: s
    -> e
  end: e
`);
    expect(steps).toEqual([]);
  });

  it('tasks without name → uses id as action', () => {
    const steps = stepsFrom(`
process: noname
  start: s
    -> do-thing
  task: do-thing
    -> e
  end: e
`);
    expect(steps).toEqual([{ sequence: 1, action: 'do-thing' }]);
  });
});
