const { test, expect } = require('@playwright/test');
const {
  FstravelCertificatesPage,
  isCertificatePostAddTargetUrl,
} = require('../../../pages/AllPages');

test.describe('fstravel — сертификаты (prod)', () => {
  test.describe.configure({ mode: 'serial' });

  test('страница сертификатов открывается', async ({ page }) => {
    const certificatesPage = new FstravelCertificatesPage(page);
    await certificatesPage.open();

    await expect(page).toHaveURL(/\/certificates/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('добавление сертификата в корзину', async ({ page }) => {
    test.setTimeout(120_000);

    const certificatesPage = new FstravelCertificatesPage(page);

    await test.step('Открытие страницы сертификатов', async () => {
      await certificatesPage.open();
      await expect(page).toHaveURL(/\/certificates/);
    });

    await test.step('Выбор номинала 10 ₽', async () => {
      await certificatesPage.selectCertificateNominalTenRubles();
    });

    await test.step('Заполнение данных отправителя и получателя', async () => {
      await certificatesPage.fillCertificateSenderRecipient();
    });

    const cartPage = await test.step('Добавить в корзину', async () =>
      certificatesPage.clickAddCertificateToCartPopup());

    await expect(cartPage).toHaveURL((url) => isCertificatePostAddTargetUrl(url.toString()), {
      timeout: 30_000,
    });
    await expect(cartPage.locator('body')).toBeVisible({ timeout: 15_000 });
  });
});
