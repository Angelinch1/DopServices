const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { BasketPage } = require('./BasketPage');
const bookingUrls = require('../config/bookingUrls');

/** Поиск туров / доп. услуг: форма страна–город–дата, выдача */
class SearchPage extends BasePage {
  /** Пауза между шагами (как раньше в проекте, дефолт 1500 ms) */
  async pause(ms = 1500) {
    await this._pause(ms);
  }

  async _pause(ms = 1000) {
    await this.page.waitForTimeout(ms);
  }

  /** @param {keyof typeof bookingUrls} section */
  async openBookingSection(section) {
    const url = bookingUrls[section];
    if (!url) throw new Error(`Неизвестный раздел: ${section}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    const ready =
      section === 'certificates'
        ? this.page.locator('input#name.form__field').first()
        : this.page.locator('.v-departure__pinput').first();
    await ready.waitFor({ state: 'visible', timeout: 15_000 });
    await this.ensureAutoCloseBanners();
    await this.closeBanners();
  }

  /** Дождаться выдачи и закрыть баннеры */
  async waitForSearchResults() {
    await this.page.getByText(/найдено/i).waitFor({ state: 'visible', timeout: 15_000 });
    await this._pause();
    await this.closeSubscribeBanner({ waitForAppear: true });
    await this.closeBanners();
  }

  async reloadSearchResults() {
    await this.page.getByText(/найдено/i).waitFor({ state: 'visible', timeout: 30_000 });
    await this.page.waitForTimeout(3000);
    await this.page.reload();
    await this.page.getByText(/найдено/i).waitFor({ state: 'visible', timeout: 30_000 });
  }

  /** Случайная карточка и добавление в корзину */
  async addRandomOfferToCart() {
    await this.closeSubscribeBanner({ waitForAppear: false });

    let btns = this.page.locator('button.excursion-card__content-btn');
    if ((await btns.count()) === 0) {
      btns = this.page.frameLocator('iframe').first().locator('button.excursion-card__content-btn');
    }
    await btns.first().waitFor({ state: 'visible', timeout: 20_000 });
    const n = await btns.count();
    const i = Math.floor(Math.random() * n);
    await btns.nth(i).scrollIntoViewIfNeeded();
    await btns.nth(i).click();
    await this._pause();

    const modal = this.page.locator('.excursion-modal');
    await modal.waitFor({ state: 'visible', timeout: 20_000 });
    await this._pause();
    await this.closeBanners();

    const calendarBtn = modal.locator('.excursion-modal-main__buttons .calendar__field-button');
    await this.closeBanners();
    await calendarBtn.click({ force: true });
    await modal
      .locator('.calendar-popup__cell-case:not(.calendar-popup__cell-gray) span.calendar-popup__text')
      .first()
      .click();

    const continueBtn = modal.getByRole('button', { name: 'Продолжить' });
    await expect(continueBtn).toBeEnabled({ timeout: 15_000 });
    await this.closeBanners();
    await this._pause();
    return BasketPage.openInNewTab(this.page, () => continueBtn.click());
  }

  async selectCountry(country = 'Египет') {
    await this.page.locator('.v-departure__pinput').first().click();
    await this._pause();
    await this.page.getByText(country, { exact: true }).click();
    await this._pause();
  }

  async selectCity(city = 'Шарм-эль-Шейх') {
    await this.page.locator('#city-excursions-field-input > .v-departure__pinput').click();
    await this._pause();
    await this.closeBanners();
    await this.page.getByText(city, { exact: true }).last().click();
    await this._pause();
  }

  async _pickCalendarPopup() {
    const popup = this.page.locator('motion.div.calendar-popup, div.calendar-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10_000 });
    const nextMonth = popup.locator('.calendar-popup__arrow-right');
    await nextMonth.click();
    await nextMonth.click();
    await popup.locator('span.calendar-popup__text').first().click();
    await this._pause();
  }

  async excursionPickDate(dateLabel = 'Дата экскурсии') {
    const dateField = this.page.locator('.calendar__field').filter({ hasText: dateLabel });
    await dateField.locator('.calendar__field-button').click();
    await this._pause();
    await this._pickCalendarPopup();
  }

  async airportPickDate() {
    const dateField = this.page.locator('.calendar__field').filter({ hasText: 'Даты поездки' });
    await dateField.locator('.calendar__field-button').click();
    await this._pause();
    await this._pickCalendarPopup();
  }

  async hotelPickDate() {
    await this.page.getByText('Дата Выбрать').click();
    await this._pause();
    await this._pickCalendarPopup();
  }

  async yachtPickDate() {
    await this.page.getByText('Дата Выбрать').click();
    await this._pause();
    await this._pickCalendarPopup();
  }

  /** Услуги в отеле / аэропорту: поле «Дата Выбрать» */
  async pickServiceDate() {
    await this.hotelPickDate();
  }

  async clickSearch() {
    await this.page.locator('button.v-search-button').click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  // Сертификаты

  async selectCertificateNominalTenRubles() {
    const names = this.page.locator('input#name.form__field').filter({ visible: true });
    await names.first().waitFor({ state: 'visible', timeout: 25_000 });
    await expect(names).toHaveCount(2, { timeout: 15_000 });

    await this.page.locator('.v-icon-chevron-down-bold').first().click();
    await this.page.getByText(/10[\s\u202f]*₽/).first().click();
  }

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

  /** «Добавить в корзину» на странице сертификата */
  async clickAddToCart() {
    await this.closeBanners();
    const addBtn = this.page.getByText('Добавить в корзину', { exact: true });
    await addBtn.scrollIntoViewIfNeeded();
    return BasketPage.openInNewTab(this.page, () => addBtn.click());
  }

  /** Как {@link clickAddToCart}, но возвращает `Page` для существующих тестов */
  async clickAddCertificateToCartPopup() {
    const basket = await this.clickAddToCart();
    return basket.page;
  }
}

module.exports = { SearchPage };
