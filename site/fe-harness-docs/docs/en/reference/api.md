# API Documentation

This document details all fe-harness CLI commands, parameters, return values, and usage examples.

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

---

## version

Output CLI version information.

### Usage

```bash
fe-harness version
fe-harness -v
fe-harness --version
```

### Output Example

```
fe-harness v1.2.4
```

### Parameters

None

---

## scaffold

Delegate the framework CLI to create a project, then layer Harness on top: cascade options + skeleton injection + route splitting.

### Usage

```bash
fe-harness scaffold <project-name> [options]
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `<project-name>` | string | - | Project name (lowercase letters, digits, hyphens) |
| `--profile` | string | none (interactive mode) | consumer-h5 / admin-web / mini-program |
| `--stack` | string | first available for profile | uni-app / vue3-vite / react-vite / taro / next.js |
| `--ui` | string | null | UI component library adapter |
| `--hosts` | string | codex | Host list, comma-separated |
| `--with-routes` | boolean | false | Split routes from a PRD |
| `--prd` | string | null | PRD file path |
| `--skip-install` | boolean | false | Skip dependency installation |
| `--skip-framework-cli` | boolean | false | Skip framework CLI (existing project) |
| `--dry-run` | boolean | false | Preview steps |
| `--json` | boolean | false | JSON output |

### Execution Steps

1. Validate cascade compatibility
2. Delegate framework CLI to create the project
3. fe-harness init (add Harness files + idempotency verification)
4. fe-harness hosts install (multi-host thin entrypoints)
5. fe-harness ui systems install (UI adapter, optional)
6. Inject engineering skeleton (directory boundaries + ESLint/Prettier + test infrastructure)
7. Route splitting (when a PRD is provided)
8. Write project.yaml
9. Install dependencies

### Cascade Matrix

Profile → Stack → UI System → framework options. Upper-level options constrain lower-level available options; incompatible combinations are rejected in step 1.

| Profile | Available Stacks | Available UI Systems |
|---------|------------------|----------------------|
| consumer-h5 | uni-app / vue3-vite / react-vite | tdesign-uniapp / vant / nutui |
| admin-web | vue3-vite / react-vite / next.js | tdesign / antd / element-plus |
| mini-program | uni-app / taro | tdesign-uniapp / nutui |

### Examples

```bash
# Interactively create a Consumer H5 project
fe-harness scaffold my-h5 --profile consumer-h5

# Specify stack and UI
fe-harness scaffold my-admin --profile admin-web --stack vue3-vite --ui tdesign

# Mini-program project
fe-harness scaffold my-mp --profile mini-program --stack taro

# Existing project, skip framework CLI
fe-harness scaffold my-existing --profile consumer-h5 --skip-framework-cli

# Split routes from a PRD
fe-harness scaffold my-h5 --profile consumer-h5 --with-routes --prd ./prd.md

# Preview steps
fe-harness scaffold my-h5 --profile consumer-h5 --dry-run

# Skip dependency installation
fe-harness scaffold my-h5 --profile consumer-h5 --skip-install

# JSON output
fe-harness scaffold my-h5 --profile consumer-h5 --json
```

### Output Example

```json
{
  "status": "success",
  "projectName": "my-h5",
  "profile": "consumer-h5",
  "stack": "uni-app",
  "ui": null,
  "steps": [
    "cascade-validate",
    "framework-cli",
    "init",
    "hosts-install",
    "skeleton-inject"
  ],
  "files": [
    "package.json",
    "src/main.js",
    "src/pages/index/index.vue",
    ".fe-harness/project.yaml",
    "AGENTS.md"
  ]
}
```

### What Gets Created

- Project structure created by the framework CLI
- `.fe-harness/` config directory and project.yaml
- AGENTS.md constraint file
- Engineering skeleton (ESLint/Prettier, test infrastructure, directory boundaries)
- Multi-host thin entrypoints
- UI System Adapter (when `--ui` is specified)

---

## init

Initialize an existing project with fe-harness configuration.

### Usage

```bash
fe-harness init [options]
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--dry-run` | boolean | false | Preview initialization without writing |
| `--json` | boolean | false | Output in JSON format |

### Examples

```bash
# Preview initialization
fe-harness init --dry-run

# Execute initialization
fe-harness init

