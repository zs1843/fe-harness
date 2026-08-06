# 构建与部署

文档站使用 VitePress。源码位于：

```text
site/fe-harness-docs/docs/
```

## 安装依赖

```bash
cd site/fe-harness-docs
pnpm install
```

## 本地预览

```bash
pnpm docs:dev
```

## 构建静态资源

```bash
pnpm docs:build
```

输出目录：

```text
site/fe-harness-docs/docs/.vitepress/dist/
```

## 本地预览构建产物

```bash
pnpm docs:preview
```

## 打包

```bash
tar -czf fe-harness-docs.tar.gz -C site/fe-harness-docs/docs/.vitepress/dist .
```

## 部署

把 dist 目录内容上传到任意静态托管服务：

- Nginx 静态目录。
- GitHub Pages。
- OSS/CDN。
- Vercel。
- Netlify。
- 任意对象存储静态网站。

如果部署在子路径，需要在 `docs/.vitepress/config.mjs` 中配置 VitePress `base`。
