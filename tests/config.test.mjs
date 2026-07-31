import assert from 'node:assert/strict';
import test from 'node:test';

import { resolveVerifySteps, validateProjectConfig } from '../packages/core/src/index.mjs';

const config = {
  commands: { lint: 'pnpm lint', test: 'pnpm test' },
  harness: { version: '0.1.0' },
  project: { name: 'example', platforms: ['web_mobile'], product_type: 'consumer_h5' },
  stack: { adapter: 'uni-app' },
  verify: {
    audit: { commands: ['lint', 'test'], fail_fast: false },
    quick: { commands: ['lint'], fail_fast: true },
  },
};

test('validates a minimal project configuration', () => {
  assert.equal(validateProjectConfig(config), config);
});

test('resolves fail-fast quick verification', () => {
  assert.deepEqual(resolveVerifySteps(config, 'quick'), {
    failFast: true,
    steps: [{ command: 'pnpm lint', name: 'lint' }],
  });
});

test('resolves non-fail-fast audit verification', () => {
  assert.equal(resolveVerifySteps(config, 'audit').failFast, false);
});

test('rejects an undefined command reference', () => {
  assert.throws(
    () =>
      resolveVerifySteps(
        { ...config, verify: { quick: { commands: ['missing'], fail_fast: true } } },
        'quick',
      ),
    /未定义命令/,
  );
});
