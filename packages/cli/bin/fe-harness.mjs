#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { access, appendFile, copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  applyInitialization,
  applyOpenApiGeneration,
  analyzeInputs,
  AUTHORIZATION_GROUPS,
  createTaskSnapshot,
  discoverDesignTokenCandidates,
  formatAuditMarkdown,
  generateCodebaseMaps,
  getGroupKeys,
  HOST_ADAPTERS,
  getSupportedHosts,
  detectHosts,
  installThinEntry,
  installAllThinEntries,
  inspectDesignTokens,
  inspectInputs,
  inspectUiGovernance,
  inspectTaskHistory,
  listRules,
  loadProjectConfig,
  listOpenApiOperations,
  planInitialization,
  planOpenApiGeneration,
  resolveVerifySteps,
  runAudit,
  runDoctor,
  runOptimize,
  applyOptimize,
  runScaffold,
  validateScaffoldConfig,
  getAvailableStacks,
  getAvailableUiSystems,
  getStackOptions,
  getDefaultOptions,
  buildFrameworkCommand,
  interactiveScaffold,
  runShellCommand,
  runVerification,
  readInputManifest,
  validateGroupSelection,
  validateHarness,
  verifyInitializationIdempotent,
  writeReport,
} from '@anthropic/fe-harness-core';
import YAML from 'yaml';

const cwd = process.cwd();
const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repositoryRoot = resolve(packageDirectory, '../..');
const packageRoot = existsSync(resolve(repositoryRoot, 'presets')) ? repositoryRoot : packageDirectory;

async function copyDirectory(source, target, { force = false } = {}) {
  await mkdir(target, { recursive: true });
  for (const entry of await readdir(source, { withFileTypes: true })) {
    const sourcePath = resolve(source, entry.name);
    const targetPath = resolve(target, entry.name);
    if (entry.isDirectory()) await copyDirectory(sourcePath, targetPath, { force });
    else if (force || !(await exists(targetPath))) await copyFile(sourcePath, targetPath);
  }
}
const initFiles = [
  ['templates/AGENTS.md', 'AGENTS.md'],
  ['templates/CLAUDE.md', 'CLAUDE.md'],
  ['templates/CURSOR_RULE.mdc', '.cursor/rules/fe-harness.mdc'],
  ['templates/PROJECT_MAP.md', 'docs/PROJECT_MAP.md'],
  ['templates/DESIGN.md', 'docs/DESIGN.md'],
  ['templates/PRODUCT.md', 'docs/PRODUCT.md'],
  ['templates/CURRENT_STATUS.md', 'docs/CURRENT_STATUS.md'],
  ['templates/DECISIONS.md', 'docs/DECISIONS.md'],
  ['templates/CHANGELOG.md', 'docs/CHANGELOG.md'],
  ['templates/INPUTS.md', '.fe-harness/inputs/README.md'],
  ['templates/INPUT_MANIFEST.yaml', '.fe-harness/inputs/manifest.yaml'],
  ['templates/PRD_INPUT.md', '.fe-harness/inputs/prd/README.md'],
  ['templates/RP_INPUT.md', '.fe-harness/inputs/rp/README.md'],
  ['templates/UI_INPUT.md', '.fe-harness/inputs/ui/README.md'],
  ['templates/API_INPUT.md', '.fe-harness/inputs/api/README.md'],
  ['templates/API_SELECTION.yaml', '.fe-harness/api/selection.yaml'],
  ['templates/ASSETS_INPUT.md', '.fe-harness/inputs/assets/README.md'],
  ['templates/SNAPSHOTS.md', '.fe-harness/snapshots/README.md'],
  ['templates/PRD_HISTORY.md', 'docs/history/PRD_HISTORY.md'],
  ['templates/CHANGE_HISTORY.md', 'docs/history/CHANGE_HISTORY.md'],
  ['templates/IMPLEMENTATION_COVERAGE.md', 'docs/IMPLEMENTATION_COVERAGE.md'],
  ['templates/TOKENS.json', 'docs/design/tokens.json'],
  ['templates/TOKENS.md', 'docs/design/TOKENS.md'],
  ['templates/COMPONENTS.md', 'docs/design/COMPONENTS.md'],
  ['templates/PAGE_FLOW_MODEL.yaml', '.fe-harness/models/page-flow.yaml'],
  ['templates/LAYOUT_SPECS.yaml', '.fe-harness/models/layout-specs.yaml'],
  ['templates/UI_ADJUSTMENTS.yaml', '.fe-harness/ui/adjustments.yaml'],
  ['templates/project.yaml', '.fe-harness/project.yaml'],
];

function has(flag) { return process.argv.includes(flag); }
function option(flag) { const index = process.argv.indexOf(flag); return index < 0 ? undefined : process.argv[index + 1]; }
async function exists(path) { try { await access(path); return true; } catch { return false; } }

