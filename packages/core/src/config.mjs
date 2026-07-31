import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import YAML from 'yaml';

export async function loadProjectConfig(cwd, configPath = '.fe-harness/project.yaml') {
  const absolutePath = resolve(cwd, configPath);
  const source = await readFile(absolutePath, 'utf8');
  const config = YAML.parse(source);
  validateProjectConfig(config);
  return { config, path: absolutePath };
}

export function validateProjectConfig(config) {
  const issues = [];
  if (!config || typeof config !== 'object') issues.push('配置必须是对象');
  if (!config?.harness?.version) issues.push('缺少 harness.version');
  if (!config?.project?.name) issues.push('缺少 project.name');
  if (!config?.project?.product_type) issues.push('缺少 project.product_type');
  if (!Array.isArray(config?.project?.platforms) || !config.project.platforms.length) {
    issues.push('project.platforms 至少配置一个平台');
  }
  if (!config?.stack?.adapter) issues.push('缺少 stack.adapter');
  if (!config?.commands || typeof config.commands !== 'object') issues.push('缺少 commands');
  if (!config?.verify || typeof config.verify !== 'object') issues.push('缺少 verify');
  if (issues.length) {
    throw new Error(`fe-harness 配置无效：${issues.join('；')}`);
  }
  return config;
}

export function resolveVerifySteps(config, mode) {
  const definition = config.verify?.[mode];
  if (!definition) throw new Error(`未配置 verify.${mode}`);
  const commandNames = Array.isArray(definition) ? definition : definition.commands;
  if (!Array.isArray(commandNames) || !commandNames.length) {
    throw new Error(`verify.${mode}.commands 不能为空`);
  }
  return {
    failFast: Array.isArray(definition) ? true : definition.fail_fast !== false,
    steps: commandNames.map((name) => {
      const command = config.commands[name];
      if (!command) throw new Error(`verify.${mode} 引用了未定义命令：${name}`);
      return { command, name };
    }),
  };
}
