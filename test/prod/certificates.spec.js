const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');
const { SearchPage } = require('../../pages/SearchPage');

const pause = (page, ms = 1500) => page.waitForTimeout(ms);

test.describe('fstravel — сертификаты (prod)', () => {
  test.describe.configure({ mode: 'serial' });

  test('страница сертификатов открывается', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('certificates');

    await expect(page).toHaveURL(/\/certificates/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('добавление сертификата в корзину', async ({ page }) => {
    // связь автотеста с TestIt
    testit.externalId('000');
    testit.workItemIds(['000']); 
    test.setTimeout(120_000);

    const searchPage = new SearchPage(page);

    await test.step('Открытие страницы сертификатов', async () => {
      await searchPage.openBookingSection('certificates');
      await expect(page).toHaveURL(/\/certificates/);
    });
    await pause(page, 2000);

    await test.step('Выбор номинала 10 ₽', async () => {
      await searchPage.selectCertificateNominalTenRubles();
    });
    await pause(page);

    await test.step('Заполнение данных отправителя и получателя', async () => {
      await searchPage.fillCertificateSenderRecipient();
    });
    await pause(page, 2000);

    const cartPage = await test.step('Добавить в корзину', async () =>
      searchPage.clickAddCertificateToCartPopup());
    await pause(page);

    await expect(cartPage).toHaveURL(/\/booking/i, { timeout: 30_000 });
    await expect(cartPage.locator('body')).toBeVisible({ timeout: 15_000 });
  });
});
