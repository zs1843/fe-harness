# API 详细文档

本文档详细描述 fe-harness CLI 的所有命令、参数、返回值和使用示例。

## 命令总览

| 命令 | 作用 | 是否写文件 |
|------|------|-----------|
| `version` | 输出 CLI 版本 | 否 |
| `scaffold` | 委托框架 CLI 创建项目 + 叠加 Harness | 是 |
| `init` | 接入已有项目 | 是 |
| `plan` | 输出结构化计划 | 否 |
| `inspect` | 查看项目事实 | 否 |
| `doctor` | 只读诊断 | 否 |
| `inputs` | 检查输入 | 主要只读 |
| `task` | 管理任务 | 是 |
| `verify` | 执行验证 | 写报告 |
| `api` | OpenAPI 操作 | inspect 只读 |
| `design` | Design Token 操作 | inspect 只读 |
| `ui` | UI System 管理 | install 写 |
| `skills` | 安装 Skills | install 写 |
| `optimize` | 幂等升级既有 Harness | 是，仅写选定组 |
| `validate` | 验证 Harness 完整性 | 否 |
| `hosts` | 管理多宿主薄入口 | install 写 |

---

## version

输出 CLI 版本信息。

### 用法

```bash
fe-harness version
fe-harness -v
fe-harness --version
```

### 输出示例

```
fe-harness v1.2.4
```

### 参数

无

---

## scaffold

委托框架 CLI 创建项目，再叠加 Harness：级联选项 + 骨架注入 + 路由拆分。

### 用法

```bash
fe-harness scaffold <项目名> [选项]
```

### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `<项目名>` | string | - | 项目名称（小写字母、数字、连字符） |
| `--profile` | string | 无（进入交互模式） | consumer-h5 / admin-web / mini-program |
| `--stack` | string | profile 第一个可用 | uni-app / vue3-vite / react-vite / taro / next.js |
| `--ui` | string | null | UI 组件库适配器 |
| `--hosts` | string | codex | 宿主列表，逗号分隔 |
| `--with-routes` | boolean | false | 根据 PRD 做路由拆分 |
| `--prd` | string | null | PRD 文件路径 |
| `--skip-install` | boolean | false | 跳过依赖安装 |
| `--skip-framework-cli` | boolean | false | 跳过框架 CLI（已有项目） |
| `--dry-run` | boolean | false | 预览步骤 |
| `--json` | boolean | false | JSON 输出 |

### 执行步骤

1. 验证级联兼容性
2. 委托框架 CLI 创建项目
3. fe-harness init（补 Harness 文件 + 幂等验证）
4. fe-harness hosts install（多宿主薄入口）
5. fe-harness ui systems install（UI 适配器，可选）
6. 注入工程骨架（目录边界 + ESLint/Prettier + 测试基础设施）
7. 路由拆分（有 PRD 时）
8. 写入 project.yaml
9. 安装依赖

### 级联矩阵

Profile → Stack → UI System → 框架选项。上层选项决定下层可选项，不兼容组合在步骤 1 即被拒绝。

| Profile | 可用 Stack | 可用 UI System |
|---------|-----------|----------------|
| consumer-h5 | uni-app / vue3-vite / react-vite | tdesign-uniapp / vant / nutui |
| admin-web | vue3-vite / react-vite / next.js | tdesign / antd / element-plus |
| mini-program | uni-app / taro | tdesign-uniapp / nutui |

### 示例

```bash
# 交互式创建 Consumer H5 项目
fe-harness scaffold my-h5 --profile consumer-h5

# 指定 stack 和 UI
fe-harness scaffold my-admin --profile admin-web --stack vue3-vite --ui tdesign

# 小程序项目
fe-harness scaffold my-mp --profile mini-program --stack taro

# 已有项目，跳过框架 CLI
fe-harness scaffold my-existing --profile consumer-h5 --skip-framework-cli

# 根据 PRD 做路由拆分
fe-harness scaffold my-h5 --profile consumer-h5 --with-routes --prd ./prd.md

# 预览步骤
fe-harness scaffold my-h5 --profile consumer-h5 --dry-run

# 跳过依赖安装
fe-harness scaffold my-h5 --profile consumer-h5 --skip-install

# JSON 输出
fe-harness scaffold my-h5 --profile consumer-h5 --json
```

