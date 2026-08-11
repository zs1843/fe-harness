# 使用 SOP 总览

fe-harness 的 SOP 分成七步：

1. 创建新项目或接入已有项目。
2. 放入原始输入。
3. 检查和分析输入。
4. 创建稳定任务编号。
5. 按任务类型加载证据。
6. 实现并选择验证模式。
7. 创建快照，更新历史和状态。

## 新项目主路径

```bash
fe-harness scaffold my-h5 --profile consumer-h5 --stack uni-app
cd my-h5
fe-harness hosts install
fe-harness inspect --map
fe-harness inputs inspect --json
fe-harness inputs analyze --json
fe-harness task create --title "根据首批输入实现项目" --json
fe-harness verify feature
fe-harness audit
fe-harness validate
```

`scaffold` 默认会安装依赖。离线或网络不可用时使用：

```bash
fe-harness scaffold my-h5 --profile consumer-h5 --stack uni-app --skip-install
```

不传 `--profile` 时进入交互模式，逐轮确认产品形态、技术框架、UI 组件库和 Agent 宿主。

## 已有项目主路径

```bash
fe-harness init --dry-run
fe-harness plan init --json
fe-harness init
fe-harness hosts install
fe-harness inspect --map
fe-harness doctor
fe-harness audit
fe-harness validate
fe-harness optimize --dry-run
```

已有项目一定先 dry-run。初始化流程会报告目标文件状态，并在冲突时拒绝写入。init 完成后自动运行幂等验证；hosts install 用受管块安装多宿主薄入口（codex/opencode/claude/cursor/trae），不覆盖已有内容。

## 为什么 SOP 要这么拆

创建项目、登记输入、建立任务和执行验证分别解决不同问题：

| 阶段 | 解决的问题 |
| --- | --- |
| scaffold/init | 项目先获得稳定结构和约束 |
| hosts | 多宿主薄入口统一安装，不复制约束 |
| inspect --map | 生成代码图谱，建立结构事实 |
| inputs | 原始证据进入项目，而不是留在聊天记录 |
| task | 需求、接口、实现、验证有共同编号 |
| implementation | Agent 按任务类型读取证据，避免猜测 |
| verify | 完成标准可执行、可记录 |
| audit | 八维成熟度审计，A-F 等级 + P0-P2 清单 |
| validate | 自验证受管块、规则、链接、禁止路径 |
| optimize | 幂等升级，五组差异 + 二次 dry comparison |
| snapshot | 交付结果可追踪、可审计 |
