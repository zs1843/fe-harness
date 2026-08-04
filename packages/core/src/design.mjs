import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import YAML from 'yaml';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readStructured(path) {
  const source = await readFile(path, 'utf8');
  if (path.endsWith('.json')) return JSON.parse(source);
  return YAML.parse(source);
}

export async function inspectDesignTokens(cwd, config = {}) {
  const configured = config.facts?.design_tokens || config.design?.tokens;
  const candidates = [
    configured,
    'docs/design/tokens.json',
    'docs/design/tokens.yaml',
    'docs/design/tokens.yml',
  ].filter(Boolean);
  const uniqueCandidates = [...new Set(candidates)];
  const present = [];
  for (const path of uniqueCandidates) {
    const absolutePath = resolve(cwd, path);
    if (await exists(absolutePath)) present.push(path);
  }
  if (!present.length) {
    return {
      issues: [
        {
          code: 'DESIGN_TOKEN_SOURCE',
          display_name: '未配置',
          message: '未配置独立 Design Token 真值文件',
          status: 'not_configured',
        },
      ],
      source: null,
      status: 'not_configured',
    };
  }
  if (present.length > 1) {
    return {
      issues: [
        {
          code: 'DESIGN_TOKEN_MULTIPLE_SOURCES',
          display_name: '冲突',
          message: `存在多个 Token 真值文件：${present.join(', ')}`,
          status: 'conflict',
        },
      ],
      sources: present,
      status: 'failed',
    };
  }
  const sourcePath = present[0];
  try {
    const tokens = await readStructured(resolve(cwd, sourcePath));
    const missing = ['version', 'updated_at', 'sources', 'tokens'].filter((key) => tokens?.[key] === undefined);
    return {
      issues: missing.map((key) => ({
        code: 'DESIGN_TOKEN_FIELD',
        display_name: '待确认',
        message: `Token 文件缺少字段：${key}`,
        status: 'needs_confirmation',
      })),
      source: sourcePath,
      status: missing.length ? 'needs_confirmation' : 'passed',
      tokens,
    };
  } catch (error) {
    return {
      issues: [
        {
          code: 'DESIGN_TOKEN_PARSE',
          display_name: '失败',
          message: `Token 文件无法解析：${error instanceof Error ? error.message : String(error)}`,
          status: 'failed',
        },
      ],
      source: sourcePath,
      status: 'failed',
    };
  }
}

export function diffDesignTokens(before = {}, after = {}) {
  const beforeTokens = before.tokens || {};
  const afterTokens = after.tokens || {};
  const changes = [];
  for (const key of new Set([...Object.keys(beforeTokens), ...Object.keys(afterTokens)])) {
    if (!(key in beforeTokens)) {
      changes.push({ after: afterTokens[key], before: null, key, type: '新增 Token' });
    } else if (!(key in afterTokens)) {
      changes.push({ after: null, before: beforeTokens[key], key, type: '删除 Token' });
    } else if (JSON.stringify(beforeTokens[key]) !== JSON.stringify(afterTokens[key])) {
      changes.push({ after: afterTokens[key], before: beforeTokens[key], key, type: '修改 Token' });
    }
  }
  return changes;
}
