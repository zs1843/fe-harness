# UI System 与视觉生成边界

更新时间：2026-08-12

## 权威分工

| 证据 | 负责内容 |
| --- | --- |
| PRD | 业务规则、权限和验收条件 |
| RP | 页面节点、流程、交互和状态 |
| Page Flow Model | 可达页面、状态和跳转的机器可读闭包 |
| Layout Spec | 页面区域、滚动/固定关系、语义组件和视觉参考元数据 |
| UI System Adapter | 组件目录、语义映射、Token 映射和使用约束 |
| Semantic Design Token | 与框架无关的品牌、密度、排版和视觉参数 |
| UI Reference | 视觉校准、截图比较和页面例外证据 |

UI 图不单独承担业务或交互权威，RP 也不单独承担最终视觉权威。

## 当前 Adapter

所有 Adapter 当前均为 `0.1.0-experimental`：

| Stack | UI System Adapter |
| --- | --- |
| `uni-app` | `tdesign-uniapp` |
| `vue3-vite` | `element-plus`、`ant-design-vue`、`arco-design-vue`、`tdesign-web-vue` |
| `react-vite` | `ant-design` |

可使用以下命令查看实际清单或预览安装：

```bash
fe-harness ui systems list --json
fe-harness ui systems install element-plus --dry-run --json
```

## 通用配置

```yaml
ui:
  system:
    adapter: element-plus
    version: 0.1.0-experimental
    policy: preferred
facts:
  ui_system_adapter: .fe-harness/ui-systems/element-plus/adapter.yaml
  page_flow_model: .fe-harness/models/page-flow.yaml
  layout_specs: .fe-harness/models/layout-specs.yaml
  ui_adjustments: .fe-harness/ui/adjustments.yaml
```

`required` 表示存在语义映射时必须采用系统组件；`preferred` 允许有记录地包装或自定义；`none`
表示项目明确不使用组件系统。Core 只验证协议，不导入具体组件库。

## Adapter 与 runtime 的边界

安装 Adapter 只把描述证据写入项目，不会自动添加 UI runtime。源码真正引用组件后，runtime 必须
作为锁定版本的生产依赖：

```yaml
ui:
  system:
    adapter: element-plus
    version: 0.1.0-experimental
    policy: preferred
    runtime:
      status: installed
      package: element-plus
      version: "<项目锁定版本>"
```

只安装试用且源码没有引用时可以卸载。切换 UI 框架时必须先迁移组件和 Token，运行 feature、
runtime、interaction、visual 验证，再移除旧 runtime；不得长期并存多个完整 UI 框架。

## 证据优先级

```text
安装包类型声明 → 同版本源码/元数据 → 同版本官方文档 → llms.txt → MCP → 模型记忆
```

在线证据必须记录查询时间和对应安装版本，不能用最新版文档解释旧依赖。Adapter 的实验状态也
意味着组件名和 Token 映射必须由项目针对实际安装版本再次验证。

## 微调归因与晋升规则

视觉差异按 `token`、`component`、`layout`、`responsive`、`page_exception` 分类，记录在
`.fe-harness/ui/adjustments.yaml`。真实 pilot 应记录首次与最终截图差异率、生成迭代次数和人工
调整数量。

只有相同问题在两个互不相关的项目中重复出现，才考虑晋升为默认 Token、Adapter 规则或 Layout
Pattern；业务特例保留在项目内。协议 fixture 通过不能证明 Adapter 已减少真实项目的微调。
