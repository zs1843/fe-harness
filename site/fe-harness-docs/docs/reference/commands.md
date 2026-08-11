# 命令参考

## 命令总览

| 命令 | 作用 | 什么时候用 | 是否写文件 |
| --- | --- | --- | --- |
| `version` | 输出 CLI 版本 | 检查工具是否可用 | 否 |
| `scaffold` | 委托框架 CLI 创建项目 + 叠加 Harness | 新项目从零开始（admin/H5/小程序） | 是 |
| `init` | 接入已有项目 | 给现有项目补 Harness 文件 | 是，冲突时不写 |
| `plan` | 输出 create/init 结构化计划 | 写文件前预览 | 否 |
| `inspect` | 查看项目事实和能力 | Agent 开始任务前 | 否 |
| `doctor` | 只读诊断 | 排查配置、脚本、输入、Token、Agent readiness | 否 |
| `inputs` | 检查、比对、分析输入 | PRD/RP/UI/API/assets 进入后 | 主要只读 |
| `task` | 管理任务编号、历史、快照 | 功能开始和完成时 | 是 |
| `verify` | 执行验证模式 | 实现后或交付前 | 写报告 |
| `api` | OpenAPI 检查和生成 | API 任务 | inspect 只读，generate 写 generated |
| `design` | Design Token 检查、发现、diff | UI/视觉任务或既有项目接入 | discover/inspect 只读 |
| `ui` | UI System Adapter 管理 | 选择组件系统时 | install 写 Adapter evidence |
| `skills` | 安装 Agent Skills | 补齐 Codex/Claude/Cursor 工作流 | install 写 Skill 文件 |
| `optimize` | 幂等升级既有 Harness | 想按组对齐到最新 Harness 时 | 是，仅写选定组 |
| `validate` | 验证 Harness 完整性 | 升级或接入后检查一致性 | 否 |
| `hosts` | 管理多宿主薄入口 | 给 codex/claude/cursor 等装入口 | install 写入口文件 |

## 默认流程命令

```bash
fe-harness scaffold <项目名> --profile consumer-h5
fe-harness init --dry-run
fe-harness inputs inspect --json
fe-harness task create --title "任务名称"
fe-harness verify feature
```

默认流程只保留最短闭环。更深能力通过任务类型进入，不要求新用户一开始理解所有命令。

## 创建和接入

```bash
fe-harness scaffold my-h5 --profile consumer-h5 --dry-run
fe-harness scaffold my-h5 --profile consumer-h5
fe-harness scaffold my-admin --profile admin-web --stack vue3-vite --ui tdesign
fe-harness scaffold my-mp --profile mini-program --stack taro
fe-harness scaffold my-existing --profile consumer-h5 --skip-framework-cli
fe-harness init --dry-run
fe-harness plan init --json
fe-harness init
```

`scaffold` 委托框架 CLI 创建项目，再叠加 Harness：级联选项收敛 profile → stack → UI → 框架选项；注入工程骨架（目录边界、ESLint/Prettier、测试基础设施）；提供 PRD 时做路由拆分。已有项目用 `--skip-framework-cli` 跳过框架 CLI，只叠加 Harness。

`plan` 和 `--dry-run` 都是为了在写文件前暴露影响面。已有项目里，任何冲突都应该先交给人确认。

## 输入

```bash
fe-harness inputs inspect --json
fe-harness inputs analyze --json
fe-harness inputs diff --json
```

`inspect` 关注文件和 manifest 是否一致，`analyze` 关注证据结论和冲突，`diff` 关注输入变化后旧结论是否还能继续使用。

## 任务

```bash
fe-harness task create --title "首次需求" --json
fe-harness task history T001 --json
fe-harness task snapshot T001 --title "首次需求" --request "完成页面" --json
```

任务命令的核心是稳定编号。编号把 PRD/RP、operationId、实现文件、验证报告和快照串起来。

## 验证

```bash
fe-harness verify quick
fe-harness verify feature
fe-harness verify runtime
fe-harness verify interaction
fe-harness verify visual
fe-harness verify audit
```

验证模式由 `.fe-harness/project.yaml` 映射到底层命令。Agent 不应该写死 `pnpm test`，而应读取项目配置。

## 诊断和检查

```bash
fe-harness inspect --json
fe-harness inspect --map
fe-harness doctor
fe-harness doctor --json
fe-harness audit
fe-harness audit --json
fe-harness optimize --dry-run
fe-harness optimize --groups docs,rules,adapters,engineering,tools
fe-harness validate
fe-harness validate --json
fe-harness hosts list
fe-harness hosts install --host claude
```

`inspect` 查看项目事实和能力；`inspect --map` 生成 `.fe-harness/codebase/` 下 5 份代码图谱（STACK/STRUCTURE/CONVENTIONS/TESTING/CONCERNS）；`doctor` 做工程诊断；`audit` 从八个维度做成熟度评分并输出 A-F 等级和 P0-P2 改进清单；`optimize` 幂等升级既有 Harness，读取现有 Harness 和工程配置，按五组（docs/rules/adapters/engineering/tools）列出精确差异，只执行用户选择的组，二次 dry comparison 验证幂等；`validate` 验证 Harness 完整性，包括受管块匹配、规则完整性、宿主适配器、Markdown 链接和禁止路径；`hosts` 管理多宿主薄入口，支持 codex/opencode/claude/cursor/trae，用受管块+稳定 ID 安装，不覆盖已有内容。

## OpenAPI

```bash
fe-harness api inspect --task T001 --json
fe-harness api generate --task T001 --dry-run
fe-harness api generate --task T001
```

API 生成必须先 inspect 和 dry-run。PRD 选择 operationId，OpenAPI JSON 提供字段契约，业务映射放在 generated 层之外。

## Design Token

```bash
fe-harness design tokens inspect --json
fe-harness design tokens discover --json
fe-harness design tokens diff --json
```

`inspect` 确认唯一真值文件和状态；`discover` 只读扫描既有样式；`diff` 用于把 Token 变化写入任务快照和历史。

## UI System

```bash
fe-harness ui systems list --json
fe-harness ui systems install tdesign-uniapp --dry-run --json
fe-harness ui systems install tdesign-uniapp
```

Adapter 安装只是证据安装，不会自动添加生产 UI 依赖，也不会替项目决定 Token 值。

## Skills

```bash
fe-harness skills list --json
fe-harness skills install --project --name consumer-h5-harness
fe-harness skills install --project --provider all --name consumer-h5-harness
fe-harness skills install --global --provider claude
```

项目级 Codex/Cursor 共用 `.agents/skills`，Claude Code 使用 `.claude/skills`。全局安装和覆盖已有 Skill 都需要人确认。
