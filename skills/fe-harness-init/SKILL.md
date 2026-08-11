---
name: fe-harness-init
description: Safely connect fe-harness to an existing Consumer H5 project. Use when initializing project constraints, input directories, history, tokens, verification, project-local Skills, multi-host thin entries, or running idempotency verification without overwriting project-owned files.
---

# 接入现有项目

1. 阅读现有 `AGENTS.md`、包配置、页面注册、源码结构和 CI 配置。
2. 运行 `fe-harness plan init --json` 预览。将"项目已维护"视为项目所有内容，不覆盖；仅对"待创建"执行写入。真实冲突必须交由用户决定。
3. 经计划确认后执行 `fe-harness init`。init 完成后自动运行幂等验证，二次执行确认零漂移；可用 `--no-verify-idempotent` 跳过。
4. 安装多宿主薄入口：`fe-harness hosts install`。支持 codex、opencode、claude、cursor、trae 五个宿主，用受管块+稳定 ID 安装，不覆盖已有内容。
5. 运行 `fe-harness inspect --json` 查看项目事实；运行 `fe-harness inspect --map` 生成 `.fe-harness/codebase/` 下 5 份代码图谱（STACK/STRUCTURE/CONVENTIONS/TESTING/CONCERNS）。
6. 运行 `fe-harness doctor` 做工程诊断，包含敏感路径检测（扫描 `.env`、私钥等，只枚举不读取）。
7. 主动盘点存量设计：运行 `fe-harness design tokens discover --json`，同时读取已有 CSS Variables、SCSS/Less 变量、全局样式、UI 框架主题配置、公共组件和高频页面样式。不得因为没有新 UI/RP 就跳过现有风格提取。
8. 将发现结果按语义归并到 `docs/design/tokens.json`：存量明确变量标记 `source: 项目已有 Design Token`；从重复样式归纳的值标记 `source: 项目已有实现` 和 `confidence: inferred`；冲突或低频值保持 `needs_confirmation`。先展示候选和影响范围，确认后才写 Token，不改原样式文件。
9. 检查颜色、字体、字号、字重、行高、间距、圆角、阴影、边框、控件高度、图标尺寸、层级、动效和断点；不能只提取品牌色。记录未归一的硬编码值和多套主题来源。
10. 确认根目录 `AGENTS.md` 是唯一约束本体；`CLAUDE.md` 和 Cursor Rule 只能导入或指向它。
11. 缺少项目级命令 Skills 时执行 `fe-harness skills install --project --provider all`。
12. 只补充缺失能力；不自动改旧项目命令、锁文件、业务 API、原始输入或现有样式。Token 提取是建立现状事实，不是重设计。
13. 运行 `fe-harness design tokens inspect --json` 报告 Token 状态。
14. 运行 `fe-harness audit` 做八维成熟度审计，输出 A-F 等级和 P0-P2 改进清单。
15. 运行 `fe-harness validate` 验证 Harness 完整性：受管块匹配、规则完整性、宿主适配器、Markdown 链接、禁止路径。
16. 运行 `fe-harness optimize --dry-run` 检查是否有漂移或缺失，按五组（文档/规则/适配器/工程配置/工具）列出差异。
