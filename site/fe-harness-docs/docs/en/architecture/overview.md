# Architecture Overview

## System Design

fe-harness follows a modular architecture:

```
┌─────────────────────────────────────┐
│              CLI Layer               │
├─────────────────────────────────────┤
│            Core Engine              │
├──────────┬──────────┬───────────────┤
│  Profile │ Platform │    Stack      │
│ Adapters │ Adapters │  Adapters     │
├──────────┴──────────┴───────────────┤
│          Project Layer              │
│  (Config, Inputs, Skills, Tests)    │
└─────────────────────────────────────┘
```

## Core Principles

### 1. Separation of Concerns

- **Core**: Business-agnostic logic
- **Adapters**: Technology-specific implementations
- **Project**: User-owned configuration

### 2. Plugin Architecture

- Profiles (consumer-h5, admin-web, etc.)
- Platforms (web-mobile, web-desktop, etc.)
- Stacks (uni-app, react, vue, etc.)

### 3. Agent-First Design

- Structured facts and capabilities
- Clear input/output contracts
- Skill-based automation

## Modules

| Module | Purpose |
|--------|---------|
| [Core](/en/architecture/core) | Business-agnostic foundation |
| [CLI](/en/architecture/cli) | Command-line interface |
| [Adapters](/en/architecture/adapters) | Technology adapters |
| [Templates](/en/architecture/templates-presets) | Project templates |
| [Inputs](/en/architecture/inputs) | Input management |
| [OpenAPI](/en/architecture/openapi) | API integration |
| [Design Tokens](/en/architecture/design-tokens) | Token management |
| [UI Systems](/en/architecture/ui-system) | Component system adapters |
| [Skills](/en/architecture/skills) | Agent skills |

## Data Flow

```
Inputs (PRD/RP/UI/API/Assets)
    ↓
Analysis & Evidence
    ↓
Task Creation
    ↓
Implementation
    ↓
Verification
    ↓
Snapshot
```

## Next Steps

- [Core Module](/en/architecture/core)
- [CLI Module](/en/architecture/cli)
- [Adapters](/en/architecture/adapters)