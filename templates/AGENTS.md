# Project Agent Guide

This file is the entry point for coding agents and contributors.

## Read order

1. Read this file.
2. Read `.fe-harness/project.yaml`.
3. Read `docs/PROJECT_MAP.md` when locating modules or assessing impact.
4. Read `docs/DESIGN.md` for UI, interaction, content, or design-system work.
5. Read only task-relevant project documentation.

## Safety boundaries

Obtain confirmation before changing dependencies, authentication, authorization, public API
contracts, global themes, test frameworks, routing systems, CI gates, deployments, or releases.

## Verification

- Routine change: `pnpm verify:quick`
- Completed feature: `pnpm verify:feature`
- UI or interaction change: `pnpm verify:visual`
- Full diagnosis: `pnpm verify:audit`

Report only commands that were actually executed, their results, remaining risks, and any
unverified work.
