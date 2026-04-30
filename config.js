// @ts-check
/**
 * Общие фрагменты конфигурации Playwright (Test IT и др.).
 * Загрузка .env и синхронизация переменных CI (URL, PROJECT_ID, …) с именами,
 * которые ожидает адаптер Test IT (TMS_*).
 */
const dotenv = require('dotenv');
dotenv.config();

if (process.env.URL && !process.env.TMS_URL) {
  process.env.TMS_URL = process.env.URL.trim();
}
if (process.env.USER_PRIVATE_TOKEN && !process.env.TMS_PRIVATE_TOKEN) {
  process.env.TMS_PRIVATE_TOKEN = process.env.USER_PRIVATE_TOKEN.trim();
}
if (process.env.PROJECT_ID && !process.env.TMS_PROJECT_ID) {
  process.env.TMS_PROJECT_ID = process.env.PROJECT_ID.trim();
}
if (process.env.CONFIGURATION_ID && !process.env.TMS_CONFIGURATION_ID) {
  process.env.TMS_CONFIGURATION_ID = process.env.CONFIGURATION_ID.trim();
}
if (process.env.TEST_RUN_ID && !process.env.TMS_TEST_RUN_ID) {
  process.env.TMS_TEST_RUN_ID = process.env.TEST_RUN_ID.trim();
}
if (process.env.TEST_RUN_NAME && !process.env.TMS_TEST_RUN_NAME) {
  process.env.TMS_TEST_RUN_NAME = process.env.TEST_RUN_NAME.trim();
}
if (process.env.ADAPTER_MODE && !process.env.TMS_ADAPTER_MODE) {
  process.env.TMS_ADAPTER_MODE = process.env.ADAPTER_MODE.trim();
}

/**
 * Репортер Test IT (`testit-adapter-playwright` не входит в встроенный union типов Playwright).
 * @type {import('@playwright/test').ReporterDescription}
 */
const testItReporter = [
  'testit-adapter-playwright',
  {
    url: process.env.TMS_URL?.trim(),
    privateToken: process.env.TMS_PRIVATE_TOKEN?.trim(),
    projectId: process.env.TMS_PROJECT_ID?.trim(),
    configurationId: process.env.TMS_CONFIGURATION_ID?.trim(),
    testRunId: process.env.TMS_TEST_RUN_ID?.trim(),
    testRunName: process.env.TMS_TEST_RUN_NAME?.trim(),
    adapterMode: process.env.TMS_ADAPTER_MODE
      ? parseInt(process.env.TMS_ADAPTER_MODE, 10)
      : undefined,
  },
];

module.exports = { testItReporter };
