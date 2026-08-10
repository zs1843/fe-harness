# OpenAPI

OpenAPI capability is used for task-level interface generation.

## Current Scope

Current implementation starts from local OpenAPI JSON, usually from Apifox official export.

```text
.fe-harness/inputs/api/
.fe-harness/api/selection.yaml
src/types/api.generated.ts
src/services/api.generated.ts
.fe-harness/api/generated.json
```

## How Tasks Select Interfaces

PRD determines which operationIds are needed for the current task. selection.yaml binds tasks with operationIds.

This is done to avoid generating the entire API at once and to prevent Agents from guessing fields based on PRD.

## What Is Generated

Generated content includes:

- TypeScript request/response types.
- uni.request wrapper.
- managed metadata.

## Why Protect Generated Files

Generated files should remain regenerable. If developers manually modify generated files, the next generation will refuse to overwrite.

Business mapping should be placed outside the generated layer. This keeps interface contracts and business adaptation separate.

## Future Scope

Currently, online Apifox synchronization, authenticated fetching, complex discriminator mapping, and advanced media type support are not implemented. These belong to the scope of future provider interfaces.