const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class BasketPage extends BasePage {
  /**
   * Клик открытия корзины в новой вкладке с /booking
   * @param {import('@playwright/test').Page} fromPage
   * @param {() => Promise<void>} click
   */
  static async openInNewTab(fromPage, click) {
    const [cartPage] = await Promise.all([
      fromPage.context().waitForEvent('page', { timeout: 45_000 }),
      click(),
    ]);
    await cartPage.waitForURL(/\/booking/i, { timeout: 45_000 });
    return new BasketPage(cartPage);
  }

  /** Корзина отображается после авторизации */
  async expectCartVisible() {
    await expect(this.page).toHaveURL(/\/booking/i, { timeout: 30_000 });
    await expect(this.page.locator('body')).toBeVisible({ timeout: 15_000 });
  }

  async _clickBookButton() {
    const btn = this.page.locator('.v-button').first();
    await btn.scrollIntoViewIfNeeded();
    await expect(btn).toBeEnabled({ timeout: 10_000 });
    await this._pause();
    await btn.click();
  }

  async booking() {
    await this._clickBookButton();
  }

  async _pause(ms = 1000) {
    await this.page.waitForTimeout(ms);
  }

  async fillTouristData() {
    await this.page.locator('#lastName').fill('Петров');
    await this._pause();
    await this.page.locator('#firstName').fill('Сергей');
    await this._pause();
    await this.page.locator('#middleName').fill('Иванович');
    await this._pause();
    await this.page.getByText('Номер документа', { exact: true }).locator('..').locator('input').fill('124416');
    await this._pause();
    await this.page.getByText(/[CС]ерия документа/).locator('..').locator('input').fill('1566');
  }

  /** Поле «Отель проживания» (экскурсии) */
  async fillHotelStay(hotel = 'Тест') {
    const hotelField = this.page.getByRole('textbox', { name: 'Выберите отель проживания*' });
    await hotelField.click();
    await this._pause();
    await hotelField.fill(hotel);
  }

  async bookingCertificate() {
    await this._clickBookButton();
  }

  /** Страница успешного бронирования */
  async expectBookingSuccessPage() {
    const header = this.page.locator('h4.bookingPay__header-text');
    await header.waitFor({ state: 'visible', timeout: 20_000 });
    await this.page.waitForTimeout(2000);
  }

  async getBookingNumberFromPayHeader() {
    const header = this.page.locator('h4.bookingPay__header-text');
    await header.waitFor({ state: 'visible', timeout: 20_000 });
    return (await header.innerText()).replace(/\D+/g, '');
  }
}

module.exports = { BasketPage };
