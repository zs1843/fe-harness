# Configuration and Files

## Project Configuration

Entry file:

```text
.fe-harness/project.yaml
```

It declares:

- Harness package and version.
- Project name and product type.
- platform selection.
- stack adapter.
- facts file paths.
- command mappings.
- verify modes.
- Optional sources, ui, api configurations.

## Key Facts Files

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Project's unique constraint ontology |
| `docs/PROJECT_MAP.md` | Module map |
| `docs/CURRENT_STATUS.md` | Current status and limitations |
| `docs/PRODUCT.md` | Product facts |
| `docs/DESIGN.md` | Design facts |
| `docs/DECISIONS.md` | Long-term decisions |
| `docs/IMPLEMENTATION_COVERAGE.md` | Requirement coverage |

## Generated Reports

```text
tmp/fe-harness/
```

This directory is ignored by Git. Reports can serve as local debugging and CI artifacts.

## Generated Interface Files

```text
src/types/api.generated.ts
src/services/api.generated.ts
.fe-harness/api/generated.json
```

These files are protected by managed metadata.