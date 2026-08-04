# 项目 Agent 指南

本文是 consumer H5 项目的统一 Agent 入口。所有用户可见结论、报告摘要、待办、风险和历史记录默认使用中文。

## 读取顺序

1. 读取 `.fe-harness/project.yaml`。
2. 读取 `docs/PROJECT_MAP.md`、`docs/PRODUCT.md`、`docs/DESIGN.md`、`docs/CURRENT_STATUS.md` 和 `docs/DECISIONS.md`。
3. 读取 `.fe-harness/inputs/manifest.yaml`，再按本次任务读取对应 PRD、RP、UI、API 和资产输入。
4. 使用项目 Skill：`.agents/skills/consumer-h5-harness/SKILL.md`。

## 输入优先级

- 业务规则：用户当前明确业务要求 → 最新有效 PRD → 最新有效 RP → 最新有效 UI → 项目事实文档 → Harness 默认模板 → Agent 推断。
- 页面结构与交互：用户当前明确交互要求 → 最新有效高保真 UI → 最新有效 RP → 最新有效 PRD → 项目已有实现 → Harness 默认模板 → Agent 推断。
- Design Token：高保真 UI → 低保真 RP → 用户当前临时视觉要求 → 项目已有 Token → `docs/DESIGN.md` 全局原则 → Harness 默认 Token → Agent 推断。

PRD、RP、UI 冲突不得静默处理；涉及核心流程、金额、权限、认证、支付或数据结构时必须询问用户。

## 自动工作流

- 进入陌生项目时执行 `fe-harness inspect --json`。
- 项目有效性不确定时执行 `fe-harness doctor`。
- 逻辑或工具改动后执行 `fe-harness verify quick`。
- 完成功能后执行 `fe-harness verify feature`。
- 页面启动与运行时错误执行 `fe-harness verify runtime`。
- 关键流程交互执行 `fe-harness verify interaction`。
- UI、样式、布局或交互改动执行 `fe-harness verify visual`；未配置视觉基线时必须报告“未配置”。
- 配置或跨模块改动执行 `fe-harness verify audit`。
- 完成任务后更新 `docs/IMPLEMENTATION_COVERAGE.md`、`docs/history/CHANGE_HISTORY.md`，并创建任务快照。

## 禁止事项

- 不得修改、格式化或覆盖 `.fe-harness/inputs/` 下的原始证据文件。
- 提供 UI 时，不得擅自重新设计一套相似页面。
- 不得用 Emoji、字符图标、随机渐变或通用占位图替代已提供资产。
- 不得省略页面、弹窗、浮层或关键状态后宣称完整实现。
- 不得把多个独立页面压缩成单文件字符串状态机。
- 不得把构建通过、页面可打开、E2E 通过或截图通过等同于产品验收通过。
- 不得保存密钥、Cookie、Access Token、`.env` 内容或个人敏感数据到项目文件。
