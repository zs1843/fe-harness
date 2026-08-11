# Create New Project (scaffold)

`scaffold` is the sole command for creating a new project. It confirms product type, tech framework, UI component library, and Agent host through multi-round Q&A, then delegates to the framework CLI to generate the project and layers fe-harness governance on top.

## Commands

```bash
fe-harness scaffold <project-name> --profile <profile> --stack <stack>
```

Full parameter form:

```bash
fe-harness scaffold <project-name> \
  --profile <profile> \
  --stack <stack> \
  --ui <ui-system> \
  --hosts <host1,host2> \
  [--with-routes --prd <prd-path>] \
  [--skip-install] \
  [--skip-framework-cli]
```

When `--profile` is not provided, the CLI enters terminal interactive mode; but as an AI Agent, you should **ask the user round by round, collect confirmations, and execute in parameter mode** rather than letting the user face terminal input.

Offline creation (skip dependency install):

```bash
fe-harness scaffold my-h5 --profile consumer-h5 --stack uni-app --skip-install
```

## Multi-Round Q&A Flow

Without `--profile`, interactive mode collects options round by round. Each round's choices are determined by the previous step:

### Round 1: Product Type

- Admin management system (`admin-web`)
- Consumer H5 (`consumer-h5`)
- WeChat/Alipay mini-program (`mini-program`)

### Round 2: Tech Framework

Based on the Profile from Round 1, only compatible Stacks are shown (cascading filter):

| Profile | Available Stacks |
|---------|-----------|
| `admin-web` | `vue3-vite` / `react-vite` |
| `consumer-h5` | `uni-app` / `vue3-vite` / `taro` / `react-vite` |
| `mini-program` | `uni-app` / `taro` |

### Round 3: Framework Options

Based on the Stack from Round 2, confirm TypeScript / Vue Router / Pinia / ESLint item by item. Defaults to all "yes".

| Stack | Framework Options |
|-------|---------|
| `vue3-vite` | TypeScript / Vue Router / Pinia / ESLint |
| `react-vite` | TypeScript |
| `uni-app` | TypeScript / Pinia (no Router, uses built-in pages.json) |
| `taro` | Framework syntax(React/Vue) / TypeScript |
| `next.js` | TypeScript / TailwindCSS |

### Round 4: UI Component Library

Based on the Stack from Round 2, only compatible UI Systems are shown:

| Stack | Available UI Systems |
|-------|----------------|
| `vue3-vite` | `element-plus` / `ant-design-vue` / `arco-design-vue` / `tdesign-web-vue` |
| `react-vite` | `ant-design` |
| `uni-app` | `tdesign-uniapp` |
| `taro` | (none yet) |

### Round 5: Agent Host

Multiple selection: Codex / OpenCode / Claude Code / Cursor / Trae. Defaults to Codex.

### Round 6: Route Splitting

Ask whether a PRD already exists and route splitting based on requirements is needed:

- Yes → ask for PRD file path, add `--with-routes --prd <path>` at execution
- No → skip; page splitting done later by Agent after PRD is added

### Round 7: Install Dependencies

Defaults to yes. Choose no and add `--skip-install`.

## Cascading Selection Matrix

Each step's choice filters subsequent available options. Profile determines Stack scope, and Stack determines framework options and UI System, preventing incompatible combinations.

## Skeleton Injection

`scaffold` automatically injects the engineering skeleton with no manual configuration needed:

- Directory boundaries (components, services, repositories, stores, utils, etc.)
- ESLint + Prettier rules
- Test infrastructure (Playwright runtime/visual verification config)
- `.fe-harness/project.yaml`

## Route Splitting (--with-routes --prd)

If a PRD already exists at creation time, pass the PRD path and `scaffold` will automatically split routes based on requirements:

```bash
fe-harness scaffold my-admin --profile admin-web --stack vue3-vite \
  --with-routes --prd .fe-harness/inputs/prd.md
```

Without a PRD, route splitting is skipped; page splitting is done later by Agent after the PRD is added.

## Existing Project, Harness Only (--skip-framework-cli)

When the project already exists and framework CLI execution is not needed, add `--skip-framework-cli` to only layer fe-harness governance:

```bash
fe-harness scaffold my-existing --profile consumer-h5 --stack uni-app --skip-framework-cli
```

In this mode `scaffold` only runs init + hosts + ui + skeleton + project.yaml, and does not delegate to create-vue / create-vite / taro init, etc.

## What scaffold Generates

- Project created by delegated framework CLI (create-vue / create-vite / taro init, etc.)
- `.fe-harness/project.yaml`
- `.fe-harness/inputs/` standard input directory
- `AGENTS.md`, `CLAUDE.md`, Cursor rule
- Multi-host thin entrypoints (codex/opencode/claude/cursor/trae, managed blocks, no overwrite)
- UI adapters (`fe-harness ui systems install`)
- Engineering skeleton (directory boundaries + ESLint/Prettier + test infrastructure)
- Default aggregated Skill: `consumer-h5-harness`
- PRODUCT, DESIGN, CURRENT_STATUS, PROJECT_MAP, history and coverage files under docs
- Route splitting results, if a PRD was provided

## Why Not Require PRD/UI/API Before Creation

The goal of project creation is to generate container and rules, not immediately complete business. Real projects often have temporarily incomplete inputs. Forcing all materials ready at creation stage would make scaffolding a process blocker.

The correct approach:

1. First create project and input directory.
2. Put existing materials into `.fe-harness/inputs/`.
3. Then register, analyze, and create first task.

## Default Only Installs Aggregated Skill

New projects by default only install `consumer-h5-harness`. Command-level Skills can still be installed as needed:

```bash
fe-harness skills install --project --name fe-harness-api
```

This reduces default context. Regular business tasks don't need to load deep rules like OpenAPI, Design Token, UI System, visual baselines at the start.
