# SOP Overview

## Standard Operating Procedures

fe-harness defines clear SOPs for different scenarios:

## Project Lifecycle

### 1. New Project

```bash
fe-harness scaffold my-h5 --profile consumer-h5 --stack uni-app
fe-harness hosts install
fe-harness inspect --map
```

Creates a complete project with:
- uni-app + Vue 3 + Vite
- Playwright tests
- Project facts
- Agent workflows
- Multi-host thin entrypoints (codex/opencode/claude/cursor/trae)

Without `--profile`, enters interactive mode to confirm product type, tech framework, UI component library, and Agent host round by round.

### 2. Existing Project

```bash
fe-harness init --dry-run
fe-harness init
fe-harness hosts install
fe-harness inspect --map
fe-harness doctor
fe-harness audit
fe-harness validate
fe-harness optimize --dry-run
```

Connects fe-harness to an existing project without overwriting:
- Project-owned files
- Existing configuration
- Team workflows

init includes idempotency verification; hosts install uses managed blocks with stable IDs.

### 3. Daily Development

```bash
# Register inputs
fe-harness inputs inspect --json

# Create task
fe-harness task create --title "New feature"

# Verify implementation
fe-harness verify feature

# Create snapshot
fe-harness task snapshot T001 --title "Feature complete"
```

## SOP Sections

| SOP | Purpose |
|-----|---------|
| [Create Project](/en/sop/create-project) | Start from scratch |
| [Init Existing](/en/sop/init-existing-project) | Connect existing codebase |
| [Inputs](/en/sop/inputs) | Register and analyze inputs |
| [Task & Implementation](/en/sop/task-and-implementation) | Manage feature development |
| [Verification](/en/sop/verification-and-snapshot) | Validate and snapshot |

## Agent Integration

fe-harness is designed for AI agent workflows:

- **Claude Code**: `.claude/skills`
- **Cursor**: `.agents/skills`
- **Codex**: `.agents/skills`

Install workflows:

```bash
fe-harness skills install --project --provider all --name consumer-h5-harness
```

## Next Steps

- [Create New Project](/en/sop/create-project)
- [Connect Existing Project](/en/sop/init-existing-project)