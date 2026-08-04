# Getting started

Install dependencies and run the self-tests:

```bash
corepack pnpm install
corepack pnpm test
```

To create a new consumer H5 project:

```bash
fe-harness plan create my-h5 --json
fe-harness create my-h5
cd my-h5
pnpm install
pnpm exec playwright install chromium
fe-harness doctor
fe-harness verify audit
```

The generated `AGENTS.md` and `.agents/skills/consumer-h5-harness/SKILL.md` tell compatible coding
agents to inspect project facts, ask only for necessary missing information, implement from PRD/UI
inputs, invoke Harness verification automatically, and update project history.

For local Harness development, make `fe-harness` available on `PATH` by linking the package binary
with a Node.js 20 environment. Published installations should provide the same global command; AI
agents should call that command directly instead of relying on a repository-relative path.

To inspect initialization without changing a target project:

```bash
node packages/cli/bin/fe-harness.mjs init --dry-run
```

Projects own `.fe-harness/project.yaml`; the package only supplies defaults and validation.

Initialization performs a complete preflight before writing. Existing identical files are kept;
if any target differs, initialization reports the conflict and writes nothing.

Consumer H5 projects can place source PRDs and UI references under `.fe-harness/inputs/prd/` and
`.fe-harness/inputs/ui/`. Coding agents summarize confirmed product facts in `docs/PRODUCT.md`,
design facts in `docs/DESIGN.md`, current facts in `docs/CURRENT_STATUS.md`, and durable decisions
in `docs/DECISIONS.md`.

To consume an Apifox contract, export OpenAPI 3.x JSON through Apifox's official export, script, or
an MCP integration, store it under `.fe-harness/snapshots/openapi.json`, and enable the commented
`sources.api` block in `.fe-harness/project.yaml`. Doctor checks that the snapshot exists, parses as
JSON, declares OpenAPI 3.x (or Swagger 2.0), and contains a `paths` object. Credentials remain in
environment variables and must not be written to configuration or snapshots.
