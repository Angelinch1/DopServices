const { test, expect } = require('@playwright/test');
const { FstravelCertificatesPage } = require('../../../pages/certificates/FstravelCertificatesPage');

test.describe('fstravel — сертификаты (stage)', () => {
  test('страница сертификатов открывается', async ({ page }) => {
    const certificatesPage = new FstravelCertificatesPage(page);
    await certificatesPage.open();

    await expect(page).toHaveURL(/\/certificates/);
    await expect(page.locator('body')).toBeVisible();
  });
});
