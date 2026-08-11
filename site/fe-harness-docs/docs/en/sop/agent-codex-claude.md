# Connecting Codex / Claude Code

fe-harness's Agent connection goal: different Agents use the same set of project constraints, not maintaining multiple copies of rules.

## File Responsibilities

| File or Directory | For Whom | Purpose |
| --- | --- | --- |
| `AGENTS.md` | All Agents | Single project constraint body |
| `.agents/skills/` | Codex / Cursor | Callable workflow Skills |
| `CLAUDE.md` | Claude Code | Thin adapter, imports `AGENTS.md` |
| `.claude/skills/` | Claude Code | Claude Code Skill directory |
| `.cursor/rules/fe-harness.mdc` | Cursor | Always-applied rule pointing to `AGENTS.md` |

## New Project Default State

`fe-harness scaffold` by default installs aggregated Skill:

```text
.agents/skills/consumer-h5-harness/SKILL.md
.claude/skills/consumer-h5-harness/SKILL.md
```

This is already enough for Codex and Claude Code to understand Consumer H5's default workflow.

## Existing Project Supplement

If vendor adapter is missing after connecting existing project, run:

```bash
fe-harness skills install --project --provider all --name consumer-h5-harness
```

If current task needs specialized capabilities, install corresponding Skill:

```bash
fe-harness skills install --project --name fe-harness-api
fe-harness skills install --project --name fe-harness-design-tokens
```

## What Codex Should Do

After Codex enters project, first read:

1. `AGENTS.md`
2. `.fe-harness/project.yaml`
3. `docs/PROJECT_MAP.md`
4. `docs/CURRENT_STATUS.md`
5. `.agents/skills/consumer-h5-harness/SKILL.md`

Then continue reading inputs, design, API, or history evidence based on task type.

## What Claude Code Should Do

Claude Code reads `CLAUDE.md`, which imports `AGENTS.md`. Project-level Skill is at:

```text
.claude/skills/consumer-h5-harness/SKILL.md
```

Claude Code shouldn't maintain another copy of project rules. All long-term constraints go back to `AGENTS.md`.

## Why Do This

Multi-Agent projects fear rule drift. If Codex, Claude Code, and Cursor each maintain a set of long rules, later there will be:

- Some Agent still using old SOP.
- Some Agent thinks API generation rules are different.
- Some Agent reads outdated Design Token priority.
- People can't judge which rule is authoritative.

Therefore fe-harness divides rules into two types:

- `AGENTS.md`: Single constraint body.
- Skills: Callable workflows, only explaining "how to execute when doing this type of task".

## What Humans Still Need to Handle

Agents can execute inspect, plan, inputs, task, verify, but humans still handle authoritative judgments:

- Confirm task goals and priorities.
- Provide real PRD/RP/UI/API/assets.
- Adjudicate when input conflicts occur.
- Confirm Design Token sources and coverage.
- Approve dependency installation, global installation, publishing, remote repository operations.
- Judge whether external blockers are acceptable.

This isn't weakening Agents, but separating "execution" and "decision". The more stably Agents execute, the more humans should only intervene where judgment is truly needed.