const HELP = {
  main: `fe-harness - 前端工程约束、输入管理和验证工具

用法：
  fe-harness <命令> [参数] [选项]

默认流程：
  fe-harness scaffold <项目名> --profile <p> --stack <s>  创建项目 + 叠加 Harness
  fe-harness init --dry-run                  查看接入现有项目会创建哪些文件
  fe-harness inputs inspect --json           登记并检查本次任务输入
  fe-harness task create --title "任务名称"  创建稳定任务编号
  fe-harness verify feature                  验证完整功能改动

基础命令：
  scaffold    委托框架 CLI 创建项目 + 叠加 Harness（交互式级联选项）
  init        向现有项目补充 Harness 文件，不覆盖项目已维护内容
  inputs      查看、比对和分析 PRD/RP/UI/API/assets 输入
  task        创建任务、查看历史、创建不可变任务快照
  verify      执行 quick/feature/runtime/interaction/visual/audit

诊断与按需能力：
  inspect / doctor / audit / optimize / validate / plan  检查、诊断、审计、升级、验证和预览
  hosts       管理多宿主薄入口（codex/opencode/claude/cursor/trae）
  design / ui                                UI 任务需要时启用
  api                                        接口任务需要时启用
  skills      列出或安装 fe-harness Skills
  version     输出 fe-harness 版本

全局选项：
  -h, --help  显示帮助
  -v, --version  输出 fe-harness 版本
  --json      输出稳定 JSON，适合 Agent 和 CI

按需查看帮助：
  fe-harness help <命令>
`,
  scaffold: `fe-harness scaffold - 委托框架 CLI 创建项目 + 叠加 Harness

用法：
  fe-harness scaffold <项目名> [选项]

说明：
  根据级联选项矩阵，委托对应框架的 CLI（create-vue / create-vite / taro init 等）创建项目，
  然后叠加 fe-harness：init 补 Harness 文件、hosts 装多宿主薄入口、ui systems 装组件库适配器、写入 project.yaml。
  默认模板后续放入；当前只做框架 + Harness 生成。

级联选项：
  Profile → Stack → UI System → 框架选项（TypeScript/Router/Pinia 等）

  consumer-h5:  uni-app / vue3-vite / taro / react-vite
  admin-web:    vue3-vite / react-vite
  mini-program: uni-app / taro

参数：
  --profile <p>      consumer-h5 / admin-web / mini-program
  --stack <s>        uni-app / vue3-vite / react-vite / taro / next.js
  --ui <u>           element-plus / ant-design-vue / tdesign-uniapp / ...
  --hosts <h,h>      codex / opencode / claude / cursor / trae
  --with-routes      根据 PRD 做路由拆分（需配合 --prd）
  --prd <path>       PRD 文件路径，配合 --with-routes 使用
  --skip-install     跳过依赖安装
  --skip-framework-cli  跳过框架 CLI，只叠加 Harness（已有项目时）
  --dry-run          预览步骤，不执行
  --json             JSON 输出

示例：
  fe-harness scaffold my-admin --profile admin-web --stack vue3-vite --ui element-plus
  fe-harness scaffold my-h5 --profile consumer-h5 --stack uni-app --hosts codex,claude
  fe-harness scaffold my-admin --with-routes --prd ./prd.md --profile admin-web --stack vue3-vite
  fe-harness scaffold my-admin --dry-run --json
`,
  init: `fe-harness init - 接入现有项目

用法：
  fe-harness init [--dry-run] [--json]

说明：
  init 只创建缺失文件，不覆盖项目已有内容。
  已存在且与模板不同的文件显示为“项目已维护”，不会被当作真实冲突。

示例：
  fe-harness init --dry-run
  fe-harness init --dry-run --json
`,
  inspect: `fe-harness inspect - 查看项目 Harness 状态

用法：
  fe-harness inspect [--json]
  fe-harness inspect --map [--json]

输出：
  project.yaml 路径、项目类型、技术栈、事实文档存在性、verify 模式、输入清单、Design Token 和 Agent 工作流。
  --map：生成 .fe-harness/codebase/ 下 5 份代码图谱（STACK/STRUCTURE/CONVENTIONS/TESTING/CONCERNS）。
`,
  audit: `fe-harness audit - 八维成熟度审计

用法：
  fe-harness audit [--json]

说明：
  从可复现性、命令配置、代码质量、测试覆盖、架构一致性、输入证据、Agent 生态、设计治理
  八个维度评分，输出 A-F 等级和 P0-P2 改进清单。报告写入 tmp/fe-harness/audit-report.md。
`,
  optimize: `fe-harness optimize - 幂等升级既有 Harness

用法：
  fe-harness optimize [--dry-run] [--groups docs,rules,adapters,engineering,tools] [--json]

说明：
  读取现有 Harness 和工程配置，按五组（文档/规则/适配器/工程配置/工具）列出精确差异。
  只执行用户选择的组；冲突项回到提案阶段。二次 dry comparison 验证幂等。
`,
  validate: `fe-harness validate - 验证 Harness 完整性

用法：
  fe-harness validate [--json]

说明：
  检查受管块匹配、规则完整性、宿主适配器、Markdown 链接、禁止路径。
`,
  hosts: `fe-harness hosts - 管理多宿主薄入口

用法：
  fe-harness hosts list [--json]
  fe-harness hosts install [--host <宿主>] [--json]

支持的宿主：
  codex / opencode / claude / cursor / trae

说明：
  list 列出所有宿主及检测状态。
  install 安装薄入口（受管块，不覆盖已有内容）。
`,
  plan: `fe-harness plan - 输出结构化计划

用法：
  fe-harness plan init --json
  fe-harness plan create <项目名> [--output <目录>] --json

状态说明：
  create=待创建
  managed_unchanged=脚手架管理且未修改
  project_owned_modified=项目已维护
  true_conflict=真实冲突
`,
  doctor: `fe-harness doctor - 只读诊断项目

用法：
  fe-harness doctor [--json]

检查范围：
  Node/pnpm、package scripts、uni-app 页面注册、输入清单、PRD/RP/UI/API/assets、PRD 历史、变更历史、覆盖矩阵、Design Token、视觉基线、.env* 忽略和 Agent 工作流。

说明：
  确定性错误显示“失败”；未启用能力显示“未配置”；启发式问题显示“待确认”。
`,
  verify: `fe-harness verify - 执行验证模式

用法：
  fe-harness verify <模式> [--json]

模式：
  quick        快速验证，通常包含单元测试、类型检查和 Lint
  feature      功能完成验证，通常包含 quick 和生产构建
  runtime      页面启动和运行时错误验证
  interaction  关键交互流程验证
  visual       截图基线和像素差异验证
  audit        汇总审计，尽量运行所有已配置检查

说明：
  visual 没有截图基线时返回“未配置”，不能视为通过。
  端口监听或工具链权限失败会被归类为环境阻塞，不当作业务失败。
`,
  inputs: `fe-harness inputs - 输入清单、差异和基础分析

用法：
  fe-harness inputs inspect [--json]
  fe-harness inputs diff [--json]
  fe-harness inputs analyze [--json]

说明：
  inspect 检查 manifest、文件存在性、哈希变化、未登记输入和 active 冲突。
  diff 汇总需要处理的输入变化。
  analyze 对文本 PRD/RP/UI 抽取基础证据，并记录同名字段冲突。
`,
  api: `fe-harness api - Apifox/OpenAPI 接口生成

用法：
  fe-harness api inspect --task T001 [--json]
  fe-harness api generate --task T001 [--dry-run] [--json]

配置：
  在 .fe-harness/api/selection.yaml 中为任务关联 PRD 输入、API 输入和 operationId。
  API 输入必须登记在 .fe-harness/inputs/manifest.yaml，首版接受 Apifox 导出的 OpenAPI JSON。

原则：
  PRD 决定本任务使用哪些接口；OpenAPI 决定路径、方法、请求和响应字段。
  生成文件有哈希保护，检测到手工修改时不会覆盖。
`,
  design: `fe-harness design - 设计与 Token 工具

用法：
  fe-harness design tokens inspect [--json]
  fe-harness design tokens diff [--json]
  fe-harness design tokens discover [--json]

说明：
  当前支持检查唯一机器可读 Token 真值文件。
  默认路径为 docs/design/tokens.json，也可通过 project.yaml 的 facts.design_tokens 指定。
`,
  task: `fe-harness task - 任务编号、历史和快照

用法：
  fe-harness task create [T001] --title "<任务名称>" [--json]
  fe-harness task inspect T001 [--json]
  fe-harness task history T001 [--json]
  fe-harness task snapshot T001 --title "<任务名称>" --request "<用户要求>" [--json]

说明：
  create 会创建模块化 PRD、metadata.yaml，并登记到 inputs/manifest.yaml 和 PRD_HISTORY。
  snapshot 会创建不可变任务快照，包含 SNAPSHOT.md、files.json、verification.json 和 design-token-diff.json。
  快照不会保存 .env、密钥、Cookie 或 Access Token。
`,
  version: `fe-harness version - 输出当前 fe-harness 版本

用法：
  fe-harness version
  fe-harness -v
  fe-harness --version
`,
  skills: `fe-harness skills - 管理命令 Skills

用法：
  fe-harness skills list [--json]
  fe-harness skills install --project [--provider codex|claude|cursor|all] [--name <名称>] [--force]
  fe-harness skills install --global [--provider codex|claude|cursor|all] [--name <名称>] [--target <目录>] [--force]

说明：
  --provider 默认为 codex；all 会同步 Codex、Claude Code 和 Cursor。
  项目级 Codex/Cursor 共用 .agents/skills；Claude Code 使用 .claude/skills。
  全局默认目录分别为 ~/.codex/skills、~/.claude/skills、~/.cursor/skills。
  已存在且未指定 --force 时不会覆盖。
`,
  ui: `fe-harness ui - 管理 UI System Adapter

用法：
  fe-harness ui systems list [--json]
  fe-harness ui systems install <名称> [--dry-run] [--json]

Adapter 不会自动修改项目依赖或 project.yaml；安装后按输出片段显式选择并锁定版本。
`,
};

