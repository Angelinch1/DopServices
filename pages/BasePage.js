const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Кнопки cookie и простых модалок */
const overlayButtons = [
  (page) => page.locator('#onetrust-accept-btn-handler'),
  (page) => page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll'),
  (page) => page.getByRole('button', { name: /Принять все|Accept all|Allow all/i }),
  (page) => page.getByRole('button', { name: /^Принять$/i }),
  (page) => page.getByRole('button', { name: /Согласен|Согласна|Принимаю/i }),
  (page) => page.getByRole('button', { name: /Понятно|Хорошо|^ОК$/i }),
  (page) => page.getByRole('button', { name: /^Закрыть$/i }),
  (page) => page.locator('[aria-label="Закрыть"], [aria-label="Close"]'),
];

class BasePage {
  constructor(page) {
    this.page = page;
  }

  /** Закрыть cookie и модалки, если есть */
  async dismissOverlays(maxPasses = 5) {
    for (let pass = 0; pass < maxPasses; pass++) {
      let clicked = false;
      for (const pick of overlayButtons) {
        const btn = pick(this.page).first();
        if (!(await btn.isVisible().catch(() => false))) continue;
        try {
          await btn.click({ timeout: 2000 });
          clicked = true;
          await sleep(300);
          break;
        } catch {
          // пробуем следующую кнопку
        }
      }
      if (!clicked) break;
    }
  }
}

module.exports = { BasePage };
