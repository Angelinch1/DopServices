const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');
const { SearchPage } = require('../pages/SearchPage');

const pause = (page, ms = 500) => page.waitForTimeout(ms);

test.describe('fstravel — сертификаты', () => {
  test.describe.configure({ mode: 'serial' });

  test('Страница сертификатов', async ({ page }) => {
    // связь автотеста с TestIt
    testit.externalId('396bee689824a0cfd677e7e95b001be1');
    //testit.workItemIds(['']);
    testit.displayName('Страница сертификатов');

    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('certificates');

    await expect(page).toHaveURL(/\/certificates/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Добавление сертификата в корзину', async ({ page }) => {
    // связь автотеста с TestIt
    testit.externalId('08fb10e9-0d98-4f11-99e9-57d1e2574703');
    testit.workItemIds(['bedc097b-9566-45a9-9a5f-00b38ac8153c']);
    testit.displayName('Добавление сертификата в корзину');
    test.setTimeout(120_000);

    const searchPage = new SearchPage(page);

    await test.step('Открытие страницы сертификатов', async () => {
      await searchPage.openBookingSection('certificates');
      await expect(page).toHaveURL(/\/certificates/);
    });
    await pause(page);

    await test.step('Выбор номинала 10 ₽', async () => {
      await searchPage.selectCertificateNominalTenRubles();
    });
    await pause(page);

    await test.step('Заполнение данных отправителя и получателя', async () => {
      await searchPage.fillCertificateSenderRecipient();
    });
    await pause(page);

    const cartPage = await test.step('Добавить в корзину', async () =>
      searchPage.clickAddCertificateToCartPopup());
    await pause(page);

    await expect(cartPage).toHaveURL(/\/booking/i, { timeout: 30_000 });
    await expect(cartPage.locator('body')).toBeVisible({ timeout: 15_000 });
  });
});
