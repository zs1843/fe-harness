# Verification and Snapshot

## Choose Verification Mode

| Scenario | Recommended Mode |
| --- | --- |
| Small config or tool changes | `fe-harness verify quick` |
| Complete feature implementation | `fe-harness verify feature` |
| Visual regression | `fe-harness verify visual` |
| Pre-release or audit | `fe-harness verify audit` |

## Why feature Matters

`feature` isn't simply running tests. For Consumer H5, it also handles requirement closure:

- Are reachable pages covered.
- Are popups and states covered.
- Are user actions and return paths covered.
- Are incomplete items explicitly deferred or recorded as external blockers.

This prevents the illusion of "first screen opens, so feature is complete".

## Report Output

Verification reports go to:

```text
tmp/fe-harness/
```

Reports include Markdown, JSON, and logs for each command. Command failures, environment blockers, unconfigured capabilities, and business failures should be recorded separately.

## Create Snapshot

```bash
fe-harness task snapshot T001 --title "Task name" --request "User request this time" --json
```

Snapshot records:

- Task description.
- Modified files.
- Verification results.
- Design Token diff.
- Related evidence.

Snapshots don't save `.env`, secrets, cookies, or access tokens.