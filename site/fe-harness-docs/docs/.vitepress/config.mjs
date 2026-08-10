export default {
  title: 'fe-harness',
  description: '业务无关的前端工程与质量 Harness',
  lang: 'zh-CN',
  cleanUrls: true,
  lastUpdated: true,
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        logo: '/logo.svg',
        nav: [
          { text: '背景', link: '/background/why-harness' },
          { text: 'SOP', link: '/sop/overview' },
          { text: '架构', link: '/architecture/overview' },
          { text: '参考', link: '/reference/commands' },
          { text: '部署', link: '/deploy/build' },
          { text: '反馈', link: 'https://github.com/zs1843/fe-harness/issues' }
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
              { text: 'API 文档', link: '/reference/api' },
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
        footer: {
          message: 'Business-neutral by design. Project-owned by default.',
          copyright: 'fe-harness 1.2.4'
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        logo: '/logo.svg',
        nav: [
          { text: 'Background', link: '/en/background/why-harness' },
          { text: 'SOP', link: '/en/sop/overview' },
          { text: 'Architecture', link: '/en/architecture/overview' },
          { text: 'Reference', link: '/en/reference/commands' },
          { text: 'Feedback', link: 'https://github.com/zs1843/fe-harness/issues' }
        ],
        sidebar: [
          {
            text: 'Getting Started',
            items: [
              { text: 'Home', link: '/en/' },
              { text: 'Docs as Contract', link: '/en/maintenance/docs-as-contract' }
            ]
          },
          {
            text: 'Background',
            items: [
              { text: 'Why Harness', link: '/en/background/why-harness' },
              { text: 'Problems We Solve', link: '/en/background/problems' },
              { text: 'Design Principles', link: '/en/background/principles' }
            ]
          },
          {
            text: 'SOP',
            items: [
              { text: 'Overview', link: '/en/sop/overview' },
              { text: 'Create Project', link: '/en/sop/create-project' },
              { text: 'Init Existing Project', link: '/en/sop/init-existing-project' },
              { text: 'Inputs', link: '/en/sop/inputs' },
              { text: 'Task & Implementation', link: '/en/sop/task-and-implementation' },
              { text: 'Verification & Snapshot', link: '/en/sop/verification-and-snapshot' },
              { text: 'Project Structure', link: '/en/sop/project-structure' },
              { text: 'Agent Integration', link: '/en/sop/agent-codex-claude' }
            ]
          },
          {
            text: 'Architecture',
            items: [
              { text: 'Overview', link: '/en/architecture/overview' },
              { text: 'Core', link: '/en/architecture/core' },
              { text: 'CLI', link: '/en/architecture/cli' },
              { text: 'Adapters', link: '/en/architecture/adapters' },
              { text: 'Templates & Presets', link: '/en/architecture/templates-presets' },
              { text: 'Inputs', link: '/en/architecture/inputs' },
              { text: 'OpenAPI', link: '/en/architecture/openapi' },
              { text: 'Design Tokens', link: '/en/architecture/design-tokens' },
              { text: 'UI System', link: '/en/architecture/ui-system' },
              { text: 'Skills', link: '/en/architecture/skills' }
            ]
          },
          {
            text: 'Reference',
            items: [
              { text: 'Commands', link: '/en/reference/commands' },
              { text: 'API Documentation', link: '/en/reference/api' },
              { text: 'Skills', link: '/en/reference/skills' },
              { text: 'Config & Files', link: '/en/reference/config-and-files' },
              { text: 'Verification Modes', link: '/en/reference/verification-modes' },
              { text: 'Glossary', link: '/en/reference/glossary' }
            ]
          },
          {
            text: 'Deployment',
            items: [
              { text: 'Build & Deploy', link: '/en/deploy/build' }
            ]
          }
        ],
        footer: {
          message: 'Business-neutral by design. Project-owned by default.',
          copyright: 'fe-harness 1.2.4'
        }
      }
    }
  },
  themeConfig: {
    outline: {
      level: [2, 3]
    },
    search: {
      provider: 'local'
    }
  }
};