# JSON output
fe-harness init --json
```

### Behavior

- Detects project type
- Generates `.fe-harness/` directory
- Creates `AGENTS.md`
- Does not overwrite existing files (unless explicitly specified)

---

## plan

Output a structured plan for scaffold/init operations.

### Usage

```bash
fe-harness plan <scaffold|init> [options]
```

### Examples

```bash
fe-harness plan scaffold my-h5 --json
fe-harness plan init --json
```

### Output Example

```json
{
  "operation": "scaffold",
  "projectName": "my-h5",
  "files": [
    {
      "path": "package.json",
      "action": "create",
      "description": "Project config file"
    }
  ]
}
```

---

## inspect

View project facts and capabilities.

### Usage

```bash
fe-harness inspect [options]
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--json` | boolean | false | Output in JSON format |

### Examples

```bash
fe-harness inspect
fe-harness inspect --json
```

### Output Fields

- Project type
- Tech stack
- File structure
- Configuration info
- Agent capabilities

---

## doctor

Read-only diagnostics for project health check.

### Usage

```bash
fe-harness doctor [options]
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--json` | boolean | false | Output in JSON format |

### Checks

- Config file completeness
- Script availability
- Input file status
- Token configuration
- Agent readiness
- Sensitive path detection (.env, private keys — names only, not content)

---

## audit

Eight-dimension maturity audit, inspired by ai-harness-init.

### Usage

```bash
fe-harness audit [options]
```

### Eight Dimensions

| Dimension | Checks |
|-----------|--------|
| `reproducibility` | Node version, package manager, lock file |
| `commands` | build/test/lint/type-check scripts |
| `code_quality` | ESLint, Prettier, TS config, module boundaries |
| `testing` | Unit/E2E/visual tests, coverage closure |
| `architecture` | profile/platform/stack consistency, module boundaries |
| `inputs` | PRD/RP/UI/API/assets registration |
| `agent_ecosystem` | AGENTS.md, Skills, agent adapters |
| `design_governance` | Design Token, UI System, visual baselines |

### Scoring

| Status | Score |
|--------|-------|
| `passed` | 100 |
| `warning` | 60 |
| `failed` | 0 |
| `manual` | Not scored |

### Grades

| Grade | Score Range |
|-------|-------------|
| A | ≥ 90 |
| B | 80-89 |
| C | 70-79 |
| D | 60-69 |
| E | 50-59 |
| F | < 50 |

### Output

- Per-dimension score and grade
- Overall score and grade
- P0-P2 improvement list (P0=command/safety failures, P1=other failures, P2=warnings)
- Markdown report written to `tmp/fe-harness/audit-report.md`

### Examples

```bash
fe-harness audit
fe-harness audit --json
```

---

## optimize

Idempotently upgrade an existing Harness, aligning to the latest Harness spec by group.

### Usage

```bash
fe-harness optimize [options]
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--dry-run` | boolean | false | List precise diffs without writing files |
| `--groups` | string | - | Comma-separated list of groups to execute |
| `--json` | boolean | false | Output in JSON format |

### Five Groups

| Group | Content |
|-------|--------|
| `docs` | AGENTS.md and fact files under docs/ |
| `rules` | Rule files under `.fe-harness/rules/` |
| `adapters` | Host adapters and thin entrypoints |
| `engineering` | Engineering config (lint, tsconfig, scripts, etc.) |
| `tools` | Agent toolchain and Skills |

### Behavior

- Reads existing Harness and project config, listing precise diffs across five groups.
- `--dry-run` lists diffs without writing files.
- When `--groups` is not specified, interactively prompts the user to select groups.
- When `--groups` is specified, only the selected groups are executed.
- After execution, a second dry comparison verifies idempotency; remaining diffs are reported.

### Examples

```bash
# Preview all group diffs
fe-harness optimize --dry-run

# Execute only docs and rules groups
fe-harness optimize --groups docs,rules

# Execute all five groups
fe-harness optimize --groups docs,rules,adapters,engineering,tools

# JSON output
fe-harness optimize --dry-run --json
```

### Output Example

```json
{
  "status": "success",
  "groups": {
    "docs": { "diffs": 3, "applied": true },
    "rules": { "diffs": 1, "applied": true },
    "adapters": { "diffs": 0, "applied": false },
    "engineering": { "diffs": 2, "applied": true },
    "tools": { "diffs": 0, "applied": false }
  },
  "idempotent": true
}
```

---

## validate

Validate Harness integrity, checking managed blocks, rules, adapters, and link consistency.

### Usage

```bash
fe-harness validate [options]
```

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `--json` | boolean | false | Output in JSON format |

### Checks

| Check | Description |
|-------|-------------|
| Managed block matching | Verify all managed block markers are complete and content matches the source |
| Rule completeness | Check rule files under `.fe-harness/rules/` are complete and not missing |
| Host adapters | Verify installed host adapter entrypoints and managed blocks are healthy |
| Markdown links | Scan documentation links to ensure they point to valid paths |
| Forbidden paths | Check for forbidden paths that should not be included in Harness |

### Examples

```bash
fe-harness validate
fe-harness validate --json
```

### Output Example

```json
{
  "status": "passed",
  "checks": {
    "managed_blocks": "passed",
    "rules": "passed",
    "host_adapters": "passed",
    "markdown_links": "warning",
    "forbidden_paths": "passed"
  },
  "warnings": [
    "docs/PROJECT_MAP.md: broken link to docs/ARCHITECTURE.md"
  ]
}
```

---

## hosts

Manage multi-host thin entrypoints, installing entry files for different Agent hosts.

### Subcommands

- `list`: List supported hosts and installation status
- `install`: Install a thin entrypoint for the specified host

### Usage

```bash
fe-harness hosts list [options]
fe-harness hosts install [options]
```

### Supported Hosts

| Host | Description |
|------|-------------|
| `codex` | Codex entrypoint |
| `opencode` | OpenCode entrypoint |
| `claude` | Claude Code entrypoint |
| `cursor` | Cursor entrypoint |
| `trae` | Trae entrypoint |

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `--host` | string | Host name |
| `--json` | boolean | JSON output |

### Behavior

- Installs entry files using managed blocks and stable IDs.
- Does not overwrite existing content; only inserts managed blocks.
- When `--host` is not specified, interactively prompts for selection.

### Examples

```bash
# List supported hosts and installation status
fe-harness hosts list --json

