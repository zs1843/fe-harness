import { access, readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { execSync } from 'node:child_process';
import readline from 'node:readline';

import { loadProjectConfig } from './config.mjs';
import { planInitialization, applyInitialization, verifyInitializationIdempotent } from './init.mjs';
import { installThinEntry, getSupportedHosts, HOST_ADAPTERS } from './host-adapters.mjs';
import { analyzeInputs } from './inputs.mjs';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function createRl() {
  return readline.createInterface({ input: process.stdin, output: process.stdout });
}

async function askQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer.trim()));
  });
}

async function askSelect(rl, question, choices, defaultIndex = 0) {
  console.log(`\n${question}`);
  choices.forEach((choice, i) => {
    const marker = i === defaultIndex ? '❯' : ' ';
    console.log(`  ${marker} ${choice.label || choice}`);
  });
  const answer = await askQuestion(rl, `\n请选择 (1-${choices.length}, 默认 ${defaultIndex + 1}): `);
  const index = answer ? Math.max(0, Math.min(choices.length - 1, parseInt(answer, 10) - 1)) : defaultIndex;
  const selected = choices[index];
  console.log(`  → 已选择: ${selected.label || selected}`);
  return typeof selected === 'string' ? selected : selected.value || selected.label || selected;
}

async function askMultiSelect(rl, question, choices, defaultSelected = [0]) {
  console.log(`\n${question}`);
  choices.forEach((choice, i) => {
    const marker = defaultSelected.includes(i) ? '◉' : '◯';
    console.log(`  ${marker} ${choice.label || choice}`);
  });
  const answer = await askQuestion(rl, `\n请输入序号，逗号分隔 (默认 ${defaultSelected.map(i => i + 1).join(',')}): `);
  const indices = answer
    ? answer.split(',').map(s => parseInt(s.trim(), 10) - 1).filter(i => i >= 0 && i < choices.length)
    : defaultSelected;
  const selected = indices.map(i => {
    const c = choices[i];
    return typeof c === 'string' ? c : c.value || c.label || c;
  });
  console.log(`  → 已选择: ${selected.join(', ')}`);
  return selected;
}

