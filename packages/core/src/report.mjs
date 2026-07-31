import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function renderMarkdown(report) {
  const lines = [
    '# fe-harness verification report',
    '',
    `- Mode: \`${report.mode}\``,
    `- Status: **${report.status.toUpperCase()}**`,
    `- Generated: ${report.generatedAt}`,
    '',
    '| Check | Status | Duration | Command |',
    '| --- | --- | ---: | --- |',
  ];
  for (const result of report.results) {
    lines.push(
      `| ${result.name} | ${result.status} | ${result.durationMs}ms | \`${result.command}\` |`,
    );
  }
  return `${lines.join('\n')}\n`;
}

export async function writeReport(cwd, verification) {
  const reportDir = resolve(cwd, 'tmp/fe-harness');
  const logDir = resolve(reportDir, 'logs');
  await mkdir(logDir, { recursive: true });
  const report = {
    ...verification,
    generatedAt: new Date().toISOString(),
    harnessVersion: '0.1.0',
  };
  await Promise.all(
    report.results.map((result) =>
      writeFile(
        resolve(logDir, `${result.name}.log`),
        `${result.stdout || ''}${result.stderr || ''}`,
        'utf8',
      ),
    ),
  );
  await writeFile(resolve(reportDir, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(resolve(reportDir, 'report.md'), renderMarkdown(report));
  return report;
}
