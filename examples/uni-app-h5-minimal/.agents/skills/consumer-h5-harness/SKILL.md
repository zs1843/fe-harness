---
name: consumer-h5-harness
description: Implement and verify this consumer H5 fixture with fe-harness.
---

# Consumer H5 Harness

Read project facts, run `fe-harness inspect` and `fe-harness doctor`, implement within scope, then
run the appropriate `fe-harness verify` mode. Ask only for necessary missing information or new
authority. Never persist credentials. Update current status and durable decisions when applicable.

Before implementing from PRD/RP/UI, identify pages, flow nodes, dialogs, overlays, return paths, and
shared regions. Use separate uni-app pages for independent views, update `src/pages.json`, and keep
request logic out of page files.

Extract Design Token values before UI implementation when `docs/design/tokens.json` is pending. UI
inputs override RP-inferred tokens; later UI additions must update the JSON and record diffs.

When helper logic repeats, move pure shared functions to `src/utils/`. Keep Vue-reactive logic in
composables and API/data-source adaptation in services or repositories.
