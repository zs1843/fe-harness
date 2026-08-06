export default {
  title: 'fe-harness',
  description: '业务无关的前端工程与质量 Harness',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: '背景', link: '/background/why-harness' },
      { text: 'SOP', link: '/sop/overview' },
      { text: '架构', link: '/architecture/overview' },
      { text: '参考', link: '/reference/commands' },
      { text: '部署', link: '/deploy/build' }
    ],
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '文档首页', link: '/' },
          { text: '维护规则', link: '/maintenance/docs-as-contract' }
        ]
      },
      {
        text: '背景',
        items: [
          { text: '为什么做 Harness', link: '/background/why-harness' },
          { text: '要解决的问题', link: '/background/problems' },
          { text: '设计原则', link: '/background/principles' }
        ]
      },
      {
        text: '使用 SOP',
        items: [
          { text: '总览', link: '/sop/overview' },
          { text: '创建新项目', link: '/sop/create-project' },
          { text: '接入已有项目', link: '/sop/init-existing-project' },
          { text: '输入登记与分析', link: '/sop/inputs' },
          { text: '任务与实现', link: '/sop/task-and-implementation' },
          { text: '验证与快照', link: '/sop/verification-and-snapshot' },
          { text: '新建项目结构', link: '/sop/project-structure' },
          { text: '接入 Codex / Claude', link: '/sop/agent-codex-claude' }
        ]
      },
      {
        text: '架构与模块',
        items: [
          { text: '架构总览', link: '/architecture/overview' },
          { text: 'Core', link: '/architecture/core' },
          { text: 'CLI', link: '/architecture/cli' },
          { text: 'Profiles / Platforms / Stacks', link: '/architecture/adapters' },
          { text: 'Templates / Presets', link: '/architecture/templates-presets' },
          { text: 'Inputs', link: '/architecture/inputs' },
          { text: 'OpenAPI', link: '/architecture/openapi' },
          { text: 'Design Token', link: '/architecture/design-tokens' },
          { text: 'UI System', link: '/architecture/ui-system' },
          { text: 'Agent Skills', link: '/architecture/skills' }
        ]
      },
      {
        text: '参考',
        items: [
          { text: '命令参考', link: '/reference/commands' },
          { text: 'Skill 列表', link: '/reference/skills' },
          { text: '配置与文件', link: '/reference/config-and-files' },
          { text: '验证模式', link: '/reference/verification-modes' },
          { text: '术语表', link: '/reference/glossary' }
        ]
      },
      {
        text: '部署',
        items: [
          { text: '构建与部署', link: '/deploy/build' }
        ]
      }
    ],
    outline: {
      level: [2, 3]
    },
    search: {
      provider: 'local'
    },
    footer: {
      message: 'Business-neutral by design. Project-owned by default.',
      copyright: 'fe-harness 0.1.0'
    }
  }
};
