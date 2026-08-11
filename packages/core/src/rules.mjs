import { access, readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

import { upsertManagedBlock, parseManagedBlocks, extractManagedBlockIds, findDuplicateIds, buildManagedBlock } from './managed-block.mjs';

const RULES_DIR = '.fe-harness/rules';
const RULES_FILE = 'project-rules.md';
const REQUIRED_FIELDS = ['rule', 'scope', 'evidence', 'confidence', 'verification'];
const VALID_CONFIDENCE = ['high', 'medium', 'low'];
const VALID_STATUS = ['passed', 'warning', 'failed', 'manual'];
const MIN_RULES = 5;
const MAX_RULES = 12;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

export function parseRuleBlock(inner) {
  const rule = {};
  const lines = inner.split('\n');
  const idMatch = inner.match(/^###\s+([\w-]+)/);
  if (idMatch) rule.id = idMatch[1];
  for (const line of lines) {
    const match = line.match(/^-\s+(\w+)[：:]\s*(.+)$/);
    if (match) {
      const key = match[1].toLowerCase();
      rule[key] = match[2].trim();
    }
  }
  return rule;
}

export function buildRuleBlock(rule) {
  const lines = [`### ${rule.id} — ${rule.title || rule.id}`];
  lines.push('');
  lines.push(`- 规则：${rule.rule}`);
  lines.push(`- 适用范围：${rule.scope}`);
  lines.push(`- 证据：${Array.isArray(rule.evidence) ? rule.evidence.join('、') : rule.evidence}`);
  lines.push(`- 置信度：${rule.confidence}`);
  lines.push(`- 验证：${rule.verification}`);
  if (rule.status) lines.push(`- 状态：${rule.status}`);
  return lines.join('\n');
}

export async function generateRules(cwd, rules) {
  const rulesDir = resolve(cwd, RULES_DIR);
  await mkdir(rulesDir, { recursive: true });
  const rulesPath = resolve(rulesDir, RULES_FILE);

  const content = rules.map((rule) => buildRuleBlock(rule)).join('\n\n');
  const wrapped = `# 项目规则\n\n> 由 fe-harness 生成，使用稳定 ID 管理更新。手动内容保留在受管块外。\n\n${content}\n`;

  await writeFile(rulesPath, wrapped, 'utf8');

  return {
    path: rulesPath,
    count: rules.length,
    rules: rules.map((r) => r.id),
  };
}

export async function upsertRule(cwd, rule) {
  const rulesPath = resolve(cwd, RULES_DIR, RULES_FILE);
  await mkdir(dirname(rulesPath), { recursive: true });
  return upsertManagedBlock(rulesPath, rule.id, buildRuleBlock(rule), true);
}

export async function validateRules(cwd) {
  const rulesPath = resolve(cwd, RULES_DIR, RULES_FILE);
  const issues = [];

  if (!(await exists(rulesPath))) {
    return [{ code: 'RULES_MISSING', message: `缺少 ${RULES_DIR}/${RULES_FILE}` }];
  }

  const content = await readFile(rulesPath, 'utf8');
  const blocks = parseManagedBlocks(content, '<!-- fe-harness-rule:start');

  if (blocks.length < MIN_RULES) {
    issues.push({ code: 'RULES_TOO_FEW', message: `规则数量不足：${blocks.length}/${MIN_RULES}` });
  }
  if (blocks.length > MAX_RULES) {
    issues.push({ code: 'RULES_TOO_MANY', message: `规则数量过多：${blocks.length}/${MAX_RULES}` });
  }

  const ids = blocks.map((b) => b.id);
  const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (duplicates.length) {
    issues.push({ code: 'RULES_DUPLICATE_ID', message: `重复稳定 ID：${duplicates.join(', ')}` });
  }

  for (const block of blocks) {
    const rule = parseRuleBlock(block.inner);
    if (!rule.id) {
      issues.push({ code: 'RULE_MISSING_ID', message: `规则缺少 ID` });
      continue;
    }
    for (const field of REQUIRED_FIELDS) {
      if (!rule[field]) {
        issues.push({ code: 'RULE_MISSING_FIELD', message: `规则 ${rule.id} 缺少字段：${field}` });
      }
    }
    if (rule.confidence && !VALID_CONFIDENCE.includes(rule.confidence)) {
      issues.push({ code: 'RULE_INVALID_CONFIDENCE', message: `规则 ${rule.id} 置信度无效：${rule.confidence}` });
    }
    if (rule.status && !VALID_STATUS.includes(rule.status)) {
      issues.push({ code: 'RULE_INVALID_STATUS', message: `规则 ${rule.id} 状态无效：${rule.status}` });
    }
    if (rule.evidence) {
      const evidenceFiles = rule.evidence.split(/[、,，]/).map((s) => s.trim());
      for (const file of evidenceFiles) {
        if (file && !file.startsWith('<') && !(await exists(resolve(cwd, file)))) {
          issues.push({ code: 'RULE_EVIDENCE_MISSING', message: `规则 ${rule.id} 证据不存在：${file}` });
        }
      }
    }
  }

  return issues;
}

export async function listRules(cwd) {
  const rulesPath = resolve(cwd, RULES_DIR, RULES_FILE);
  if (!(await exists(rulesPath))) return [];
  const content = await readFile(rulesPath, 'utf8');
  const blocks = parseManagedBlocks(content, '<!-- fe-harness-rule:start');
  return blocks.map((b) => ({ id: b.id, ...parseRuleBlock(b.inner) }));
}
