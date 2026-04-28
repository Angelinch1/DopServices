// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/** Хост stage без завершающего слэша; пути в Page Object — относительные (/searchexcursions и т.д.). */
const STAGE_BASE_URL =
  process.env.STAGE_BASE_URL || 'https://stage.fstravel.com';
/** Прод: те же пути, другой хост (https://fstravel.com/...). */
const PROD_BASE_URL = process.env.PROD_BASE_URL || 'https://fstravel.com';

/**
 * Конфигурация Playwright для проекта dopservices.
 * Тесты по средам: tests/stage/** и tests/prod/** (разделы сайта — подпапки).
 * @see https://playwright.dev/docs/test-projects
 * @see https://allurereport.org/docs/playwright/
 */
module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        detail: true,
        suiteTitle: true,
        environmentInfo: {
          os_platform: process.platform,
          node_version: process.version,
          stage_base_url: STAGE_BASE_URL,
          prod_base_url: PROD_BASE_URL,
        },
      },
    ],
  ],
  use: {
    trace: 'off',
    screenshot: 'off',
    video: 'off',
    locale: 'ru-RU',
  },
  projects: [
    {
      name: 'stage-chromium',
      testMatch: '**/stage/**/*.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: STAGE_BASE_URL,
      },
    },
    {
      name: 'prod-chromium',
      testMatch: '**/prod/**/*.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: PROD_BASE_URL,
      },
    },
  ],
});
