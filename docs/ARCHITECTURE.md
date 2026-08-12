# 架构说明

更新时间：2026-08-12

## 组合模型

目标项目行为由以下层组合而成：

```text
Core
  + Product Profile
  + Platform Adapter
  + Stack Adapter
  + optional UI System Adapter
  + Project-owned configuration
```

- Core 负责通用机制，不理解具体业务。
- Product Profile 描述由产品形态带来的验收重点。
- Platform Adapter 描述运行环境、视口和验收产物。
- Stack Adapter 描述框架、工具链、入口和构建检查。
- UI System Adapter 是可选协议，只描述组件语义与 Token 映射，不安装运行时依赖。
- `.fe-harness/project.yaml` 始终由目标项目拥有，负责最终选择和命令映射。

当前公开描述包括 3 个 Profile、2 个 Platform、4 个 Stack，以及 6 个实验性 UI System
Adapter。仓库自身使用内部的 `developer_tooling + node + node-esm` 组合，不属于目标项目前端预设。

## CLI 与 Core 边界

CLI 负责参数解析、帮助文本、交互式级联选择和人类/JSON 输出；Core 负责可测试的业务无关实现。
公共路径分为四组：

1. 创建与接入：`scaffold`、`init`、`plan`。
2. 输入与任务：`inputs`、`task`、`api`、`design`、`ui`。
3. 诊断与治理：`inspect`、`doctor`、`audit`、`optimize`、`validate`、`hosts`。
4. 验证与分发：`verify`、`skills`、`version`。

`scaffold` 委托框架 CLI 创建基础项目，再叠加 Harness；`init` 只补充缺失文件。二者不得以
“初始化”为由覆盖项目已经维护的内容。

## 证据与任务模型

```text
PRD ───────────────→ 业务规则、权限、验收条件
RP ────────────────→ 页面、状态、动作与返回路径
UI Reference ──────→ 视觉校准与页面例外
OpenAPI ───────────→ 请求和响应的数据契约
             ↓
Task + Coverage Matrix + Immutable Snapshot
             ↓
Implementation + Verification Evidence
```

功能完成不是“页面能打开”的同义词。活动任务中的每个可达 PRD/RP 节点都必须被逐项验证、由
用户明确延期，或记录为外部阻塞；构建、首屏运行和截图只提供支持证据，不能替代覆盖闭环。

API 生成由 PRD/任务选择 operationId，由 OpenAPI 决定路径、方法和字段。原始输入保持只读，
生成文件通过哈希元数据防止覆盖人工修改。

## UI 与 Design Token 边界

Core 只验证 UI System Adapter 的通用协议，不导入 Element Plus、Ant Design、TDesign 等具体库。
项目拥有唯一的语义 Design Token 真值；Adapter 将通用语义映射到特定运行时变量。Page Flow
Model 记录可达流程，Layout Spec 记录页面组合，UI Reference 用于校准和验收。

Adapter 安装不等于 UI runtime 安装。源码实际使用某个 UI runtime 后，它必须是锁定版本的生产
依赖。更换框架时先迁移组件和 Token，完成 feature、runtime、interaction、visual 验证后，才可
移除旧 runtime。

## 验证模型

| 模式 | 用途 | 默认语义 |
| --- | --- | --- |
| `quick` | 高频反馈 | 快速、失败即停 |
| `feature` | 完整功能门禁 | 包含工程检查和需求覆盖闭环 |
| `runtime` | 启动与运行时错误 | 页面加载、控制台和未捕获错误 |
| `interaction` | 关键用户路径 | 由项目配置真实流程 |
| `visual` | 截图回归 | 缺少基线时为 `not_configured`，不是通过 |
| `audit` | 汇总验证 | 尽量执行全部检查并汇总失败 |

端口监听或工具权限问题可归类为环境阻塞，避免误报为业务失败。

## 安全与所有权

- 所有写入型流程应先提供 dry-run 或结构化预览。
- `doctor`、`inspect`、Token 发现和审计分析保持只读；报告目录除外。
- 初始化必须先完整预检，再一次性写入；存在真实冲突时不写任何目标。
- `optimize` 按组提出差异，冲突项回到提案阶段，并用二次比较检查幂等性。
- 凭据属于项目和环境变量，不得进入模板、快照或生成配置。
- 发布、远程仓库操作和生产依赖变更必须经过明确授权。

## Agent 约束权威

根 `AGENTS.md` 是唯一约束本体：

- Codex 与 OpenCode 读取 `AGENTS.md` 和 `.agents/skills/`。
- Claude Code 通过 `CLAUDE.md` 导入约束，并使用 `.claude/skills/`。
- Cursor 读取 `AGENTS.md`，`.cursor/rules/fe-harness.mdc` 只声明该唯一来源。
- Trae 由运行时检测，不复制约束正文。

Skills 定义可调用流程，但不得覆盖项目约束。默认只安装聚合工作流，专项 Skill 按任务需要加载。
