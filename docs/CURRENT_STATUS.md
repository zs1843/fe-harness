# 当前状态

更新时间：2026-08-12

## 当前版本与阶段

- 工作区与 CLI 版本：`1.2.4`。
- 状态：持续开发，尚未发布 npm 包，也没有 CI Release 流水线。
- 默认工作流：`scaffold/init → inputs → task → verify`。
- 当前重点：让多 Profile/Stack 脚手架与既有 H5 深度工作流、测试和文档重新一致。

## 已实现能力

### Core、CLI 与安全写入

- YAML 项目配置加载、运行时校验和 JSON Schema 草案。
- 命名命令解析、fail-fast/continue-on-error 执行、退出码和 Markdown/JSON/命令日志报告。
- `scaffold` 级联选择并委托框架 CLI，随后叠加 Harness、宿主入口、工程骨架和项目配置。
- `init` 完整预检、`create/unchanged/project-owned/conflict` 状态判定及无覆盖写入。
- `inspect --map`、只读 `doctor`、八维 `audit`、`validate` 和分组幂等 `optimize`。

### 产品、平台与技术栈

- Product Profiles：`consumer-h5`、`admin-web`、`mini-program`。
- Platform Adapters：`web-mobile`、`node-runtime`。
- Stack Adapters：`uni-app`、`vue3-vite`、`react-vite`、`taro`。
- 级联兼容矩阵和 TypeScript、Router、Pinia、ESLint 等框架选项。

### 输入、任务与接口

- PRD、RP、UI、API、assets 的 manifest、哈希、未登记文件、变化和冲突检查。
- 文本优先的输入分析，以及业务/交互/视觉权威分工。
- 稳定任务编号、历史、不可变快照和递归需求覆盖闭环。
- 从本地 Apifox/OpenAPI JSON 按任务选择 operationId，生成 TypeScript 类型与 uni-app 请求封装。
- 对生成文件记录哈希，拒绝覆盖被人工修改的受管文件。

### UI、视觉与运行时

- 唯一语义 Design Token 真值协议，以及 Vue/CSS/SCSS/Less 的只读存量视觉发现。
- Page Flow Model、Layout Spec、UI Reference 和 UI 调整分类协议。
- 6 个实验性 UI System Adapter：TDesign UniApp、Element Plus、Ant Design Vue、Arco Design
  Vue、TDesign Web Vue、Ant Design React。
- UI runtime 生命周期治理：实际引用后必须作为锁定版本的生产依赖。
- runtime、interaction、visual 独立验证；缺少基线或流程时明确返回 `not_configured`。

### Agent 与多宿主

- `AGENTS.md` 单一约束本体，以及 Codex、OpenCode、Claude Code、Cursor、Trae 薄适配。
- 聚合式 `consumer-h5-harness` 与 13 个命令级 Skills，共 14 个 Skills。
- project/global 与 provider-aware Skill 安装，不覆盖已有文件。
- Agent 自动流程：检查证据、按需提问、实现、选择验证、有限重试、更新持久事实。

## 当前验证结果

2026-08-12 的实际检查：

```text
node packages/cli/bin/fe-harness.mjs version
→ 1.2.4

node packages/cli/bin/fe-harness.mjs scaffold readme-check \
  --profile consumer-h5 --stack uni-app --dry-run --json
→ 通过，返回 6 步结构化计划且未写入项目

pnpm test
→ 56 项：48 通过，8 失败
```

8 个失败反映当前迁移尚未收口，而不是稳定基线：

- CLI 已使用 `scaffold` 和 `1.2.4`，部分测试仍断言旧 `create` 命令和 `0.1.0`。
- UI System 列表扩展后，一项测试仍假设 TDesign UniApp 排在首位。
- `presets/consumer-h5/tests/coverage-closure.mjs` 缺失，导致两项覆盖闭环夹具失败。

在这些问题修复前，不应宣称测试套件全部通过。

## 当前限制

- `.fe-harness/project.yaml` 的自维护版本仍为 `0.1.0`，与工作区 `1.2.4` 存在版本元数据漂移。
- JSON Schema 尚未通过标准兼容校验器执行。
- 初始化不提供三方合并、冲突补丁或异常中断后的事务回滚。
- `optimize` 已提供分组提案和应用，但还不是通用的版本升级/三方迁移系统。
- 在线 Apifox 同步和 Token 鉴权拉取未实现；复杂引用、媒体类型、discriminator 与厂商扩展仍有限。
- 输入分析以文本启发式为主，PDF、图片和二进制 RP 仍需 Agent 或工具辅助解释。
- UI System Adapter 全部为实验状态，尚未证明能在两个无关真实项目中稳定减少视觉微调。
- Platform 默认能力尚未全部自动落盘，interaction/visual 仍需项目提供真实流程或基线。
- 尚无发布 Registry、Release CI、已发布 npm 包或 Codex Plugin。

## 下一步建议

1. 收口 `create → scaffold` 与 `0.1.0 → 1.2.4` 迁移，恢复测试全绿。
2. 补回或替代覆盖闭环预设夹具，并调整 UI System 列表测试为稳定排序契约。
3. 对齐自维护配置、包版本、帮助文本和文档中的版本真值。
4. 用互不相关的真实项目验证 consumer H5、admin web 和 mini-program 组合，再决定哪些规则晋升为稳定能力。

不得为了补齐示例而复制业务项目规则，也不得在未授权时发布包或修改远程仓库。
