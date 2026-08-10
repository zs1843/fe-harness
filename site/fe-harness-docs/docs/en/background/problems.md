# Problems We Solve

## 1. Scattered Requirements Evidence

PRD, RP, UI, API, and assets often come from different tools. They may be in chat logs, cloud drives, screenshots, export files, and temporary directories. Without unified registration, developers and agents struggle to answer "which input does the current task actually rely on".

fe-harness stores original inputs in `.fe-harness/inputs/` and records source, type, and status through manifest. Original inputs are read-only by default; analysis results are generated separately.

## 2. Agent Context Overload

If an agent reads all designs, APIs, history, and task files every time, it easily mixes irrelevant constraints into the current task. If it reads too little, it starts guessing.

fe-harness's default strategy is to read stable workflows first, then load evidence by task type:

- Business tasks read PRD/RP.
- UI tasks also read DESIGN, Token, UI inputs, and visual adjustment records.
- API tasks also read OpenAPI inputs and operationId selections.
- Long-term conflicts or architectural decisions only read DECISIONS when necessary.

## 3. Unprovable Completion Standards

A page opening and build passing doesn't mean requirements are fully implemented. Especially in multi-layer flows, it's easy to miss popups, error states, return paths, and secondary pages.

fe-harness introduces requirement closure in Consumer H5 feature/audit: reachable pages, states, actions, and return paths must be verified, explicitly deferred, or recorded as external blockers.

## 4. Mixed Generated and Manual Code

If interface types and request wrappers are manually edited after generation, the next generation might overwrite business fixes.

fe-harness's OpenAPI generation is task-level with managed-file conflict protection. The generation layer stays pure contract; business mapping should go in separate service or repository.

## 5. Multi-Agent Rule Drift

Codex, Claude Code, and Cursor may each have their own entry files. If each entry copies a complete set of rules, eventually "the same project has multiple specifications".

fe-harness makes `AGENTS.md` the single constraint body. `CLAUDE.md` and Cursor rules are thin adapters; Skills are callable workflows that don't override project constraints.