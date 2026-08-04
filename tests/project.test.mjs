import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repository = resolve(import.meta.dirname, '..');
const cli = resolve(repository, 'packages/cli/bin/fe-harness.mjs');

test('creates a complete consumer-h5 project with local agent skill', async () => {
  const parent = await mkdtemp(resolve(tmpdir(), 'fe-harness-create-'));
  const result = spawnSync(process.execPath, [cli, 'create', 'pilot-h5'], {
    cwd: parent,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const project = resolve(parent, 'pilot-h5');
  assert.match(await readFile(resolve(project, 'package.json'), 'utf8'), /"name": "pilot-h5"/);
  assert.match(await readFile(resolve(project, 'src/pages/index/index.vue'), 'utf8'), /pilot-h5/);
  assert.match(
    await readFile(resolve(project, '.agents/skills/consumer-h5-harness/SKILL.md'), 'utf8'),
    /fe-harness inspect/,
  );
});

test('create dry-run returns a structured plan without writing', async () => {
  const parent = await mkdtemp(resolve(tmpdir(), 'fe-harness-plan-'));
  const result = spawnSync(process.execPath, [cli, 'create', 'planned-h5', '--dry-run'], {
    cwd: parent,
    encoding: 'utf8',
  });
  assert.equal(result.status, 0, result.stderr);
  const plan = JSON.parse(result.stdout);
  assert.equal(plan.action, 'create');
  assert.equal(plan.status, 'ready');
  assert.ok(plan.entries.some((entry) => entry.target === 'AGENTS.md'));
  await assert.rejects(readFile(resolve(parent, 'planned-h5/package.json')), /ENOENT/);
});
