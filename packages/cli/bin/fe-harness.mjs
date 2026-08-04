#!/usr/bin/env node

import { access, appendFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  applyInitialization,
  applyProjectCreation,
  analyzeInputs,
  createTaskSnapshot,
  inspectDesignTokens,
  inspectInputs,
  inspectTaskHistory,
  loadProjectConfig,
  planInitialization,
  planProjectCreation,
  publicPlan,
  resolveVerifySteps,
  runDoctor,
  runVerification,
  writeReport,
} from '../../core/src/index.mjs';
import YAML from 'yaml';

const cwd = process.cwd();
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const initFiles = [
  ['templates/AGENTS.md', 'AGENTS.md'],
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
  ['templates/ASSETS_INPUT.md', '.fe-harness/inputs/assets/README.md'],
  ['templates/SNAPSHOTS.md', '.fe-harness/snapshots/README.md'],
  ['templates/PRD_HISTORY.md', 'docs/history/PRD_HISTORY.md'],
  ['templates/CHANGE_HISTORY.md', 'docs/history/CHANGE_HISTORY.md'],
  ['templates/IMPLEMENTATION_COVERAGE.md', 'docs/IMPLEMENTATION_COVERAGE.md'],
  ['templates/TOKENS.json', 'docs/design/tokens.json'],
  ['templates/TOKENS.md', 'docs/design/TOKENS.md'],
  ['templates/COMPONENTS.md', 'docs/design/COMPONENTS.md'],
  ['skills/consumer-h5-harness/SKILL.md', '.agents/skills/consumer-h5-harness/SKILL.md'],
  ['skills/consumer-h5-harness/agents/openai.yaml', '.agents/skills/consumer-h5-harness/agents/openai.yaml'],
  ['templates/project.yaml', '.fe-harness/project.yaml'],
];

function has(flag) { return process.argv.includes(flag); }
function option(flag) { const index = process.argv.indexOf(flag); return index < 0 ? undefined : process.argv[index + 1]; }
async function exists(path) { try { await access(path); return true; } catch { return false; } }

const HELP = {
  main: `fe-harness - 前端工程约束、输入管理和验证工具

用法：
  fe-harness <命令> [参数] [选项]

常用流程：
  fe-harness create <项目名> --output <目录>  创建 consumer-h5 项目
  fe-harness init --dry-run                  查看接入现有项目会创建哪些文件
  fe-harness inspect --json                  查看项目配置、输入和 Token 状态
  fe-harness doctor                          诊断项目约束、命令、输入、历史和视觉基线
  fe-harness verify quick                    执行快速验证
  fe-harness verify visual                   执行视觉回归；缺少基线时显示“未配置”

命令分组：
  create      创建新的 consumer-h5 项目
  init        向现有项目补充 Harness 文件，不覆盖项目已维护内容
  inspect     查看项目事实、输入清单、Token 和 Agent 工作流
  plan        输出 init/create 的结构化计划
  doctor      只读诊断项目配置、输入、历史、Token、脚本和验证能力
  verify      执行 quick/feature/runtime/interaction/visual/audit
  inputs      查看、比对和分析 PRD/RP/UI/API/assets 输入
  design      查看 Design Token 真值文件
  task        创建任务、查看历史、创建不可变任务快照
  version     输出 fe-harness 版本

全局选项：
  -h, --help  显示帮助
  --json      输出稳定 JSON，适合 Agent 和 CI

更多示例：
  fe-harness inputs analyze --json
  fe-harness design tokens inspect --json
  fe-harness task create T001 --title "酒店搜索与列表"
  fe-harness task snapshot T001 --title "酒店搜索与列表" --request "完成列表样式"
`,
  create: `fe-harness create - 创建新的 consumer-h5 项目

用法：
  fe-harness create <项目名> [--output <目录>] [--dry-run] [--json]

说明：
  项目名只能使用小写字母、数字和连字符。
  默认输出到当前目录下的同名子目录。
  create 会生成中文 AGENTS、输入目录、历史目录、Token 文件、uni-app H5 最小工程和测试基础设施。

示例：
  fe-harness create hotel-h5
  fe-harness create hotel-h5 --output /tmp/hotel-h5
  fe-harness create hotel-h5 --dry-run --json
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

输出：
  project.yaml 路径、项目类型、技术栈、事实文档存在性、verify 模式、输入清单、Design Token 和 Agent 工作流。
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
  design: `fe-harness design - 设计与 Token 工具

用法：
  fe-harness design tokens inspect [--json]
  fe-harness design tokens diff [--json]

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
  return planInitialization({ cwd, files: initFiles, templateRoot: packageRoot });
}

