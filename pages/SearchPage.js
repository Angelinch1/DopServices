const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const bookingUrls = require('../config/bookingUrls');

class SearchPage extends BasePage {
  constructor(page) {
    super(page);
    this._bannerHandlerInstalled = false;
  }

  async pause(ms = 1500) {
    await this.page.waitForTimeout(ms);
  }

  /** @param {keyof typeof bookingUrls} section */
  async openBookingSection(section) {
    const path = bookingUrls[section];
    if (!path) throw new Error(`Неизвестный раздел: ${section}`);

    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlays();

    if (section === 'certificates') return;

    await this.page.locator('.v-departure__pinput').first().waitFor({ state: 'visible', timeout: 15_000 });
    await this.setupBannerHandler();
    await this.closePopups();
  }

  async setupBannerHandler() {
    if (this._bannerHandlerInstalled) return;
    this._bannerHandlerInstalled = true;
    const banner = this.page.getByText('Будьте в курсе');
    await this.page.addLocatorHandler(banner, () => this.closePopups());
  }

  async closePopups() {
    const p = this.page;
    await p.keyboard.press('Escape').catch(() => {});
    await p.locator('button.close[data-dismiss="modal"]').click({ timeout: 1500 }).catch(() => {});
    await p.getByRole('button', { name: /Нет,?\s*спасибо/i }).first().click({ timeout: 1000 }).catch(() => {});
  }

  async reloadSearchResults() {
    await this.page.getByText(/найдено/i).waitFor({ state: 'visible', timeout: 30_000 });
    await this.page.waitForTimeout(3000);
    await this.page.reload();
    await this.page.getByText(/найдено/i).waitFor({ state: 'visible', timeout: 30_000 });
  }

  async addRandomOfferToCart() {
    let btns = this.page.locator('button.excursion-card__content-btn');
    if ((await btns.count()) === 0) {
      btns = this.page.frameLocator('iframe').first().locator('button.excursion-card__content-btn');
    }
    await btns.first().waitFor({ state: 'visible', timeout: 20_000 });

    const i = Math.floor(Math.random() * (await btns.count()));
    await btns.nth(i).click();

    const modal = this.page.locator('.excursion-modal');
    await modal.waitFor({ state: 'visible', timeout: 20_000 });
    await modal.locator('.excursion-modal-main__buttons .calendar__field-button').click();
    await modal.locator('.calendar-popup').waitFor({ state: 'visible', timeout: 10_000 });
    await modal
      .locator('.calendar-popup__cell-case:not(.calendar-popup__cell-gray) span.calendar-popup__text')
      .first()
      .click();

    const continueBtn = modal.getByRole('button', { name: 'Продолжить' });
    await expect(continueBtn).toBeEnabled({ timeout: 15_000 });

    const [bookingTab] = await Promise.all([
      this.page.context().waitForEvent('page', { timeout: 30_000 }),
      continueBtn.click(),
    ]);
    await bookingTab.waitForURL(/\/booking/i, { timeout: 30_000 });
    return bookingTab;
  }

  async selectCountry(country = 'Египет') {
    await this.page.locator('.v-departure__pinput').first().click();
    await this.pause(1000);
    await this.page.getByText(country, { exact: true }).click();
    await this.pause();
  }

  async selectCity(city = 'Шарм-эль-Шейх') {
    await this.page.locator('#city-excursions-field-input > .v-departure__pinput').click();
    await this.pause(1000);
    await this.closePopups();
    await this.page.getByText(city, { exact: true }).last().click();
    await this.pause();
  }

  async pickCalendarDate() {
    const popup = this.page.locator('div.calendar-popup').first();
    await popup.waitFor({ state: 'visible', timeout: 10_000 });
    await popup.locator('.calendar-popup__arrow-right').click();
    await popup.locator('.calendar-popup__arrow-right').click();
    await popup.locator('span.calendar-popup__text').first().click();
    await this.pause();
  }

  async excursionPickDate(dateLabel = 'Дата экскурсии') {
    await this.page.locator('.calendar__field').filter({ hasText: dateLabel }).locator('.calendar__field-button').click();
    await this.pause(1000);
    await this.pickCalendarDate();
  }

  async airportPickDate() {
    await this.page.locator('.calendar__field').filter({ hasText: 'Даты поездки' }).locator('.calendar__field-button').click();
    await this.pause(1000);
    await this.pickCalendarDate();
  }

  async pickServiceDate() {
    await this.page.getByText('Дата Выбрать').click();
    await this.pause(1000);
    await this.pickCalendarDate();
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
    await this.dismissOverlays(4);
    await this.closePopups();

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

  /** Корзина открывается в новой вкладке с /booking в URL */
  async clickAddCertificateToCartPopup() {
    await this.closePopups();
    const addBtn = this.page.getByText('Добавить в корзину', { exact: true });
    await addBtn.scrollIntoViewIfNeeded();

    const [cartPage] = await Promise.all([
      this.page.waitForEvent('popup', { timeout: 45_000 }),
      addBtn.click(),
    ]);
    await cartPage.waitForURL(/\/booking/i, { timeout: 45_000 });
    return cartPage;
  }
}

module.exports = { SearchPage };
