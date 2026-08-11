import { access, readFile } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';

import { parseManagedBlocks, extractManagedBlockIds, findDuplicateIds, findUnclosedBlocks } from './managed-block.mjs';
import { validateRules } from './rules.mjs';
import { validateHostAdapters, HOST_ADAPTERS } from './host-adapters.mjs';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

const FORBIDDEN_PATHS = ['.ai-harness/', '.spec/', '.codebase-memory/', '.planning/codebase/'];

export async function validateHarness(cwd) {
  const issues = [];

  for (const forbidden of FORBIDDEN_PATHS) {
    if (await exists(resolve(cwd, forbidden))) {
      issues.push({ code: 'FORBIDDEN_PATH', severity: 'error', path: forbidden, message: `禁止存在的路径：${forbidden}` });
    }
  }

  const rulesValidation = await validateRules(cwd);
  for (const issue of rulesValidation) {
    issues.push({ ...issue, severity: issue.code.includes('MISSING') ? 'error' : 'warning', group: 'rules' });
  }

  const hostValidation = await validateHostAdapters(cwd);
  for (const issue of hostValidation) {
    issues.push({ ...issue, severity: 'warning', group: 'adapters' });
  }

  const entryFiles = [
    { path: 'AGENTS.md', hosts: ['codex', 'opencode'] },
    { path: 'CLAUDE.md', hosts: ['claude'] },
    { path: '.cursor/rules/fe-harness.mdc', hosts: ['cursor'] },
  ];

  for (const { path, hosts } of entryFiles) {
    const fullPath = resolve(cwd, path);
    if (!(await exists(fullPath))) continue;

    const content = await readFile(fullPath, 'utf8');
    const blocks = parseManagedBlocks(content);

    const duplicates = findDuplicateIds(content);
    if (duplicates.length) {
      issues.push({ code: 'DUPLICATE_MANAGED_BLOCK', severity: 'error', file: path, message: `重复受管块 ID：${duplicates.join(', ')}` });
    }

    const unclosed = findUnclosedBlocks(content);
    if (unclosed > 0) {
      issues.push({ code: 'UNCLOSED_MANAGED_BLOCK', severity: 'error', file: path, message: `未闭合受管块：${unclosed} 个` });
    }

    for (const host of hosts) {
      const adapter = HOST_ADAPTERS[host];
      const hasId = blocks.some((b) => b.id === adapter?.thinEntryId);
      if (!hasId) {
        issues.push({
          code: 'HOST_ENTRY_MISSING_BLOCK',
          severity: 'warning',
          file: path,
          host,
          message: `${path} 缺少 ${adapter?.thinEntryId || 'fe-harness'} 受管块`,
        });
      }
    }
  }

  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const markdownFiles = ['.fe-harness/rules/project-rules.md', 'AGENTS.md', 'CLAUDE.md'];
  for (const file of markdownFiles) {
    const fullPath = resolve(cwd, file);
    if (!(await exists(fullPath))) continue;
    const content = await readFile(fullPath, 'utf8');
    let linkMatch;
    while ((linkMatch = linkRegex.exec(content)) !== null) {
      const target = linkMatch[2];
      if (target.startsWith('http') || target.startsWith('#')) continue;
      const targetPath = resolve(dirname(fullPath), target);
      if (!(await exists(targetPath))) {
        issues.push({ code: 'BROKEN_LINK', severity: 'warning', file, message: `链接目标不存在：${linkMatch[1]} → ${target}` });
      }
    }
  }

  const projectYaml = resolve(cwd, '.fe-harness/project.yaml');
  if (!(await exists(projectYaml))) {
    issues.push({ code: 'PROJECT_YAML_MISSING', severity: 'error', message: '缺少 .fe-harness/project.yaml' });
  }

  return {
    schemaVersion: 'fe-harness-validate/v1',
    issues,
    summary: {
      total: issues.length,
      errors: issues.filter((i) => i.severity === 'error').length,
      warnings: issues.filter((i) => i.severity === 'warning').length,
    },
    status: issues.some((i) => i.severity === 'error') ? 'failed' : 'passed',
  };
}
