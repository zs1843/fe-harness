import { spawn } from 'node:child_process';
import { performance } from 'node:perf_hooks';

export function runShellCommand(command, { cwd, env = process.env } = {}) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    const child = spawn(command, {
      cwd,
      env,
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      const text = String(chunk);
      stdout += text;
      process.stdout.write(text);
    });
    child.stderr.on('data', (chunk) => {
      const text = String(chunk);
      stderr += text;
      process.stderr.write(text);
    });
    child.on('error', (error) => {
      resolve({
        command,
        durationMs: Math.round(performance.now() - startedAt),
        error: error.message,
        status: 'blocked',
        stderr,
        stdout,
      });
    });
    child.on('exit', (code) => {
      resolve({
        command,
        durationMs: Math.round(performance.now() - startedAt),
        exitCode: code ?? 1,
        status: code === 0 ? 'passed' : 'failed',
        stderr,
        stdout,
      });
    });
  });
}

export async function runVerification({ cwd, failFast, mode, steps }) {
  const results = [];
  for (const step of steps) {
    const result = await runShellCommand(step.command, { cwd });
    results.push({ ...result, name: step.name });
    if (failFast && result.status !== 'passed') break;
  }
  return {
    mode,
    results,
    status: results.every((item) => item.status === 'passed') ? 'passed' : 'failed',
  };
}
