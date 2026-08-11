---
name: fe-harness-create
description: Create a new Consumer H5 project through the complete fe-harness workflow. Use when starting a project from zero, scaffolding consumer-h5, collecting PRD/RP/UI/API/assets inputs, confirming Design Token authority, installing dependencies, preparing engineering conventions, installing multi-host thin entries, running maturity audit, or bootstrapping fe-harness CLI when it is unavailable.
---

# 创建 Consumer H5 项目

## 执行边界

所有用户可见输出使用中文。先做只读检查；安装全局 CLI、下载依赖或覆盖视觉依据前取得用户授权。不得把脚手架示例当作项目需求。

生成项目必须以根目录 `AGENTS.md` 作为唯一约束本体。Claude Code 和 Cursor 配置只能做供应商适配，不得复制另一套约束正文。

## 工作流

1. 检查 Node.js 20、Corepack、包管理器和 `fe-harness version`。
2. 如果找不到 CLI，说明将执行的安装命令并请求授权；获准后执行 `npm install --global @anthropic/fe-harness`，再验证 `fe-harness version`。registry 尚未发布该包时停止并给出中文原因，不使用来源不明的替代包。
3. 创建前只询问或从上下文确定项目名、完整目标目录，以及确实影响脚手架结构的 Profile、Platform、Stack；目录存在时先执行 `fe-harness plan create <name> --output <dir> --json`，有冲突则停止。
4. 不在空目录阶段要求用户提供 PRD、RP、UI、API 或资产，也不因这些输入缺失而阻止创建。执行 `fe-harness create <name> --output <dir>`；默认由 CLI 安装依赖，离线或需要稍后安装时使用 `--skip-install`。
5. 创建完成后安装多宿主薄入口：`fe-harness hosts install`。支持 codex、opencode、claude、cursor、trae，用受管块安装不覆盖已有内容。
6. 创建完成后明确展示 `.fe-harness/inputs/prd/`、`rp/`、`ui/`、`api/`、`assets/` 的完整路径，并暂停输入分析，等待用户把原始文件放入项目。用户直接上传截图时，项目已存在后再将其登记为 UI 输入证据。
7. 用户确认文件已放好后，运行 `fe-harness inputs inspect --json` 查找未登记文件，按 [创建问答](references/create-intake.md) 完成生成后输入确认；将原始输入登记到 `manifest.yaml`，不得修改原始证据。
8. 运行 `fe-harness inputs analyze --json`，再创建或识别任务编号：`fe-harness task create [Txxx] --title "<名称>"`。没有输入时只报告"等待输入"，不得创建虚假的业务任务或开始实现示例页面。
9. 确认 `CLAUDE.md` 导入 `AGENTS.md`、Cursor Rule 指向 `AGENTS.md`，并确认 `.agents/skills/` 与 `.claude/skills/` 可发现工作流。
10. 运行 `fe-harness inspect --json` 查看项目事实；运行 `fe-harness inspect --map` 生成 5 份代码图谱；运行 `fe-harness inputs inspect --json` 和 `fe-harness doctor`。
11. 根据技术栈确认格式化、类型检查、Lint、CI 门禁、本地代理、HTTP 封装、公共方法的组件边界。脚手架已提供的基础能力应复用；业务 API、品牌 Token、业务组件必须从项目输入产生。
12. 输入登记后，Design Token 仍为待提炼时，向用户二次确认视觉依据和 Token 来源，再更新唯一真值文件；不得在输入尚未落盘时凭截图印象或偏好提前定稿。
13. 运行 `pnpm harness:quick`；创建首次实现后运行 `pnpm harness:audit`。缺少视觉基线时如实报告"未配置"。
14. 运行 `fe-harness audit` 做八维成熟度审计，输出 A-F 等级和 P0-P2 改进清单。
15. 运行 `fe-harness validate` 验证 Harness 完整性：受管块匹配、规则完整性、宿主适配器、Markdown 链接、禁止路径。
16. 从 PRD/HTML RP 递归抽取一级、二级、三级及更深可达页面、弹窗、状态和返回路径，每个可验收节点写入覆盖矩阵独立行。
17. 只有所有节点达到 `已验证`、用户确认的 `明确延期` 或说明原因的 `外部阻塞` 才能声明完成；否则继续执行或集中追问。
18. 更新中文事实文档和历史；需求闭包后创建不可变快照。

最终报告实际创建路径、输入状态、安装结果、工程能力、验证结果、审计等级、待确认项和剩余风险。
