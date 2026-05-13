/**
 * Базовый класс для Page Object: общие действия со страницей.
 *
 * Закрытие баннеров (`dismissOverlays`): при запуске `tests/stage/**` проект
 * `stage-chromium` задаёт baseURL stage, при `tests/prod/**` — `prod-chromium` и prod.
 * Метод смотрит hostname текущего URL страницы и совпадение с STAGE_BASE_URL / PROD_BASE_URL
 * из окружения (как в playwright.config.js), чтобы при необходимости развести селекторы.
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function hostnameFromBaseUrlVar(value, fallbackHostname) {
  if (!value || typeof value !== 'string') return fallbackHostname;
  try {
    return new URL(value).hostname;
  } catch {
    return fallbackHostname;
  }
}

/** Синхронно с дефолтами в playwright.config.js */
const DEFAULT_STAGE_HOST = hostnameFromBaseUrlVar(
  process.env.STAGE_BASE_URL,
  'stage.fstravel.com',
);
const DEFAULT_PROD_HOST = hostnameFromBaseUrlVar(process.env.PROD_BASE_URL, 'fstravel.com');

/**
 * @param {import('@playwright/test').Page} page
 * @returns {'stage' | 'prod' | 'unknown'}
 */
function inferFstravelEnv(page) {
  let urlString;
  try {
    urlString = page.url();
  } catch {
    return 'unknown';
  }
  if (!urlString || urlString.startsWith('about:')) return 'unknown';
  let host;
  try {
    host = new URL(urlString).hostname;
  } catch {
    return 'unknown';
  }
  if (host === DEFAULT_STAGE_HOST) return 'stage';
  if (host === DEFAULT_PROD_HOST) return 'prod';
  if (host.includes('stage')) return 'stage';
  if (host.includes('fstravel')) return 'prod';
  return 'unknown';
}

/**
 * Общие кандидаты (cookie / модалки) — stage и prod.
 * @param {import('@playwright/test').Page} page
 * @returns {import('@playwright/test').Locator}
 */
const overlayDismissCandidatesCommon = [
  (page) => page.locator('#onetrust-accept-btn-handler'),
  (page) => page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll'),
  (page) => page.getByRole('button', { name: /Принять все|Accept all|Allow all/i }),
  (page) => page.getByRole('button', { name: /^Принять$/i }),
  (page) => page.getByRole('button', { name: /Согласен|Согласна|Принимаю/i }),
  (page) => page.getByRole('button', { name: /Понятно|Хорошо|^ОК$/i }),
  (page) => page.getByRole('button', { name: /^Закрыть$/i }),
  (page) => page.locator('[aria-label="Закрыть"], [aria-label="Close"]'),
];

/** Доп. кандидаты только для stage (при необходимости дополняйте). */
const overlayDismissCandidatesStage = [];

/** Доп. кандидаты только для prod (при необходимости дополняйте). */
const overlayDismissCandidatesProd = [];

/**
 * @param {import('@playwright/test').Page} page
 * @returns {((page: import('@playwright/test').Page) => import('@playwright/test').Locator)[]}
 */
function overlayDismissCandidatesForPage(page) {
  const env = inferFstravelEnv(page);
  if (env === 'stage') return [...overlayDismissCandidatesStage, ...overlayDismissCandidatesCommon];
  if (env === 'prod') return [...overlayDismissCandidatesProd, ...overlayDismissCandidatesCommon];
  return [...overlayDismissCandidatesCommon];
}

class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  async goto(path = '') {
    await this.page.goto(path);
  }

  /**
   * Закрывает типичные cookie-баннеры и простые всплывающие окна (несколько проходов).
   * Среда (stage vs prod) определяется по URL страницы после навигации — в соответствии с
   * проектом Playwright (`stage-chromium` / `prod-chromium`) и тем же baseURL, что в playwright.config.js.
   * Не бросает ошибку, если ничего не найдено.
   * @param {{ maxPasses?: number, settleMs?: number }} [options]
   */
  async dismissOverlays(options = {}) {
    let urlString;
    try {
      urlString = this.page.url();
    } catch {
      return;
    }
    if (!urlString || urlString.startsWith('about:')) return;

    const maxPasses = options.maxPasses ?? 8;
    const settleMs = options.settleMs ?? 300;
    const candidates = overlayDismissCandidatesForPage(this.page);

    for (let pass = 0; pass < maxPasses; pass += 1) {
      let clicked = false;
      for (const pick of candidates) {
        const loc = pick(this.page).first();
        const visible = await loc.isVisible().catch(() => false);
        if (!visible) continue;
        try {
          await loc.click({ timeout: 2000 });
          clicked = true;
          await sleep(settleMs);
          break;
        } catch {
          try {
            await loc.click({ force: true, timeout: 1500 });
            clicked = true;
            await sleep(settleMs);
            break;
          } catch {
            // следующий кандидат
          }
        }
      }
      if (!clicked) break;
    }
  }
}

module.exports = { BasePage, inferFstravelEnv };
