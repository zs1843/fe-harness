# Contributing to fe-harness

感谢你考虑为 fe-harness 做贡献！

## 开发环境设置

### 前置要求

- Node.js >= 20
- pnpm >= 10.12.1

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/zs1843/fe-harness.git
cd fe-harness

# 安装依赖
pnpm install
```

### 运行测试

```bash
# 运行所有测试
pnpm test

# 运行诊断
pnpm doctor

# 快速验证
pnpm verify:quick
```

## 项目结构

```
fe-harness/
├── packages/
│   ├── cli/          # CLI 工具
│   └── core/         # 核心库
├── skills/           # Agent Skills
├── templates/        # 项目模板
├── schemas/          # JSON Schemas
├── docs/             # 内部文档
├── site/             # VitePress 文档站点
│   └── fe-harness-docs/
│       └── docs/
│           ├── .vitepress/
│           ├── architecture/
│           ├── background/
│           ├── reference/
│           ├── sop/
│           └── deploy/
└── tests/            # 测试文件
```

## 代码规范

### 提交信息

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
feat: 添加新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具链相关
```

示例：

```
feat: 添加 OpenAPI 生成命令
fix: 修复 init 命令的路径解析问题
docs: 补充 API 文档
```

### 代码风格

- 使用 ES Modules (ESM)
- 使用 `.mjs` 扩展名
- 使用 2 空格缩进
- 使用单引号
- 添加必要的注释

## 提交 PR

### 1. 创建分支

```bash
# 从 main 创建特性分支
git checkout -b feature/your-feature-name
```

### 2. 提交更改

```bash
# 添加更改
git add .

# 提交（使用规范格式）
git commit -m "feat: 你的改动描述"
```

### 3. 推送并创建 PR

```bash
# 推送到你的 fork
git push origin feature/your-feature-name
```

然后在 GitHub 上创建 Pull Request。

### PR 检查清单

- [ ] 代码通过所有测试
- [ ] 提交信息符合规范
- [ ] 添加必要的文档
- [ ] 没有引入新的 lint 错误

## 文档贡献

### 文档位置

- 在线文档：`site/fe-harness-docs/docs/`
- 内部文档：`docs/`

### 文档规范

1. 使用 Markdown 格式
2. 文件名使用小写和连字符：`my-document.md`
3. 添加清晰的标题和目录
4. 提供代码示例
5. 保持中英文同步（如有英文版）

### 运行文档站点

```bash
cd site/fe-harness-docs
pnpm install
pnpm docs:dev
```

访问 http://localhost:5173 查看效果。

## 问题反馈

如果你发现 bug 或有功能建议：

1. 先搜索 [已有 Issues](https://github.com/zs1843/fe-harness/issues)
2. 如果没有相关问题，[创建新 Issue](https://github.com/zs1843/fe-harness/issues/new)
3. 使用清晰的标题和详细的描述
4. 提供复现步骤和环境信息

## 许可证

本项目采用 MIT 许可证。贡献的代码将以相同许可证发布。

---

再次感谢你的贡献！