### 输出示例

```json
{
  "status": "success",
  "projectName": "my-h5",
  "profile": "consumer-h5",
  "stack": "uni-app",
  "ui": null,
  "steps": [
    "cascade-validate",
    "framework-cli",
    "init",
    "hosts-install",
    "skeleton-inject"
  ],
  "files": [
    "package.json",
    "src/main.js",
    "src/pages/index/index.vue",
    ".fe-harness/project.yaml",
    "AGENTS.md"
  ]
}
```

### 生成的内容

- 框架 CLI 创建的项目结构
- `.fe-harness/` 配置目录和 project.yaml
- AGENTS.md 约束文件
- 工程骨架（ESLint/Prettier、测试基础设施、目录边界）
- 多宿主薄入口
- UI System Adapter（指定 `--ui` 时）

---

## init

接入已有项目，添加 fe-harness 配置文件。

### 用法

```bash
fe-harness init [选项]
```

### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--dry-run` | boolean | false | 预览初始化内容，不写文件 |
| `--json` | boolean | false | 以 JSON 格式输出 |

### 示例

```bash
# 预览初始化
fe-harness init --dry-run

# 执行初始化
fe-harness init

# JSON 输出
fe-harness init --json
```

### 行为说明

- 检测项目类型
- 生成 `.fe-harness/` 目录
- 创建 `AGENTS.md`
- 不会覆盖已有文件（除非显式指定）

---

## plan

输出 scaffold/init 的结构化计划，用于预览。

### 用法

```bash
fe-harness plan <scaffold|init> [选项]
```

### 示例

```bash
fe-harness plan scaffold my-h5 --json
fe-harness plan init --json
```

### 输出示例

```json
{
  "operation": "scaffold",
  "projectName": "my-h5",
  "files": [
    {
      "path": "package.json",
      "action": "create",
      "description": "项目配置文件"
    }
  ]
}
```

---

## inspect

查看项目事实和能力。

### 用法

```bash
fe-harness inspect [选项]
```

### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--json` | boolean | false | 以 JSON 格式输出 |

### 示例

```bash
fe-harness inspect
fe-harness inspect --json
```

### 输出字段

- 项目类型
- 技术栈
- 文件结构
- 配置信息
- Agent 能力

---

## doctor

只读诊断，检查项目健康状态。

### 用法

```bash
fe-harness doctor [选项]
```

### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--json` | boolean | false | 以 JSON 格式输出 |

### 检查项

- 配置文件完整性
- 脚本可用性
- 输入文件状态
- Token 配置
- Agent readiness
- 敏感路径检测（.env、私钥等，只枚举不读取）

---

## audit

八维成熟度审计，借鉴 ai-harness-init 的审计模式。

### 用法

```bash
fe-harness audit [选项]
```

### 八个维度

| 维度 | 检查内容 |
|------|----------|
| `reproducibility` | Node 版本、包管理器、锁文件一致 |
| `commands` | build/test/lint/type-check 脚本配置 |
| `code_quality` | ESLint、Prettier、TS 配置、模块边界 |
| `testing` | 单测/E2E/视觉测试、覆盖闭环 |
| `architecture` | profile/platform/stack 一致性、模块边界 |
| `inputs` | PRD/RP/UI/API/assets 登记状态 |
| `agent_ecosystem` | AGENTS.md、Skills、Agent 适配器 |
| `design_governance` | Design Token、UI System、视觉基线 |

### 评分规则

| 状态 | 得分 |
|------|------|
| `passed` | 100 |
| `warning` | 60 |
| `failed` | 0 |
| `manual` | 不计分 |

### 等级

| 等级 | 分数范围 |
|------|----------|
| A | ≥ 90 |
| B | 80-89 |
| C | 70-79 |
| D | 60-69 |
| E | 50-59 |
| F | < 50 |

### 输出

- 每维度得分和等级
- 总分和总等级
- P0-P2 改进清单（P0=命令/安全失败，P1=其他失败，P2=警告）
- Markdown 报告写入 `tmp/fe-harness/audit-report.md`

### 示例

