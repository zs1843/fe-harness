# Documentation Maintenance Rules

This documentation should evolve together with Harness, but doesn't need to be updated for every internal implementation change.

## When Documentation Must Be Updated

- Changes to CLI commands, parameters, outputs, or default help.
- Changes to `create` or `init` generated content.
- Changes to `.fe-harness/project.yaml` schema or configuration semantics.
- Changes to Profile, Platform, or Stack capabilities.
- Changes to Agent Skill read order or workflow.
- Changes to Doctor checks, verify modes, or report formats.
- Changes to specialized capabilities like OpenAPI, UI System, Design Token, etc.
- Significant changes to current status, limitations, or roadmap.

## When Documentation May Not Need Updates

- Pure internal refactoring with no behavioral changes.
- Test implementation adjustments where user-visible results remain unchanged.
- Fixes for typos, formatting, or local code style.

## Recommended Change Practices

When submitting Harness behavioral changes, include related documentation changes in the same PR or same group of commits. This way, documentation is not extra promotional material, but part of engineering acceptance.

## Documentation Site Build Check

```bash
cd site/fe-harness-docs
pnpm docs:build
```

If dependencies are not installed locally, run first:

```bash
pnpm install
```