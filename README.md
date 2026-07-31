# fe-harness

`fe-harness` is a business-agnostic frontend engineering and quality harness. It provides
configuration-driven verification, project diagnostics, reports, initialization templates, and CI
entry points.

The first profile targets:

- Product profile: `consumer-h5`
- Platform adapter: `web-mobile`
- Stack adapter: `uni-app`

## Commands

```bash
fe-harness init --dry-run
fe-harness init
fe-harness doctor
fe-harness verify quick
fe-harness verify feature
fe-harness verify visual
fe-harness verify audit
fe-harness version
```

## Architecture

```text
Core
  + Product Profile
  + Platform Adapter
  + Stack Adapter
  + Project-owned configuration
```

Core does not contain product pages, domain states, API endpoints, brand values, or design tokens.

## Status

This repository is an initial `0.1.0` implementation. Publishing, upgrades, API contract adapters,
and additional project profiles are intentionally deferred until the first H5 pilot is stable.
