# fe-harness 项目地图

更新时间：2026-08-12

## 项目定位

`fe-harness` 是业务无关的前端工程与质量 Harness。开发者、CI 和编码 Agent 通过同一份
`.fe-harness/project.yaml` 与同一个 CLI 使用项目创建、输入管理、任务追踪、诊断和验证能力。

## 顶层目录职责

| 路径 | 职责 |
| --- | --- |
| `packages/core/` | 配置、脚手架、初始化、诊断、验证、审计、报告和安全写入 |
| `packages/cli/` | `fe-harness` CLI 入口、帮助和稳定 JSON 输出 |
| `profiles/` | 产品形态规则：`consumer-h5`、`admin-web`、`mini-program` |
| `platforms/` | 运行与验收平台规则：`web-mobile`、`node-runtime` |
| `stacks/` | 工具链规则：`uni-app`、`vue3-vite`、`react-vite`、`taro` |
| `ui-systems/` | 可选 UI System Adapter 的组件语义、Token 映射和约束 |
| `templates/` | `init` 写入目标项目的业务无关模板和宿主薄入口 |
| `presets/` | CLI 打包和项目生成使用的业务无关预设资源 |
| `skills/` | 聚合工作流与命令级 Agent Skills，共 14 个 |
| `schemas/` | 公共项目配置协议草案 |
| `examples/` | 可丢弃的集成与运行时验证夹具 |
| `tests/` | Core、CLI、治理和编排测试 |
| `site/fe-harness-docs/` | 独立 VitePress 文档站 |
| `docs/` | 本仓库的项目地图、架构、状态、路线图与专题说明 |

## Core 模块地图

| 模块 | 职责 |
| --- | --- |
| `config.mjs` | 加载和验证项目配置 |
| `scaffold.mjs` | 级联选择、框架 CLI 委托和 Harness 叠加 |
| `init.mjs` | 完整预检、无覆盖初始化和幂等判定 |
| `doctor.mjs` | 只读工程诊断和稳定问题码 |
| `runner.mjs` / `report.mjs` | 验证执行、退出语义及 Markdown/JSON/日志报告 |
| `inputs.mjs` / `history.mjs` | 输入登记、差异分析、任务历史和快照 |
| `openapi.mjs` | 任务级 OpenAPI 检查、TypeScript 生成和哈希保护 |
| `design.mjs` / `ui-system.mjs` | Design Token 发现与 UI System 协议验证 |
| `audit.mjs` / `optimize.mjs` | 八维成熟度审计与分组幂等优化 |
| `host-adapters.mjs` / `managed-block.mjs` | 多宿主薄入口和受管块 |
| `codebase-map.mjs` / `validator.mjs` | 代码图谱与 Harness 完整性检查 |

## 依赖方向

```text
CLI → Core
Core → 通用配置协议和文件系统机制
项目配置 → Profile + Platform + Stack + 可选 UI System
Profiles / Platforms / Stacks / UI Systems → 声明式描述
Tests / Examples → 公共 Core 与 CLI 行为
```

Core 不得导入业务项目，也不得把具体产品页面、接口、品牌或 Token 值写入通用规则。

## 工作区包

- `@anthropic/fe-harness-core`：私有工作区 Core 包。
- `@anthropic/fe-harness`：暴露 `fe-harness` 命令的 CLI 包。

当前工作区版本为 `1.2.4`。包元数据和预打包资源已经准备，但尚未发布到 npm Registry。

## 目标项目产物

目标项目拥有 `.fe-harness/project.yaml`，并按需生成或维护：

```text
.fe-harness/inputs/          PRD/RP/UI/API/assets 原始证据和 manifest
.fe-harness/history/         任务历史与不可变快照
.fe-harness/models/          Page Flow Model 与 Layout Specs
.fe-harness/ui/              UI 调整记录
.fe-harness/api/             operationId 选择和生成元数据
tmp/fe-harness/              验证、审计和命令日志
```

API 生成文件位于 `src/types/api.generated.ts` 与 `src/services/api.generated.ts`。生成器只在记录
的哈希能证明文件仍由 Harness 管理时更新它们。
