import { access, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

import { upsertManagedBlock } from './managed-block.mjs';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export const HOST_ADAPTERS = {
  codex: {
    label: 'Codex',
    entryFile: 'AGENTS.md',
    skillsDir: '.agents/skills',
    thinEntryId: 'fe-harness-agent-entry',
  },
  opencode: {
    label: 'OpenCode',
    entryFile: 'AGENTS.md',
    skillsDir: '.agents/skills',
    thinEntryId: 'fe-harness-agent-entry',
  },
  claude: {
    label: 'Claude Code',
    entryFile: 'CLAUDE.md',
    skillsDir: '.claude/skills',
    thinEntryId: 'fe-harness-agent-entry',
  },
  cursor: {
    label: 'Cursor',
    entryFile: '.cursor/rules/fe-harness.mdc',
    skillsDir: '.agents/skills',
    thinEntryId: 'fe-harness-agent-entry',
    alwaysApplied: true,
  },
  trae: {
    label: 'Trae',
    entryFile: null,
    skillsDir: '.trae/skills',
    thinEntryId: 'fe-harness-agent-entry',
    note: 'Trae 路径需在执行时核验，不创建推测路径',
  },
};

export function getSupportedHosts() {
  return Object.keys(HOST_ADAPTERS);
}

export function detectHosts(cwd) {
  const found = [];
  for (const [key, adapter] of Object.entries(HOST_ADAPTERS)) {
    if (!adapter.entryFile) {
      if (exists(resolve(cwd, '.trae'))) found.push(key);
      continue;
    }
    if (exists(resolve(cwd, adapter.entryFile))) found.push(key);
  }
  return found;
}

const THIN_ENTRY_CONTENT = `## Project AI Harness

先阅读 \`.fe-harness/project.yaml\` 和 \`.fe-harness/rules/project-rules.md\`。按 project.yaml 的 commands 和 verify 配置选择已验证的命令；未知项保持 MANUAL。Agent 工作流 Skills 位于 \`${'{skillsDir}'}\`。`;

export async function installThinEntry(cwd, host) {
  const adapter = HOST_ADAPTERS[host];
  if (!adapter) throw new Error(`不支持的宿主：${host}`);
  if (!adapter.entryFile) {
    return { action: 'manual', host, message: adapter.note };
  }

  const entryPath = resolve(cwd, adapter.entryFile);
  await mkdir(dirname(entryPath), { recursive: true });

  const content = THIN_ENTRY_CONTENT.replace('{skillsDir}', adapter.skillsDir);
  const result = await upsertManagedBlock(entryPath, adapter.thinEntryId, content);

  return {
    action: result.action,
    host,
    target: adapter.entryFile,
  };
}

export async function installAllThinEntries(cwd, hosts) {
  const results = [];
  const targetHosts = hosts || getSupportedHosts();
  for (const host of targetHosts) {
    results.push(await installThinEntry(cwd, host));
  }
  return results;
}

export async function validateHostAdapters(cwd) {
  const issues = [];
  for (const [key, adapter] of Object.entries(HOST_ADAPTERS)) {
    if (!adapter.entryFile) continue;
    const entryPath = resolve(cwd, adapter.entryFile);
    if (!(await exists(entryPath))) {
      issues.push({
        code: 'HOST_ADAPTER_MISSING',
        host: key,
        message: `缺少宿主入口：${adapter.entryFile}`,
      });
      continue;
    }
    const content = await readFile(entryPath, 'utf8');
    if (!content.includes('fe-harness:start') && !content.includes('fe-harness-agent-entry')) {
      issues.push({
        code: 'HOST_ADAPTER_NO_MANAGED_BLOCK',
        host: key,
        message: `${adapter.entryFile} 缺少 fe-harness 受管块`,
      });
    }
  }
  return issues;
}
