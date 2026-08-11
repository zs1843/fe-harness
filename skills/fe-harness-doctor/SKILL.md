---
name: fe-harness-doctor
description: Diagnose a fe-harness project without modifying it. Use when checking Node/pnpm, scripts, uni-app pages, inputs, task history, Design Token integrity, visual baselines, sensitive files, Agent workflow, or distinguishing deterministic failures from warnings and unconfigured capabilities.
---

# 诊断 Harness 项目

1. 运行 `fe-harness doctor --json` 获取可追踪结果；需要人读输出时运行 `fe-harness doctor`。
2. 按“失败、待确认、未配置、通过、不适用”分组，不把启发式建议升级为确定性错误。
3. 优先修复确定性失败；修复前读取建议与项目事实。
4. 工具链、端口权限、registry 或 Corepack 问题应与项目业务失败分开报告。
5. 敏感路径检测：`fe-harness doctor` 现含敏感路径扫描，枚举 `.env`、私钥等敏感文件位置，只枚举不读取，避免泄露。
6. 需要成熟度评估时运行 `fe-harness audit`，输出八维成熟度审计（A-F 等级 + P0-P2 清单），区分快速修复与长期改进。
7. Doctor 是只读操作。用户只要求诊断时不得直接修改项目。
8. 修复完成后重跑一次，并报告仍未配置的能力。
