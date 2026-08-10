# Inputs

The Inputs module is responsible for incorporating raw evidence into projects.

## File Responsibilities

| File or Directory | Responsibility |
| --- | --- |
| `.fe-harness/inputs/manifest.yaml` | Register input inventory |
| `.fe-harness/inputs/prd/` | Product requirements |
| `.fe-harness/inputs/rp/` | Prototypes and interactions |
| `.fe-harness/inputs/ui/` | Visual references |
| `.fe-harness/inputs/api/` | API inputs |
| `.fe-harness/inputs/assets/` | Assets |

## What Inspect Does

Inspect compares manifest against actual files:

- Find unregistered files.
- Find registered but missing files.
- Report manifest status.
- Output stable JSON.

## What Analyze Does

Analyze is lightweight text analysis:

- Extract labelled conclusions.
- Distinguish business, interaction, visual.
- Report same-key conflicts.
- Do not modify original inputs.

## Why Not a Complex Knowledge Base

At the current stage, priority is given to validating local file flow and task closure. Complex PDF, image, and online synchronization can be integrated later, but should not block the first stable Harness protocol.