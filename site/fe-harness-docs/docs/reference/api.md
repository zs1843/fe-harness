# API 详细文档

本文档详细描述 fe-harness CLI 的所有命令、参数、返回值和使用示例。

## 命令总览

| 命令 | 作用 | 是否写文件 |
|------|------|-----------|
| `version` | 输出 CLI 版本 | 否 |
| `create` | 创建新项目 | 是 |
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

## create

创建新的 Consumer H5 项目。

### 用法

```bash
fe-harness create <项目名> [选项]
```

### 参数

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `<项目名>` | string | - | 项目名称 |
| `--output` | string | `.` | 输出目录 |
| `--dry-run` | boolean | false | 预览创建内容，不写文件 |
| `--skip-install` | boolean | false | 跳过依赖安装 |
| `--json` | boolean | false | 以 JSON 格式输出 |

### 示例

```bash
# 创建项目（交互式）
fe-harness create my-h5

# 指定输出目录
fe-harness create my-h5 --output ./projects

# 预览创建内容
fe-harness create my-h5 --dry-run

# 跳过依赖安装
fe-harness create my-h5 --skip-install

# JSON 输出
fe-harness create my-h5 --json
```

### 输出示例

```json
{
  "status": "success",
  "projectName": "my-h5",
  "outputPath": "./my-h5",
  "files": [
    "package.json",
    "src/main.js",
    "src/pages/index/index.vue"
  ]
}
```

### 创建的内容

- 项目配置文件（package.json, vite.config.js）
- 源码目录结构
- 测试配置
- Agent 工作流文件
- 默认 Skill

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

输出 create/init 的结构化计划，用于预览。

### 用法

```bash
fe-harness plan <create|init> [选项]
```

### 示例

```bash
fe-harness plan create my-h5 --json
fe-harness plan init --json
```

### 输出示例

```json
{
  "operation": "create",
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

### 示例

```bash
fe-harness doctor
fe-harness doctor --json
```

### 检查项

- 配置文件完整性
- 脚本可用性
- 输入文件状态
- Token 配置
- Agent readiness

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