```bash
fe-harness audit
fe-harness audit --json
```

---

## optimize

幂等升级既有 Harness，按组对齐到最新 Harness 规范。

### 用法

```bash
fe-harness optimize [选项]
```

### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--dry-run` | boolean | false | 列出精确差异，不写文件 |
| `--groups` | string | - | 指定执行的组，逗号分隔 |
| `--json` | boolean | false | 以 JSON 格式输出 |

### 五个组

| 组 | 内容 |
|------|------|
| `docs` | AGENTS.md、docs/ 下的事实文件 |
| `rules` | `.fe-harness/rules/` 下的规则文件 |
| `adapters` | 宿主适配器和薄入口 |
| `engineering` | 工程配置（lint、tsconfig、scripts 等） |
| `tools` | Agent 工具链和 Skills |

### 行为说明

- 读取现有 Harness 和工程配置，按五组列出精确差异。
- `--dry-run` 只列出差异不写文件。
- 不指定 `--groups` 时，交互式让用户选择组。
- 指定 `--groups` 时，只执行选定的组。
- 执行后做二次 dry comparison 验证幂等：如果二次比较仍有差异会报告。

### 示例

```bash
# 预览所有组的差异
fe-harness optimize --dry-run

# 只执行 docs 和 rules 组
fe-harness optimize --groups docs,rules

# 执行全部五组
fe-harness optimize --groups docs,rules,adapters,engineering,tools

# JSON 输出
fe-harness optimize --dry-run --json
```

### 输出示例

```json
{
  "status": "success",
  "groups": {
    "docs": { "diffs": 3, "applied": true },
    "rules": { "diffs": 1, "applied": true },
    "adapters": { "diffs": 0, "applied": false },
    "engineering": { "diffs": 2, "applied": true },
    "tools": { "diffs": 0, "applied": false }
  },
  "idempotent": true
}
```

---

## validate

验证 Harness 完整性，检查受管块、规则、适配器和链接一致性。

### 用法

```bash
fe-harness validate [选项]
```

### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--json` | boolean | false | 以 JSON 格式输出 |

### 检查项

| 检查 | 说明 |
|------|------|
| 受管块匹配 | 验证所有 managed block 标记完整且内容与源一致 |
| 规则完整性 | 检查 `.fe-harness/rules/` 下规则文件是否完整、无遗漏 |
| 宿主适配器 | 验证已安装宿主适配器的入口和受管块是否正常 |
| Markdown 链接 | 扫描文档中的链接是否指向有效路径 |
| 禁止路径 | 检查是否存在不应纳入 Harness 的禁止路径 |

### 示例

```bash
fe-harness validate
fe-harness validate --json
```

### 输出示例

```json
{
  "status": "passed",
  "checks": {
    "managed_blocks": "passed",
    "rules": "passed",
    "host_adapters": "passed",
    "markdown_links": "warning",
    "forbidden_paths": "passed"
  },
  "warnings": [
    "docs/PROJECT_MAP.md: broken link to docs/ARCHITECTURE.md"
  ]
}
```

---

## hosts

管理多宿主薄入口，为不同 Agent 宿主安装入口文件。

### 子命令

- `list`: 列出支持的宿主和已安装状态
- `install`: 为指定宿主安装薄入口

### 用法

```bash
fe-harness hosts list [选项]
fe-harness hosts install [选项]
```

### 支持的宿主

| 宿主 | 说明 |
|------|------|
| `codex` | Codex 入口 |
| `opencode` | OpenCode 入口 |
| `claude` | Claude Code 入口 |
| `cursor` | Cursor 入口 |
| `trae` | Trae 入口 |

### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `--host` | string | - | 指定宿主名称 |
| `--json` | boolean | false | 以 JSON 格式输出 |

### 行为说明

- 用受管块和稳定 ID 安装入口文件。
- 不覆盖已有内容，只插入受管块。
- 未指定 `--host` 时，交互式选择。

### 示例

```bash
# 列出支持的宿主和安装状态
fe-harness hosts list --json

# 安装 Claude Code 入口
fe-harness hosts install --host claude

# 安装 Codex 入口
fe-harness hosts install --host codex --json
```

### 输出示例

