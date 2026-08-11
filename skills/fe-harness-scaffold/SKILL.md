---
name: fe-harness-scaffold
description: Scaffold a new frontend project by cascading multi-round Q&A. Use when a user wants to create a new project (admin backend, H5, mini-program), needs to choose framework/UI/library, and wants fe-harness layered on top. Triggers on "新建项目""创建项目""scaffold""初始化项目""做一个后台""做一个H5" etc.
---

# 项目脚手架（级联多轮问答）

通过多轮问答确认产品形态、技术框架、UI 组件库和 Agent 宿主，然后委托框架 CLI 创建项目并叠加 fe-harness 治理层。

所有用户可见输出使用中文。不传 `--profile` 参数时 CLI 会进入终端交互模式；但作为 AI Agent，应**逐轮提问用户、收集确认后用参数模式执行**，而不是让用户面对终端输入。

## 级联过滤矩阵

每一轮的选项由上一步决定：

| Profile | 可选 Stack |
|---------|-----------|
| `admin-web` | `vue3-vite` / `react-vite` |
| `consumer-h5` | `uni-app` / `vue3-vite` / `taro` / `react-vite` |
| `mini-program` | `uni-app` / `taro` |

| Stack | 可选 UI System |
|-------|----------------|
| `vue3-vite` | `element-plus` / `ant-design-vue` / `arco-design-vue` / `tdesign-web-vue` |
| `react-vite` | `ant-design` |
| `uni-app` | `tdesign-uniapp` |
| `taro` | （暂无） |

| Stack | 框架选项 |
|-------|---------|
| `vue3-vite` | TypeScript / Vue Router / Pinia / ESLint |
| `react-vite` | TypeScript |
| `uni-app` | TypeScript / Pinia（无 Router，用 pages.json 内置） |
| `taro` | 框架语法(React/Vue) / TypeScript |
| `next.js` | TypeScript / TailwindCSS |

## 多轮问答流程

### 第1轮：产品形态

问用户："这是什么类型的产品？"

选项（级联决定后续 Stack 范围）：
- 后台管理系统（admin-web）
- 消费者 H5（consumer-h5）
- 微信/支付宝小程序（mini-program）

### 第2轮：技术框架

根据第1轮的 Profile，只展示兼容的 Stack。

例如用户选了 admin-web，则只问：
- Vue 3 + Vite
- React + Vite

### 第3轮：框架选项

根据第2轮的 Stack，逐项确认：
- TypeScript？是/否
- Vue Router？是/否（仅 vue3-vite/next.js）
- Pinia？是/否（仅 vue3-vite/uni-app）
- ESLint + Prettier？是/否

默认全部"是"。用户说"都要"或"默认"时全部选是。

### 第4轮：UI 组件库

根据第2轮的 Stack，只展示兼容的 UI System。

例如用户选了 vue3-vite，则展示：
- Element Plus（后台首选）
- Ant Design Vue
- Arco Design Vue
- TDesign Web Vue
- 不配置

### 第5轮：Agent 宿主

问用户："使用哪些 AI Agent 宿主？可多选。"

选项：
- Codex
- OpenCode
- Claude Code
- Cursor
- Trae

默认 Codex。用户说"都要"时选全部。

### 第6轮：路由拆分

问用户："是否已有 PRD，需要根据需求做路由拆分？"

- 是 → 询问 PRD 文件路径，执行时加 `--with-routes --prd <路径>`
- 否 → 跳过，后续放入 PRD 后再由 Agent 做页面拆分

### 第7轮：安装依赖

问用户："是否现在安装依赖？"

默认是。用户说"稍后"时选否，加 `--skip-install`。

## 执行

收集完所有答案后，汇总确认：

```
项目名:    <用户输入>
Profile:   <第1轮>
Stack:     <第2轮>
框架选项:  <第3轮>
UI System: <第4轮>
宿主:      <第5轮>
路由拆分:  <第6轮>
依赖安装:  <第7轮>
```

用户确认后，用参数模式执行（不依赖终端交互）：

```bash
fe-harness scaffold <项目名> \
  --profile <profile> \
  --stack <stack> \
  --ui <ui-system> \
  --hosts <host1,host2> \
  [--with-routes --prd <prd路径>] \
  [--skip-install]
```

`scaffold` 会自动完成：
1. 委托框架 CLI 创建项目（create-vue / create-vite / taro init 等）
2. `fe-harness init` 补 Harness 文件 + 幂等验证
3. `fe-harness hosts install` 多宿主薄入口（受管块，不覆盖）
4. `fe-harness ui systems install` UI 适配器
5. 注入工程骨架（目录边界 + 测试基础设施 + ESLint/Prettier）
6. 根据 PRD 做路由拆分（如果第6轮选了）
7. 写入 `.fe-harness/project.yaml`
8. 安装依赖（如果第7轮选了）

## 执行后

告知用户下一步：

```
项目已创建。下一步：
1. 把 PRD/RP/UI/API/assets 放入 .fe-harness/inputs/
2. fe-harness inputs inspect --json
3. fe-harness task create --title "首期需求"
4. fe-harness doctor
5. fe-harness audit
```

## 常见场景

### 运营后台（Vue3 + Element Plus）

用户说"做一个运营后台"时：
1. 确认项目名
2. Profile → admin-web
3. Stack → vue3-vite
4. TypeScript/Router/Pinia/ESLint → 全部默认是
5. UI → element-plus
6. 宿主 → 确认用户用什么
7. 路由拆分 → 询问有无 PRD
8. 安装依赖 → 是

### 小程序（Taro + React）

用户说"做一个微信小程序"时：
1. 确认项目名
2. Profile → mini-program
3. Stack → taro（uni-app 也可选）
4. 框架语法 → React 或 Vue
5. UI → 暂无可选，跳过
6. 宿主 → 确认
7. 路由拆分 → 询问
8. 安装依赖 → 是

### 已有项目只加 Harness

用户说"我已有项目，只想加 fe-harness"时：
- 不执行框架 CLI，加 `--skip-framework-cli`
- 只执行 init + hosts + ui + skeleton + project.yaml
