import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import test from 'node:test';

const repository = resolve(import.meta.dirname, '..');
const cli = resolve(repository, 'packages/cli/bin/fe-harness.mjs');

function run(args = []) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: repository,
    encoding: 'utf8',
  });
}

test('prints rich help with no arguments', () => {
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /fe-harness - 前端工程约束、输入管理和验证工具/);
  assert.match(result.stdout, /常用流程/);
  assert.match(result.stdout, /fe-harness create <项目名> --output <目录>/);
  assert.match(result.stdout, /命令分组/);
});

test('prints rich help for -h', () => {
  const result = run(['-h']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /全局选项/);
  assert.match(result.stdout, /fe-harness verify visual/);
});

test('prints topic help through help subcommand', () => {
  const result = run(['help', 'verify']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /fe-harness verify - 执行验证模式/);
  assert.match(result.stdout, /quick/);
  assert.match(result.stdout, /visual/);
});

test('prints topic help through subcommand help flag', () => {
  const result = run(['verify', '-h']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /用法：\n  fe-harness verify <模式> \[--json\]/);
});

test('unknown command exits non-zero and shows main help', () => {
  const result = run(['unknown']);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /未知命令：unknown/);
  assert.match(result.stdout, /命令分组/);
});
