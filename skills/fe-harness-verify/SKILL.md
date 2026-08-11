---
name: fe-harness-verify
description: Select and execute fe-harness verification modes for Consumer H5 changes. Use when validating logic, types, lint, build, browser runtime, user interactions, visual regression, cross-module changes, or producing an audit report without overstating product completion.
---

# 执行分层验证

- 小型逻辑变更：`fe-harness verify quick`。
- 完成功能或生产构建：`fe-harness verify feature`。
- 页面启动和浏览器错误：`fe-harness verify runtime`。
- 关键流程：`fe-harness verify interaction`。
- UI、布局、Token：`fe-harness verify visual`。
- 配置、跨模块或交付前：`fe-harness verify audit`。

先读取 `.fe-harness/project.yaml` 的实际映射，不写死底层命令。失败后只修复当前范围并最多重试两轮。视觉基线缺失必须报告“未配置”。构建、冒烟、交互或截图单独通过均不能宣称产品验收完成。

Harness 自身结构验证使用 `fe-harness validate`，检查受管块、规则、链接和禁止路径是否一致，与上述代码验证互补。
