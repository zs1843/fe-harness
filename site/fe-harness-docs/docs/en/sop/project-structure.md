# Project Structure After Creation

Run:

```bash
fe-harness create my-h5
```

You get a business-neutral Consumer H5 project. It provides runnable technical container, Harness facts directory, Agent entry points, and verification skeleton, but won't generate real business pages.

## Marker Definitions

| Marker | Meaning |
| --- | --- |
| Required | Default workflow dependency, don't delete unless explicitly migrating |
| Optional | Enable only when corresponding task or team needs it |
| As Needed | Default generates directory or README, but actual files generated when tasks occur |
| Project Maintained | Maintained by project team, Harness shouldn't overwrite |
| Harness Managed | Managed by Harness template or CLI, check plan before updating |

## Complete Directory Tree

```text
my-h5/
├── .fe-harness/                         # Harness project facts and task data
│   ├── api/
│   │   └── selection.yaml                # operationId selection per task
│   ├── inputs/
│   │   ├── api/README.md                 # API input placement instructions
│   │   ├── assets/README.md              # Asset input placement instructions
│   │   ├── prd/README.md                 # PRD input placement instructions
│   │   ├── rp/README.md                  # RP input placement instructions
│   │   ├── ui/README.md                  # UI input placement instructions
│   │   └── manifest.yaml                 # Input registration list
│   ├── models/
│   │   ├── layout-specs.yaml             # Page layout specs
│   │   └── page-flow.yaml                # Page flow and interaction model
│   ├── snapshots/README.md                # API or task snapshot instructions
│   ├── ui/
│   │   └── adjustments.yaml               # Visual adjustment records
│   └── project.yaml                       # Single Harness config entry point
├── .cursor/
│   └── rules/fe-harness.mdc               # Cursor thin adapter rule
├── docs/
│   ├── design/
│   │   ├── COMPONENTS.md                 # Component semantics and boundaries
│   │   ├── TOKENS.md                     # Token explanation, not duplicating values
│   │   └── tokens.json                   # Unique machine-readable Design Token truth
│   ├── history/
│   │   ├── CHANGE_HISTORY.md             # Implementation change history
│   │   └── PRD_HISTORY.md                # PRD input and requirement history
│   ├── CHANGELOG.md                      # Project-facing changelog
│   ├── CURRENT_STATUS.md                 # Current status, limitations, next steps
│   ├── DECISIONS.md                      # Long-term architecture and important decisions
│   ├── DESIGN.md                         # Project design facts and visual principles
│   ├── IMPLEMENTATION_COVERAGE.md        # PRD/RP requirement coverage matrix
│   ├── PRODUCT.md                        # Project product facts
│   └── PROJECT_MAP.md                    # Project module map
├── src/
│   ├── components/
│   │   ├── BaseButton.vue                # Minimal base component example
│   │   └── README.md                     # Component boundary instructions
│   ├── composables/README.md             # Reusable Vue composables instructions
│   ├── fixtures/README.md                # Test and development fixture instructions
│   ├── pages/
│   │   ├── index/
│   │   │   └── index.vue                 # Default placeholder homepage
│   │   └── pages.json                    # uni-app page registration
│   ├── repositories/README.md            # Business data mapping layer instructions
│   ├── services/
│   │   ├── http.ts                       # Generic HTTP request wrapper
│   │   └── README.md                     # Service layer boundary instructions
│   ├── stores/README.md                  # Cross-page state instructions
│   ├── styles/
│   │   ├── reset.scss                    # Global style reset
│   │   └── tokens.scss                   # Compile-time style Token mapping
│   ├── types/README.md                   # Type definition boundary instructions
│   ├── utils/
│   │   ├── format.ts                     # Generic formatting function example
│   │   └── README.md                     # Pure function and utility boundary instructions
│   ├── App.vue                           # uni-app root component
│   ├── main.ts                           # App entry
│   ├── manifest.json                     # uni-app app metadata
│   └── pages.json                        # Project page registration
├── tests/
│   ├── e2e/
│   │   ├── dev-ready.mjs                # Dev server ready check
│   │   ├── runtime.spec.mjs              # Browser runtime check
│   │   └── visual.spec.mjs               # Screenshot visual check
│   ├── unit/README.md                    # Unit test conventions
│   ├── visual/
│   │   ├── baselines/README.md           # Visual baseline directory
│   │   ├── diffs/README.md               # Visual diff directory
│   │   └── README.md                     # Visual test instructions
│   ├── coverage-closure.mjs              # Requirement closure check
│   └── structure.test.mjs                # Project structure check
├── .editorconfig                         # Editor basic formatting
├── .env.example                          # Environment variable example, no real credentials
├── .eslintrc.cjs                         # ESLint config
├── .gitignore                            # Git ignore rules
├── .prettierignore                       # Prettier ignore rules
├── .prettierrc                           # Prettier config
├── AGENTS.md                             # Single project constraint body
├── CLAUDE.md                             # Claude Code thin adapter
├── env.d.ts                              # TypeScript environment declaration
├── index.html                            # Vite HTML entry
├── package.json                          # Project dependencies and scripts
├── playwright.config.mjs                 # Playwright config
├── tsconfig.json                         # TypeScript config
└── vite.config.mjs                       # Vite / uni-app build config
```

## What Can Be Deleted

Can be deleted or adjusted after project confirms not needed:

- `src/components/BaseButton.vue`: Only minimal base component example.
- `src/utils/format.ts`: Only formatting function example.
- `README.md` under directories: If team already maintains equivalent boundary instructions in module map, can merge and delete.
- `tests/e2e/visual.spec.mjs` and visual directories: Can close when project explicitly doesn't do visual regression, but must sync project config and docs.
- `src/repositories/`, `src/stores/`, `src/composables/`, `src/fixtures/`: Can keep empty directory instructions when project doesn't need corresponding boundaries, or remove after team confirmation.

Not recommended to delete directly:

- `AGENTS.md`.
- `.fe-harness/project.yaml`.
- `docs/PROJECT_MAP.md` and `docs/CURRENT_STATUS.md`.
- `src/pages.json`, `src/main.ts`, `src/App.vue`.
- `tests/coverage-closure.mjs`, unless product explicitly doesn't adopt requirement closure gate and syncs verification config.