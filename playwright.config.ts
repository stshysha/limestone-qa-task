import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup project: authenticates once and saves storageState
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        baseURL: 'https://www.saucedemo.com',
      },
    },
    // UI tests depend on setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.saucedemo.com',
        storageState: '.auth/storageState.json',
      },
      dependencies: ['setup'],
      testMatch: /tests\/ui\/.*/,
    },
    // API tests — no browser needed
    {
      name: 'api',
      use: {
        baseURL: 'https://jsonplaceholder.typicode.com',
      },
      testMatch: /tests\/api\/.*/,
    },
  ],
});
