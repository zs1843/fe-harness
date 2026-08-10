# Initialize Existing Project

When connecting an existing project, the primary principle is safety: do not overwrite project-maintained files.

## Recommended Commands

```bash
fe-harness init --dry-run
fe-harness plan init --json
fe-harness init
fe-harness doctor
```

## Pre-check Status

Initialization plan categorizes files into:

| Status | Meaning |
| --- | --- |
| `create` | Target file doesn't exist, can create |
| `unchanged` | File exists with identical content |
| `managed_unchanged` | Scaffold-managed file unmodified |
| `project_owned_modified` | Project-maintained, cannot directly overwrite |
| `conflict` | Real conflict, must be handled manually |

If there's any conflict, `init` won't write any files.

## Why Be Conservative

Existing project's directory structure, scripts, styles, and agent rules may already carry real business experience. Harness's responsibility is to supplement engineering protocols, not replace project ownership.

Conservative connection allows teams to adopt gradually:

- First supplement `.fe-harness/project.yaml`.
- Then supplement input directories and project docs.
- Then enable Doctor and verify.
- Finally enable Design Token, OpenAPI, or UI System per task.

## First Thing After Connection

After connecting an existing project, run existing visual discovery:

```bash
fe-harness design tokens discover --json
fe-harness design tokens inspect --json
```

Discovery command read-only scans Vue/CSS/SCSS/Less under `src/`, outputs CSS Variables, high-frequency colors, fonts, spacing, radii, shadows, sizes, layers, animations, and breakpoint candidates. After confirmation, update the unique Token truth.

Token definitions must follow fixed source priority: high-fidelity UI, RP, user temporary visual requirements, project existing tokens, DESIGN principles, Harness defaults, Agent inference. See [Design Token](../architecture/design-tokens.md).