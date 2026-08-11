export const AUTHORIZATION_GROUPS = {
  docs: {
    label: '文档与代码图谱',
    description: '.fe-harness/codebase/ 下的代码图谱、审计报告等文档',
    color: 'blue',
  },
  rules: {
    label: '规则',
    description: '.fe-harness/rules/project-rules.md 结构化规则',
    color: 'green',
  },
  adapters: {
    label: 'Agent 适配器',
    description: '各宿主薄入口（AGENTS.md、CLAUDE.md、Cursor Rule、Trae）',
    color: 'orange',
  },
  engineering: {
    label: '工程配置',
    description: '.fe-harness/project.yaml、commands、verify 配置',
    color: 'purple',
  },
  tools: {
    label: 'MCP/Skills/工具',
    description: 'Agent Skills 安装、MCP 集成建议',
    color: 'red',
  },
};

export function getGroupKeys() {
  return Object.keys(AUTHORIZATION_GROUPS);
}

export function validateGroupSelection(groups) {
  const valid = getGroupKeys();
  const invalid = groups.filter((g) => !valid.includes(g));
  if (invalid.length) {
    throw new Error(`未知的授权组：${invalid.join(', ')}。有效组：${valid.join(', ')}`);
  }
  return groups;
}

export function isAuthorized(group, authorizedGroups) {
  return authorizedGroups.includes(group);
}

export function summarizeAuthorization(authorizedGroups) {
  const all = getGroupKeys();
  const selected = authorizedGroups.length;
  const skipped = all.filter((g) => !authorizedGroups.includes(g));
  return {
    total: all.length,
    selected,
    skipped: skipped.length,
    skippedGroups: skipped,
    message: `已授权 ${selected}/${all.length} 组${skipped.length ? `（跳过：${skipped.map((g) => AUTHORIZATION_GROUPS[g].label).join('、')}）` : ''}`,
  };
}

export function requireExplicitAuthorization(action, group, authorizedGroups) {
  const dangerousActions = ['install', 'write', 'create', 'update', 'delete', 'publish', 'push'];
  if (dangerousActions.includes(action) && !isAuthorized(group, authorizedGroups)) {
    throw new Error(`操作 ${action} 需要授权组 ${group}，但未在已授权组中。已授权：${authorizedGroups.join(', ') || '无'}`);
  }
}
