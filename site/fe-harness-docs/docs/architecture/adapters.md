# Profiles / Platforms / Stacks

Adapters 把不同变化维度拆开。

## Product Profile

Product Profile 描述产品形态。当前支持的 profile：

- `consumer-h5`（首个）：Consumer H5 移动端应用
- `admin-web`：后台管理系统，B 端中后台应用
- `mini-program`：微信/支付宝小程序

### consumer-h5

它关注：

- 页面结构。
- 需求闭环。
- 输入证据优先级。
- H5 常见验收路径。

它不应该写入具体业务页面和品牌。

### admin-web

它关注：

- 桌面视口布局。
- 数据表格状态（空/加载/错误/分页）。
- 表单校验与错误展示。
- 权限与路由守卫。
- 批量操作。
- 弹窗与抽屉管理。
- 响应式侧边栏。

### mini-program

它关注：

- 页面路由栈。
- TabBar 导航。
- 授权与作用域。
- 下拉刷新。
- 网络错误恢复。
- 分包加载。
- 分享与场景值。

## Platform Adapter

Platform Adapter 描述运行平台。当前支持的 adapter：

- `web-mobile`（首个）：移动 Web 平台
- `node-runtime`：Node.js 服务端运行时

### web-mobile

它关注：

- 移动 Web 视口。
- 浏览器 runtime 检查。
- H5 截图验收。
- 环境阻塞分类。

平台规则独立后，未来 mini-program、React Native 或 desktop web 可以有自己的验收模型。

### node-runtime

它关注：

- Node.js 版本兼容。
- 环境变量配置。
- 进程错误处理。
- 日志与覆盖率产出。

## Stack Adapter

Stack Adapter 描述框架和工具链。当前支持的 stack：

- `uni-app`（首个）：uni-app + Vue 3
- `vue3-vite`：Vue 3 + Vite 纯 Web
- `taro`：Taro 4 + React 多端
- `react-vite`：React 18 + Vite 纯 Web

### uni-app

它关注：

- Vue 3。
- Vite。
- `src/pages.json` 页面注册。
- Playwright。
- 项目脚本。

### vue3-vite

它关注：

- Vue 3 + Vite + TypeScript。
- `vite.config` 配置文件。
- Vue Router 路由完整性。
- Vitest + Playwright 测试隔离。

### taro

它关注：

- Taro 4 + React。
- `src/app.config.ts` 页面注册。
- Taro 请求 Mock。
- 多端构建命令。

### react-vite

它关注：

- React 18 + Vite + TypeScript。
- `vite.config` 配置文件。
- React Router 路由完整性。
- Vitest + Playwright 测试隔离。

## 为什么拆成三层

`consumer-h5` 是产品形态，`web-mobile` 是运行平台，`uni-app` 是实现技术栈。三者经常一起出现，但不等价。

拆开后可以支持这样的组合演进：

- Consumer H5 换成其他技术栈。
- Web Mobile 用于其他产品形态。
- uni-app 支持其他平台验收。
