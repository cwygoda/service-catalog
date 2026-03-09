import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { LinterConfig } from '@cwygoda/bpmn-txt';

export async function resolveBpmnlintrc(configPath?: string): Promise<LinterConfig | undefined> {
  const filePath = configPath ? resolve(configPath) : resolve('.bpmnlintrc');

  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as LinterConfig;
  } catch {
    return undefined;
  }
}
