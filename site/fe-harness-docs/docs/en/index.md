# fe-harness

A business-agnostic frontend engineering and quality harness.

## Core Principles

- **Business-neutral**: No business-specific logic or values
- **Evidence-first**: All decisions backed by documented evidence
- **Agent-friendly**: Optimized for AI agent workflows

## Default Workflow

```bash
fe-harness scaffold my-h5 --profile consumer-h5 --stack uni-app --dry-run
fe-harness scaffold my-h5 --profile consumer-h5 --stack uni-app
fe-harness init --dry-run
fe-harness init
fe-harness inspect --json
fe-harness doctor
fe-harness verify quick
```

## Documentation Sections

- **Background**: Why fe-harness exists and the problems it solves
- **SOP**: Standard Operating Procedures for different scenarios
- **Architecture**: System design and module breakdown
- **Reference**: Commands, configuration, and glossary
- **Deployment**: Build and deployment guides

## Current Version

v1.2.4

## Quick Links

- [Why Harness](/en/background/why-harness)
- [Getting Started](/en/sop/overview)
- [Architecture Overview](/en/architecture/overview)
- [Command Reference](/en/reference/commands)