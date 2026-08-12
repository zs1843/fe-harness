# fe-harness

[English](README.md) | [简体中文](README.zh-CN.md)

`fe-harness` 是一个业务无关的前端工程与质量 Harness。它为开发者、CI 流水线和编码 Agent
提供统一的配置与 CLI，用于项目脚手架、需求证据管理、任务追踪、工程诊断和分层验证。

> 当前状态：持续开发中。工作区包已经具备打包条件，但尚未发布到 npm；评估项目时请先使用
> 仓库内的 CLI。

## 核心能力

- 级联式项目脚手架：Product Profile → Stack → UI System → 框架选项。
- 以 dry-run 为先、安全且不覆盖项目自有文件的已有项目接入。
- 登记 PRD、RP、UI、API 和 assets，并检测文件变化与证据冲突。
- 稳定任务编号、不可变快照和需求覆盖闭环检查。
- Quick、Feature、Runtime、Interaction、Visual、Audit 六种验证模式。
- 只读诊断、八维成熟度审计和幂等优化提案。
- 按需启用 Design Token、UI System Adapter 和任务级 OpenAPI 代码生成。
- 为 Codex、OpenCode、Claude Code、Cursor 和 Trae 提供多宿主薄入口。

## 从源码快速开始

环境要求：Node.js 20 或更高版本、pnpm 10.x。

```bash
pnpm install
node packages/cli/bin/fe-harness.mjs --help

# 只预览新项目创建步骤，不写入文件
node packages/cli/bin/fe-harness.mjs scaffold my-app \
  --profile consumer-h5 \
  --stack uni-app \
  --dry-run

# 在已有项目中预览接入内容
node /path/to/fe-harness/packages/cli/bin/fe-harness.mjs init --dry-run
```

CLI 发布或在本地 link 后，可以使用相同的 `fe-harness ...` 命令。

## 默认工作流

```bash
# 1. 创建项目，或接入已有项目
fe-harness scaffold my-app --profile consumer-h5 --stack uni-app
fe-harness init --dry-run
fe-harness init

# 2. 检查并分析任务输入
fe-harness inputs inspect --json
fe-harness inputs analyze --json

# 3. 创建可追踪任务
fe-harness task create --title "首个功能"

# 4. 完成实现后执行匹配的验证门禁
fe-harness verify feature
```

`scaffold` 委托选定框架的 CLI 完成初始创建，再叠加 Harness 文件、Agent 入口、Adapter 和项目
配置。`init` 只向已有项目补充缺失的 Harness 文件。两条路径都支持在接入前进行无写入预览。

## 支持的组合

| 层 | 当前可用选项 |
| --- | --- |
| Product Profile | `consumer-h5`、`admin-web`、`mini-program` |
| Platform Adapter | `web-mobile`、`node-runtime` |
| Stack Adapter | `uni-app`、`vue3-vite`、`react-vite`、`taro` |
| UI System Adapter | `tdesign-uniapp`、`element-plus`、`ant-design-vue`、`arco-design-vue`、`tdesign-web-vue`、`ant-design` |

可选项会根据 Product Profile 和 Stack Adapter 级联过滤。UI System Adapter 是可选描述协议；
项目真正采用 UI 运行时后，仍须将其作为锁定版本的生产依赖。

## CLI 概览

```text
scaffold <name>                  通过级联选项创建项目
init [--dry-run]                安全接入已有项目
inspect [--map]                 查看项目事实或生成代码图谱
plan init                       输出结构化初始化预览
doctor                          执行只读工程诊断
audit                           生成八维成熟度报告
optimize [--dry-run]            提议或应用分组的幂等优化
validate                        检查受管块、规则、链接和宿主适配器
hosts list|install              管理多宿主薄入口
inputs inspect|diff|analyze     检查已登记的任务输入
task create|inspect|history|snapshot
api inspect|generate            从本地 OpenAPI JSON 生成任务级代码
design tokens inspect|diff|discover
ui systems list|install
skills list|install
verify quick|feature|runtime|interaction|visual|audit
version
```

使用 `fe-harness help <命令>` 查看具体参数。支持的命令可增加 `--json`，为 Agent 和 CI 输出稳定
的结构化数据。

## 架构

```text
Core
  + Product Profile
  + Platform Adapter
  + Stack Adapter
  + 可选 UI System Adapter
  + 项目自有配置（.fe-harness/project.yaml）
```

Core 负责配置加载、诊断、命令执行、报告和安全写入等可复用机制，不包含业务页面、领域状态、
接口地址、品牌信息或项目 Design Token 值。产品形态、运行平台、技术栈和 UI 规则均由声明式
Adapter 承载。

## Agent 集成与 Skills

`AGENTS.md` 是唯一的项目约束本体，各宿主文件只是薄适配层：

- Codex 和 OpenCode → `AGENTS.md`
- Claude Code → `CLAUDE.md`
- Cursor → `.cursor/rules/fe-harness.mdc`
- Trae → 运行时核验入口

仓库提供聚合式 `consumer-h5-harness` 工作流，以及 scaffold、init、inspect、plan、doctor、
verify、inputs、task、API 生成、Design Token、Skill 安装和版本检查等命令级 Skills。生成项目
默认只安装聚合工作流，需要专项能力时再按需安装对应 Skill。

```bash
fe-harness skills list --json
fe-harness skills install --project --provider all --name consumer-h5-harness
fe-harness skills install --global --provider claude
```

## 开发与验证

```bash
pnpm test
node packages/cli/bin/fe-harness.mjs version
pnpm verify:quick
pnpm verify:audit
```

可部署的 VitePress 文档站位于 `site/fe-harness-docs/`：

```bash
cd site/fe-harness-docs
pnpm install
pnpm docs:dev
pnpm docs:build
```

更多实现细节和项目方向请参阅[项目地图](docs/PROJECT_MAP.md)、[架构说明](docs/ARCHITECTURE.md)、
[当前状态](docs/CURRENT_STATUS.md)和[路线图](docs/ROADMAP.md)。

## 当前限制

- npm 发布、Release 自动化和升级冲突补丁尚未提供。
- 尚不支持在线同步 Apifox；API 生成以已登记的本地 OpenAPI JSON 导出文件为起点。
- Visual 和 Interaction 验证依赖项目提供基线或关键流程，缺失时可能返回 `not_configured`。
- 实验性 UI System 工作流仍需在互不相关的真实项目中继续验证。

## 许可证

MIT
