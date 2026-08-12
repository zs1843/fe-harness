# VitePress 文档站开发与部署

独立文档项目位于 `site/fe-harness-docs/`，使用 VitePress 1.6.x。它与根 `docs/` 的仓库事实文档
用途不同：根 `docs/` 服务于工程维护，VitePress 站点服务于对外阅读和静态部署。

## 本地开发

```bash
cd site/fe-harness-docs
pnpm install
pnpm docs:dev
```

开发服务器默认监听所有网卡；实际地址以终端输出为准。

## 构建与预览

```bash
cd site/fe-harness-docs
pnpm docs:build
pnpm docs:preview
```

构建产物位于：

```text
site/fe-harness-docs/docs/.vitepress/dist/
```

发布前至少执行 `pnpm docs:build`，并检查导航、内部链接、代码块和中英文入口。构建产物可部署到
GitHub Pages、Vercel、Nginx、对象存储/CDN 或其他静态托管平台。

如需手工打包：

```bash
tar -czf fe-harness-docs.tar.gz -C site/fe-harness-docs/docs/.vitepress/dist .
```

发布或修改远程部署配置必须获得明确确认；本说明不代表仓库已经配置自动部署流水线。
