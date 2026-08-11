import { access, readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative, join } from 'node:path';

import { loadProjectConfig } from './config.mjs';
import { runDoctor } from './doctor.mjs';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return null;
  }
}

async function readOptional(path) {
  try {
    return await readFile(path, 'utf8');
  } catch {
    return null;
  }
}

async function listDirTree(root, maxDepth = 3, currentDepth = 0) {
  const entries = [];
  if (!(await exists(root)) || currentDepth >= maxDepth) return entries;
  try {
    for (const entry of await readdir(root, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const fullPath = join(root, entry.name);
      entries.push({ path: relative(root, fullPath), depth: currentDepth, isDir: entry.isDirectory() });
      if (entry.isDirectory()) {
        entries.push(...(await listDirTree(fullPath, maxDepth, currentDepth + 1)));
      }
    }
  } catch {
    // ignore
  }
  return entries;
}

async function generateStackMap(cwd, config, outputDir) {
  const packageJson = await readJson(resolve(cwd, 'package.json'));
  const lines = [
    '# STACK — 技术栈地图',
    '',
    `> 自动生成，请勿手动维护。来源：project.yaml + package.json`,
    '',
    '## 技术栈配置',
    '',
    '| 属性 | 值 |',
    '|------|-----|',
    `| Profile | ${config.project?.product_type || '未配置'} |`,
    `| Platforms | ${(config.project?.platforms || []).join(', ') || '未配置'} |`,
    `| Stack Adapter | ${config.stack?.adapter || '未配置'} |`,
    `| Framework | ${config.stack?.framework || '未配置'} |`,
    `| Language | ${config.stack?.language || '未配置'} |`,
    `| Bundler | ${config.stack?.bundler || '未配置'} |`,
    `| Package Manager | ${config.stack?.package_manager || '未配置'} |`,
    '',
  ];

  if (packageJson) {
    lines.push('## 依赖', '');
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    if (deps && Object.keys(deps).length) {
      lines.push('| 包 | 版本 |', '|----|------|');
      for (const [name, version] of Object.entries(deps).sort()) {
        lines.push(`| ${name} | ${version} |`);
      }
    } else {
      lines.push('无依赖。');
    }
  }

  lines.push('', '## 引擎要求', '');
  if (packageJson?.engines) {
    lines.push('| 引擎 | 版本 |', '|------|------|');
    for (const [name, version] of Object.entries(packageJson.engines)) {
      lines.push(`| ${name} | ${version} |`);
    }
  } else {
    lines.push('未声明 engines。');
  }

  await writeFile(resolve(outputDir, 'STACK.md'), lines.join('\n'), 'utf8');
}

async function generateStructureMap(cwd, config, outputDir) {
  const srcDir = resolve(cwd, config.stack?.source_dir || 'src');
  const entries = await listDirTree(srcDir, 3);
  const projectMap = await readOptional(resolve(cwd, config.facts?.project_map || 'docs/PROJECT_MAP.md'));

  const lines = [
    '# STRUCTURE — 项目结构地图',
    '',
    `> 自动生成，来源：${config.stack?.source_dir || 'src'}/ 目录树`,
    '',
    '## 目录树',
    '',
    '```text',
    config.stack?.source_dir || 'src',
  ];
  for (const entry of entries) {
    const indent = '  '.repeat(entry.depth + 1);
    lines.push(`${indent}${entry.isDir ? '├── ' : '├── '}${entry.path}`);
  }
  lines.push('```', '');

  if (projectMap) {
    lines.push('## 模块边界（来自 PROJECT_MAP.md）', '', '```markdown', projectMap, '```');
  }

  await writeFile(resolve(outputDir, 'STRUCTURE.md'), lines.join('\n'), 'utf8');
}

async function generateConventionsMap(cwd, config, outputDir) {
  const agentsMd = await readOptional(resolve(cwd, config.facts?.agent_entry || 'AGENTS.md'));
  const lines = [
    '# CONVENTIONS — 约定地图',
    '',
    '> 自动生成，来源：AGENTS.md 规则摘要',
    '',
  ];

  if (agentsMd) {
    const sections = agentsMd.split(/^## /m).slice(1);
    for (const section of sections) {
      const title = section.split('\n')[0].trim();
      const summary = section.split('\n').slice(1, 4).join('\n').trim();
      if (title) {
        lines.push(`### ${title}`, '', `${summary}...`, '');
      }
    }
  } else {
    lines.push('缺少 AGENTS.md，无法提取约定。');
  }

  await writeFile(resolve(outputDir, 'CONVENTIONS.md'), lines.join('\n'), 'utf8');
}

async function generateTestingMap(cwd, config, outputDir) {
  const verify = config.verify || {};
  const commands = config.commands || {};
  const testsDir = resolve(cwd, 'tests');
  const testEntries = await listDirTree(testsDir, 2);

  const lines = [
    '# TESTING — 测试地图',
    '',
    '> 自动生成，来源：project.yaml verify 配置 + tests/ 结构',
    '',
    '## 验证模式',
    '',
    '| 模式 | 策略 | 命令 |',
    '|------|------|------|',
  ];
  for (const [mode, def] of Object.entries(verify)) {
    const notConfigured = !Array.isArray(def) && def?.status === 'not_configured';
    const cmdNames = Array.isArray(def) ? def : def?.commands || [];
    const cmds = (cmdNames || []).map((n) => commands[n] || n).join(', ');
    lines.push(
      `| ${mode} | ${notConfigured ? '未配置' : `fail_fast=${def?.fail_fast !== false}`} | ${cmds || '—'} |`,
    );
  }

  lines.push('', '## 测试文件结构', '', '```text', 'tests');
  for (const entry of testEntries) {
    const indent = '  '.repeat(entry.depth + 1);
    lines.push(`${indent}${entry.path}`);
  }
  lines.push('```', '');

  await writeFile(resolve(outputDir, 'TESTING.md'), lines.join('\n'), 'utf8');
}

async function generateConcernsMap(cwd, config, outputDir) {
  const doctorReport = await runDoctor(cwd, config);
  const failed = doctorReport.results.filter((r) => r.status === 'failed');
  const warnings = doctorReport.results.filter((r) => r.status === 'warning');

  const lines = [
    '# CONCERNS — 关注点地图',
    '',
    '> 自动生成，来源：doctor 诊断结果',
    '',
    `## 诊断状态：${doctorReport.status}`,
    '',
    '## 失败项',
    '',
  ];
  if (failed.length) {
    for (const item of failed) {
      lines.push(`- **${item.code}**：${item.message}${item.suggestion ? ` → ${item.suggestion}` : ''}`);
    }
  } else {
    lines.push('无失败项。');
  }

  lines.push('', '## 警告项', '');
  if (warnings.length) {
    for (const item of warnings) {
      lines.push(`- **${item.code}**：${item.message}`);
    }
  } else {
    lines.push('无警告项。');
  }

  await writeFile(resolve(outputDir, 'CONCERNS.md'), lines.join('\n'), 'utf8');
}

export async function generateCodebaseMaps(cwd) {
  const { config } = await loadProjectConfig(cwd);
  const outputDir = resolve(cwd, '.fe-harness/codebase');
  await mkdir(outputDir, { recursive: true });

  await generateStackMap(cwd, config, outputDir);
  await generateStructureMap(cwd, config, outputDir);
  await generateConventionsMap(cwd, config, outputDir);
  await generateTestingMap(cwd, config, outputDir);
  await generateConcernsMap(cwd, config, outputDir);

  return {
    outputDir,
    maps: ['STACK.md', 'STRUCTURE.md', 'CONVENTIONS.md', 'TESTING.md', 'CONCERNS.md'],
  };
}
