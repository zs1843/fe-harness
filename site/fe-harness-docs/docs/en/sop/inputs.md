# Input Registration and Analysis

Inputs are evidence sources for implementation. fe-harness divides inputs into five categories:

| Type | Directory | Description |
| --- | --- | --- |
| PRD | `.fe-harness/inputs/prd/` | Product requirements and business rules |
| RP | `.fe-harness/inputs/rp/` | Prototypes, page flows, interaction specs |
| UI | `.fe-harness/inputs/ui/` | Visual references, design files, screenshot notes |
| API | `.fe-harness/inputs/api/` | OpenAPI / Apifox exports |
| assets | `.fe-harness/inputs/assets/` | Images, icons, fonts, materials |

## Inspect

```bash
fe-harness inputs inspect --json
```

Inspect discovers differences between input directory and manifest:

- Which files are registered.
- Which files are not registered.
- Which registered items have missing files.
- Whether manifest exists and is parseable.

## Analyze

```bash
fe-harness inputs analyze --json
```

Analyze extracts simple facts from text inputs and categorizes by business, interaction, and visual dimensions. It also reports same-key conflicts.

## Why Original Inputs Are Read-Only by Default

Original inputs are evidence. Implementation process can generate analysis conclusions, coverage matrices, and task snapshots, but should not silently rewrite the evidence itself.

This strategy reduces two types of problems:

- Requirements being "conveniently fixed" during implementation, making later tracing impossible.
- Agent writing its inferences back to original materials, mixing evidence and conclusions.

## Relationship with Design Token

UI and RP inputs are important sources for Token refinement. When visual conflicts occur, Token source priority is: high-fidelity UI, RP, user temporary visual requirements, project existing tokens, DESIGN principles, Harness defaults, Agent inference.

This means Agent cannot ignore newly entered UI files just because templates have defaults; nor can it overwrite high-fidelity UI because it inferred a more pleasing value.