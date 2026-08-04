---
name: fe-harness-version
description: Check fe-harness CLI availability and version compatibility. Use when a workflow needs the CLI, when project.yaml declares a harness version, when diagnosing PATH/global installation, or before running create/init/verify commands.
---

# 检查 CLI 版本

1. 运行 `command -v fe-harness` 和 `fe-harness version`。只需要简短检查时也可使用等价别名 `fe-harness -v` 或 `fe-harness --version`。
2. 与 `.fe-harness/project.yaml` 的 `harness.version` 对比并用中文报告。
3. CLI 缺失时，不使用同名未知软件包。需要全局安装时说明将执行 `npm install --global @company/fe-harness` 并请求授权。
4. registry 未发布或版本不满足时停止相关写操作，给出安装本地 tarball、正式 registry 包或升级项目配置的可选方案。
