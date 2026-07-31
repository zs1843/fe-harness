# fe-harness Project Map

## Purpose

`fe-harness` is a business-agnostic frontend engineering and quality harness. It is consumed by
developers, CI pipelines, and coding agents through the same configuration and CLI.

## Top-level responsibilities

| Path | Responsibility |
| --- | --- |
| `packages/core/` | Configuration loading, verification execution, diagnostics, and reports |
| `packages/cli/` | Public command-line interface |
| `profiles/` | Product-shape verification descriptors |
| `platforms/` | Runtime and acceptance-platform descriptors |
| `stacks/` | Framework and toolchain descriptors |
| `templates/` | Business-neutral files created during initialization |
| `schemas/` | Public configuration protocol |
| `examples/` | Disposable integration fixtures |
| `tests/` | Harness unit and orchestration tests |
| `docs/` | Architecture, status, roadmap, and adoption guidance |

## Dependency direction

```text
CLI -> Core
Core -> configuration only
Project configuration -> Profile + Platform + Stack selection
Profiles / Platforms / Stacks -> declarative descriptors
Examples -> public CLI behavior
Tests -> Core and CLI
```

Core must not import a Profile, Platform Adapter, Stack Adapter, example, or target project.

## Current packages

- `@company/fe-harness-core`: private workspace package containing the initial runtime.
- `@company/fe-harness`: private CLI package exposing the `fe-harness` executable.

Neither package is published yet.

## Runtime requirements

- Node.js 20
- pnpm
- ESM

## Generated artifacts

Target projects receive reports under:

```text
tmp/fe-harness/
```

Generated reports and dependency directories are ignored by Git.
