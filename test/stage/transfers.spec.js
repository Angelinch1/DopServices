const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');
const { SearchPage } = require('../../pages/SearchPage');

test.describe('fstravel — трансферы (stage)', () => {
  test('страница поиска трансферов открывается', async ({ page }) => {
    // связь автотеста с TestIt
    testit.externalId('000');
    testit.workItemIds(['000']);
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('transfers');

    await expect(page).toHaveURL(/\/searchtransfers/);
    await expect(page.locator('body')).toBeVisible();
  });
});
