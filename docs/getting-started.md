# Getting started

Install dependencies and run the self-tests:

```bash
corepack pnpm install
corepack pnpm test
```

To inspect initialization without changing a target project:

```bash
node packages/cli/bin/fe-harness.mjs init --dry-run
```

Projects own `.fe-harness/project.yaml`; the package only supplies defaults and validation.
