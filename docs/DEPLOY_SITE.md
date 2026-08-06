# fe-harness VitePress 文档站

可部署的完整文档项目位于：

```text
site/fe-harness-docs/
```

源码入口：

```text
site/fe-harness-docs/docs/index.md
```

该文档站包含 fe-harness 的建设背景、使用 SOP、模块设计解释、验证策略、Agent 协作方式和静态部署说明。

本地开发：

```bash
cd site/fe-harness-docs
pnpm install
pnpm docs:dev
```

构建：

```bash
cd site/fe-harness-docs
pnpm docs:build
```

构建产物：

```text
site/fe-harness-docs/docs/.vitepress/dist/
```

打包命令：

```bash
tar -czf fe-harness-docs.tar.gz -C site/fe-harness-docs/docs/.vitepress/dist .
```