function wantsHelp(value) {
  return value === '-h' || value === '--help' || value === 'help';
}

function printHelp(topic = 'main') {
  console.log(HELP[topic] || HELP.main);
}

async function listFiles(root, directory = root) {
  const output = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) output.push(...(await listFiles(root, path)));
    else output.push(relative(root, path));
  }
  return output.sort();
}

function printPlan(plan) {
  const names = {
    conflict: '真实冲突',
    create: '待创建',
    managed_unchanged: '脚手架管理且未修改',
    project_owned_modified: '项目已维护',
    template_update_available: '存在模板更新',
    unchanged: '脚手架管理且未修改',
  };
  for (const entry of plan.entries) console.log(`${(names[entry.status] || entry.status).padEnd(14)} ${entry.target}`);
}

async function initializationPlan() {
  return planInitialization({ cwd, files: await initializationFiles(), templateRoot: packageRoot });
}

async function skillFiles() {
  const root = resolve(packageRoot, 'skills');
  const paths = [];
  for (const name of defaultProjectSkills) {
    paths.push(...(await listFiles(resolve(root, name))).map((path) => `${name}/${path}`));
  }
  return paths.flatMap((path) => [
    [`skills/${path}`, `.agents/skills/${path}`],
    [`skills/${path}`, `.claude/skills/${path}`],
  ]);
}

async function initializationFiles() {
  return [...initFiles, ...(await skillFiles())];
}

