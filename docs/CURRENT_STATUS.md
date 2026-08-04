# Current Status

Updated: 2026-08-03

## Completed

- Created the Core and CLI workspace packages.
- Added YAML project configuration loading and focused runtime validation.
- Added Quick, Feature, Visual, and Audit command resolution.
- Added fail-fast and continue-on-error execution.
- Added Markdown, JSON, and per-command log reports.
- Added a read-only initial Doctor.
- Added safe initialization and dry-run behavior.
- Added the initial `consumer-h5` Product Profile.
- Added the initial `web-mobile` Platform Adapter.
- Added the initial `uni-app` Stack Adapter.
- Added a JSON Schema draft for project configuration.
- Added a minimal business-neutral uni-app H5 fixture.
- Added six passing Core and orchestration tests.
- Verified example Doctor and Audit execution.
- Initialized an independent Git repository on branch `main`.
- Strengthened runtime validation for supported project, platform, stack, command, and verification
  values without adding a production dependency.
- Added stable Doctor check codes and focused remediation for missing project scripts.
- Changed initialization to preflight every target before writing, report create/unchanged/conflict
  states, and write nothing when any conflict exists.
- Added consumer-H5 product, current-status, decision, changelog, PRD-input, and UI-input templates.
- Added focused configuration, Doctor, initialization, and creation tests; 20 Core tests and one fixture
  structure test now pass.
- Added lightweight Doctor checks for Node.js 20, package-manager/lockfile consistency, uni-app page
  registration and dependencies, Harness report ignore rules, and optional OpenAPI JSON snapshots.
- Added an optional `sources.api` configuration protocol for Apifox-exported OpenAPI snapshots,
  without adding an Apifox SDK or code-generation path.
- Replaced the placeholder example build with a real minimal uni-app Vue 3 H5 fixture using the
  official DCloud Vue 3 preset release line and Vite 5.2.8.
- Upgraded the uni-app page-registry Doctor check to parse `src/pages.json`, require at least one
  page, and verify that each registered Vue page component exists.
- Added a focused Playwright browser runtime check for the real fixture at the 390 x 844 mobile
  viewport. It verifies the HTTP response, core content, console errors, and uncaught page errors.
- Connected the runtime check to the fixture's Visual and Audit verification modes.
- Added `create`, `inspect`, and structured `plan` CLI commands. The consumer-H5 preset now generates
  a real project, local Harness scripts, project facts, PRD/UI/Snapshot inputs, Agent instructions,
  and a project-local validated Skill.
- Defined the automatic Agent workflow: inspect and diagnose, ask only at necessary authority or
  ambiguity boundaries, implement, select verification by change type, retry failures at most twice,
  and update current status and durable decisions.
- Added Agent automation readiness reporting to Inspect and Doctor. Consumer-H5 projects now fail
  Doctor when their Agent guide or project-local Harness Skill is missing or lacks core CLI rules.
- Added input analysis for registered PRD/RP/UI evidence. The analyzer extracts simple labelled
  conclusions, separates business/interaction/visual dimensions, and reports same-key conflicts
  without modifying original inputs.
- Added consumer-H5 dev ready verification through `test:dev-ready` and mapped it into runtime
  verification.
- Added a real Playwright screenshot visual spec, explicit baseline update command, and missing
  baseline handling. Missing screenshots are reported as `not_configured`; generated baselines allow
  visual verification to pass.
- Added environment-block classification for local port listen failures so toolchain restrictions
  are not reported as business failures.

## Verified commands

```text
pnpm install
pnpm test
node packages/cli/bin/fe-harness.mjs version
node packages/cli/bin/fe-harness.mjs init --dry-run
node ../../packages/cli/bin/fe-harness.mjs doctor
node ../../packages/cli/bin/fe-harness.mjs verify audit
```

## Current limitations

- Runtime validation does not yet execute the JSON Schema through a standards-compliant validator.
- Initialization deliberately provides only a lightweight terminal plan; it does not generate
  conflict patches, perform three-way merges, or roll back exceptional mid-write filesystem errors.
- Upgrade is not implemented.
- API/OpenAPI adapters are not implemented.
- Doctor does not yet validate CI entry points or sensitive source contents beyond file naming and
  `.env*` ignore rules.
- Platform Adapter defaults are not yet fully materialized automatically; the consumer-H5 preset
  configures its Playwright mobile viewport explicitly.
- Input analysis is heuristic and text-first; PDF/image/RP binary inputs still require Agent or
  tool-assisted interpretation.
- No CI release pipeline, package registry, remote repository, or published npm package exists.
- No Codex Plugin exists.

## Next recommended task

Connect the first consumer-H5 pilot project and use its PRD, UI references, and optional Apifox
OpenAPI snapshot to identify the next generalizable checks.

Do not restart the repository scaffold or copy files from a business project.
