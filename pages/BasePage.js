/** Базовый Page Object */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this._bannerHandlersInstalled = false;
  }

  /** Автозакрытие баннеров, если перекрывают клик */
  async ensureAutoCloseBanners() {
    if (this._bannerHandlersInstalled) return;
    this._bannerHandlersInstalled = true;

    const triggers = [
      this.page.getByText('Будьте в курсе'),
      this.page.locator('motion.div.login, div.login').filter({ hasText: 'Подписаться' }),
      this.page.locator('.flocktory-widget-overlay').first(),
    ];

    for (const trigger of triggers) {
      await this.page.addLocatorHandler(trigger, () => this.closeBanners());
    }
  }

  /** Закрыть попапы и оверлеи, мешающие клику */
  async closeBanners() {
    const { page } = this;

    await page.keyboard.press('Escape').catch(() => {});
    await this._tryClick(page.locator('button.close[data-dismiss="modal"]'));
    await this.closeSubscribeBanner({ waitForAppear: false });
    await this._tryClick(page.getByRole('button', { name: /Нет,?\s*спасибо/i }).first());
    await this._removeBlockingOverlays();
  }

  /**
   * Баннер «Подписаться» внизу
   * @param {{ waitForAppear?: boolean }} [options]
   */
  async closeSubscribeBanner({ waitForAppear = true } = {}) {
    const closeBtn = this.page.locator('motion.div.login button.close, div.login button.close').first();

    if (waitForAppear) {
      const shown = await closeBtn
        .waitFor({ state: 'visible', timeout: 4_000 })
        .then(() => true)
        .catch(() => false);
      if (!shown) return;
    } else if (!(await closeBtn.isVisible())) {
      return;
    }

    await closeBtn.click({ timeout: 2_000, force: true }).catch(() => {});
    await closeBtn.waitFor({ state: 'hidden', timeout: 3_000 }).catch(() => {});
  }

  async _tryClick(locator, timeout = 1_500) {
    await locator.click({ timeout }).catch(() => {});
  }

  async _removeBlockingOverlays() {
    await this.page
      .evaluate(() => {
        const selectors = [
          '.flocktory-widget-overlay',
          'iframe.flocktory-widget',
          'iframe[title="Flocktory widget"]',
          'motion.div.login',
          'div.login',
        ];
        for (const selector of selectors) {
          document.querySelectorAll(selector).forEach((el) => el.remove());
        }
      })
      .catch(() => {});
  }
}

module.exports = { BasePage };
