# Templates / Presets

Templates and Presets are both business-neutral file sources, but used for different scenarios.

## Templates

`templates/` is used for connecting existing projects. It provides:

- `AGENTS.md`
- `.fe-harness/project.yaml`
- Input directory README
- PRODUCT / DESIGN / CURRENT_STATUS / DECISIONS
- history and coverage files
- API selection
- Design Token initial files

When `init` uses templates, it first pre-checks and does not overwrite project-maintained files.

## Presets

`presets/consumer-h5/` is used for creating new projects. It contains a minimal runnable uni-app H5 project:

- `package.json`
- `src/App.vue`
- `src/pages.json`
- `src/pages/index/index.vue`
- `src/services/http.ts`
- Playwright configuration and tests
- Harness project documentation and input directories

## Why Not Include Business Example Pages

Business example pages create misleading implications. Real projects should generate business pages from PRD/RP/UI/API inputs, not inherit a fake default business from templates.

Therefore, preset only creates containers, directories, and engineering capabilities. When inputs are empty, the project remains "waiting for inputs".