```json
{
  "status": "success",
  "host": "claude",
  "installed": true,
  "entry": ".claude/CLAUDE.md",
  "managedBlocks": 3
}
```

---

## inputs

检查、比对、分析输入文件。

### 子命令

- `inspect`: 检查输入文件和 manifest
- `analyze`: 分析证据结论和冲突
- `diff`: 对比输入变化

### 用法

```bash
fe-harness inputs inspect --json
fe-harness inputs analyze --json
fe-harness inputs diff --json
```

---

## task

管理任务编号、历史和快照。

### 子命令

- `create`: 创建新任务
- `history`: 查看任务历史
- `snapshot`: 创建任务快照

### 用法

```bash
# 创建任务
fe-harness task create --title "首次需求" --json

# 查看历史
fe-harness task history T001 --json

# 创建快照
fe-harness task snapshot T001 --title "首次需求" --request "完成页面" --json
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `--title` | string | 任务标题 |
| `--request` | string | 需求描述 |
| `--json` | boolean | JSON 输出 |

---

## verify

执行验证模式。

### 验证模式

- `quick`: 快速验证
- `feature`: 功能验证
- `runtime`: 运行时验证
- `interaction`: 交互验证
- `visual`: 视觉验证
- `audit`: 审计验证

### 用法

```bash
fe-harness verify quick
fe-harness verify feature
fe-harness verify visual
fe-harness verify audit
```

### 输出

生成验证报告（Markdown 或 JSON）。

---

## api

OpenAPI 检查和生成。

### 子命令

- `inspect`: 检查 OpenAPI 文件
- `generate`: 生成 TypeScript 类型

### 用法

```bash
fe-harness api inspect --task T001 --json
fe-harness api generate --task T001 --dry-run
fe-harness api generate --task T001
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `--task` | string | 任务编号 |
| `--dry-run` | boolean | 预览生成内容 |

---

## design

Design Token 检查、发现、对比。

### 子命令

- `tokens inspect`: 检查 Token 文件
- `tokens discover`: 发现现有样式
- `tokens diff`: 对比 Token 变化

### 用法

```bash
fe-harness design tokens inspect --json
fe-harness design tokens discover --json
fe-harness design tokens diff --json
```

---

## ui

UI System Adapter 管理。

### 子命令

- `systems list`: 列出可用系统
- `systems install`: 安装 Adapter

### 用法

```bash
fe-harness ui systems list --json
fe-harness ui systems install tdesign-uniapp --dry-run --json
fe-harness ui systems install tdesign-uniapp
```

---

## skills

安装 Agent Skills。

### 子命令

- `list`: 列出可用 Skills
- `install`: 安装 Skill

### 用法

```bash
fe-harness skills list --json
fe-harness skills install --project --name consumer-h5-harness
fe-harness skills install --global --provider claude
```

### 参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `--project` | boolean | 项目级安装 |
| `--global` | boolean | 全局安装 |
| `--provider` | string | Provider (claude, cursor, all) |
| `--name` | string | Skill 名称 |

---

## 错误处理

### 常见错误码

| 错误码 | 说明 |
|--------|------|
| `ENOENT` | 文件不存在 |
| `EEXIST` | 文件已存在 |
| `INVALID_CONFIG` | 配置无效 |
| `MISSING_INPUT` | 输入缺失 |

### 错误输出格式

```json
{
  "error": {
    "code": "ENOENT",
    "message": "File not found: .fe-harness/project.yaml",
    "suggestion": "Run 'fe-harness init' to initialize the project"
  }
}
```

---

## 环境变量

| 变量 | 说明 |
|------|------|
| `FE_HARNESS_DEBUG` | 启用调试模式 |
| `FE_HARNESS_CONFIG` | 自定义配置文件路径 |

---

## 配置文件

### .fe-harness/project.yaml

项目配置文件，定义：

- 项目类型
- 技术栈
- 验证模式映射
- 文件路径

### AGENTS.md

项目约束文件，定义：

- 业务无关的工程规则
- 验证要求
- Agent 工作流指引

---

## 更多信息

- [命令参考](/reference/commands)
- [配置与文件](/reference/config-and-files)
- [验证模式](/reference/verification-modes)