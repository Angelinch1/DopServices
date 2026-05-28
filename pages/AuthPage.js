const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');
const { getBasketTestCredentials } = require('../config/basketCredentials');

class AuthPage extends BasePage {
  async _pause(ms = 500) {
    await this.page.waitForTimeout(ms);
  }

  /** Вход в корзине: «Войти или зарегистрироваться» */
  async authInBag() {
    await this.page.getByText('Войти или зарегистрироваться Вход или Регистрация').click();
    await this._pause();
    await this._login();
  }

  /** Вход через иконку пользователя в шапке */
  async authInBag2() {
    await this.page.locator('span.v-icon-user-14').click();
    await this._pause();
    await this._login();
  }

  async _login() {
    const { email, password } = getBasketTestCredentials();

    const emailInput = this.page.locator("input[name='LoginInput.Email']");
    const passInput = this.page.locator("input[name='LoginInput.Password']");

    await emailInput.waitFor({ state: 'visible', timeout: 12_000 });
    await this._pause();
    await emailInput.fill(email);
    await this._pause();
    await passInput.fill(password);
    await this._pause();
    await passInput.press('Enter');
    await expect(passInput).toBeHidden({ timeout: 15_000 }).catch(() => {});
  }
}

module.exports = { AuthPage };