async function init() {
  const plan = await initializationPlan();
  if (has('--json')) console.log(JSON.stringify({ action: 'init', ...plan }, null, 2));
  else printPlan(plan);
  if (has('--dry-run')) return;
  if (plan.status === 'conflict') throw new Error('初始化存在文件冲突，未写入任何文件');
  const files = await initializationFiles();
  await applyInitialization({ cwd, files, plan, templateRoot: packageRoot });
  if (!has('--no-verify-idempotent')) {
    const verification = await verifyInitializationIdempotent({ cwd, files, templateRoot: packageRoot });
    if (has('--json')) console.log(JSON.stringify({ idempotent: verification }, null, 2));
    else if (!verification.idempotent) {
      console.log(`幂等验证发现漂移：${verification.drift.join(', ')}`);
    } else {
      console.log('幂等验证通过：二次执行无变更');
    }
  }
}

async function audit() {
  const report = await runAudit(cwd);
  if (has('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`fe-harness 审计：${report.overallScore} 分 / 等级 ${report.overallGrade}`);
    for (const dim of report.dimensions) {
      console.log(`  ${dim.label}：${dim.score ?? 'MANUAL'} 分 (${dim.grade})${dim.tentative ? ' (暂定)' : ''}`);
    }
    if (report.improvements.length) {
      console.log('\n改进清单：');
      for (const item of report.improvements) {
        console.log(`  [${item.priority}] ${item.dimension}/${item.check}：${item.status}`);
      }
    }
  }
  const reportDir = resolve(cwd, 'tmp/fe-harness');
  await mkdir(reportDir, { recursive: true });
  await writeFile(resolve(reportDir, 'audit-report.md'), formatAuditMarkdown(report), 'utf8');
  process.exitCode = report.overallScore >= 60 ? 0 : 1;
}

async function optimize() {
  const groupFlag = option('--groups');
  const groups = groupFlag ? validateGroupSelection(groupFlag.split(',').map((s) => s.trim())) : getGroupKeys();
  const isDryRun = has('--dry-run');
  const files = await initializationFiles();

  if (isDryRun) {
    const proposal = await runOptimize(cwd, { groups, files, templateRoot: packageRoot });
    if (has('--json')) {
      console.log(JSON.stringify(proposal, null, 2));
    } else {
      console.log(`fe-harness optimize：${proposal.totalIssues} 个差异`);
      for (const [group, issues] of Object.entries(proposal.proposal)) {
        if (!issues.length) continue;
        console.log(`\n[${AUTHORIZATION_GROUPS[group].label}]`);
        for (const issue of issues) console.log(`  ${issue.status.padEnd(16)} ${issue.code} — ${issue.message}`);
      }
      console.log(`\n摘要：create=${proposal.summary.create} managed-update=${proposal.summary.managedUpdate} manual-merge=${proposal.summary.manualMerge}`);
    }
    return;
  }

  const result = await applyOptimize(cwd, { groups, files, templateRoot: packageRoot });
  if (has('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`fe-harness optimize：已处理 ${result.applied.filter((a) => a.applied).length} 项`);
    if (result.drift.length) {
      console.log(`幂等验证发现漂移：${result.drift.join(', ')}`);
    } else {
      console.log('幂等验证通过');
    }
  }
}

async function validate() {
  const result = await validateHarness(cwd);
  if (has('--json')) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`fe-harness validate：${result.summary.errors} 错误 / ${result.summary.warnings} 警告 — ${result.status}`);
    for (const issue of result.issues) {
      console.log(`  ${issue.severity === 'error' ? '✖' : '⚠'} ${issue.code} — ${issue.message}`);
    }
  }
  process.exitCode = result.status === 'passed' ? 0 : 1;
}

async function hosts(command) {
  if (!command || command === 'list') {
    const found = detectHosts(cwd);
    const all = getSupportedHosts();
    const payload = all.map((h) => ({ host: h, label: HOST_ADAPTERS[h].label, entry: HOST_ADAPTERS[h].entryFile, detected: found.includes(h) }));
    if (has('--json')) {
      console.log(JSON.stringify(payload, null, 2));
    } else {
      console.log('已检测到的宿主：');
      for (const item of payload) {
        console.log(`  ${item.detected ? '✓' : '✗'} ${item.host} (${item.label}) → ${item.entry || '需执行时核验'}`);
      }
    }
    return;
  }
  if (command === 'install') {
    const target = option('--host');
    const hostsToInstall = target ? [target] : getSupportedHosts();
    const results = await installAllThinEntries(cwd, hostsToInstall);
    if (has('--json')) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      for (const r of results) {
        console.log(`  ${r.action === 'keep' ? '✓' : r.action === 'manual' ? '⚠' : '✓'} ${r.host} → ${r.target || r.message}`);
      }
    }
    return;
  }
  throw new Error('hosts 仅支持 list 或 install');
}

