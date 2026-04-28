const { test, expect } = require('@playwright/test');
const { FstravelTransfersPage } = require('../../../pages/transfers/FstravelTransfersPage');

test.describe('fstravel — трансферы (stage)', () => {
  test('страница поиска трансферов открывается', async ({ page }) => {
    const transfersPage = new FstravelTransfersPage(page);
    await transfersPage.open();

    await expect(page).toHaveURL(/\/searchtransfers/);
    await expect(page.locator('body')).toBeVisible();
  });
});
