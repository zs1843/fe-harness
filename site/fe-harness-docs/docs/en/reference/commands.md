# Command Reference

## Command Overview

| Command | Purpose | Writes Files |
|---------|---------|--------------|
| `version` | Output CLI version | No |
| `create` | Create new project | Yes |
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

## Default Workflow

```bash
fe-harness create <project-name> --output <directory>
fe-harness init --dry-run
fe-harness inputs inspect --json
fe-harness task create --title "Task name"
fe-harness verify feature
```

## Creation & Initialization

```bash
fe-harness plan create my-h5 --json
fe-harness create my-h5
fe-harness create my-h5 --skip-install
fe-harness init --dry-run
fe-harness plan init --json
fe-harness init
```

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
fe-harness doctor
fe-harness doctor --json
```

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