async function askConfirm(rl, question, defaultValue = true) {
  const answer = await askQuestion(rl, `${question} (${defaultValue ? 'Y/n' : 'y/N'}): `);
  if (!answer) return defaultValue;
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

const PROFILE_CHOICES = [
  { label: '后台管理系统 (admin-web)', value: 'admin-web' },
  { label: '消费者 H5 (consumer-h5)', value: 'consumer-h5' },
  { label: '微信/支付宝小程序 (mini-program)', value: 'mini-program' },
];

const STACK_LABELS = {
  'vue3-vite': 'Vue 3 + Vite (纯 Web)',
  'react-vite': 'React + Vite (纯 Web)',
  'uni-app': 'uni-app (跨端 H5/小程序)',
  'taro': 'Taro (跨端小程序/H5)',
  'next.js': 'Next.js (React SSR/SSG)',
};

const UI_LABELS = {
  'element-plus': 'Element Plus (Vue 3 后台首选)',
  'ant-design-vue': 'Ant Design Vue (Vue 3 企业级)',
  'arco-design-vue': 'Arco Design Vue (字节设计)',
  'tdesign-web-vue': 'TDesign Web Vue (腾讯设计)',
  'tdesign-uniapp': 'TDesign UniApp (uni-app 组件库)',
  'ant-design': 'Ant Design (React)',
};

const HOST_CHOICES = [
  { label: 'Codex', value: 'codex' },
  { label: 'OpenCode', value: 'opencode' },
  { label: 'Claude Code', value: 'claude' },
  { label: 'Cursor', value: 'cursor' },
  { label: 'Trae', value: 'trae' },
];

export async function interactiveScaffold(name) {
  const rl = createRl();
  const config = { name };

  try {
    console.log(`\n┌  fe-harness 项目脚手架  ┐`);
    console.log(`  项目名: ${name}\n`);

    // 第1轮：产品形态
    config.profile = await askSelect(rl, '第1轮：这是什么类型的产品？', PROFILE_CHOICES, 0);

    // 第2轮：技术框架（根据 profile 级联过滤）
    const availableStacks = getAvailableStacks(config.profile);
    const stackChoices = availableStacks.map(s => ({ label: STACK_LABELS[s] || s, value: s }));
    config.stack = await askSelect(rl, '第2轮：用什么技术框架？', stackChoices, 0);

    // 第3轮：框架选项（根据 stack 级联过滤）
    const stackOptions = getStackOptions(config.stack);
    if (stackOptions.length > 0) {
      console.log(`\n第3轮：框架选项`);
      const selectedOptions = {};
      for (const opt of stackOptions) {
        if (opt.choices) {
          const choiceLabels = opt.choices.map(c => ({ label: c, value: c }));
          selectedOptions[opt.key] = await askSelect(rl, `${opt.label}？`, choiceLabels, 0);
        } else {
          selectedOptions[opt.key] = await askConfirm(rl, `${opt.label}？`, opt.default !== false);
        }
      }
      config.options = selectedOptions;
    }

    // 第4轮：UI 组件库（根据 stack 级联过滤）
    const availableUi = getAvailableUiSystems(config.stack);
    if (availableUi.length > 0) {
      const uiChoices = [
        ...availableUi.map(u => ({ label: UI_LABELS[u] || u, value: u })),
        { label: '不配置', value: null },
      ];
      config.uiSystem = await askSelect(rl, '第4轮：用什么 UI 组件库？', uiChoices, 0);
    } else {
      console.log(`\n第4轮：该框架暂无可用 UI 组件库，跳过`);
      config.uiSystem = null;
    }

    // 第5轮：Agent 宿主
    config.hosts = await askMultiSelect(rl, '第5轮：选择 Agent 宿主（可多选）', HOST_CHOICES, [0]);

    // 第6轮：路由拆分
    const withRoutes = await askConfirm(rl, '\n第6轮：是否根据 PRD 做路由拆分？（需要提供 PRD 文件）', false);
    if (withRoutes) {
      const prdPath = await askQuestion(rl, '请输入 PRD 文件路径: ');
      config.withRoutes = true;
      config.prdPath = prdPath;
    }

    // 第7轮：安装依赖
    config.skipInstall = !(await askConfirm(rl, '\n第7轮：是否安装依赖？', true));

    // 确认
    console.log('\n────────── 确认 ──────────');
    console.log(`  项目名:    ${config.name}`);
    console.log(`  Profile:   ${config.profile}`);
    console.log(`  Stack:     ${config.stack}`);
    if (config.uiSystem) console.log(`  UI System: ${config.uiSystem}`);
    console.log(`  宿主:      ${config.hosts.join(', ')}`);
    if (config.options) {
      const optSummary = Object.entries(config.options).map(([k, v]) => `${k}=${v}`).join(', ');
      console.log(`  框架选项:  ${optSummary}`);
    }
    if (config.withRoutes) console.log(`  路由拆分:  是 (${config.prdPath})`);
    console.log(`  依赖安装:  ${config.skipInstall ? '否' : '是'}`);

    const confirmed = await askConfirm(rl, '\n确认创建？', true);
    if (!confirmed) {
      console.log('已取消。');
      return null;
    }

    return config;
  } finally {
    rl.close();
  }
}

export const COMPATIBILITY = {
  'consumer-h5': {
    stacks: ['uni-app', 'vue3-vite', 'taro', 'react-vite'],
  },
  'admin-web': {
    stacks: ['vue3-vite', 'react-vite'],
  },
  'mini-program': {
    stacks: ['uni-app', 'taro'],
  },
};

export const STACK_UI = {
  'uni-app': ['tdesign-uniapp'],
  'vue3-vite': ['element-plus', 'ant-design-vue', 'arco-design-vue', 'tdesign-web-vue'],
  'react-vite': ['ant-design'],
  'taro': [],
  'next.js': ['ant-design'],
};

export const STACK_OPTIONS = {
  'vue3-vite': [
    { key: 'typescript', label: 'TypeScript', flag: '--typescript', default: true },
    { key: 'router', label: 'Vue Router', flag: '--router', default: true },
    { key: 'pinia', label: 'Pinia 状态管理', flag: '--pinia', default: true },
    { key: 'eslint', label: 'ESLint + Prettier', flag: '--eslint', default: true },
  ],
  'react-vite': [
    { key: 'typescript', label: 'TypeScript', flag: '--template react-ts', default: true },
  ],
  'uni-app': [
    { key: 'typescript', label: 'TypeScript', default: true },
    { key: 'pinia', label: 'Pinia 状态管理', default: true },
  ],
  'taro': [
    { key: 'framework', label: '框架语法', choices: ['React', 'Vue'], default: 'React' },
    { key: 'typescript', label: 'TypeScript', default: true },
  ],
  'next.js': [
    { key: 'typescript', label: 'TypeScript', flag: '--typescript', default: true },
    { key: 'tailwind', label: 'TailwindCSS', flag: '--tailwind', default: false },
  ],
};

export const FRAMEWORK_CLIS = {
  'vue3-vite': {
    command: (name, options) => {
      const flags = [];
      if (options.typescript) flags.push('--typescript');
      if (options.router) flags.push('--router');
      if (options.pinia) flags.push('--pinia');
      if (options.eslint) flags.push('--eslint');
      return `npm create vue@latest ${name} -- ${flags.join(' ')}`.trim();
    },
    postInstall: null,
  },
  'react-vite': {
    command: (name, options) => {
      const template = options.typescript ? 'react-ts' : 'react';
      return `npm create vite@latest ${name} -- --template ${template}`;
    },
    postInstall: null,
  },
  'uni-app': {
    command: (name, options) => {
      const template = options.typescript ? 'vite-ts' : 'vite';
      return `npx degit dcloudio/uni-preset-vue#${template} ${name}`;
    },
    postInstall: null,
  },
  'taro': {
    command: (name, options) => {
      const framework = (options.framework || 'React').toLowerCase();
      const tsFlag = options.typescript ? '--typescript' : '';
      return `npx @tarojs/cli init ${name} --template ${framework} ${tsFlag}`.trim();
    },
    postInstall: null,
  },
  'next.js': {
    command: (name, options) => {
      const flags = ['--typescript'];
      if (options.tailwind) flags.push('--tailwind');
      flags.push('--app');
      return `npx create-next-app@latest ${name} ${flags.join(' ')}`;
    },
    postInstall: null,
  },
};

export const UI_INSTALL = {
  'element-plus': { package: 'element-plus', autoImport: '@element-plus/auto-import-plugin' },
  'ant-design-vue': { package: 'ant-design-vue' },
  'arco-design-vue': { package: '@arco-design/web-vue' },
  'tdesign-web-vue': { package: 'tdesign-vue-next' },
  'tdesign-uniapp': { package: 'tdesign-uniapp' },
  'ant-design': { package: 'antd' },
};

export function getAvailableStacks(profile) {
  return COMPATIBILITY[profile]?.stacks || [];
}

export function getAvailableUiSystems(stack) {
  return STACK_UI[stack] || [];
}

export function getStackOptions(stack) {
  return STACK_OPTIONS[stack] || [];
}

export function getDefaultOptions(stack) {
  const options = {};
  for (const opt of getStackOptions(stack)) {
    options[opt.key] = opt.default;
  }
  return options;
}

export function buildFrameworkCommand(stack, name, options) {
  const builder = FRAMEWORK_CLIS[stack];
  if (!builder) throw new Error(`不支持的 Stack：${stack}`);
  return builder.command(name, options || getDefaultOptions(stack));
}

function buildProjectYaml({ name, profile, stack, uiSystem, hosts }) {
  const platforms = profile === 'mini-program' ? ['web_mobile'] : ['web_mobile'];
  const uiSection = uiSystem
    ? `ui:\n  system:\n    adapter: ${uiSystem}\n    version: "0.1.0-experimental"\n    policy: preferred\n    runtime:\n      status: not_installed`
    : `ui:\n  system:\n    status: not_configured`;

  return `harness:
  package: '@anthropic/fe-harness'
  version: '1.2.4'
project:
  name: ${name}
  product_type: ${profile}
  platforms: [${platforms.join(', ')}]
stack:
  adapter: ${stack}
  framework: ${stack.includes('react') || stack === 'next.js' ? 'react' : 'vue'}
  language: typescript
  bundler: vite
  package_manager: pnpm
${uiSection}
facts:
  agent_entry: AGENTS.md
  project_map: docs/PROJECT_MAP.md
  design_guide: docs/DESIGN.md
  design_tokens: docs/design/tokens.json
  product_guide: docs/PRODUCT.md
  current_status: docs/CURRENT_STATUS.md
  decisions: docs/DECISIONS.md
  prd_history: docs/history/PRD_HISTORY.md
  change_history: docs/history/CHANGE_HISTORY.md
  implementation_coverage: docs/IMPLEMENTATION_COVERAGE.md
commands:
  format_check: pnpm format:check
  lint: pnpm lint
  type_check: pnpm type-check
  unit_test: pnpm test
  build: pnpm build
  dev_ready: pnpm test:dev-ready
  runtime: pnpm test:runtime
  visual: pnpm test:visual
verify:
  quick:
    { fail_fast: true, commands: [format_check, unit_test, type_check, lint] }
  feature:
    { fail_fast: true, commands: [format_check, unit_test, type_check, lint, build] }
  runtime: { fail_fast: true, commands: [dev_ready, runtime] }
  interaction: { status: not_configured }
  visual: { fail_fast: true, commands: [visual] }
  audit:
    { fail_fast: false, commands: [format_check, unit_test, type_check, lint, build, dev_ready, runtime] }
`;
}

const STACK_LINT_CONFIGS = {
  'vue3-vite': {
    '.eslintrc.cjs': `/* eslint-env node */
module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    './.eslintrc-auto-import.json',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
`,
    'eslintDeps': ['eslint', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser', 'eslint-plugin-vue'],
  },
  'react-vite': {
    '.eslintrc.cjs': `module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
`,
    'eslintDeps': ['eslint', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser', 'eslint-plugin-react', 'eslint-plugin-react-hooks'],
  },
  'uni-app': {
    '.eslintrc.cjs': `module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
`,
    'eslintDeps': ['eslint', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser', 'eslint-plugin-vue'],
  },
  'taro': {
    '.eslintrc.cjs': `module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: { react: { version: 'detect' } },
  rules: {
    'react/react-in-jsx-scope': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
`,
    'eslintDeps': ['eslint', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser', 'eslint-plugin-react', 'eslint-plugin-react-hooks'],
  },
  'next.js': {
    '.eslintrc.json': `{
  "extends": ["next/core-web-vitals"]
}
`,
    'eslintDeps': ['eslint', 'eslint-config-next'],
  },
};

const COMMON_LINT_FILES = {
  '.prettierrc': `{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
`,
  '.prettierignore': `node_modules
dist
tmp
.fe-harness/snapshots
**/*.generated.ts
`,
  '.editorconfig': `root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
`,
  '.env.example': `# 环境变量示例，不放真实凭据
VITE_API_BASE_URL=/api
VITE_APP_TITLE=
`,
};

export async function injectLintConfigs(outputDir, stack) {
  const results = [];
  const stackConfig = STACK_LINT_CONFIGS[stack];
  const allFiles = { ...COMMON_LINT_FILES };

  if (stackConfig) {
    for (const [path, content] of Object.entries(stackConfig)) {
      if (path === 'eslintDeps') continue;
      allFiles[path] = content;
    }
  }

  for (const [path, content] of Object.entries(allFiles)) {
    const targetPath = resolve(outputDir, path);
    if (await exists(targetPath)) {
      results.push({ path, status: 'keep', note: '框架 CLI 已生成' });
      continue;
    }
    await writeFile(targetPath, content, 'utf8');
    results.push({ path, status: 'created' });
  }

  if (stackConfig?.eslintDeps?.length) {
    const pkgPath = resolve(outputDir, 'package.json');
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
    pkg.devDependencies = pkg.devDependencies || {};
    let added = [];
    for (const dep of stackConfig.eslintDeps) {
      if (!pkg.devDependencies[dep]) {
        pkg.devDependencies[dep] = '^8.0.0';
        added.push(dep);
      }
    }
    if (added.length) {
      await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
      results.push({ path: 'package.json', status: 'updated', added: `eslint deps: ${added.join(', ')}` });
    }
  }

  return results;
}

const SKELETON_FILES = {
  'src/services/http.ts': `import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  // TODO: 实现 HTTP 请求封装
  throw new Error('request not implemented');
}
`,
  'src/utils/README.md': `# Utils

跨页面纯函数和轻量工具。格式化、校验、日期金额处理、URL 参数、安全区适配。

## 约定

- 纯函数：无副作用、无响应式依赖
- 出现第二次相同逻辑时必须提取到此处
- 依赖 Vue 响应式状态的逻辑放 \`src/composables/\`
- 依赖接口字段的逻辑放 \`src/services/\` 或 \`src/repositories/\`
`,
  'src/composables/README.md': `# Composables

可复用 Vue 组合逻辑。依赖响应式状态或生命周期的逻辑。

## 约定

- 不包含业务 API 调用（放 services）
- 不包含数据映射（放 repositories）
- 可跨页面复用
`,
  'src/repositories/README.md': `# Repositories

API 返回值到页面业务模型的映射层。

## 约定

- 从 service 获取原始数据，映射为页面所需结构
- 不直接发请求（用 services/http）
- 页面只调 repository，不直接调 service
`,
  'src/stores/README.md': `# Stores

跨页面共享状态。使用 Pinia。

## 约定

- 只放跨页面共享的状态
- 页面私有状态用 ref/reactive 在页面内管理
`,
  'tests/structure.test.mjs': `import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

const cwd = process.cwd();

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

describe('项目结构', () => {
  it('src 目录存在', async () => {
    assert.ok(await exists(resolve(cwd, 'src')), '缺少 src/ 目录');
  });

  it('.fe-harness/project.yaml 存在', async () => {
    assert.ok(await exists(resolve(cwd, '.fe-harness/project.yaml')), '缺少 project.yaml');
  });

  it('AGENTS.md 存在', async () => {
    assert.ok(await exists(resolve(cwd, 'AGENTS.md')), '缺少 AGENTS.md');
  });

  it('docs/PROJECT_MAP.md 存在', async () => {
    assert.ok(await exists(resolve(cwd, 'docs/PROJECT_MAP.md')), '缺少 PROJECT_MAP.md');
  });
});
`,
  'tests/coverage-closure.mjs': `// 需求闭环检查：验证 IMPLEMENTATION_COVERAGE.md 中的节点是否全部收口
// 状态只有：已验证 / 明确延期 / 外部阻塞 才算收口

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const NOT_CLOSED = ['待分析', '待实现', '实现中', '待验证', ''];

async function main() {
  const path = resolve(process.cwd(), 'docs/IMPLEMENTATION_COVERAGE.md');
  try {
    const content = await readFile(path, 'utf8');
    const lines = content.split('\\n').filter((line) => line.includes('|') && line.includes('T'));
    const unclosed = lines.filter((line) => NOT_CLOSED.some((s) => line.includes(s)));
    if (unclosed.length > 0) {
      console.error(\`需求未闭包：\${unclosed.length} 个节点未收口\\n\${unclosed.join('\\n')}\`);
      process.exit(1);
    }
    console.log(\`需求闭包检查通过：所有节点已收口\`);
  } catch {
    console.log('IMPLEMENTATION_COVERAGE.md 不存在，跳过闭包检查');
  }
}

main();
`,
  'tests/e2e/dev-ready.mjs': `// 开发服务就绪检查
import { execSync } from 'node:child_process';

const PORT = process.env.PORT || 5173;
const url = \`http://localhost:\${PORT}\`;

try {
  execSync(\`curl -s -o /dev/null -w "%{http_code}" \${url}\`, { timeout: 10000 });
  console.log(\`开发服务就绪：\${url}\`);
  process.exit(0);
} catch {
  console.error(\`开发服务未就绪：\${url}\`);
  process.exit(1);
}
`,
  'tests/e2e/runtime.spec.mjs': `// 运行时检查：页面响应、console error、uncaught error
import { test, expect } from '@playwright/test';

test('页面可加载', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page).toHaveTitle(/.+/);
  expect(errors).toEqual([]);
});
`,
  'tests/e2e/visual.spec.mjs': `// 视觉检查：截图回归
import { test, expect } from '@playwright/test';

test('首页视觉一致', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('home.png');
});
`,
  'tests/visual/baselines/README.md': `# Visual Baselines

已确认的视觉基线截图。运行 \`pnpm test:visual:update\` 更新基线。
`,
  'tests/visual/diffs/README.md': `# Visual Diffs

视觉差异截图。检查后可删除。
`,
  'playwright.config.mjs': `import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.CI ? {
    command: 'npm run build && npm run preview',
    port: 4173,
    reuseExistingServer: false,
  } : undefined,
});
`,
};

const SCAFFOLD_SCRIPTS = {
  'format:check': 'prettier --check .',
  'format': 'prettier --write .',
  'test': 'node --test tests/*.test.mjs',
  'test:coverage': 'node tests/coverage-closure.mjs',
  'test:dev-ready': 'node tests/e2e/dev-ready.mjs',
  'test:runtime': 'playwright test tests/e2e/runtime.spec.mjs',
  'test:visual': 'playwright test tests/e2e/visual.spec.mjs',
  'test:visual:update': 'playwright test tests/e2e/visual.spec.mjs --update-snapshots',
  'harness:inspect': 'fe-harness inspect',
  'harness:doctor': 'fe-harness doctor',
  'harness:audit': 'fe-harness audit',
  'harness:quick': 'fe-harness verify quick',
  'harness:feature': 'fe-harness verify feature',
};

export async function injectSkeleton(outputDir, stack) {
  const results = [];
  for (const [path, content] of Object.entries(SKELETON_FILES)) {
    const targetPath = resolve(outputDir, path);
    if (await exists(targetPath)) {
      results.push({ path, status: 'keep' });
      continue;
    }
    await mkdir(resolve(targetPath, '..'), { recursive: true });
    await writeFile(targetPath, content, 'utf8');
    results.push({ path, status: 'created' });
  }

  const lintResults = await injectLintConfigs(outputDir, stack);
  results.push(...lintResults);

  const pkgPath = resolve(outputDir, 'package.json');
  const pkg = JSON.parse(await readFile(pkgPath, 'utf8'));
  pkg.scripts = { ...pkg.scripts, ...SCAFFOLD_SCRIPTS };
  if (!pkg.devDependencies?.['@playwright/test']) {
    pkg.devDependencies = pkg.devDependencies || {};
    pkg.devDependencies['@playwright/test'] = '^1.62.0';
  }
  await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  results.push({ path: 'package.json', status: 'updated' });

  return results;
}

export async function splitRoutes(outputDir, stack, prdContent) {
  const isVue = stack === 'vue3-vite' || stack === 'uni-app';
  const isReact = stack === 'react-vite' || stack === 'taro';

  const pageMatches = prdContent.match(/(?:页面|Page|页面名)[:：\s]+([^\n]+)/gi) || [];
  const pages = pageMatches.map((m) => m.replace(/(?:页面|Page|页面名)[:：\s]+/i, '').trim()).filter(Boolean);

  if (pages.length === 0) {
    return { routes: [], note: 'PRD 中未检测到页面定义，跳过路由拆分' };
  }

  const routes = pages.map((page, i) => {
    const path = `/${page.toLowerCase().replace(/\s+/g, '-')}`;
    const component = isVue
      ? `() => import('@/${page.replace(/\s+/g, '')}.vue')`
      : `() => import('@/${page.replace(/\s+/g, '')}')`;
    return { path, name: page, component };
  });

  if (isVue) {
    const routerPath = resolve(outputDir, 'src/router/index.ts');
    const routerContent = `import { createRouter, createWebHistory } from 'vue-router';

const routes = [
${routes.map((r) => `  { path: '${r.path}', name: '${r.name}', component: ${r.component} },`).join('\n')}
  { path: '/', redirect: '${routes[0]?.path || '/'}' },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
`;
    await mkdir(resolve(routerPath, '..'), { recursive: true });
    await writeFile(routerPath, routerContent, 'utf8');

    for (const route of routes) {
      const pageDir = resolve(outputDir, `src/views/${route.name}`);
      await mkdir(pageDir, { recursive: true });
      const pageContent = `<template>
  <div class="${route.name.toLowerCase()}">
    <h1>${route.name}</h1>
  </div>
</template>

<script setup lang="ts">
// ${route.name} 页面
</script>
`;
      await writeFile(resolve(pageDir, `${route.name}.vue`), pageContent, 'utf8');
    }
  }

  if (isReact) {
    const routerPath = resolve(outputDir, 'src/router/index.tsx');
    const routerContent = `import { createBrowserRouter } from 'react-router-dom';

${routes.map((r) => `const ${r.name} = lazy(() => import('./views/${r.name}'));`).join('\n')}

export const router = createBrowserRouter([
${routes.map((r) => `  { path: '${r.path}', element: <${r.name} /> },`).join('\n')}
]);
`;
    await mkdir(resolve(routerPath, '..'), { recursive: true });
    await writeFile(routerPath, routerContent, 'utf8');

    for (const route of routes) {
      const pageDir = resolve(outputDir, `src/views/${route.name}`);
      await mkdir(pageDir, { recursive: true });
      const pageContent = `export default function ${route.name}() {
  return (
    <div className="${route.name.toLowerCase()}">
      <h1>${route.name}</h1>
    </div>
  );
}
`;
      await writeFile(resolve(pageDir, 'index.tsx'), pageContent, 'utf8');
    }
  }

  return { routes, pages };
}

export async function runScaffold(cwd, config) {
  const {
    name,
    profile = 'consumer-h5',
    stack,
    uiSystem,
    hosts = ['codex'],
    options = {},
    skipInstall = false,
    skipFrameworkCli = false,
    dryRun = false,
    templateRoot,
  } = config;

  const availableStacks = getAvailableStacks(profile);
  const selectedStack = stack || availableStacks[0];
  if (!availableStacks.includes(selectedStack)) {
    throw new Error(`Profile ${profile} 不支持 Stack ${selectedStack}。可选：${availableStacks.join(', ')}`);
  }

  const stackOptions = { ...getDefaultOptions(selectedStack), ...options };
  const outputDir = resolve(cwd, name);
  const withRoutes = config.withRoutes || config.prdPath || false;

  const steps = [];

  if (!skipFrameworkCli) {
    const command = buildFrameworkCommand(selectedStack, name, stackOptions);
    steps.push({ step: 1, action: 'framework-cli', command, description: `执行框架 CLI 创建 ${selectedStack} 项目` });
  }

  steps.push({ step: 2, action: 'init', description: '补 Harness 文件 + 幂等验证' });
  steps.push({ step: 3, action: 'hosts', hosts, description: `安装宿主薄入口：${hosts.join(', ')}` });

  if (uiSystem) {
    const availableUi = getAvailableUiSystems(selectedStack);
    if (availableUi.length && !availableUi.includes(uiSystem)) {
      throw new Error(`Stack ${selectedStack} 不支持 UI System ${uiSystem}。可选：${availableUi.join(', ') || '无'}`);
    }
    steps.push({ step: 4, action: 'ui-system', uiSystem, description: `安装 UI 适配器：${uiSystem}` });
  }

  const skeletonStep = uiSystem ? 5 : 4;
  steps.push({ step: skeletonStep, action: 'skeleton', description: '注入工程骨架（目录边界 + 测试基础设施）' });

  if (withRoutes && config.prdPath) {
    steps.push({ step: skeletonStep + 1, action: 'split-routes', prdPath: config.prdPath, description: '根据 PRD 做路由拆分' });
  }

  steps.push({ step: skeletonStep + (withRoutes ? 2 : 1), action: 'project-yaml', description: '写入 .fe-harness/project.yaml' });

  if (!skipInstall) {
    steps.push({ step: skeletonStep + (withRoutes ? 3 : 2), action: 'install', description: '安装项目依赖' });
  }

  if (dryRun) {
    return { name, profile, stack: selectedStack, uiSystem, hosts, options: stackOptions, outputDir, steps, dryRun: true };
  }

  const results = [];
  for (const step of steps) {
    if (step.action === 'framework-cli') {
      try {
        execSync(step.command, { cwd, stdio: 'inherit' });
        results.push({ ...step, status: 'passed' });
      } catch (error) {
        results.push({ ...step, status: 'failed', error: error.message });
        throw new Error(`框架 CLI 执行失败：${step.command}`);
      }
    } else if (step.action === 'init') {
      const initFiles = await getScaffoldInitFiles(templateRoot || cwd);
      const plan = await planInitialization({ cwd: outputDir, files: initFiles, templateRoot: templateRoot || cwd });
      if (plan.status === 'ready') {
        await applyInitialization({ cwd: outputDir, files: initFiles, plan, templateRoot: templateRoot || cwd });
        const idempotent = await verifyInitializationIdempotent({ cwd: outputDir, files: initFiles, templateRoot: templateRoot || cwd });
        results.push({ ...step, status: 'passed', idempotent: idempotent.idempotent });
      } else {
        results.push({ ...step, status: 'passed', note: '部分文件已存在，跳过' });
      }
    } else if (step.action === 'hosts') {
      for (const host of step.hosts) {
        const result = await installThinEntry(outputDir, host);
        results.push({ step: step.step, action: 'hosts', host, status: result.action === 'manual' ? 'manual' : 'passed', target: result.target });
      }
    } else if (step.action === 'ui-system') {
      const uiAdapterSource = resolve(templateRoot || cwd, 'ui-systems', step.uiSystem, 'adapter.yaml');
      const uiAdapterTarget = resolve(outputDir, '.fe-harness/ui-systems', step.uiSystem, 'adapter.yaml');
      if (await exists(uiAdapterSource)) {
        const { copyFile } = await import('node:fs/promises');
        await mkdir(resolve(uiAdapterTarget, '..'), { recursive: true });
        await copyFile(uiAdapterSource, uiAdapterTarget);
        results.push({ ...step, status: 'passed', target: uiAdapterTarget });
      } else {
        results.push({ ...step, status: 'manual', note: `UI 适配器 ${step.uiSystem} 源文件不存在，需手动安装` });
      }
    } else if (step.action === 'project-yaml') {
      const yamlContent = buildProjectYaml({ name, profile, stack: selectedStack, uiSystem, hosts });
      const yamlPath = resolve(outputDir, '.fe-harness/project.yaml');
      await mkdir(resolve(yamlPath, '..'), { recursive: true });
      await writeFile(yamlPath, yamlContent, 'utf8');
      results.push({ ...step, status: 'passed', target: yamlPath });
    } else if (step.action === 'skeleton') {
      const skeletonResults = await injectSkeleton(outputDir, selectedStack);
      const created = skeletonResults.filter((r) => r.status === 'created').length;
      results.push({ ...step, status: 'passed', files: created, details: skeletonResults });
    } else if (step.action === 'split-routes') {
      const prdPath = resolve(cwd, step.prdPath);
      const prdContent = await readFile(prdPath, 'utf8').catch(() => '');
      const routeResult = await splitRoutes(outputDir, selectedStack, prdContent);
      results.push({ ...step, status: 'passed', routes: routeResult.routes, note: routeResult.note });
    } else if (step.action === 'install') {
      try {
        execSync('pnpm install', { cwd: outputDir, stdio: 'inherit' });
        results.push({ ...step, status: 'passed' });
      } catch {
        try {
          execSync('npm install', { cwd: outputDir, stdio: 'inherit' });
          results.push({ ...step, status: 'passed' });
        } catch (error) {
          results.push({ ...step, status: 'manual', note: '依赖安装失败，请手动执行 pnpm install' });
        }
      }
    }
  }

  return {
    name,
    profile,
    stack: selectedStack,
    uiSystem,
    hosts,
    options: stackOptions,
    outputDir,
    steps: results,
    dryRun: false,
  };
}

async function getScaffoldInitFiles(templateRoot) {
  const essentialFiles = [
    ['templates/AGENTS.md', 'AGENTS.md'],
    ['templates/CLAUDE.md', 'CLAUDE.md'],
    ['templates/CURSOR_RULE.mdc', '.cursor/rules/fe-harness.mdc'],
    ['templates/PROJECT_MAP.md', 'docs/PROJECT_MAP.md'],
    ['templates/DESIGN.md', 'docs/DESIGN.md'],
    ['templates/PRODUCT.md', 'docs/PRODUCT.md'],
    ['templates/CURRENT_STATUS.md', 'docs/CURRENT_STATUS.md'],
    ['templates/DECISIONS.md', 'docs/DECISIONS.md'],
    ['templates/CHANGELOG.md', 'docs/CHANGELOG.md'],
    ['templates/IMPLEMENTATION_COVERAGE.md', 'docs/IMPLEMENTATION_COVERAGE.md'],
    ['templates/TOKENS.json', 'docs/design/tokens.json'],
    ['templates/TOKENS.md', 'docs/design/TOKENS.md'],
    ['templates/COMPONENTS.md', 'docs/design/COMPONENTS.md'],
    ['templates/PRD_HISTORY.md', 'docs/history/PRD_HISTORY.md'],
    ['templates/CHANGE_HISTORY.md', 'docs/history/CHANGE_HISTORY.md'],
    ['templates/INPUT_MANIFEST.yaml', '.fe-harness/inputs/manifest.yaml'],
    ['templates/PRD_INPUT.md', '.fe-harness/inputs/prd/README.md'],
    ['templates/RP_INPUT.md', '.fe-harness/inputs/rp/README.md'],
    ['templates/UI_INPUT.md', '.fe-harness/inputs/ui/README.md'],
    ['templates/API_INPUT.md', '.fe-harness/inputs/api/README.md'],
    ['templates/ASSETS_INPUT.md', '.fe-harness/inputs/assets/README.md'],
    ['templates/PAGE_FLOW_MODEL.yaml', '.fe-harness/models/page-flow.yaml'],
    ['templates/LAYOUT_SPECS.yaml', '.fe-harness/models/layout-specs.yaml'],
    ['templates/UI_ADJUSTMENTS.yaml', '.fe-harness/ui/adjustments.yaml'],
    ['templates/API_SELECTION.yaml', '.fe-harness/api/selection.yaml'],
    ['templates/SNAPSHOTS.md', '.fe-harness/snapshots/README.md'],
  ];
  return essentialFiles;
}

export function validateScaffoldConfig(config) {
  const issues = [];
  if (!config.name || !/^[a-z0-9][a-z0-9-]*$/.test(config.name)) {
    issues.push('项目名必须使用小写字母、数字和连字符');
  }
  if (config.profile && !COMPATIBILITY[config.profile]) {
    issues.push(`不支持的 Profile：${config.profile}`);
  }
  if (config.stack) {
    const available = getAvailableStacks(config.profile || 'consumer-h5');
    if (!available.includes(config.stack)) {
      issues.push(`Profile ${config.profile || 'consumer-h5'} 不支持 Stack ${config.stack}`);
    }
  }
  if (config.uiSystem && config.stack) {
    const available = getAvailableUiSystems(config.stack);
    if (available.length && !available.includes(config.uiSystem)) {
      issues.push(`Stack ${config.stack} 不支持 UI System ${config.uiSystem}`);
    }
  }
  return issues;
}
