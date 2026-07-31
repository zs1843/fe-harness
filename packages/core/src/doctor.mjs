import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function result(name, status, message) {
  return { message, name, status };
}

export async function runDoctor(cwd, config) {
  const results = [];
  const packageJsonPath = resolve(cwd, 'package.json');
  results.push(
    result(
      'package-json',
      (await exists(packageJsonPath)) ? 'passed' : 'failed',
      (await exists(packageJsonPath)) ? 'package.json 已存在' : '缺少 package.json',
    ),
  );

  for (const [name, relativePath] of Object.entries(config.facts || {})) {
    if (!relativePath || Array.isArray(relativePath)) continue;
    const present = await exists(resolve(cwd, relativePath));
    results.push(
      result(
        `fact:${name}`,
        present ? 'passed' : 'failed',
        present ? `${relativePath} 已存在` : `缺少事实来源 ${relativePath}`,
      ),
    );
  }

  if (await exists(resolve(cwd, 'vitest.config.ts'))) {
    const source = await readFile(resolve(cwd, 'vitest.config.ts'), 'utf8');
    const overlapsE2e =
      source.includes("tests/**/*.{test,spec}.ts") && !source.includes("tests/e2e/**");
    results.push(
      result(
        'test-isolation',
        overlapsE2e ? 'failed' : 'passed',
        overlapsE2e ? 'Vitest 可能会加载 tests/e2e 下的 Playwright 用例' : '测试目录已隔离',
      ),
    );
  } else {
    results.push(result('test-isolation', 'not_configured', '未检测到 Vitest 配置'));
  }

  const packageJson = (await exists(packageJsonPath))
    ? JSON.parse(await readFile(packageJsonPath, 'utf8'))
    : {};
  for (const [name, command] of Object.entries(config.commands || {})) {
    const scriptMatch = String(command).match(/^(?:pnpm|npm run|yarn) ([\w:-]+)/);
    if (!scriptMatch) continue;
    const present = Boolean(packageJson.scripts?.[scriptMatch[1]]);
    results.push(
      result(
        `command:${name}`,
        present ? 'passed' : 'failed',
        present ? `脚本 ${scriptMatch[1]} 已配置` : `package.json 缺少脚本 ${scriptMatch[1]}`,
      ),
    );
  }
  return {
    results,
    status: results.some((item) => item.status === 'failed') ? 'failed' : 'passed',
  };
}
