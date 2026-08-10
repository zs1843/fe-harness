# Create New Project

## Commands

```bash
fe-harness plan create my-h5 --json
fe-harness create my-h5
```

Offline creation:

```bash
fe-harness create my-h5 --skip-install
```

## What Gets Generated

Consumer H5 preset generates:

- uni-app + Vue 3 + Vite base project.
- Playwright runtime/visual verification config.
- `.fe-harness/project.yaml`.
- `.fe-harness/inputs/` standard input directory.
- `AGENTS.md`, `CLAUDE.md`, Cursor rule.
- Default aggregated Skill: `consumer-h5-harness`.
- PRODUCT, DESIGN, CURRENT_STATUS, PROJECT_MAP, history and coverage files under docs.
- Boundary directories like components, services, repositories, stores, utils under src.

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