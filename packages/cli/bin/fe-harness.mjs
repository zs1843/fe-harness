#!/usr/bin/env node

import { cp, mkdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  loadProjectConfig,
  resolveVerifySteps,
  runDoctor,
  runVerification,
  writeReport,
} from '../../core/src/index.mjs';

const cwd = process.cwd();
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

function printDoctor(report) {
  for (const item of report.results) {
    console.log(`${item.status.toUpperCase().padEnd(14)} ${item.name} - ${item.message}`);
  }
}

async function init() {
  const dryRun = process.argv.includes('--dry-run');
  const files = [
    ['templates/AGENTS.md', 'AGENTS.md'],
    ['templates/PROJECT_MAP.md', 'docs/PROJECT_MAP.md'],
    ['templates/DESIGN.md', 'docs/DESIGN.md'],
    ['templates/project.yaml', '.fe-harness/project.yaml'],
  ];
  for (const [source, target] of files) {
    console.log(`${dryRun ? 'WOULD_CREATE' : 'CREATE'} ${target}`);
    if (dryRun) continue;
    await mkdir(dirname(resolve(cwd, target)), { recursive: true });
    await cp(resolve(packageRoot, source), resolve(cwd, target), { errorOnExist: true, force: false });
  }
}

async function doctor() {
  const { config } = await loadProjectConfig(cwd);
  const report = await runDoctor(cwd, config);
  printDoctor(report);
  process.exitCode = report.status === 'passed' ? 0 : 1;
}

async function verify(mode) {
  const { config } = await loadProjectConfig(cwd);
  const definition = resolveVerifySteps(config, mode);
  const verification = await runVerification({ cwd, mode, ...definition });
  const report = await writeReport(cwd, verification);
  console.log(`fe-harness ${mode}: ${report.status}`);
  process.exitCode = report.status === 'passed' ? 0 : 1;
}

async function main() {
  const [, , command, argument] = process.argv;
  if (command === 'init') return init();
  if (command === 'doctor') return doctor();
  if (command === 'verify' && argument) return verify(argument);
  if (command === 'version') {
    console.log((await readFile(resolve(packageRoot, 'VERSION'), 'utf8')).trim());
    return;
  }
  console.error('Usage: fe-harness <init|doctor|verify|version>');
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
