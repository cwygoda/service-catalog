import type { Document, FlowNode, SequenceFlow, Task } from '@cwygoda/bpmn-txt';
import type { Step } from '../../domain/use-case.js';

interface Collected {
  tasks: Map<string, Task>;
  flows: SequenceFlow[];
}

function collectFromNodes(nodes: FlowNode[] | undefined, out: Collected): void {
  if (!nodes) return;
  for (const node of nodes) {
    if (node.type === 'task' && node.id) {
      out.tasks.set(node.id, node);
    }
    if (node.type === 'subprocess' && node.elements) {
      collectFromNodes(node.elements, out);
    }
  }
}

function collectFromDocument(doc: Document): Collected {
  const out: Collected = { tasks: new Map(), flows: [] };
  for (const process of doc.processes) {
    collectFromNodes(process.elements, out);
    if (process.sequenceFlows) out.flows.push(...process.sequenceFlows);
    if (process.pools) {
      for (const pool of process.pools) {
        collectFromNodes(pool.elements, out);
        if (pool.sequenceFlows) out.flows.push(...pool.sequenceFlows);
        if (pool.lanes) {
          for (const lane of pool.lanes) {
            collectFromNodes(lane.elements, out);
            if (lane.sequenceFlows) out.flows.push(...lane.sequenceFlows);
          }
        }
      }
    }
  }
  return out;
}

/** Extract steps from BPMN AST — tasks ordered by sequence flow topology */
export function extractSteps(doc: Document): Step[] {
  const { tasks, flows } = collectFromDocument(doc);
  if (tasks.size === 0) return [];

  // Build adjacency: nodeId → list of target nodeIds
  const adj = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  for (const id of tasks.keys()) {
    inDegree.set(id, 0);
  }

  for (const flow of flows) {
    const targets = adj.get(flow.from);
    if (targets) {
      targets.push(flow.to);
    } else {
      adj.set(flow.from, [flow.to]);
    }
  }

  // Resolve transitive edges through non-task nodes (events, gateways)
  // so we get direct task→task ordering.
  const taskAdj = new Map<string, Set<string>>();
  for (const id of tasks.keys()) {
    taskAdj.set(id, new Set());
  }

  // BFS from each task to find reachable next tasks
  for (const taskId of tasks.keys()) {
    const visited = new Set<string>();
    const bfsQueue = [taskId];
    visited.add(taskId);
    const neighbors = taskAdj.get(taskId) ?? new Set();

    while (bfsQueue.length > 0) {
      const current = bfsQueue.shift() ?? '';
      const targets = adj.get(current) ?? [];
      for (const target of targets) {
        if (visited.has(target)) continue;
        visited.add(target);
        if (tasks.has(target)) {
          neighbors.add(target);
        } else {
          bfsQueue.push(target);
        }
      }
    }
  }

  // Compute in-degree for topological sort over tasks only
  for (const [, targets] of taskAdj) {
    for (const target of targets) {
      inDegree.set(target, (inDegree.get(target) ?? 0) + 1);
    }
  }

  // Kahn's algorithm
  const topoQueue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) topoQueue.push(id);
  }

  const ordered: string[] = [];
  while (topoQueue.length > 0) {
    const id = topoQueue.shift() ?? '';
    ordered.push(id);
    for (const target of taskAdj.get(id) ?? []) {
      const newDeg = (inDegree.get(target) ?? 1) - 1;
      inDegree.set(target, newDeg);
      if (newDeg === 0) topoQueue.push(target);
    }
  }

  // Any tasks not reached by topo sort (disconnected) — append at end
  const orderedSet = new Set(ordered);
  for (const id of tasks.keys()) {
    if (!orderedSet.has(id)) ordered.push(id);
  }

  return ordered.map((id, i) => {
    const task = tasks.get(id);
    const step: Step = {
      sequence: i + 1,
      action: task?.name ?? id,
    };
    if (task?.service) step.service = task.service;
    return step;
  });
}
