import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Snapshot update behavior controlled via CLI flags in npm scripts.
    // Local `npm run test` passes --update to always write snapshots.
    // CI `npm run test:ci` omits --update so mismatched snapshots fail.
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: 'coverage'
    }
  }
});
