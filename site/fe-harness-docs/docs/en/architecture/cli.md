# CLI

CLI is located at `packages/cli/` and serves as the common entry point for developers, CI, and Agents.

## Basic Commands

| Command | Purpose |
| --- | --- |
| `create` | Create a new Consumer H5 project |
| `init` | Connect to an existing project |
| `inputs` | Check and analyze inputs |
| `task` | Create tasks, history, and snapshots |
| `verify` | Execute verification modes |
| `doctor` | Read-only diagnostics |
| `inspect` | View project facts |
| `plan` | Output structured plans |
| `skills` | Install Agent Skills |
| `api` | OpenAPI checking and generation |
| `ui` | UI System Adapter management |

## Why CLI Default Help Should Be Lightweight

The main help only shows `create/init -> inputs -> task -> verify`. This is the default path and the most commonly used path.

Other commands are not hidden, but enabled on demand:

- Check `design` and `ui` when working on UI tasks.
- Check `api` when working on API tasks.
- Check `inspect`, `doctor`, `plan` during diagnostics or onboarding.
- Check `skills` when extending Agent workflows.

If default help shows too much, new users may think they must understand all capabilities at once.

## JSON Output

Multiple commands support `--json` for Agents and CI:

```bash
fe-harness inspect --json
fe-harness plan init --json
fe-harness inputs analyze --json
fe-harness verify audit --json
```

Stable JSON output allows automation to read status rather than parse human text.