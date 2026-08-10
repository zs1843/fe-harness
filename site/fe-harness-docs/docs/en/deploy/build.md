# Build and Deployment

The documentation site uses VitePress. Source code is located at:

```text
site/fe-harness-docs/docs/
```

## Install Dependencies

```bash
cd site/fe-harness-docs
pnpm install
```

## Local Preview

```bash
pnpm docs:dev
```

## Build Static Assets

```bash
pnpm docs:build
```

Output directory:

```text
site/fe-harness-docs/docs/.vitepress/dist/
```

## Preview Build Locally

```bash
pnpm docs:preview
```

## Package

```bash
tar -czf fe-harness-docs.tar.gz -C site/fe-harness-docs/docs/.vitepress/dist .
```

## Deploy

Upload the contents of the dist directory to any static hosting service:

- Nginx static directory.
- GitHub Pages.
- OSS/CDN.
- Vercel.
- Netlify.
- Any object storage static website.

If deploying to a subpath, configure VitePress `base` in `docs/.vitepress/config.mjs`.