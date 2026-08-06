---
layout: home

hero:
  name: fe-harness
  text: 前端工程与质量 Harness
  tagline: 把需求输入、项目约束、Agent 工作流、验证报告和任务留痕放进同一套可执行协议里。
  actions:
    - theme: brand
      text: 查看使用 SOP
      link: /sop/overview
    - theme: alt
      text: 理解架构
      link: /architecture/overview

features:
  - title: 业务无关
    details: Core 不包含业务页面、品牌、接口路径、状态枚举或设计值，项目事实由目标项目自己持有。
  - title: 证据优先
    details: PRD、RP、UI、API 和 assets 先登记，再分析，再绑定到任务，避免实现阶段凭记忆和猜测推进。
  - title: Agent 友好
    details: 默认安装聚合工作流 Skill，按任务类型加载相关证据，减少上下文过载和规则漂移。
---

## 一句话说明

`fe-harness` 是一个业务无关的前端工程与质量 Harness。它不替业务项目决定页面、接口或设计，而是提供一套稳定机制：输入如何登记，约束如何读取，任务如何编号，验证如何执行，完成如何留下证据。

## 当前首个支持组合

| 层级 | 当前实现 | 作用 |
| --- | --- | --- |
| Product Profile | `consumer-h5` | 描述消费型 H5 的页面、输入和验收关注点 |
| Platform Adapter | `web-mobile` | 描述移动 Web 运行和视觉验收环境 |
| Stack Adapter | `uni-app` | 描述 uni-app、Vue 3、Vite 和 Playwright 工具链 |

## 默认工作流

```bash
fe-harness create my-h5
cd my-h5
fe-harness inputs inspect --json
fe-harness inputs analyze --json
fe-harness task create --title "根据首批输入实现项目" --json
fe-harness verify feature
```

新项目默认只安装 `consumer-h5-harness` 聚合 Skill。OpenAPI、UI System、Design Token、视觉基线和命令级 Skills 都在任务需要时再启用。
