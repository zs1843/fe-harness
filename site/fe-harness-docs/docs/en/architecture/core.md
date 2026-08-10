# Core

Core is located at `packages/core/` and serves as the business-agnostic runtime of Harness.

## What Core Is Responsible For

| Capability | Description | Why It Belongs in Core |
| --- | --- | --- |
| Configuration Loading | Reads `.fe-harness/project.yaml`, parsing project, platform, tech stack, facts, and command mappings | All workflows depend on the same configuration entry point |
| Runtime Validation | Checks whether product type, platform, stack, commands, and verify mode are supported | Fail early to prevent Agents from continuing implementation on incorrect configurations |
| Command Resolution | Maps symbolic commands like `unit_test` and `coverage_closure` to actual shell commands | Projects own commands; Core only executes mappings |
| Verification Execution | Supports fail-fast and audit-style continued execution | Different scenarios require different feedback costs |
| Doctor | Checks Node, pnpm, scripts, page registration, inputs, tokens, Agent workflows, etc. | Diagnostics should be read-only and repeatable |
| Init Planning | Generates create, unchanged, conflict, and other statuses for `init` / `create` | Must preview and protect existing projects before writing files |
| Reporting | Writes Markdown, JSON, and command logs | Humans, CI, and Agents can all read the same results |
| Input Analysis | Reads manifest, discovers unregistered inputs, extracts text facts and conflicts | Input evidence is shared context before tasks begin |
| OpenAPI Generation Protection | Records generated hash, refuses to overwrite manually modified generated files | Auto-generated layer and business layer must be separated |
| UI/Token Check Protocol | Checks unique Token ground truth and UI System Adapter descriptions | Core only understands generic descriptions, does not import specific component libraries |

## What Core Is NOT Responsible For

Core does not contain:

- Business pages.
- Business state.
- API endpoints.
- Brand names.
- Design Token values.
- Specific UI component library implementations.

In other words, Core can know "the project declared an API snapshot," but not "this is a hotel search endpoint"; can know "a page registration is missing," but not "what cards the hotel list page should have"; can know "Token is not extracted," but not "what the brand primary color should be."

## Why Core Must Be Restrained

Once Core understands business, implicit coupling emerges when extending profiles and platforms. Keeping Core focused on generic protocols enables future product forms beyond Consumer H5 to use the same Harness.

## Relationship with Configuration

Core works through project configuration:

```yaml
project:
  product_type: consumer_h5
platforms:
  - web_mobile
stack:
  adapter: uni_app
verify:
  feature:
    commands:
      - unit_test
      - coverage_closure
```

Projects choose capabilities; Core executes protocols.

## Core Internal File Perspective

| File | Primary Responsibility |
| --- | --- |
| `config.mjs` | Project configuration loading and validation |
| `runner.mjs` | Command execution, fail-fast, state normalization |
| `doctor.mjs` | Read-only diagnostics |
| `init.mjs` | Initialization and creation planning, safe writes |
| `inputs.mjs` | Input inventory, discovery, and analysis |
| `openapi.mjs` | OpenAPI operation checking, type and wrapper generation |
| `design.mjs` | Design Token inspect/discover/diff |
| `ui-system.mjs` | UI System Adapter checking |
| `history.mjs` | Task history and snapshots |
| `report.mjs` | Reports and log output |