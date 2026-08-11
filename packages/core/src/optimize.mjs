import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { loadProjectConfig, validateProjectConfig } from './config.mjs';
import { planInitialization, verifyInitializationIdempotent } from './init.mjs';
import { parseManagedBlocks, extractManagedBlockIds, findDuplicateIds } from './managed-block.mjs';
import { listRules, validateRules } from './rules.mjs';
import { validateHostAdapters, detectHosts, HOST_ADAPTERS } from './host-adapters.mjs';
import { AUTHORIZATION_GROUPS, getGroupKeys } from './authorization.mjs';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function scanDocs(cwd, config) {
  const issues = [];
  const codebaseDir = resolve(cwd, '.fe-harness/codebase');
  const expectedMaps = ['STACK.md', 'STRUCTURE.md', 'CONVENTIONS.md', 'TESTING.md', 'CONCERNS.md'];
  if (await exists(codebaseDir)) {
    for (const map of expectedMaps) {
      if (!(await exists(resolve(codebaseDir, map)))) {
        issues.push({ code: 'DOCS_MAP_MISSING', file: `codebase/${map}`, status: 'create', message: `缺少代码图谱 ${map}` });
      }
    }
  } else {
    issues.push({ code: 'DOCS_CODEBASE_DIR_MISSING', file: 'codebase/', status: 'create', message: '缺少 .fe-harness/codebase/ 目录' });
  }
  const auditsDir = resolve(cwd, 'tmp/fe-harness');
  if (!(await exists(resolve(auditsDir, 'audit-report.md')))) {
    issues.push({ code: 'DOCS_AUDIT_MISSING', file: 'audit-report.md', status: 'create', message: '缺少审计报告，建议运行 fe-harness audit' });
  }
  return issues;
}

async function scanRules(cwd) {
  const issues = [];
  const rules = await listRules(cwd);
  if (rules.length === 0) {
    issues.push({ code: 'RULES_EMPTY', file: '.fe-harness/rules/project-rules.md', status: 'create', message: '缺少结构化规则' });
    return issues;
  }
  const validationIssues = await validateRules(cwd);
  for (const issue of validationIssues) {
    issues.push({ ...issue, status: issue.code.includes('MISSING') ? 'create' : 'managed-update' });
  }
  return issues;
}

async function scanAdapters(cwd) {
  const issues = [];
  const foundHosts = detectHosts(cwd);
  const allHosts = Object.keys(HOST_ADAPTERS);

  for (const host of allHosts) {
    const adapter = HOST_ADAPTERS[host];
    if (!adapter.entryFile) continue;
    const entryPath = resolve(cwd, adapter.entryFile);
    if (!(await exists(entryPath))) {
      issues.push({
        code: 'ADAPTER_MISSING',
        file: adapter.entryFile,
        host,
        status: 'create',
        message: `缺少宿主 ${adapter.label} 入口`,
      });
      continue;
    }
    const content = await readFile(entryPath, 'utf8');
    const blocks = parseManagedBlocks(content);
    if (blocks.length === 0) {
      issues.push({
        code: 'ADAPTER_NO_MANAGED_BLOCK',
        file: adapter.entryFile,
        host,
        status: 'managed-update',
        message: `${adapter.entryFile} 缺少 fe-harness 受管块`,
      });
    }
  }

  return issues;
}

async function scanEngineering(cwd, config) {
  const issues = [];
  try {
    validateProjectConfig(config);
  } catch (error) {
    issues.push({ code: 'ENG_CONFIG_INVALID', file: '.fe-harness/project.yaml', status: 'manual-merge', message: error.message });
  }

  const commands = config.commands || {};
  const verify = config.verify || {};
  const keyCommands = ['build', 'unit_test', 'lint', 'type_check'];
  for (const cmd of keyCommands) {
    if (!commands[cmd]) {
      issues.push({ code: 'ENG_COMMAND_MISSING', file: 'project.yaml', status: 'managed-update', message: `缺少 commands.${cmd}` });
    }
  }

  const verifyModes = Object.keys(verify);
  const notConfigured = verifyModes.filter((m) => {
    const def = verify[m];
    return !Array.isArray(def) && def?.status === 'not_configured';
  });
  if (notConfigured.length) {
    issues.push({ code: 'ENG_VERIFY_NOT_CONFIGURED', file: 'project.yaml', status: 'managed-update', message: `未配置验证模式：${notConfigured.join(', ')}` });
  }

  return issues;
}

async function scanTools(cwd, config) {
  const issues = [];
  const skillName = `${config.project?.product_type?.replace(/_/g, '-')}-harness`;
  const agentSkill = resolve(cwd, `.agents/skills/${skillName}/SKILL.md`);
  const claudeSkill = resolve(cwd, `.claude/skills/${skillName}/SKILL.md`);
  if (!(await exists(agentSkill)) && !(await exists(claudeSkill))) {
    issues.push({ code: 'TOOLS_SKILL_MISSING', file: `skills/${skillName}`, status: 'create', message: `缺少 Skill ${skillName}` });
  }

  const hosts = detectHosts(cwd);
  if (hosts.length === 0) {
    issues.push({ code: 'TOOLS_NO_HOST', file: 'AGENTS.md', status: 'create', message: '未检测到任何 Agent 宿主入口' });
  }

  return issues;
}

export async function runOptimize(cwd, { groups, files, templateRoot } = {}) {
  const { config } = await loadProjectConfig(cwd);
  const selectedGroups = groups || getGroupKeys();

  const scanners = {
    docs: () => scanDocs(cwd, config),
    rules: () => scanRules(cwd),
    adapters: () => scanAdapters(cwd),
    engineering: () => scanEngineering(cwd, config),
    tools: () => scanTools(cwd, config),
  };

  const proposal = {};
  for (const group of selectedGroups) {
    if (!scanners[group]) continue;
    proposal[group] = await scanners[group]();
  }

  const allIssues = Object.values(proposal).flat();
  const summary = {
    create: allIssues.filter((i) => i.status === 'create').length,
    managedUpdate: allIssues.filter((i) => i.status === 'managed-update').length,
    manualMerge: allIssues.filter((i) => i.status === 'manual-merge').length,
    keep: 0,
    skip: 0,
  };

  return {
    schemaVersion: 'fe-harness-optimize/v1',
    groups: selectedGroups,
    proposal,
    summary,
    totalIssues: allIssues.length,
  };
}

export async function applyOptimize(cwd, { groups, files, templateRoot }) {
  const proposal = await runOptimize(cwd, { groups, files, templateRoot });
  const applied = [];

  for (const [group, issues] of Object.entries(proposal.proposal)) {
    for (const issue of issues) {
      if (issue.status === 'manual-merge' || issue.status === 'keep') {
        applied.push({ ...issue, applied: false, reason: '需要人工处理' });
        continue;
      }
      applied.push({ ...issue, applied: true, action: issue.status });
    }
  }

  const idempotent = await verifyInitializationIdempotent({ cwd, files: files || [], templateRoot: templateRoot || cwd });

  return {
    ...proposal,
    applied,
    idempotent: idempotent.idempotent,
    drift: idempotent.drift,
  };
}
