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
fe-harness inputs inspect --json
fe-harness design tokens inspect --json
fe-harness ui systems list --json
fe-harness ui systems install tdesign-uniapp --dry-run --json
fe-harness task create --title "首次需求"
fe-harness skills list --json
fe-harness skills install --project
fe-harness skills install --global
fe-harness version
fe-harness -v
fe-harness --version
```

`create` generates a real consumer-H5 project with uni-app, Vue 3, Vite, Playwright, project facts,
automatic Agent instructions, and the default aggregate Consumer H5 workflow Skill. It installs
project dependencies by default; use `--skip-install` for offline scaffolding. `init` connects an
existing project without overwriting project-owned files. AI agents should use `inspect` and `plan`
before mutation, then invoke the appropriate verification mode automatically.

Command-specific Skills remain available through explicit installation when a task needs them.

`AGENTS.md` is the only project constraint body. Generated `CLAUDE.md` imports it, Cursor receives a
thin always-applied rule pointing to it, and Codex/Cursor use `.agents/skills` while Claude Code uses
`.claude/skills`. Install workflows for supported providers with:

```bash
fe-harness skills install --project --provider all --name consumer-h5-harness
fe-harness skills install --global --provider claude
fe-harness skills install --global --provider cursor
```

## Architecture

```text
Core
  + Product Profile
  + Platform Adapter
  + Stack Adapter
  + Project-owned configuration
```

Core does not contain product pages, domain states, API endpoints, brand values, or design tokens.
It also does not import a concrete UI library. Optional UI System Adapters map semantic components and
project-owned semantic tokens to a selected library; see `docs/UI_SYSTEMS.md`.

## Documentation site

A deployable VitePress documentation site lives under `site/fe-harness-docs/`. It explains the
background, SOP, module design, Agent workflow, verification strategy, and static deployment path.

```bash
cd site/fe-harness-docs
pnpm install
pnpm docs:build
```

## Status

This repository is an initial `0.1.0` implementation. Core and CLI packages can be packed for
registry verification, but the placeholder `@company` scope must be replaced or configured before
publishing. Publishing, upgrades, API contract adapters, and additional project profiles remain
explicit release decisions.
