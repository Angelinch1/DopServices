// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { testItReporter } = require('./config');

/** Базовый URL среды: `preprod` / `prerelease` или свой хост через `BASE_URL`. */
const BASE_URL =
  (process.env.BASE_URL && process.env.BASE_URL.trim()) ||
  'https://fstravel.com/';

/**
 * По умолчанию один воркер — тесты идут по очереди, стабильнее и проще лог.
 * Переопределение: `PW_WORKERS` или CLI `--workers`.
 */
function resolveWorkers() {
  if (process.env.PW_WORKERS !== undefined && process.env.PW_WORKERS !== '') {
    const n = parseInt(process.env.PW_WORKERS, 10);
    return Number.isFinite(n) && n > 0 ? n : 1;
  }
  return 1;
}

/** @returns {import('@playwright/test').VideoMode} */
function resolveVideo() {
  const mode = process.env.PW_VIDEO || 'off';
  if (mode === 'on' || mode === 'off' || mode === 'retain-on-failure' || mode === 'on-first-retry') {
    return mode;
  }
  return 'off';
}

/**
 * Конфигурация Playwright для проекта dopservices.
 * Среда задаётся переменной `BASE_URL` (скрипты `npm run test:preprod` / `test:prerelease`).
 * @see https://playwright.dev/docs/test-projects
 * @see https://allurereport.org/docs/playwright/
 */
module.exports = defineConfig({
  testDir: './test',
  timeout: 60_000,
  fullyParallel: false,
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
          base_url: BASE_URL,
        },
      },
    ],
    //testItReporter,
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'off',
    screenshot: 'off',
    /** Видео: по умолчанию выкл. Включить: `PW_VIDEO=on` или `retain-on-failure` (см. README Playwright). */
    video: resolveVideo(),
    locale: 'ru-RU',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
