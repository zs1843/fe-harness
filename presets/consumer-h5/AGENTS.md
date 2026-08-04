# Consumer H5 Agent 指南

本项目由 fe-harness consumer-h5 脚手架生成。所有用户可见约束、诊断、历史、报告和风险说明默认使用中文。

## 读取顺序

1. `.fe-harness/project.yaml`
2. `docs/PROJECT_MAP.md`
3. `docs/PRODUCT.md`
4. `docs/DESIGN.md`
5. `docs/design/tokens.json`
6. `docs/CURRENT_STATUS.md`
7. `docs/DECISIONS.md`
8. `.fe-harness/inputs/manifest.yaml`
9. 本次任务对应的 PRD、RP、UI、API 和资产输入
10. `.agents/skills/consumer-h5-harness/SKILL.md`

## 自动工作流

- 陌生项目先运行 `pnpm harness:inspect`。
- 有效性不确定时运行 `pnpm harness:doctor`。
- 逻辑改动后运行 `pnpm harness:quick`。
- 完成功能后运行 `pnpm harness:feature`。
- 页面运行时检查运行 `pnpm harness:runtime`。
- 关键交互检查运行 `pnpm harness:interaction`。
- UI、样式、布局或交互改动运行 `pnpm harness:visual`；无截图基线时必须报告“未配置”。
- 配置或跨模块改动运行 `pnpm harness:audit`。
- 完成任务后更新覆盖矩阵、变更历史和任务快照。

## 输入与冲突

- 原始 PRD、RP、UI、API 和资产输入默认只读，不得直接修改。
- 业务、交互和 Token 使用不同优先级，不得用单一全局优先级覆盖全部结论。
- 冲突必须记录为“冲突”，涉及核心流程、金额、权限、认证、支付或数据结构时询问用户。
- 提供高保真 UI 时，不得擅自重新设计或用默认示例覆盖。
