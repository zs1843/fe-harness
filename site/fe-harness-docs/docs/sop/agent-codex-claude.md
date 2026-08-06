# 接入 Codex / Claude Code

fe-harness 的 Agent 接入目标是：不同 Agent 使用同一套项目约束，不维护多份规则。

## 文件分工

| 文件或目录 | 给谁用 | 作用 |
| --- | --- | --- |
| `AGENTS.md` | 所有 Agent | 唯一项目约束本体 |
| `.agents/skills/` | Codex / Cursor | 可调用工作流 Skills |
| `CLAUDE.md` | Claude Code | 薄适配，导入 `AGENTS.md` |
| `.claude/skills/` | Claude Code | Claude Code Skill 目录 |
| `.cursor/rules/fe-harness.mdc` | Cursor | 指向 `AGENTS.md` 的 always-applied rule |

## 新项目默认状态

`fe-harness create` 默认安装聚合 Skill：

```text
.agents/skills/consumer-h5-harness/SKILL.md
.claude/skills/consumer-h5-harness/SKILL.md
```

这已经足够让 Codex 和 Claude Code 理解 Consumer H5 的默认工作流。

## 已有项目补齐

如果接入已有项目后缺少供应商适配，可以运行：

```bash
fe-harness skills install --project --provider all --name consumer-h5-harness
```

如果当前任务需要专项能力，再安装对应 Skill：

```bash
fe-harness skills install --project --name fe-harness-api
fe-harness skills install --project --name fe-harness-design-tokens
```

## Codex 应该怎么做

Codex 进入项目后应先读取：

1. `AGENTS.md`
2. `.fe-harness/project.yaml`
3. `docs/PROJECT_MAP.md`
4. `docs/CURRENT_STATUS.md`
5. `.agents/skills/consumer-h5-harness/SKILL.md`

然后根据任务类型继续读取输入、设计、API 或历史证据。

## Claude Code 应该怎么做

Claude Code 读取 `CLAUDE.md`，再由它导入 `AGENTS.md`。项目级 Skill 位于：

```text
.claude/skills/consumer-h5-harness/SKILL.md
```

Claude Code 不应该维护另一份项目规则。所有长期约束都回到 `AGENTS.md`。

## 为什么这么做

多 Agent 项目最怕规则漂移。如果 Codex、Claude Code、Cursor 分别维护一套长规则，后续一定会出现：

- 某个 Agent 还在用旧 SOP。
- 某个 Agent 以为 API 生成规则不同。
- 某个 Agent 读取了过时的 Design Token 优先级。
- 人无法判断哪份规则才是权威。

因此 fe-harness 把规则分成两类：

- `AGENTS.md`：唯一约束本体。
- Skills：可调用工作流，只说明“做这类任务时怎样执行”。

## 人还需要负责什么

Agent 可以执行 inspect、plan、inputs、task、verify，但人仍然负责权威判断：

- 确认任务目标和优先级。
- 提供真实 PRD/RP/UI/API/assets。
- 在输入冲突时裁决。
- 确认 Design Token 来源和覆盖。
- 批准依赖安装、全局安装、发布、远程仓库操作。
- 判断外部阻塞是否可接受。

这不是削弱 Agent，而是把“执行”和“决策”分清楚。Agent 越稳定执行，人越应该只在真正需要判断的地方介入。
