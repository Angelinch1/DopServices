const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class BasketPage extends BasePage {
  async booking() {
    const btn = this.page.locator('div.theme-yellow-booking').filter({ visible: true }).first();
    await expect(btn).toBeVisible({ timeout: 10_000 });
    await btn.click();
  }

  async fillTouristData() {
    await this.page.locator('#lastName').fill('Петров');
    await this.page.locator('#firstName').fill('Сергей');
    await this.page.locator('#middleName').fill('Иванович');
    await this.page.locator('#lastName').fill('Петров');

    await this.page.getByText('Номер документа', { exact: true }).locator('..').locator('input').fill('124416');
    await this.page.getByText(/[CС]ерия документа/).locator('..').locator('input').fill('1566');
  }

  async bookingCertificates() {
    const btn = this.page.locator('div.theme-yellow-booking').filter({ visible: true }).first();
    await btn.scrollIntoViewIfNeeded();
    await expect(btn).toBeEnabled();
    await btn.click();
  }

  async getBookingNumberFromPayHeader() {
    const header = this.page.locator('h4.bookingPay__header-text');
    await header.waitFor({ state: 'visible', timeout: 20_000 });
    return (await header.innerText()).replace(/\D+/g, '');
  }
}

module.exports = { BasketPage };
