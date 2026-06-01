const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');
const { getBasketTestCredentials } = require('../config/basketCredentials');

const pause = (page, ms = 500) => page.waitForTimeout(ms);

test.describe('fstravel — все доп. услуги', () => {
  test('Блок «Сделайте своё путешествие ярче»', async ({ page }) => {
    testit.externalId('b044cf61d4f7184f4148d51366360fdf');
    testit.workItemIds(['04cacc3a-5649-4ac3-8aeb-d5b191013c48']);
    testit.displayName('Блок «Сделайте своё путешествие ярче»');

    const { email, password } = getBasketTestCredentials();

    await test.step('Авторизация на главной', async () => {
      await page.goto('/');
      await pause(page);
      await page.getByRole('img').nth(3).click();
      await pause(page);

      await page.locator("input[name='LoginInput.Email']").fill(email);
      await pause(page);
      await page.locator("input[name='LoginInput.Password']").fill(password);
      await pause(page);
      await page.locator("input[name='LoginInput.Password']").press('Enter');
      await pause(page);

      await expect(page.locator('.account-icon').first()).toBeVisible({
        timeout: 15_000,
      });
    });

    await test.step('Переход в ЛК', async () => {
      await page.locator('.account-icon').first().click();
      await pause(page);
      await page.getByRole('link', { name: 'Профиль' }).click();
      await pause(page);
      await expect(page).toHaveURL(/\/cabinet\/profile\/?/);
    });

    await test.step('Переход на страницу /cabinet/', async () => {
      await page.locator('.back .circle-bg').first().click();
      await pause(page);
      await expect(page).toHaveURL(/\/cabinet\/?$/);
    });

    await test.step('Блока «Сделайте своё путешествие ярче» нет', async () => {
      await page.waitForTimeout(3000);
      await expect(
        page.getByText('Сделайте своё путешествие ярче', { exact: true }),
      ).toHaveCount(0);
    });
  });
});
