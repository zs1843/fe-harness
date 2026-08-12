# 路线图

更新时间：2026-08-12

## 当前：1.2.x 一致性收口

- 完成 `create → scaffold` 迁移，统一 CLI、测试、Skills、模板和文档。
- 对齐工作区、CLI、Core、自维护配置和生成项目中的版本真值。
- 恢复 56 项现有测试全绿，并补充多 Profile/Stack 脚手架的 focused tests。
- 保持默认工作流为 `scaffold/init → inputs → task → verify`；Design Token、UI System、API 和视觉
  基线只在证据需要时启用。
- 验证 `audit`、`optimize`、`validate` 与多宿主入口的幂等和无覆盖边界。

## 下一阶段：真实项目验证

- 在两个互不相关的项目中验证 `consumer-h5 + web-mobile + uni-app`。
- 分别为 `admin-web + vue3-vite/react-vite` 和 `mini-program + uni-app/taro` 建立真实 pilot。
- 验证递归 PRD/HTML RP 覆盖提取和 requirement-closure gate 的多层流程。
- 记录 UI System 首次/最终截图差异率、生成迭代次数和人工调整数；只有重复结果才晋升默认规则。
- 在 pilot 中验证本地 OpenAPI 任务级生成，再决定是否实现带鉴权的在线同步。
- 基于真实失败完善 CI 入口、敏感内容和平台默认值诊断。

## 分发准备

- 明确最终包名、Registry 和版本策略。
- 增加 tarball 安装集成测试与 GitLab CI 模板。
- 为升级提供 managed-file 元数据、冲突 patch 和 dry-run 迁移报告。
- 在明确授权且测试全绿后发布内部 prerelease。

## 后续候选

- Merchant H5 Profile。
- React Native Platform/Stack Adapter。
- 可插拔 API/OpenAPI Provider 接口。
- 可选 Coding Agent Plugin。
- 由真实项目需求驱动的更多 Platform、Stack 和 UI System Adapter。

新 Profile 或 Adapter 必须来自多个项目可复用的证据，不能复制单一业务的页面、状态、接口或品牌规则。
