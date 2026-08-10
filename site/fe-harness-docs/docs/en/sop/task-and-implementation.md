# Task and Implementation

## Create Task Number

```bash
fe-harness task create --title "Task name" --json
```

Task number is usually like `T001`. Its purpose isn't formalized naming, but binding together:

- PRD/RP fragments.
- API operationId selections.
- Implementation files.
- Verification results.
- Snapshots and history.

## Load Evidence by Task Type

Before implementation starts, Agent should first determine task type:

| Task Type | Needs to Read |
| --- | --- |
| Business implementation | manifest, PRODUCT, PRD/RP |
| UI adjustment | DESIGN, Design Token, UI inputs, visual adjustment records |
| API integration | API inputs, OpenAPI snapshot, selection.yaml |
| Architecture decision | DECISIONS, ARCHITECTURE, related history |

## Why Not Read Everything at Once

Reading all materials at once seems safe, but actually causes context pollution. For example, API tasks shouldn't be disturbed by old visual adjustment records; UI adjustments shouldn't be forced into interface generation flow because of unselected operationId.

Loading evidence by task makes Agent's attention closer to real problems and reduces token consumption.

## Implementation Boundaries

Consumer H5 preset suggested boundaries:

- Pages go in `src/pages/`, don't stack multiple independent pages in one `.vue`.
- Components go in `src/components/`.
- Request wrappers go in `src/services/`.
- Business data mapping goes in `src/repositories/`.
- Cross-page pure functions go in `src/utils/`.
- State management goes in `src/stores/`.

These directories aren't for ceremony, but giving clear ownership to pages, components, interfaces, states, and utility functions.