async function init() {
  const plan = await initializationPlan();
  if (has('--json')) console.log(JSON.stringify({ action: 'init', ...plan }, null, 2));
  else printPlan(plan);
  if (has('--dry-run')) return;
  if (plan.status === 'conflict') throw new Error('初始化存在文件冲突，未写入任何文件');
  await applyInitialization({ cwd, files: initFiles, plan, templateRoot: packageRoot });
}

async function creationPlan(name) {
  if (!name || !/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new Error('项目名必须使用小写字母、数字和连字符');
  const presetRoot = resolve(packageRoot, 'presets/consumer-h5');
  const files = await listFiles(presetRoot);
  files.push(
    { source: resolve(packageRoot, 'skills/consumer-h5-harness/SKILL.md'), target: '.agents/skills/consumer-h5-harness/SKILL.md' },
    { source: resolve(packageRoot, 'skills/consumer-h5-harness/agents/openai.yaml'), target: '.agents/skills/consumer-h5-harness/agents/openai.yaml' },
  );
  return planProjectCreation({ name, output: resolve(option('--output') || resolve(cwd, name)), presetRoot, files });
}

async function create(name) {
  const plan = await creationPlan(name);
  if (has('--json') || has('--dry-run')) console.log(JSON.stringify(publicPlan(plan), null, 2));
  else printPlan(plan);
  if (has('--dry-run')) return;
  await applyProjectCreation(plan);
  console.log(`Created ${name}. Next: cd ${plan.output} && pnpm install && fe-harness doctor`);
}

async function inspect() {
  const { config, path } = await loadProjectConfig(cwd);
  const inputInspection = await inspectInputs(cwd);
  const tokenInspection = await inspectDesignTokens(cwd, config);
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
    inputs: {
      count: inputInspection.inputs.length,
      manifest: inputInspection.manifest,
      status: inputInspection.status,
      unregistered: inputInspection.discovered.length,
    },
    agentWorkflow: {
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
  const value = kind === 'init' ? { action: 'init', ...(await initializationPlan()) } : publicPlan(await creationPlan(name));
  console.log(JSON.stringify(value, null, 2));
  if (value.status === 'conflict') process.exitCode = 1;
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

async function design(command, subject) {
  if (wantsHelp(command) || wantsHelp(subject)) {
    printHelp('design');
    return;
  }
  if (command !== 'tokens') throw new Error('design 目前仅支持 tokens');
  const { config } = await loadProjectConfig(cwd);
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

async function main() {
  const [, , command, argument, secondArgument, thirdArgument] = process.argv;
  if (command === 'help') return printHelp(argument || 'main');
  if (!command || wantsHelp(command)) return printHelp('main');
  if (command === 'init') return init();
  if (command === 'create') {
    if (wantsHelp(argument) || !argument) return printHelp('create');
    return create(argument);
  }
  if (command === 'inspect') {
    if (wantsHelp(argument)) return printHelp('inspect');
    return inspect();
  }
  if (command === 'plan') return plan(argument, secondArgument);
  if (command === 'doctor') {
    if (wantsHelp(argument)) return printHelp('doctor');
    return doctor();
  }
  if (command === 'verify') return verify(argument);
  if (command === 'inputs') return inputs(argument || 'inspect');
  if (command === 'design') return design(argument, secondArgument || 'inspect');
  if (command === 'task') return task(argument, secondArgument, thirdArgument);
  if (command === 'version') {
    if (wantsHelp(argument)) return printHelp('version');
    return console.log((await readFile(resolve(packageRoot, 'VERSION'), 'utf8')).trim());
  }
  console.error(`未知命令：${command}\n`);
  printHelp('main');
  process.exitCode = 1;
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
