# fe-harness

`fe-harness` is a business-agnostic frontend engineering and quality harness. It provides
configuration-driven verification, project diagnostics, reports, initialization templates, and CI
entry points.

The first profile targets:

- Product profile: `consumer-h5`
- Platform adapter: `web-mobile`
- Stack adapter: `uni-app`

## Commands

```bash
fe-harness create my-h5 --dry-run
fe-harness create my-h5
fe-harness init --dry-run
fe-harness init
fe-harness inspect --json
fe-harness plan init --json
fe-harness plan create my-h5 --json
fe-harness doctor
fe-harness verify quick
fe-harness verify feature
fe-harness verify visual
fe-harness verify audit
fe-harness version
```

`create` generates a real consumer-H5 project with uni-app, Vue 3, Vite, Playwright, project facts,
automatic Agent instructions, and a project-local `consumer-h5-harness` skill. `init` connects an
existing project without overwriting conflicts. AI agents should use `inspect` and `plan` before
mutation, then invoke the appropriate verification mode automatically.

## Architecture

```text
Core
  + Product Profile
  + Platform Adapter
  + Stack Adapter
  + Project-owned configuration
```

Core does not contain product pages, domain states, API endpoints, brand values, or design tokens.

## Status

This repository is an initial `0.1.0` implementation. Publishing, upgrades, API contract adapters,
and additional project profiles are intentionally deferred until the first H5 pilot is stable.
