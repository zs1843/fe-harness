# SOP Overview

## Standard Operating Procedures

fe-harness defines clear SOPs for different scenarios:

## Project Lifecycle

### 1. New Project

```bash
fe-harness create my-h5
```

Creates a complete consumer H5 project with:
- uni-app + Vue 3 + Vite
- Playwright tests
- Project facts
- Agent workflows

### 2. Existing Project

```bash
fe-harness init
```

Connects fe-harness to an existing project without overwriting:
- Project-owned files
- Existing configuration
- Team workflows

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