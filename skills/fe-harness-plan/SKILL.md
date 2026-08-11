---
name: fe-harness-plan
description: Produce and interpret fe-harness create or init plans before filesystem changes. Use when previewing generated files, assessing adoption conflicts, checking target paths, or requiring a non-mutating plan before create/init.
---

# 规划 Harness 变更

- 新项目：`fe-harness plan create <name> --output <完整目标目录> --json`。
- 现有项目：`fe-harness plan init --json`。
- 解释 `create`、`managed_unchanged`、`project_owned_modified`、`template_update_available` 和 `true_conflict` 的中文含义。
- `--output` 是完整项目目录，不是父目录。
- 计划阶段不得安装依赖或写入文件。
- 有真实冲突时列出精确文件和决策点，不擅自覆盖。
- `fe-harness init` 现含幂等验证：二次执行确认零漂移，受管文件无变化即表示幂等通过。
- 需要升级评估时运行 `fe-harness optimize`，输出五组差异并执行二次 dry comparison 确认幂等升级安全。
