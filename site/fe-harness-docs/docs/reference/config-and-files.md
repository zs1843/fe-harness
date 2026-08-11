# 配置与文件

## 项目配置

入口文件：

```text
.fe-harness/project.yaml
```

它声明：

- Harness 包和版本。
- 项目名称和产品类型。
- platform 选择。
- stack adapter。
- facts 文件路径。
- 命令映射。
- verify modes。
- 可选 sources、ui、api 配置。

## 关键事实文件

| 文件 | 作用 |
| --- | --- |
| `AGENTS.md` | 项目唯一约束本体 |
| `docs/PROJECT_MAP.md` | 模块地图 |
| `docs/CURRENT_STATUS.md` | 当前状态和限制 |
| `docs/PRODUCT.md` | 产品事实 |
| `docs/DESIGN.md` | 设计事实 |
| `docs/DECISIONS.md` | 长期决策 |
| `docs/IMPLEMENTATION_COVERAGE.md` | 需求覆盖 |

## 生成报告

```text
tmp/fe-harness/
```

该目录被 Git 忽略。报告可以作为本地调试和 CI artifact。

## 生成接口文件

```text
src/types/api.generated.ts
src/services/api.generated.ts
.fe-harness/api/generated.json
```

这些文件受 managed metadata 保护。

## 规则目录

```text
.fe-harness/rules/
```

存放 Harness 管理的规则文件，由 `optimize --groups rules` 和 `validate` 检查维护。规则文件覆盖工程规范、验证要求、模块边界等约束。该目录下的文件受 managed metadata 保护，幂等升级时只更新有差异的文件。

## 代码图谱目录

```text
.fe-harness/codebase/
```

由 `inspect --map` 生成，包含 5 份代码图谱：

| 文件 | 内容 |
| --- | --- |
| `STACK.md` | 技术栈和依赖 |
| `STRUCTURE.md` | 模块和目录结构 |
| `CONVENTIONS.md` | 代码约定和规范 |
| `TESTING.md` | 测试策略和覆盖 |
| `CONCERNS.md` | 关注点和风险 |

该目录被 Git 忽略。图谱可以重新生成，不作为受管文件保护。
