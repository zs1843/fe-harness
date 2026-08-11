# 创建新项目（scaffold）

`scaffold` 是创建新项目的唯一命令。它通过多轮问答确认产品形态、技术框架、UI 组件库和 Agent 宿主，委托框架 CLI 创建项目并叠加 fe-harness 治理层。

## 命令

```bash
fe-harness scaffold <项目名> --profile <profile> --stack <stack>
```

完整参数形式：

```bash
fe-harness scaffold <项目名> \
  --profile <profile> \
  --stack <stack> \
  --ui <ui-system> \
  --hosts <host1,host2> \
  [--with-routes --prd <prd路径>] \
  [--skip-install] \
  [--skip-framework-cli]
```

不传 `--profile` 时 CLI 会进入终端交互模式；但作为 AI Agent，应**逐轮提问用户、收集确认后用参数模式执行**，而不是让用户面对终端输入。

离线创建（跳过依赖安装）：

```bash
fe-harness scaffold my-h5 --profile consumer-h5 --stack uni-app --skip-install
```

## 多轮问答流程

不传 `--profile` 时进入交互模式，逐轮收集选项。每一轮的选项由上一步决定：

### 第1轮：产品形态

- 后台管理系统（`admin-web`）
- 消费者 H5（`consumer-h5`）
- 微信/支付宝小程序（`mini-program`）

### 第2轮：技术框架

根据第1轮的 Profile，只展示兼容的 Stack（级联过滤）：

| Profile | 可选 Stack |
|---------|-----------|
| `admin-web` | `vue3-vite` / `react-vite` |
| `consumer-h5` | `uni-app` / `vue3-vite` / `taro` / `react-vite` |
| `mini-program` | `uni-app` / `taro` |

### 第3轮：框架选项

根据第2轮的 Stack，逐项确认 TypeScript / Vue Router / Pinia / ESLint 等。默认全部"是"。

| Stack | 框架选项 |
|-------|---------|
| `vue3-vite` | TypeScript / Vue Router / Pinia / ESLint |
| `react-vite` | TypeScript |
| `uni-app` | TypeScript / Pinia（无 Router，用 pages.json 内置） |
| `taro` | 框架语法(React/Vue) / TypeScript |
| `next.js` | TypeScript / TailwindCSS |

### 第4轮：UI 组件库

根据第2轮的 Stack，只展示兼容的 UI System：

| Stack | 可选 UI System |
|-------|----------------|
| `vue3-vite` | `element-plus` / `ant-design-vue` / `arco-design-vue` / `tdesign-web-vue` |
| `react-vite` | `ant-design` |
| `uni-app` | `tdesign-uniapp` |
| `taro` | （暂无） |

### 第5轮：Agent 宿主

可多选：Codex / OpenCode / Claude Code / Cursor / Trae。默认 Codex。

### 第6轮：路由拆分

询问是否已有 PRD 并需要根据需求做路由拆分：

- 是 → 询问 PRD 文件路径，执行时加 `--with-routes --prd <路径>`
- 否 → 跳过，后续放入 PRD 后再由 Agent 做页面拆分

### 第7轮：安装依赖

默认是。选否则加 `--skip-install`。

## 级联选择矩阵

每一步的选择会过滤后续可选项。Profile 决定 Stack 范围，Stack 决定框架选项与 UI System，避免出现不兼容组合。

## 骨架注入

`scaffold` 会自动注入工程骨架，无需手动配置：

- 目录边界（components、services、repositories、stores、utils 等）
- ESLint + Prettier 规则
- 测试基础设施（Playwright runtime/visual 验证配置）
- `.fe-harness/project.yaml`

## 路由拆分（--with-routes --prd）

若创建时已有 PRD，可传入 PRD 路径，`scaffold` 会根据需求自动做路由拆分：

```bash
fe-harness scaffold my-admin --profile admin-web --stack vue3-vite \
  --with-routes --prd .fe-harness/inputs/prd.md
```

未传 PRD 时跳过路由拆分，后续放入 PRD 后再由 Agent 完成页面拆分。

## 已有项目只加 Harness（--skip-framework-cli）

已有项目、不需要执行框架 CLI 时，加 `--skip-framework-cli`，只叠加 fe-harness 治理层：

```bash
fe-harness scaffold my-existing --profile consumer-h5 --stack uni-app --skip-framework-cli
```

此模式下 `scaffold` 只执行 init + hosts + ui + skeleton + project.yaml，不委托 create-vue / create-vite / taro init 等。

## scaffold 会生成什么

- 委托框架 CLI 创建的项目（create-vue / create-vite / taro init 等）
- `.fe-harness/project.yaml`
- `.fe-harness/inputs/` 标准输入目录
- `AGENTS.md`、`CLAUDE.md`、Cursor rule
- 多宿主薄入口（codex/opencode/claude/cursor/trae，受管块，不覆盖）
- UI 适配器（`fe-harness ui systems install`）
- 工程骨架（目录边界 + ESLint/Prettier + 测试基础设施）
- 默认聚合 Skill：`consumer-h5-harness`
- docs 下的 PRODUCT、DESIGN、CURRENT_STATUS、PROJECT_MAP、history 和 coverage 文件
- 若传入 PRD，包含路由拆分结果

## 为什么不在创建前要求 PRD/UI/API

创建项目的目标是生成容器和规则，不是立刻完成业务。真实项目经常会出现输入暂时不完整的情况。如果在创建阶段强行要求所有材料齐备，会让脚手架变成流程阻塞。

正确做法是：

1. 先创建项目和输入目录。
2. 把已有材料放入 `.fe-harness/inputs/`。
3. 再登记、分析和创建首个任务。

## 默认只安装聚合 Skill

新项目默认只安装 `consumer-h5-harness`。命令级 Skills 仍可按需安装：

```bash
fe-harness skills install --project --name fe-harness-api
```

这样做是为了减少默认上下文。普通业务任务不需要一开始就加载 OpenAPI、Design Token、UI System、视觉基线等深层规则。