async function skills(command = 'list') {
  if (wantsHelp(command)) return printHelp('skills');
  const sourceRoot = resolve(packageRoot, 'skills');
  const names = (await readdir(sourceRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (command === 'list') {
    console.log(has('--json') ? JSON.stringify({ skills: names }, null, 2) : names.join('\n'));
    return;
  }
  if (command !== 'install') throw new Error('skills 仅支持 list 或 install');
  const requested = option('--name');
  if (requested && !names.includes(requested)) throw new Error(`不存在 Skill：${requested}`);
  const selected = requested ? [requested] : names;
  const global = has('--global');
  if (!global && !has('--project')) throw new Error('请明确指定 --project 或 --global');
  const provider = option('--provider') || 'codex';
  if (!['codex', 'claude', 'cursor', 'all'].includes(provider)) {
    throw new Error('--provider 必须是 codex、claude、cursor 或 all');
  }
  if (option('--target') && provider === 'all') throw new Error('--target 不能与 --provider all 同时使用');
  const providers = provider === 'all' ? ['codex', 'claude', 'cursor'] : [provider];
  const roots = [];
  for (const currentProvider of providers) {
    const targetRoot = option('--target')
      ? resolve(option('--target'))
      : global
        ? currentProvider === 'codex'
          ? resolve(process.env.CODEX_HOME || resolve(homedir(), '.codex'), 'skills')
          : resolve(homedir(), currentProvider === 'claude' ? '.claude/skills' : '.cursor/skills')
        : resolve(cwd, currentProvider === 'claude' ? '.claude/skills' : '.agents/skills');
    if (!roots.some((item) => item.target === targetRoot)) {
      roots.push({ providers: [currentProvider], target: targetRoot });
    } else {
      roots.find((item) => item.target === targetRoot).providers.push(currentProvider);
    }
  }
  const installed = [];
  const skipped = [];
  const installations = [];
  for (const root of roots) {
    const rootInstalled = [];
    const rootSkipped = [];
    for (const name of selected) {
      const target = resolve(root.target, name);
      if ((await exists(target)) && !has('--force')) {
        skipped.push(name);
        rootSkipped.push(name);
        continue;
      }
      await mkdir(root.target, { recursive: true });
      await copyDirectory(resolve(sourceRoot, name), target, { force: has('--force') });
      installed.push(name);
      rootInstalled.push(name);
    }
    installations.push({ installed: rootInstalled, providers: root.providers, skipped: rootSkipped, target: root.target });
  }
  const uniqueInstalled = [...new Set(installed)];
  const uniqueSkipped = [...new Set(skipped)];
  const payload = {
    installations,
    installed: uniqueInstalled,
    provider,
    scope: global ? 'global' : 'project',
    skipped: uniqueSkipped,
    target: roots.length === 1 ? roots[0].target : null,
    targets: roots.map((item) => item.target),
  };
  console.log(has('--json') ? JSON.stringify(payload, null, 2) : `已安装 ${uniqueInstalled.length} 个 Skill，跳过 ${uniqueSkipped.length} 个：${payload.targets.join(', ')}`);
}

async function ui(subject = 'systems', command = 'list', name) {
  if (subject !== 'systems' || wantsHelp(command)) return printHelp('ui');
  const sourceRoot = resolve(packageRoot, 'ui-systems');
  const names = (await readdir(sourceRoot, { withFileTypes: true })).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
  if (command === 'list') {
    const systems = [];
    for (const current of names) {
      const descriptor = YAML.parse(await readFile(resolve(sourceRoot, current, 'adapter.yaml'), 'utf8'));
      systems.push({ id: descriptor.id, status: descriptor.status, version: descriptor.version });
    }
    console.log(has('--json') ? JSON.stringify({ systems }, null, 2) : systems.map((item) => `${item.id}@${item.version} (${item.status})`).join('\n'));
    return;
  }
  if (command !== 'install' || !name || !names.includes(name)) throw new Error('请指定可用的 UI System Adapter');
  const source = resolve(sourceRoot, name, 'adapter.yaml');
  const target = resolve(cwd, `.fe-harness/ui-systems/${name}/adapter.yaml`);
  const descriptor = YAML.parse(await readFile(source, 'utf8'));
  const payload = {
    action: 'install-ui-system',
    config: { facts: { ui_system_adapter: `.fe-harness/ui-systems/${name}/adapter.yaml` }, ui: { system: { adapter: descriptor.id, policy: 'preferred', version: descriptor.version } } },
    status: (await exists(target)) ? 'conflict' : 'ready',
    target: relative(cwd, target),
  };
  console.log(has('--json') || has('--dry-run') ? JSON.stringify(payload, null, 2) : `${payload.status} ${payload.target}`);
  if (has('--dry-run')) return;
  if (payload.status === 'conflict') throw new Error('目标 Adapter 已存在，拒绝覆盖');
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
}

async function inspect() {
  if (has('--map')) {
    const result = await generateCodebaseMaps(cwd);
    console.log(has('--json') ? JSON.stringify(result, null, 2) : `代码图谱已生成到 ${result.outputDir}：${result.maps.join(', ')}`);
    return;
  }
  const { config, path } = await loadProjectConfig(cwd);
  const inputInspection = await inspectInputs(cwd);
  const tokenInspection = await inspectDesignTokens(cwd, config);
  const uiInspection = config.project?.product_type === 'consumer_h5' ? await inspectUiGovernance(cwd, config) : null;
  const facts = {};
  for (const [name, value] of Object.entries(config.facts || {})) facts[name] = await exists(resolve(cwd, value));
  const payload = {
    configPath: path,
    project: config.project,
    stack: config.stack,
    facts,
    modes: Object.keys(config.verify || {}),
    apiSnapshot: config.sources?.api?.snapshot || null,
    designTokens: {
      source: tokenInspection.source || null,
      status: tokenInspection.status,
    },
    uiSystem: uiInspection ? {
      adapter: config.ui?.system?.adapter || null,
      issues: uiInspection.issues.length,
      status: uiInspection.status,
      version: config.ui?.system?.version || null,
    } : null,
    inputs: {
      count: inputInspection.inputs.length,
      manifest: inputInspection.manifest,
      status: inputInspection.status,
      unregistered: inputInspection.discovered.length,
    },
    agentWorkflow: {
      canonicalConstraints: await exists(resolve(cwd, 'AGENTS.md')),
      claudeAdapter: await exists(resolve(cwd, 'CLAUDE.md')),
      claudeSkills: await exists(resolve(cwd, '.claude/skills/consumer-h5-harness/SKILL.md')),
      cursorAdapter: await exists(resolve(cwd, '.cursor/rules/fe-harness.mdc')),
      guide: await exists(resolve(cwd, config.facts?.agent_entry || 'AGENTS.md')),
      skill: await exists(resolve(cwd, '.agents/skills/consumer-h5-harness/SKILL.md')),
      cli: true,
    },
  };
  console.log(has('--json') ? JSON.stringify(payload, null, 2) : `${payload.project.name}: ${payload.project.product_type} / ${payload.stack.adapter}`);
}

async function plan(kind, name) {
  if (wantsHelp(kind) || !kind) {
    printHelp('plan');
    return;
  }
  if (kind === 'init') {
    const value = { action: 'init', ...(await initializationPlan()) };
    console.log(JSON.stringify(value, null, 2));
    if (value.status === 'conflict') process.exitCode = 1;
    return;
  }
  throw new Error('plan 仅支持 init。新项目请使用 fe-harness scaffold');
}

function printDoctor(report) {
  for (const item of report.results) console.log(`${(item.display_name || item.status).padEnd(8)} ${item.code} ${item.name} - ${item.message}`);
}

async function doctor() {
  const { config } = await loadProjectConfig(cwd);
  const report = await runDoctor(cwd, config);
  if (has('--json')) console.log(JSON.stringify(report, null, 2)); else printDoctor(report);
  process.exitCode = report.status === 'passed' ? 0 : 1;
}

async function verify(mode) {
  if (wantsHelp(mode) || !mode) {
    printHelp('verify');
    return;
  }
  const { config } = await loadProjectConfig(cwd);
  const definition = resolveVerifySteps(config, mode);
  const verification = await runVerification({ cwd, mode, ...definition });
  const report = await writeReport(cwd, verification);
  console.log(has('--json') ? JSON.stringify(report, null, 2) : `fe-harness ${mode}: ${report.status}`);
  process.exitCode = report.status === 'passed' ? 0 : 1;
}

async function inputs(command) {
  if (wantsHelp(command)) {
    printHelp('inputs');
    return;
  }
  const inspection = command === 'analyze' ? await analyzeInputs(cwd) : await inspectInputs(cwd);
  if (has('--json')) {
    console.log(JSON.stringify(inspection, null, 2));
    return;
  }
  if (command === 'analyze') {
    console.log(`输入分析：${inspection.status === 'passed' ? '通过' : '需要处理'}`);
    console.log(`抽取证据：${inspection.facts.length}`);
    for (const issue of inspection.issues) console.log(`- ${issue.display_name}：${issue.message}`);
    return;
  }
  if (command === 'diff') {
    console.log(`输入变更：${inspection.issues.length ? '需要处理' : '无未处理差异'}`);
  } else {
    console.log(`输入清单：${inspection.exists ? '已配置' : '未配置'}`);
    console.log(`已登记输入：${inspection.inputs.length}`);
    console.log(`未登记输入：${inspection.discovered.length}`);
  }
  for (const issue of inspection.issues) console.log(`- ${issue.display_name}：${issue.message}`);
}

async function apiContext(taskId) {
  if (!taskId || !/^T\d+$/.test(taskId)) throw new Error('请使用 --task T001 指定任务');
  const selectionPath = resolve(cwd, '.fe-harness/api/selection.yaml');
  if (!(await exists(selectionPath))) throw new Error('缺少 .fe-harness/api/selection.yaml');
  const selection = YAML.parse(await readFile(selectionPath, 'utf8')) || {};
  const taskSelection = selection.tasks?.[taskId];
  if (!taskSelection) throw new Error(`selection.yaml 未配置任务 ${taskId}`);
  if (!Array.isArray(taskSelection.operations) || !taskSelection.operations.length) {
    throw new Error(`任务 ${taskId} 尚未选择 operation`);
  }
  const manifest = await readInputManifest(cwd);
  const apiInput = manifest.inputs.find((item) => item.id === taskSelection.api_input && item.type === 'api' && item.status !== 'superseded');
  if (!apiInput) throw new Error(`manifest 中找不到 API 输入 ${taskSelection.api_input || '<missing>'}`);
  const prdInputs = Array.isArray(taskSelection.prd_inputs) ? taskSelection.prd_inputs : [];
  const missingPrd = prdInputs.filter((id) => !manifest.inputs.some((item) => item.id === id && item.type === 'prd'));
  if (missingPrd.length) throw new Error(`manifest 中找不到 PRD 输入：${missingPrd.join(', ')}`);
  const sourcePath = resolve(cwd, apiInput.path || '');
  if (!(await exists(sourcePath))) throw new Error(`API 输入文件不存在：${apiInput.path}`);
  let document;
  try { document = JSON.parse(await readFile(sourcePath, 'utf8')); } catch { throw new Error('API 输入不是有效 JSON；首版请从 Apifox 导出 OpenAPI JSON'); }
  return { apiInput, document, prdInputs, sourcePath: apiInput.path, taskId, taskSelection };
}

async function api(command) {
  if (wantsHelp(command) || !command) return printHelp('api');
  if (!['inspect', 'generate'].includes(command)) throw new Error('api 仅支持 inspect 或 generate');
  const context = await apiContext(option('--task'));
  const available = listOpenApiOperations(context.document);
  const selected = new Set(context.taskSelection.operations);
  const missing = [...selected].filter((operationId) => !available.some((item) => item.operationId === operationId));
  if (missing.length) throw new Error(`OpenAPI 中找不到 operation：${missing.join(', ')}`);
  if (command === 'inspect') {
    const payload = {
      apiInput: context.apiInput.id,
      availableOperations: available,
      prdInputs: context.prdInputs,
      selectedOperations: available.filter((item) => selected.has(item.operationId)),
      sourcePath: context.sourcePath,
      taskId: context.taskId,
    };
    console.log(has('--json') ? JSON.stringify(payload, null, 2) : `任务 ${context.taskId}：已选择 ${payload.selectedOperations.length}/${available.length} 个接口`);
    return;
  }
  const generation = await planOpenApiGeneration({
    cwd,
    document: context.document,
    operationIds: context.taskSelection.operations,
    sourcePath: context.sourcePath,
    taskId: context.taskId,
  });
  const payload = {
    entries: generation.entries.map(({ content: _content, ...entry }) => entry),
    metadataPath: generation.metadataPath,
    operations: generation.metadata.operations,
    status: generation.status,
    taskId: context.taskId,
  };
  if (has('--json') || has('--dry-run')) console.log(JSON.stringify(payload, null, 2));
  else for (const entry of payload.entries) console.log(`${entry.status.padEnd(14)} ${entry.target}`);
  if (has('--dry-run')) {
    if (generation.status === 'conflict') process.exitCode = 1;
    return;
  }
  await applyOpenApiGeneration(cwd, generation);
  if (!has('--json')) console.log(`已为任务 ${context.taskId} 生成 ${generation.metadata.operations.length} 个接口封装`);
}

async function design(command, subject) {
  if (wantsHelp(command) || wantsHelp(subject)) {
    printHelp('design');
    return;
  }
  if (command !== 'tokens') throw new Error('design 目前仅支持 tokens');
  const { config } = await loadProjectConfig(cwd);
  if (subject === 'discover') {
    const discovery = await discoverDesignTokenCandidates(cwd);
    if (has('--json')) console.log(JSON.stringify(discovery, null, 2));
    else console.log(discovery.summary);
    return;
  }
  const inspection = await inspectDesignTokens(cwd, config);
  if (has('--json')) {
    console.log(JSON.stringify(inspection, null, 2));
    return;
  }
  console.log(subject === 'diff' ? 'Design Token 差异：需要项目提供前后版本时计算' : `Design Token：${inspection.source || '未配置'}`);
  for (const issue of inspection.issues || []) console.log(`- ${issue.display_name}：${issue.message}`);
}

async function nextTaskId() {
  const modulesRoot = resolve(cwd, '.fe-harness/inputs/prd/modules');
  let max = 0;
  try {
    for (const entry of await readdir(modulesRoot, { withFileTypes: true })) {
      const match = entry.isDirectory() ? entry.name.match(/^T(\d+)$/) : null;
      if (match) max = Math.max(max, Number(match[1]));
    }
  } catch {}
  return `T${String(max + 1).padStart(3, '0')}`;
}

async function task(command, taskId) {
  if (wantsHelp(command) || !command) {
    printHelp('task');
    return;
  }
  if (command === 'create') {
    const id = taskId && /^T\d+$/.test(taskId) ? taskId : await nextTaskId();
    const title = option('--title') || '未命名任务';
    const root = resolve(cwd, '.fe-harness/inputs/prd/modules', id);
    await mkdir(resolve(root, 'attachments'), { recursive: true });
    const today = new Date().toISOString().slice(0, 10);
    await writeFile(resolve(root, 'PRD.md'), `# ${title}\n\n待补充产品需求。\n`, { flag: 'wx' });
    await writeFile(
      resolve(root, 'metadata.yaml'),
      YAML.stringify({
        created_at: today,
        dependencies: [],
        id,
        sources: [],
        status: '草稿',
        supersedes: [],
        title,
        updated_at: today,
        version: '1.0',
      }),
      { flag: 'wx' },
    );
    const manifestPath = resolve(cwd, '.fe-harness/inputs/manifest.yaml');
    const manifest = (await exists(manifestPath))
      ? YAML.parse(await readFile(manifestPath, 'utf8')) || {}
      : {};
    const inputs = Array.isArray(manifest.inputs) ? manifest.inputs : [];
    const prdPath = `.fe-harness/inputs/prd/modules/${id}/PRD.md`;
    if (!inputs.some((item) => item.id === `PRD-${id}` || item.path === prdPath)) {
      inputs.push({
        id: `PRD-${id}`,
        path: prdPath,
        status: 'active',
        task_id: id,
        type: 'prd',
        version: '1.0',
      });
    }
    await mkdir(dirname(manifestPath), { recursive: true });
    await writeFile(manifestPath, YAML.stringify({ ...manifest, inputs }), 'utf8');
    const historyPath = resolve(cwd, 'docs/history/PRD_HISTORY.md');
    if (await exists(historyPath)) {
      await appendFile(
        historyPath,
        `| ${id} | ${title} | 1.0 | 草稿 | ${prdPath} | ${today} | 未执行 | 未创建 |\n`,
        'utf8',
      );
    }
    const payload = { id, path: relative(cwd, root), title };
    console.log(has('--json') ? JSON.stringify(payload, null, 2) : `已创建任务 ${id}：${title}`);
    return;
  }
  if (!taskId) throw new Error('请提供任务编号，例如 T001');
  if (command === 'snapshot') {
    const snapshot = await createTaskSnapshot(cwd, {
      taskId,
      title: option('--title') || '未命名任务',
      userRequest: option('--request') || '',
    });
    console.log(has('--json') ? JSON.stringify(snapshot, null, 2) : `已创建任务快照：${snapshot.path}`);
    return;
  }
  const history = await inspectTaskHistory(cwd, taskId);
  console.log(has('--json') ? JSON.stringify(history, null, 2) : `任务 ${taskId} 快照数：${history.snapshots.length}`);
}

async function scaffold(name) {
  if (wantsHelp(name) || !name) return printHelp('scaffold');

  const profileFlag = option('--profile');

  // 无 --profile 时进入交互式多轮问答
  if (!profileFlag) {
    const interactiveConfig = await interactiveScaffold(name);
    if (!interactiveConfig) return;

    const issues = validateScaffoldConfig(interactiveConfig);
    if (issues.length) throw new Error(issues.join('；'));

    interactiveConfig.templateRoot = packageRoot;
    const result = await runScaffold(cwd, interactiveConfig);
    console.log(`\n✅ 项目创建完成：${result.outputDir}`);
    console.log('\n下一步：');
    console.log(`  cd ${name}`);
    console.log('  把 PRD/RP/UI/API/assets 放入 .fe-harness/inputs/');
    console.log('  fe-harness inputs inspect --json');
    console.log('  fe-harness task create --title "首期需求"');
    console.log('  fe-harness doctor');
    return;
  }

  // 有 --profile 时走参数模式
  const profile = profileFlag;
  const stack = option('--stack') || getAvailableStacks(profile)[0];
  const uiSystem = option('--ui') || null;
  const hostsFlag = option('--hosts');
  const hosts = hostsFlag ? hostsFlag.split(',').map((s) => s.trim()) : ['codex'];
  const skipInstall = has('--skip-install');
  const skipFrameworkCli = has('--skip-framework-cli');
  const dryRun = has('--dry-run');
  const withRoutes = has('--with-routes');
  const prdPath = option('--prd');

  const options = {};
  for (const opt of getStackOptions(stack)) {
    if (opt.flag && has(opt.flag.replace(/^--/, ''))) options[opt.key] = true;
    else if (has(`--no-${opt.key}`)) options[opt.key] = false;
    else options[opt.key] = opt.default;
  }

  const config = { name, profile, stack, uiSystem, hosts, options, skipInstall, skipFrameworkCli, dryRun, withRoutes, prdPath, templateRoot: packageRoot };
  const issues = validateScaffoldConfig(config);
  if (issues.length) throw new Error(issues.join('；'));

  if (dryRun) {
    const result = await runScaffold(cwd, config);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (has('--json')) {
    const result = await runScaffold(cwd, config);
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\nfe-harness scaffold: ${name}`);
    console.log(`  Profile:   ${profile}`);
    console.log(`  Stack:     ${stack}`);
    if (uiSystem) console.log(`  UI System: ${uiSystem}`);
    console.log(`  Hosts:     ${hosts.join(', ')}`);
    console.log('');

    const result = await runScaffold(cwd, config);
    for (const step of result.steps) {
      const icon = step.status === 'passed' ? '✓' : step.status === 'manual' ? '⚠' : '✖';
      console.log(`  ${icon} ${step.step}. ${step.description}`);
    }
    console.log(`\n✅ 项目创建完成：${result.outputDir}`);
    console.log('\n下一步：');
    console.log(`  cd ${name}`);
    console.log('  把 PRD/RP/UI/API/assets 放入 .fe-harness/inputs/');
    console.log('  fe-harness inputs inspect --json');
    console.log('  fe-harness task create --title "首期需求"');
    console.log('  fe-harness doctor');
  }
}

async function main() {
  const [, , command, argument, secondArgument, thirdArgument] = process.argv;
  if (command === '-v' || command === '--version') {
    return console.log((await readFile(resolve(packageRoot, 'VERSION'), 'utf8')).trim());
  }
  if (command === 'help') return printHelp(argument || 'main');
  if (!command || wantsHelp(command)) return printHelp('main');
  if (command === 'init') return init();
  if (command === 'scaffold') {
    return scaffold(argument);
  }
  if (command === 'inspect') {
    if (wantsHelp(argument)) return printHelp('inspect');
    return inspect();
  }
  if (command === 'audit') {
    if (wantsHelp(argument)) return printHelp('audit');
    return audit();
  }
  if (command === 'optimize') {
    if (wantsHelp(argument)) return printHelp('optimize');
    return optimize();
  }
  if (command === 'validate') {
    if (wantsHelp(argument)) return printHelp('validate');
    return validate();
  }
  if (command === 'hosts') {
    return hosts(argument || 'list');
  }
  if (command === 'plan') return plan(argument, secondArgument);
  if (command === 'doctor') {
    if (wantsHelp(argument)) return printHelp('doctor');
    return doctor();
  }
  if (command === 'verify') return verify(argument);
  if (command === 'inputs') return inputs(argument || 'inspect');
  if (command === 'api') return api(argument);
  if (command === 'design') return design(argument, secondArgument || 'inspect');
  if (command === 'task') return task(argument, secondArgument, thirdArgument);
  if (command === 'skills') return skills(argument || 'list');
  if (command === 'ui') return ui(argument, secondArgument, thirdArgument);
  if (command === 'version') {
    if (wantsHelp(argument)) return printHelp('version');
    return console.log((await readFile(resolve(packageRoot, 'VERSION'), 'utf8')).trim());
  }
  console.error(`未知命令：${command}\n`);
  printHelp('main');
  process.exitCode = 1;
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
