module.exports = {
  env: { browser: true, es2022: true, node: true },
  extends: ['eslint:recommended'],
  ignorePatterns: ['dist/**', 'node_modules/**', 'tmp/**', 'playwright-report/**', 'test-results/**'],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
};
