# Skill List Reference

## Viewing Skills

```bash
fe-harness skills list --json
```

## Installation Strategy

By default, projects only need the aggregate Skill:

```bash
fe-harness skills install --project --provider all --name consumer-h5-harness
```

Command-level Skills are installed as needed:

```bash
fe-harness skills install --project --name fe-harness-api
```

Global installation requires user confirmation:

```bash
fe-harness skills install --global --provider claude --name consumer-h5-harness
```

## Inventory

| Skill | Purpose | Typical Triggers |
| --- | --- | --- |
| `consumer-h5-harness` | Consumer H5 master workflow | Creating/connecting projects, implementing pages, verifying features, creating snapshots |
| `fe-harness-scaffold` | Cascading multi-round Q&A project creation | "Create admin backend", "New project", "Create H5" |
| `fe-harness-init` | Existing project connection workflow | init dry-run, conflict resolution, existing token discovery |
| `fe-harness-inspect` | Status reading | Viewing project facts, input status, token status, Agent readiness |
| `fe-harness-plan` | Plan preview | Previewing which files will be written before init |
| `fe-harness-doctor` | Read-only diagnostics | Checking Node, pnpm, scripts, pages, inputs, tokens, visual baselines, sensitive paths |
| `fe-harness-inputs` | Input management | Registering and analyzing PRD/RP/UI/API/assets |
| `fe-harness-task` | Task management | Creating T001, viewing history, creating snapshots |
| `fe-harness-verify` | Layered verification | Selecting quick/feature/runtime/visual/audit based on changes |
| `fe-harness-api` | API generation | Selecting operationId from OpenAPI JSON and generating types/wrappers |
| `fe-harness-design-tokens` | Token maintenance | Extracting tokens, confirming sources, diff, recording overrides |
| `fe-harness-skills` | Skill installation | Project-level/global installation, provider adaptation |
| `fe-harness-version` | Version check | Verifying CLI availability and project declared version |

## Why Not Install All by Default

Installing all Skills by default would cause Agents to see too many specialized rules in every task. For example, regular content adjustments don't need OpenAPI generation rules, and API tasks don't need visual baseline details.

Default aggregate Skills provide the correct path, and specialized Skills enter context when needed. This reduces cognitive load and prevents Agents from misapplying irrelevant rules to current tasks.