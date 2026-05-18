const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

class AuthPage extends BasePage {
  async authInBag() {
    await this.page.getByText('Войти или зарегистрироваться', { exact: true }).click();
    await this._login();
  }

  async authInBag2() {
    await this.page.locator('span.v-icon-user-14').click();
    await this._login();
  }

  async _login() {
    const email = process.env.CART_LOGIN_EMAIL;
    const password = process.env.CART_LOGIN_PASSWORD;
    if (!email || !password) {
      throw new Error('Задайте CART_LOGIN_EMAIL и CART_LOGIN_PASSWORD в .env');
    }

    const emailInput = this.page.locator("input[name='LoginInput.Email']");
    const passInput = this.page.locator("input[name='LoginInput.Password']");

    await emailInput.waitFor({ state: 'visible', timeout: 12_000 });
    await emailInput.fill(email);
    await passInput.fill(password);
    await this.page.waitForTimeout(2000);
    await passInput.press('Enter');
    await expect(passInput).toBeHidden({ timeout: 15_000 }).catch(() => {});
  }
}

module.exports = { AuthPage };
