import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Enable global variables like `describe`, `test`, etc.
    environment: 'node', // Node environment for server-side testing
  },
});