# Install Claude Code entrypoint
fe-harness hosts install --host claude

# Install Codex entrypoint
fe-harness hosts install --host codex --json
```

### Output Example

```json
{
  "status": "success",
  "host": "claude",
  "installed": true,
  "entry": ".claude/CLAUDE.md",
  "managedBlocks": 3
}
```

---

## inputs

Check, compare, and analyze input files.

### Subcommands

- `inspect`: Check input files and manifest
- `analyze`: Analyze evidence conclusions and conflicts
- `diff`: Compare input changes

### Usage

```bash
fe-harness inputs inspect --json
fe-harness inputs analyze --json
fe-harness inputs diff --json
```

---

## task

Manage task numbers, history, and snapshots.

### Subcommands

- `create`: Create new task
- `history`: View task history
- `snapshot`: Create task snapshot

### Usage

```bash
# Create task
fe-harness task create --title "First request" --json

# View history
fe-harness task history T001 --json

# Create snapshot
fe-harness task snapshot T001 --title "First request" --request "Complete page" --json
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `--title` | string | Task title |
| `--request` | string | Request description |
| `--json` | boolean | JSON output |

---

## verify

Execute verification modes.

### Verification Modes

- `quick`: Quick verification
- `feature`: Feature verification
- `runtime`: Runtime verification
- `interaction`: Interaction verification
- `visual`: Visual verification
- `audit`: Audit verification

### Usage

```bash
fe-harness verify quick
fe-harness verify feature
fe-harness verify visual
fe-harness verify audit
```

### Output

Generates verification reports (Markdown or JSON).

---

## api

OpenAPI inspection and generation.

### Subcommands

- `inspect`: Inspect OpenAPI file
- `generate`: Generate TypeScript types

### Usage

```bash
fe-harness api inspect --task T001 --json
fe-harness api generate --task T001 --dry-run
fe-harness api generate --task T001
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `--task` | string | Task number |
| `--dry-run` | boolean | Preview generation |

---

## design

Design Token inspection, discovery, and comparison.

### Subcommands

- `tokens inspect`: Inspect Token file
- `tokens discover`: Discover existing styles
- `tokens diff`: Compare Token changes

### Usage

```bash
fe-harness design tokens inspect --json
fe-harness design tokens discover --json
fe-harness design tokens diff --json
```

---

## ui

UI System Adapter management.

### Subcommands

- `systems list`: List available systems
- `systems install`: Install adapter

### Usage

```bash
fe-harness ui systems list --json
fe-harness ui systems install tdesign-uniapp --dry-run --json
fe-harness ui systems install tdesign-uniapp
```

---

## skills

Install Agent Skills.

### Subcommands

- `list`: List available Skills
- `install`: Install Skill

### Usage

```bash
fe-harness skills list --json
fe-harness skills install --project --name consumer-h5-harness
fe-harness skills install --global --provider claude
```

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `--project` | boolean | Project-level install |
| `--global` | boolean | Global install |
| `--provider` | string | Provider (claude, cursor, all) |
| `--name` | string | Skill name |

---

## Error Handling

### Common Error Codes

| Code | Description |
|------|-------------|
| `ENOENT` | File not found |
| `EEXIST` | File already exists |
| `INVALID_CONFIG` | Invalid configuration |
| `MISSING_INPUT` | Missing input |

### Error Output Format

```json
{
  "error": {
    "code": "ENOENT",
    "message": "File not found: .fe-harness/project.yaml",
    "suggestion": "Run 'fe-harness init' to initialize the project"
  }
}
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `FE_HARNESS_DEBUG` | Enable debug mode |
| `FE_HARNESS_CONFIG` | Custom config file path |

---

## Configuration Files

### .fe-harness/project.yaml

Project configuration file defining:

- Project type
- Tech stack
- Verification mode mapping
- File paths

### AGENTS.md

Project constraint file defining:

- Business-neutral engineering rules
- Verification requirements
- Agent workflow guidelines

---

## More Information

- [Command Reference](/en/reference/commands)
- [Config & Files](/en/reference/config-and-files)
- [Verification Modes](/en/reference/verification-modes)