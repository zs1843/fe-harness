# Architecture

## Composition model

Target-project behavior is composed from four sources:

```text
Core
  + Product Profile
  + Platform Adapter
  + Stack Adapter
  + Project-owned configuration
```

### Core

Core owns:

- Configuration loading and validation.
- Named command resolution.
- Fail-fast and non-fail-fast execution.
- Process exit semantics.
- Doctor diagnostics.
- Markdown, JSON, and command-log reports.

Core does not understand UI pages, business domains, product copy, brands, or API payloads.

### Product Profile

A Product Profile describes verification priorities caused by the shape of a product. The first
public profile is `consumer-h5`.

### Platform Adapter

A Platform Adapter describes runtime acceptance behavior. The first public adapter is
`web-mobile`.

### Stack Adapter

A Stack Adapter describes framework and toolchain integration. The first public adapter is
`uni-app`.

## Configuration ownership

Each target project owns `.fe-harness/project.yaml`. The file selects adapters and maps symbolic
verification steps to actual project commands.

The Harness repository also has a self-maintenance configuration using the internal
`developer_tooling + node + node-esm` combination. That combination describes this repository only;
it is not a public target-project preset in version `0.1.0`.

## Verification modes

- Quick: fast, fail-fast feedback.
- Feature: completed-change gate.
- Visual: platform visual and interaction checks.
- Audit: run all configured checks and report all failures.

## Safety model

- Initialization must not overwrite existing files.
- Dry-run must be available before mutation.
- Doctor is read-only.
- Upgrade must eventually produce a patch before applying conflicts.
- Credentials remain project-owned and must not enter package templates.
- Publishing and remote repository operations require explicit approval.
