import { access, readFile, readdir, stat } from 'node:fs/promises';
import { resolve, relative, dirname } from 'node:path';

import { loadProjectConfig, validateProjectConfig } from './config.mjs';
import { inspectDesignTokens, discoverDesignTokenCandidates } from './design.mjs';
import { inspectInputs } from './inputs.mjs';
import { inspectUiGovernance } from './ui-system.mjs';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function scoreStatus(status) {
  if (status === 'passed') return 100;
  if (status === 'warning') return 60;
  if (status === 'failed' || status === 'not_configured') return 0;
  return null; // MANUAL / not_applicable — not scored
}

function calculateGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  if (score >= 50) return 'E';
  return 'F';
}

function priorityFor(status, dimension) {
  if (status === 'failed') {
    if (['commands', 'reproducibility'].includes(dimension)) return 'P0';
    return 'P1';
  }
  if (status === 'warning') return 'P2';
  return null;
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

async function checkReproducibility(cwd, config) {
  const checks = [];
  const packageJson = await readJson(resolve(cwd, 'package.json'));

  if (!packageJson) {
    checks.push({ name: 'package.json', status: 'failed', evidence: ['缺少 package.json'] });
  } else {
    checks.push({ name: 'package.json', status: 'passed', evidence: ['package.json 存在'] });

    const pm = config.stack?.package_manager || 'pnpm';
    const lockFiles = { pnpm: 'pnpm-lock.yaml', npm: 'package-lock.json', yarn: 'yarn.lock' };
    const lockFile = lockFiles[pm];
    const hasLock = await exists(resolve(cwd, lockFile));
    checks.push({
      name: 'lock_file',
      status: hasLock ? 'passed' : 'failed',
      evidence: [hasLock ? `${lockFile} 存在` : `缺少 ${lockFile}`],
    });

    const declaredPm = packageJson.packageManager;
    if (declaredPm && !declaredPm.startsWith(pm)) {
      checks.push({
        name: 'package_manager_consistency',
        status: 'warning',
        evidence: [`packageManager 声明 ${declaredPm} 与 project.yaml ${pm} 不一致`],
      });
    } else {
      checks.push({
        name: 'package_manager_consistency',
        status: 'passed',
        evidence: [`包管理器一致：${pm}`],
      });
    }

    const engines = packageJson.engines;
    if (engines?.node) {
      checks.push({ name: 'node_version', status: 'passed', evidence: [`engines.node: ${engines.node}`] });
    } else {
      checks.push({ name: 'node_version', status: 'warning', evidence: ['未声明 engines.node'] });
    }
  }

  return checks;
}

async function checkCommands(cwd, config) {
  const checks = [];
  const packageJson = await readJson(resolve(cwd, 'package.json'));
  const commands = config.commands || {};

  if (!packageJson?.scripts) {
    checks.push({ name: 'scripts', status: 'failed', evidence: ['package.json 缺少 scripts'] });
    return checks;
  }

  const keyCommands = ['build', 'unit_test', 'lint', 'type_check'];
  for (const name of keyCommands) {
    const cmd = commands[name];
    if (!cmd) {
      checks.push({ name, status: 'failed', evidence: [`project.yaml 未配置 commands.${name}`] });
      continue;
    }
    const scriptMatch = String(cmd).match(/(?:pnpm|npm run|yarn) ([\w:-]+)/);
    const scriptName = scriptMatch?.[1];
    const present = scriptName ? Boolean(packageJson.scripts[scriptName]) : false;
    checks.push({
      name,
      status: present ? 'passed' : 'failed',
      evidence: [present ? `脚本 ${scriptName} 已配置` : `package.json 缺少脚本 ${scriptName || name}`],
    });
  }

  return checks;
}

async function checkCodeQuality(cwd, config) {
  const checks = [];
  const files = [
    { name: 'eslint', path: '.eslintrc.cjs', alt: '.eslintrc.js' },
    { name: 'prettier', path: '.prettierrc', alt: '.prettierrc.json' },
    { name: 'tsconfig', path: 'tsconfig.json', alt: null },
    { name: 'editorconfig', path: '.editorconfig', alt: null },
  ];

  for (const { name, path, alt } of files) {
    const found = (await exists(resolve(cwd, path))) || (alt && (await exists(resolve(cwd, alt))));
    checks.push({
      name,
      status: found ? 'passed' : 'warning',
      evidence: [found ? `${path} 存在` : `缺少 ${path}`],
    });
  }

  const agentsPath = resolve(cwd, 'AGENTS.md');
  if (await exists(agentsPath)) {
    checks.push({ name: 'agents_md', status: 'passed', evidence: ['AGENTS.md 存在'] });
  } else {
    checks.push({ name: 'agents_md', status: 'failed', evidence: ['缺少 AGENTS.md 约束本体'] });
  }

  return checks;
}

async function checkTesting(cwd, config) {
  const checks = [];
  const testsDir = resolve(cwd, 'tests');
  if (!(await exists(testsDir))) {
    checks.push({ name: 'tests_dir', status: 'failed', evidence: ['缺少 tests/ 目录'] });
    return checks;
  }
  checks.push({ name: 'tests_dir', status: 'passed', evidence: ['tests/ 目录存在'] });

  const structureTest = resolve(cwd, 'tests/structure.test.mjs');
  checks.push({
    name: 'structure_test',
    status: await exists(structureTest) ? 'passed' : 'warning',
    evidence: [await exists(structureTest) ? 'structure.test.mjs 存在' : '缺少 structure.test.mjs'],
  });

  const coverageClosure = resolve(cwd, 'tests/coverage-closure.mjs');
  if (config.project?.product_type === 'consumer_h5') {
    checks.push({
      name: 'coverage_closure',
      status: await exists(coverageClosure) ? 'passed' : 'failed',
      evidence: [await exists(coverageClosure) ? 'coverage-closure.mjs 存在' : '缺少 coverage-closure.mjs'],
    });
  }

  const e2eDir = resolve(cwd, 'tests/e2e');
  if (await exists(e2eDir)) {
    checks.push({ name: 'e2e_tests', status: 'passed', evidence: ['tests/e2e/ 存在'] });
  } else {
    checks.push({ name: 'e2e_tests', status: 'warning', evidence: ['缺少 tests/e2e/'] });
  }

  const verifyModes = Object.keys(config.verify || {});
  const configuredModes = verifyModes.filter((mode) => {
    const def = config.verify[mode];
    return !Array.isArray(def) && def?.status === 'not_configured';
  });
  checks.push({
    name: 'verify_modes',
    status: configuredModes.length ? 'warning' : 'passed',
    evidence: [
      configuredModes.length
        ? `未配置模式：${configuredModes.join(', ')}`
        : `所有验证模式已配置：${verifyModes.join(', ')}`,
    ],
  });

  return checks;
}

async function checkArchitecture(cwd, config) {
  const checks = [];
  try {
    validateProjectConfig(config);
    checks.push({ name: 'config_valid', status: 'passed', evidence: ['project.yaml 配置有效'] });
  } catch (error) {
    checks.push({ name: 'config_valid', status: 'failed', evidence: [error.message] });
  }

  const projectMap = resolve(cwd, config.facts?.project_map || 'docs/PROJECT_MAP.md');
  checks.push({
    name: 'project_map',
    status: await exists(projectMap) ? 'passed' : 'failed',
    evidence: [await exists(projectMap) ? 'PROJECT_MAP.md 存在' : '缺少 PROJECT_MAP.md'],
  });

  const srcDir = resolve(cwd, config.stack?.source_dir || 'src');
  if (await exists(srcDir)) {
    checks.push({ name: 'src_dir', status: 'passed', evidence: ['src/ 目录存在'] });
    const pagesDir = resolve(cwd, 'src/pages');
    checks.push({
      name: 'pages_dir',
      status: await exists(pagesDir) ? 'passed' : 'warning',
      evidence: [await exists(pagesDir) ? 'src/pages/ 存在' : '缺少 src/pages/'],
    });
  } else {
    checks.push({ name: 'src_dir', status: 'failed', evidence: ['缺少 src/ 目录'] });
  }

  return checks;
}

async function checkInputs(cwd, config) {
  const checks = [];
  const inspection = await inspectInputs(cwd);
  checks.push({
    name: 'manifest',
    status: inspection.manifest ? 'passed' : 'warning',
    evidence: [inspection.manifest ? 'manifest.yaml 已配置' : '缺少 manifest.yaml'],
  });
  checks.push({
    name: 'registered_inputs',
    status: inspection.inputs.length > 0 ? 'passed' : 'manual',
    evidence: [`已登记输入：${inspection.inputs.length} 个`],
  });
  checks.push({
    name: 'unregistered_inputs',
    status: inspection.discovered.length > 0 ? 'warning' : 'passed',
    evidence: [inspection.discovered.length > 0 ? `未登记文件：${inspection.discovered.length} 个` : '无未登记文件'],
  });
  return checks;
}

async function checkAgentEcosystem(cwd, config) {
  const checks = [];
  const agentsPath = resolve(cwd, config.facts?.agent_entry || 'AGENTS.md');
  checks.push({
    name: 'agents_md',
    status: await exists(agentsPath) ? 'passed' : 'failed',
    evidence: [await exists(agentsPath) ? 'AGENTS.md 存在' : '缺少 AGENTS.md'],
  });

  const skillName = `${config.project?.product_type?.replace(/_/g, '-')}-harness`;
  const agentSkill = resolve(cwd, `.agents/skills/${skillName}/SKILL.md`);
  const claudeSkill = resolve(cwd, `.claude/skills/${skillName}/SKILL.md`);
  const hasAgentSkill = await exists(agentSkill);
  const hasClaudeSkill = await exists(claudeSkill);
  checks.push({
    name: 'skills_installed',
    status: hasAgentSkill || hasClaudeSkill ? 'passed' : 'failed',
    evidence: [
      hasAgentSkill || hasClaudeSkill
        ? `Skill ${skillName} 已安装`
        : `缺少 Skill ${skillName}`,
    ],
  });

  const claudeAdapter = resolve(cwd, 'CLAUDE.md');
  const cursorAdapter = resolve(cwd, '.cursor/rules/fe-harness.mdc');
  const hasClaude = await exists(claudeAdapter);
  const hasCursor = await exists(cursorAdapter);
  checks.push({
    name: 'agent_adapters',
    status: hasClaude || hasCursor ? 'passed' : 'warning',
    evidence: [
      hasClaude || hasCursor
        ? `适配器：${[hasClaude && 'CLAUDE.md', hasCursor && 'Cursor'].filter(Boolean).join(', ')}`
        : '缺少 Agent 适配器',
    ],
  });

  return checks;
}

async function checkDesignGovernance(cwd, config) {
  const checks = [];
  const tokenInspection = await inspectDesignTokens(cwd, config);
  checks.push({
    name: 'design_tokens',
    status: tokenInspection.status === 'pending_extraction' ? 'warning' : 'passed',
    evidence: [`Token 状态：${tokenInspection.status}`],
  });

  if (config.ui?.system?.status === 'not_configured') {
    checks.push({
      name: 'ui_system',
      status: 'manual',
      evidence: ['UI System 未配置'],
    });
  } else if (config.project?.product_type === 'consumer_h5') {
    const uiGov = await inspectUiGovernance(cwd, config);
    checks.push({
      name: 'ui_system',
      status: uiGov.issues.length ? 'warning' : 'passed',
      evidence: [`UI System issues：${uiGov.issues.length}`],
    });
  }

  const visualDir = resolve(cwd, 'tests/visual');
  if (await exists(visualDir)) {
    checks.push({ name: 'visual_baselines', status: 'manual', evidence: ['视觉基线目录存在'] });
  } else {
    checks.push({ name: 'visual_baselines', status: 'warning', evidence: ['缺少视觉基线目录'] });
  }

  return checks;
}

const DIMENSIONS = [
  { key: 'reproducibility', label: '可复现性', checker: checkReproducibility },
  { key: 'commands', label: '命令配置', checker: checkCommands },
  { key: 'code_quality', label: '代码质量', checker: checkCodeQuality },
  { key: 'testing', label: '测试覆盖', checker: checkTesting },
  { key: 'architecture', label: '架构一致性', checker: checkArchitecture },
  { key: 'inputs', label: '输入证据', checker: checkInputs },
  { key: 'agent_ecosystem', label: 'Agent 生态', checker: checkAgentEcosystem },
  { key: 'design_governance', label: '设计治理', checker: checkDesignGovernance },
];

export async function runAudit(cwd) {
  const { config } = await loadProjectConfig(cwd);
  const dimensions = [];

  for (const { key, label, checker } of DIMENSIONS) {
    const checks = await checker(cwd, config);
    const scored = checks.filter((c) => scoreStatus(c.status) !== null);
    const score = scored.length
      ? Math.round(scored.reduce((sum, c) => sum + scoreStatus(c.status), 0) / scored.length)
      : null;
    const coverage = scored.length / checks.length;
    dimensions.push({
      key,
      label,
      score,
      coverage: Math.round(coverage * 100),
      grade: score !== null ? calculateGrade(score) : 'MANUAL',
      tentative: coverage < 1,
      checks,
    });
  }

  const scoredDimensions = dimensions.filter((d) => d.score !== null);
  const overallScore = scoredDimensions.length
    ? Math.round(scoredDimensions.reduce((sum, d) => sum + d.score, 0) / scoredDimensions.length)
    : 0;
  const overallGrade = calculateGrade(overallScore);
  const hasManual = dimensions.some((d) => d.tentative);

  const improvements = [];
  for (const dim of dimensions) {
    for (const check of dim.checks) {
      const priority = priorityFor(check.status, dim.key);
      if (priority) {
        improvements.push({
          priority,
          dimension: dim.key,
          check: check.name,
          status: check.status,
          evidence: check.evidence,
        });
      }
    }
  }
  improvements.sort((a, b) => {
    const order = { P0: 0, P1: 1, P2: 2 };
    return order[a.priority] - order[b.priority];
  });

  return {
    schemaVersion: 'fe-harness-audit/v1',
    generatedAt: new Date().toISOString(),
    project: config.project?.name,
    overallScore,
    overallGrade: hasManual ? `${overallGrade} (暂定)` : overallGrade,
    dimensions,
    improvements,
  };
}

export function formatAuditMarkdown(report) {
  const lines = [
    `# fe-harness 审计报告`,
    '',
    `> 生成时间：${report.generatedAt}`,
    `> 总分：${report.overallScore} / 100　等级：${report.overallGrade}`,
    '',
    '## 八维评分',
    '',
    '| 维度 | 得分 | 等级 | 覆盖率 |',
    '|------|------|------|--------|',
  ];
  for (const dim of report.dimensions) {
    lines.push(
      `| ${dim.label} | ${dim.score ?? 'MANUAL'} | ${dim.grade} | ${dim.coverage}%${dim.tentative ? ' (暂定)' : ''} |`,
    );
  }
  lines.push('', '## 维度详情', '');
  for (const dim of report.dimensions) {
    lines.push(`### ${dim.label}（${dim.score ?? 'MANUAL'} 分）`, '');
    for (const check of dim.checks) {
      lines.push(`- **${check.name}**：${check.status} — ${check.evidence.join('；')}`);
    }
    lines.push('');
  }
  if (report.improvements.length) {
    lines.push('## 改进清单', '');
    for (const p of ['P0', 'P1', 'P2']) {
      const items = report.improvements.filter((i) => i.priority === p);
      if (!items.length) continue;
      lines.push(`### ${p}`, '');
      for (const item of items) {
        lines.push(`- [${item.dimension}/${item.check}] ${item.status}：${item.evidence.join('；')}`);
      }
      lines.push('');
    }
  }
  return lines.join('\n');
}
