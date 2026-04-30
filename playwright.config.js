// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { testItReporter } = require('./config');

/** Хост stage, пути в Page Object */
const STAGE_BASE_URL =
  process.env.STAGE_BASE_URL || 'https://stage.fstravel.com';
/** Хост prod, пути в Page Object */
const PROD_BASE_URL = process.env.PROD_BASE_URL || 'https://fstravel.com';

/**
 * Воркеры: CI — 1; локально на Windows — 2 (реже spawn EBUSY при Chromium/Test IT);
 * иначе — по умолчанию Playwright. Переопределение: `PW_WORKERS` (число) или CLI `--workers`.
 */
function resolveWorkers() {
  if (process.env.PW_WORKERS !== undefined && process.env.PW_WORKERS !== '') {
    const n = parseInt(process.env.PW_WORKERS, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }
  if (process.env.CI) return 1;
  if (process.platform === 'win32') return 2;
  return undefined;
}

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
  workers: resolveWorkers(),
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
    testItReporter,
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
