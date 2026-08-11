# Command Reference

## Command Overview

| Command | Purpose | Writes Files |
|---------|---------|--------------|
| `version` | Output CLI version | No |
| `scaffold` | Delegate framework CLI + layer Harness on top | Yes |
| `init` | Initialize existing project | Yes |
| `plan` | Output structured plan | No |
| `inspect` | View project facts | No |
| `doctor` | Read-only diagnostics | No |
| `inputs` | Check inputs | Mostly read-only |
| `task` | Manage tasks | Yes |
| `verify` | Run verification | Writes reports |
| `api` | OpenAPI operations | inspect: no |
| `design` | Design Token operations | inspect: no |
| `ui` | UI System management | install: yes |
| `skills` | Install Skills | install: yes |
| `optimize` | Idempotently upgrade existing Harness | Yes, selected groups only |
| `validate` | Validate Harness integrity | No |
| `hosts` | Manage multi-host thin entrypoints | install: yes |

## Default Workflow

```bash
fe-harness scaffold <project-name> --profile consumer-h5
fe-harness init --dry-run
fe-harness inputs inspect --json
fe-harness task create --title "Task name"
fe-harness verify feature
```

## Creation & Initialization

```bash
fe-harness scaffold my-h5 --profile consumer-h5 --dry-run
fe-harness scaffold my-h5 --profile consumer-h5
fe-harness scaffold my-admin --profile admin-web --stack vue3-vite --ui tdesign
fe-harness scaffold my-mp --profile mini-program --stack taro
fe-harness scaffold my-existing --profile consumer-h5 --skip-framework-cli
fe-harness init --dry-run
fe-harness plan init --json
fe-harness init
```

`scaffold` delegates the framework CLI to create the project, then layers Harness on top: cascade options converge profile → stack → UI → framework options; injects the engineering skeleton (directory boundaries, ESLint/Prettier, test infrastructure); and splits routes from a PRD when provided. Use `--skip-framework-cli` to skip the framework CLI and only layer Harness onto an existing project.

`plan` and `--dry-run` both expose the impact surface before writing files. In existing projects, any conflict should be confirmed by a human first.

## Inputs

```bash
fe-harness inputs inspect --json
fe-harness inputs analyze --json
fe-harness inputs diff --json
```

## Tasks

```bash
fe-harness task create --title "First request" --json
fe-harness task history T001 --json
fe-harness task snapshot T001 --title "First request" --request "Complete page" --json
```

## Verification

```bash
fe-harness verify quick
fe-harness verify feature
fe-harness verify runtime
fe-harness verify interaction
fe-harness verify visual
fe-harness verify audit
```

## Diagnostics

```bash
fe-harness inspect --json
fe-harness inspect --map
fe-harness doctor
fe-harness doctor --json
fe-harness audit
fe-harness audit --json
fe-harness optimize --dry-run
fe-harness optimize --groups docs,rules,adapters,engineering,tools
fe-harness validate
fe-harness validate --json
fe-harness hosts list
fe-harness hosts install --host claude
```

`inspect` views project facts and capabilities; `inspect --map` generates 5 codebase maps under `.fe-harness/codebase/` (STACK/STRUCTURE/CONVENTIONS/TESTING/CONCERNS); `doctor` runs engineering diagnostics; `audit` scores maturity across 8 dimensions and outputs A-F grade with P0-P2 improvement list; `optimize` idempotently upgrades an existing Harness by reading current Harness and project config, listing precise diffs across five groups (docs/rules/adapters/engineering/tools), executing only the user-selected groups, and verifying idempotency with a second dry comparison; `validate` validates Harness integrity including managed block matching, rule completeness, host adapters, Markdown links, and forbidden paths; `hosts` manages multi-host thin entrypoints supporting codex/opencode/claude/cursor/trae, installing via managed blocks with stable IDs without overwriting existing content.

## OpenAPI

```bash
fe-harness api inspect --task T001 --json
fe-harness api generate --task T001 --dry-run
fe-harness api generate --task T001
```

## Design Tokens

```bash
fe-harness design tokens inspect --json
fe-harness design tokens discover --json
fe-harness design tokens diff --json
```

## UI Systems

```bash
fe-harness ui systems list --json
fe-harness ui systems install tdesign-uniapp --dry-run --json
fe-harness ui systems install tdesign-uniapp
```

## Skills

```bash
fe-harness skills list --json
fe-harness skills install --project --name consumer-h5-harness
fe-harness skills install --project --provider all --name consumer-h5-harness
fe-harness skills install --global --provider claude
```

## See Also

- [API Documentation](/en/reference/api)
- [Configuration & Files](/en/reference/config-and-files)
- [Verification Modes](/en/reference/verification-modes)