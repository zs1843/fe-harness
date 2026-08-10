# Agent Skills

Skills are workflow instructions that Agents can invoke.

## Skill List

| Skill | Default Install | When to Use |
| --- | --- | --- |
| `consumer-h5-harness` | Yes | Master workflow for creating, connecting, implementing, and verifying Consumer H5 projects |
| `fe-harness-create` | No | Create Consumer H5 project from scratch, handle input collection and first task |
| `fe-harness-init` | No | Safely connect to existing projects, handle conflicts and legacy token discovery |
| `fe-harness-inspect` | No | Read project facts, inputs, tokens, verify modes, and Agent workflow states |
| `fe-harness-plan` | No | View create/init plans before writing files |
| `fe-harness-doctor` | No | Read-only diagnostics for Node, pnpm, scripts, pages, inputs, tokens, Agents, etc. |
| `fe-harness-inputs` | No | Register, check, and analyze PRD/RP/UI/API/assets inputs |
| `fe-harness-task` | No | Create task numbers, view history, and create immutable snapshots |
| `fe-harness-verify` | No | Choose quick/feature/visual/audit verification based on change risk |
| `fe-harness-api` | No | Check OpenAPI JSON, generate types and request wrappers by task operationIds |
| `fe-harness-design-tokens` | No | Extract, check, and diff unique Design Token ground truth |
| `fe-harness-skills` | No | List and install project-level or global Skills |
| `fe-harness-version` | No | Check if CLI is available and version matches |

## Default Installation Strategy

New projects by default only install:

```text
consumer-h5-harness
```

Installation locations:

```text
.agents/skills/consumer-h5-harness/
.claude/skills/consumer-h5-harness/
```

Codex and Cursor share `.agents/skills`, Claude Code uses `.claude/skills`.

If you need to install default aggregation Skill for all providers:

```bash
fe-harness skills install --project --provider all --name consumer-h5-harness
```

If a specific task requires specialized capability, install the corresponding Skill:

```bash
fe-harness skills install --project --name fe-harness-api
fe-harness skills install --project --name fe-harness-design-tokens
```

## Why Only Install One by Default

Command-level Skills are useful, but should not become default context. Installing all command-level Skills by default would make Agents read irrelevant rules about API, Design Token, UI System, visual baseline, etc. during ordinary business tasks.

The aggregation Skill is responsible for stable workflows; command-level Skills are installed on demand through explicit commands:

```bash
fe-harness skills install --project --name fe-harness-api
fe-harness skills install --project --name fe-harness-design-tokens
```

## Single Constraint Ontology

`AGENTS.md` is the only project constraint document. `CLAUDE.md` and Cursor rules only point to it.

Skills describe workflow procedures, do not replace project constraints, and do not duplicate complete constraint text. This reduces multi-provider rule drift.

## What Humans Still Need to Do

Skills can make Agents more stable, but cannot replace human authority judgment. Humans still need to:

- Provide or confirm valid versions of PRD, RP, UI, API, and assets.
- Decide which source is valid when input conflicts occur.
- Confirm Design Token authoritative sources and user ad-hoc overrides.
- Choose which operationId is truly needed among multiple candidates.
- Decide on requirement deferral, external blocking, or acceptance exemption.
- Approve global installation, dependency installation, publishing, and other cross-boundary operations.