# fe-harness

[English](README.md) | [简体中文](README.zh-CN.md)

`fe-harness` is a business-agnostic frontend engineering and quality harness. It gives developers,
CI pipelines, and coding agents one configuration and CLI for project scaffolding, evidence intake,
task tracking, diagnostics, and verification.

> Current status: active development. The workspace packages are prepared for packing, but no npm
> package has been published yet. Use the repository CLI while evaluating the project.

## What it provides

- Cascading project scaffolding: Product Profile → Stack → UI System → framework options.
- Safe, dry-run-first adoption for existing projects without overwriting project-owned files.
- Registered PRD, RP, UI, API, and asset evidence with change and conflict detection.
- Stable task IDs, immutable snapshots, and requirement-closure checks.
- Quick, feature, runtime, interaction, visual, and audit verification modes.
- Read-only diagnostics, eight-dimension maturity audits, and idempotent optimization proposals.
- Optional Design Token, UI System Adapter, and task-scoped OpenAPI generation workflows.
- Thin agent entrypoints for Codex, OpenCode, Claude Code, Cursor, and Trae.

## Quick start from source

Requirements: Node.js 20 or later and pnpm 10.x.

```bash
pnpm install
node packages/cli/bin/fe-harness.mjs --help

# Preview a new project without writing files
node packages/cli/bin/fe-harness.mjs scaffold my-app \
  --profile consumer-h5 \
  --stack uni-app \
  --dry-run

# Preview adoption inside an existing project
node /path/to/fe-harness/packages/cli/bin/fe-harness.mjs init --dry-run
```

After the CLI is published or linked locally, the same commands can be invoked as `fe-harness ...`.

## Default workflow

```bash
# 1. Create a project, or connect an existing one
fe-harness scaffold my-app --profile consumer-h5 --stack uni-app
fe-harness init --dry-run
fe-harness init

# 2. Inspect and analyze task evidence
fe-harness inputs inspect --json
fe-harness inputs analyze --json

# 3. Create a traceable task
fe-harness task create --title "First feature"

# 4. Implement, then run the appropriate gate
fe-harness verify feature
```

`scaffold` delegates initial creation to the selected framework CLI and then layers Harness files,
agent entrypoints, adapters, and project configuration on top. `init` adds only missing Harness files
to an existing project. Both support a non-mutating preview before adoption.

## Supported combinations

| Layer | Available options |
| --- | --- |
| Product Profile | `consumer-h5`, `admin-web`, `mini-program` |
| Platform Adapter | `web-mobile`, `node-runtime` |
| Stack Adapter | `uni-app`, `vue3-vite`, `react-vite`, `taro` |
| UI System Adapter | `tdesign-uniapp`, `element-plus`, `ant-design-vue`, `arco-design-vue`, `tdesign-web-vue`, `ant-design` |

Compatibility is filtered by the selected Product Profile and Stack Adapter. UI System Adapters are
optional descriptors; adopting a UI runtime still requires a version-locked project dependency.

## CLI overview

```text
scaffold <name>                  Create a project through cascading choices
init [--dry-run]                Connect an existing project safely
inspect [--map]                 Inspect facts or generate codebase maps
plan init                       Preview initialization as structured data
doctor                          Run read-only diagnostics
audit                           Produce an eight-dimension maturity report
optimize [--dry-run]            Propose or apply grouped, idempotent improvements
validate                        Validate managed blocks, rules, links, and host adapters
hosts list|install              Manage multi-host thin entrypoints
inputs inspect|diff|analyze     Inspect registered task evidence
task create|inspect|history|snapshot
api inspect|generate            Generate task-scoped code from local OpenAPI JSON
design tokens inspect|diff|discover
ui systems list|install
skills list|install
verify quick|feature|runtime|interaction|visual|audit
version
```

Run `fe-harness help <command>` for command-specific options. Add `--json` where supported for stable
Agent and CI output.

## Architecture

```text
Core
  + Product Profile
  + Platform Adapter
  + Stack Adapter
  + optional UI System Adapter
  + project-owned configuration (.fe-harness/project.yaml)
```

Core owns reusable mechanisms such as configuration loading, diagnostics, command execution,
reports, and safe writes. It does not contain business pages, domain states, API endpoints, brands,
or project Design Token values. Product, platform, stack, and UI rules remain declarative adapters.

## Agent integration and Skills

`AGENTS.md` is the single project constraint body. Provider-specific files are thin adapters:

- Codex and OpenCode → `AGENTS.md`
- Claude Code → `CLAUDE.md`
- Cursor → `.cursor/rules/fe-harness.mdc`
- Trae → runtime-verified entrypoint

The repository includes an aggregate `consumer-h5-harness` workflow plus command-specific Skills for
scaffold, init, inspect, plan, doctor, verify, inputs, tasks, API generation, Design Tokens, Skill
installation, and version checks. Generated projects receive the aggregate workflow by default;
install specialized Skills only when needed.

```bash
fe-harness skills list --json
fe-harness skills install --project --provider all --name consumer-h5-harness
fe-harness skills install --global --provider claude
```

## Development and verification

```bash
pnpm test
node packages/cli/bin/fe-harness.mjs version
pnpm verify:quick
pnpm verify:audit
```

The deployable VitePress documentation site is under `site/fe-harness-docs/`:

```bash
cd site/fe-harness-docs
pnpm install
pnpm docs:dev
pnpm docs:build
```

For implementation details and project direction, see [Project Map](docs/PROJECT_MAP.md),
[Architecture](docs/ARCHITECTURE.md), [Current Status](docs/CURRENT_STATUS.md), and
[Roadmap](docs/ROADMAP.md).

## Current limitations

- Registry publication, release automation, and upgrade conflict patches are not available yet.
- Online Apifox synchronization is not implemented; API generation starts from registered local
  OpenAPI JSON exports.
- Visual and interaction verification require project-specific baselines or flows and may report
  `not_configured`.
- The experimental UI System workflow still needs validation in unrelated real-world projects.

## License

MIT
