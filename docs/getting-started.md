# 快速开始

当前包尚未发布到 npm，以下命令默认在仓库根目录执行。

## 环境与自检

```bash
corepack pnpm install
node packages/cli/bin/fe-harness.mjs version
node packages/cli/bin/fe-harness.mjs --help
```

要求 Node.js 20 或更高版本，仓库使用 pnpm 10.x 和 ESM。

## 创建新项目

先用 dry-run 检查级联选择和将要执行的步骤：

```bash
node packages/cli/bin/fe-harness.mjs scaffold my-h5 \
  --profile consumer-h5 \
  --stack uni-app \
  --dry-run \
  --json
```

确认后移除 `--dry-run`。`scaffold` 会委托对应框架 CLI 创建基础项目，再叠加 Harness 文件、
宿主入口、工程骨架和 `.fe-harness/project.yaml`。默认安装依赖；离线创建时使用 `--skip-install`。

当前 Profile 与 Stack 组合：

```text
consumer-h5  → uni-app / vue3-vite / react-vite / taro
admin-web    → vue3-vite / react-vite
mini-program → uni-app / taro
```

可通过 `--ui` 选择兼容的实验性 UI System Adapter，通过 `--hosts` 选择 Codex、OpenCode、
Claude Code、Cursor 或 Trae。运行 `fe-harness help scaffold` 查看完整参数。

## 接入已有项目

在目标项目目录中执行仓库 CLI 的绝对路径：

```bash
node /path/to/fe-harness/packages/cli/bin/fe-harness.mjs init --dry-run --json
node /path/to/fe-harness/packages/cli/bin/fe-harness.mjs init
```

初始化先完整预检所有目标。相同文件保持不变，项目已维护文件不覆盖，真实冲突会阻止本轮全部
写入。目标项目始终拥有自己的 `.fe-harness/project.yaml`。

已有项目接入后先发现存量视觉值：

```bash
fe-harness design tokens discover --json
fe-harness design tokens inspect --json
```

发现过程只读扫描 `src/` 下的 Vue/CSS/SCSS/Less，输出 CSS Variables、颜色、字体、间距、圆角、
阴影、尺寸、层级、动效和断点候选；确认后再写入唯一语义 Token 真值。

## 输入与任务

把原始证据分别放入 `.fe-harness/inputs/prd/`、`rp/`、`ui/`、`api/` 和 `assets/`，并登记到
`manifest.yaml`。原始证据默认只读。文件准备好后执行：

```bash
fe-harness inputs inspect --json
fe-harness inputs analyze --json
fe-harness task create --title "根据首批输入实现项目" --json
```

输入为空时保持“等待输入”，不要创建虚假业务任务或把脚手架示例页当成产品实现。

## 开发与验证

根据改动选择最小充分验证：

```bash
fe-harness verify quick
fe-harness verify feature
fe-harness verify runtime
fe-harness verify interaction
fe-harness verify visual
fe-harness verify audit
```

`feature` 包含需求覆盖闭环。`interaction` 和 `visual` 需要项目提供真实流程或截图基线；缺失时
返回 `not_configured`，不能当作通过。

## OpenAPI 任务级生成

将 Apifox 导出的 OpenAPI 3.x JSON 登记为 API 输入，并在 `.fe-harness/api/selection.yaml` 中为
任务选择 operationId：

```bash
fe-harness api inspect --task T001 --json
fe-harness api generate --task T001 --dry-run --json
fe-harness api generate --task T001 --json
```

PRD 决定本任务使用哪些接口，OpenAPI 决定传输契约。凭据只进入环境变量，不得写入配置或快照。

## Agent Skills

生成项目默认只安装聚合工作流，避免一次性加载所有命令说明。专项 Skill 按需安装：

```bash
fe-harness skills list --json
fe-harness skills install --project --provider all --name consumer-h5-harness
fe-harness skills install --project --name fe-harness-api
```

根 `AGENTS.md` 是唯一项目约束本体，各宿主入口不得复制约束正文。
