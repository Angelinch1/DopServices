const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { BasketPage } = require('./BasketPage');
const bookingUrls = require('../config/bookingUrls');

/** Page Object: формы поиска и корзина доп. услуг (пути — config/bookingUrls.js) */
class SearchPage extends BasePage {
  /** Пауза между шагами */
  async _pause(ms = 500) {
    await this.page.waitForTimeout(ms);
  }

  // Открытие раздела 
  /**
   * @param {keyof typeof bookingUrls} section 
   */
  async openBookingSection(section) {
    const url = bookingUrls[section];
    if (!url) throw new Error(`Неизвестный раздел: ${section}`);

    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.ensureAutoCloseBanners();
    await this.closeBanners();

    const ready =
      section === 'certificates'
        ? 'input#name.form__field'
        : section === 'transfers'
          ? 'button.v-search-button, .v-search'
          : '.v-departure__pinput';

    await this.page.locator(ready).first().waitFor({ state: 'visible', timeout: 15_000 });
  }

  /** Выдача после «Найти» (текст «найдено») */
  async waitForSearchResults() {
    await this.page.getByText(/найдено/i).waitFor({ state: 'visible', timeout: 15_000 });
    await this._pause();
    await this.closeSubscribeBanner({ waitForAppear: true });
    await this.closeBanners();
  }

  /** Случайная карточка → модалка → дата → корзина в новой вкладке */
  async addRandomOfferToCart({ expectFlyAnimation = false } = {}) {
    await this.closeSubscribeBanner({ waitForAppear: false });

    let btns = this.page.locator('button.excursion-card__content-btn');
    if ((await btns.count()) === 0) {
      btns = this.page.frameLocator('iframe').first().locator('button.excursion-card__content-btn');
    }
    await btns.first().waitFor({ state: 'visible', timeout: 20_000 });

    const i = Math.floor(Math.random() * (await btns.count()));
    await btns.nth(i).scrollIntoViewIfNeeded();
    await btns.nth(i).click();
    await this._pause();

    const modal = this.page.locator('.excursion-modal');
    await modal.waitFor({ state: 'visible', timeout: 20_000 });
    await this.closeBanners();

    await modal.locator('.excursion-modal-main__buttons .calendar__field-button').click({ force: true });
    await modal
      .locator('.calendar-popup__cell-case:not(.calendar-popup__cell-gray) span.calendar-popup__text')
      .first()
      .click();

    const continueBtn = modal.getByRole('button', { name: 'Продолжить' });
    await expect(continueBtn).toBeEnabled({ timeout: 15_000 });
    await this.closeBanners();

    if (expectFlyAnimation) {
      const flyBall = this.page.locator('[class*="fly-to-cart"]').first();
      const [cartPage] = await Promise.all([
        this.page.context().waitForEvent('page', { timeout: 45_000 }),
        (async () => {
          await continueBtn.click();
          await expect(flyBall).toBeVisible({ timeout: 10_000 });
        })(),
      ]);
      await cartPage.waitForURL(/\/booking/i, { timeout: 45_000 });
      return new BasketPage(cartPage);
    }

    return BasketPage.openInNewTab(this.page, () => continueBtn.click());
  }

  /** Страна в форме поиска */
  async selectCountry(country = 'Египет') {
    await this.page.locator('.v-departure__pinput').first().click();
    await this._pause();
    await this.page.getByText(country, { exact: true }).click();
    await this._pause();
  }

  /** Город в форме поиска */
  async selectCity(city = 'Шарм-эль-Шейх') {
    await this.page.locator('#city-excursions-field-input > .v-departure__pinput').click();
    await this._pause();
    await this.closeBanners();
    await this.page.getByText(city, { exact: true }).last().click();
    await this._pause();
  }

  /** Календарь: +2 месяца, первая доступная дата */
  async _pickCalendarPopup() {
    const popup = this.page.locator('motion.div.calendar-popup, div.calendar-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10_000 });
    await popup.locator('.calendar-popup__arrow-right').click();
    await popup.locator('.calendar-popup__arrow-right').click();
    await popup.locator('span.calendar-popup__text').first().click();
    await this._pause();
  }

  /** Поле даты на форме экскурсий */
  async excursionPickDate(dateLabel = 'Дата экскурсии') {
    const dateField = this.page.locator('.calendar__field').filter({ hasText: dateLabel });
    await dateField.locator('.calendar__field-button').click();
    await this._pause();
    await this._pickCalendarPopup();
  }

  /** Кнопка «Найти» */
  async clickSearch() {
    await this.page.locator('button.v-search-button').click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ——— Сертификаты ———
  /** Номинал 10 ₽ */
  async selectCertificateNominalTenRubles() {
    const names = this.page.locator('input#name.form__field').filter({ visible: true });
    await names.first().waitFor({ state: 'visible', timeout: 25_000 });
    await expect(names).toHaveCount(2, { timeout: 15_000 });

    await this.page.locator('.v-icon-chevron-down-bold').first().click();
    await this.page.getByText(/10[\s\u202f]*₽/).first().click();
  }

  /** Отправитель и получатель */
  /**
 * @param {{
 *   senderName?: string,
 *   receiverName?: string,
 *   phone?: string,
 *   email?: string
 * }} [opts]
 */
  async fillCertificateSenderRecipient(opts = {}) {
    await this.closeBanners();

    const senderName = opts.senderName ?? 'Иванов Иван Иванович';
    const receiverName = opts.receiverName ?? 'Петрова Анна Ивановна';
    const phone = opts.phone ?? '7900123456';
    const email = opts.email ?? 'javaFsAutotest@fstravel.com';

    const names = this.page.locator('input#name.form__field').filter({ visible: true });
    await names.nth(0).fill(senderName);
    await names.nth(1).fill(receiverName);

    const phones = this.page.locator('input.vti__input').filter({ visible: true });
    await phones.nth(0).fill(phone);
    await phones.nth(1).fill(phone);

    const emails = this.page.locator('input.form__field#email').filter({ visible: true });
    await emails.nth(0).fill(email);
    await emails.nth(1).fill(email);
  }

  /** «Добавить в корзину» → новая вкладка */
  async clickAddToCart() {
    await this.closeBanners();
    const addBtn = this.page.getByText('Добавить в корзину', { exact: true });
    await addBtn.scrollIntoViewIfNeeded();
    return BasketPage.openInNewTab(this.page, () => addBtn.click());
  }

  async clickAddCertificateToCartPopup() {
    const basket = await this.clickAddToCart();
    return basket.page;
  }
}

module.exports = { SearchPage };
