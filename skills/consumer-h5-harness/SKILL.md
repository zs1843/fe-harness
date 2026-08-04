---
name: consumer-h5-harness
description: Create, inspect, implement, and verify uni-app Consumer H5 projects governed by fe-harness. Use when an agent creates a new consumer-h5 project, connects an existing project, ingests PRD/RP/UI/API/assets inputs, implements UI or behavior, updates project knowledge, creates task snapshots, or must select and run the correct Harness verification mode.
---

# Consumer H5 Harness

所有用户可见输出使用中文。JSON/YAML 可以保留稳定英文编码，但必须提供中文显示名称或中文说明。

## 必读顺序

1. 读取 `AGENTS.md`。
2. 读取 `.fe-harness/project.yaml`。
3. 读取 `docs/PROJECT_MAP.md`、`docs/PRODUCT.md`、`docs/DESIGN.md`、`docs/design/tokens.json`、`docs/CURRENT_STATUS.md` 和 `docs/DECISIONS.md`。
4. 读取 `.fe-harness/inputs/manifest.yaml`。
5. 识别本次任务编号；没有编号时运行 `fe-harness task create --title "<任务名称>"` 生成稳定编号。
6. 读取本任务对应 PRD、RP、UI、API 和资产输入。

## 输入优先级

- 业务规则：用户当前明确业务要求 → 最新有效 PRD → 最新有效 RP → 最新有效 UI → 项目事实文档 → Harness 默认模板 → Agent 推断。
- 页面结构和交互：用户当前明确交互要求 → 最新有效高保真 UI → 最新有效 RP → 最新有效 PRD → 项目已有实现 → Harness 默认模板 → Agent 推断。
- Design Token：高保真 UI → 低保真 RP → 用户当前临时视觉要求 → 项目已有 Design Token → `docs/DESIGN.md` 全局原则 → Harness 默认 Token → Agent 推断。

不得使用单一全局优先级覆盖所有结论。

## 冲突处理

PRD、RP、UI、API、用户临时要求和已有实现冲突时，必须记录为“冲突”。涉及核心流程、金额、权限、认证、支付或数据结构时，先询问用户。可以安全兼容时允许实现兼容方案，但必须记录决定和原因。

## UI 与 Token

- 提供高保真 UI 时，不得重新设计相似页面。
- 不得用 Emoji、字符图标、随机渐变或通用占位图替代已提供资产。
- UI 中已有 HTML/CSS/交互结构时，先分析并迁移，不得直接重写。
- Token 数值写入唯一机器可读文件 `docs/design/tokens.json`；`docs/design/TOKENS.md` 只写中文解释。
- UI 微调必须生成或更新任务快照中的 `design-token-diff.json`。

## 自动工作流

1. 运行 `fe-harness inspect --json`。
2. 项目有效性不确定时运行 `fe-harness doctor`。
3. 读取输入清单：`fe-harness inputs inspect --json`。
4. 按业务、交互和 Token 三套优先级分析。
5. 更新中文覆盖矩阵 `docs/IMPLEMENTATION_COVERAGE.md`。
6. 执行 `fe-harness plan init --json` 或 `fe-harness plan create <name> --json`。
7. 实现项目代码，不覆盖项目自有内容。
8. 按变更类型运行验证：
   - 逻辑：`pnpm harness:quick`
   - 完成功能：`pnpm harness:feature`
   - 运行时：`pnpm harness:runtime`
   - 交互：`pnpm harness:interaction`
   - UI/样式/布局：`pnpm harness:visual`
   - 配置或跨模块：`pnpm harness:audit`
9. 修复范围内失败并最多重试两轮。
10. 更新 `docs/CURRENT_STATUS.md`、`docs/DECISIONS.md`、`docs/history/PRD_HISTORY.md`、`docs/history/CHANGE_HISTORY.md` 和 `docs/CHANGELOG.md`。
11. 创建不可变任务快照：`fe-harness task snapshot <任务编号> --json`。
12. 最终只报告实际实现、实际验证和剩余风险。

视觉验证未配置基线时必须报告“未配置”，不得显示“通过”。构建通过、页面可打开、E2E 通过或截图通过都不能替代产品验收。
