const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');
const { SearchPage } = require('../../pages/SearchPage');

test.describe('fstravel — аренда яхт (stage)', () => {
  test('страница поиска яхт открывается', async ({ page }) => {
    // связь автотеста с TestIt
    testit.externalId('000');
    testit.workItemIds(['000']);
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('yachts');

    await expect(page).toHaveURL(/\/searchyachtrent/);
    await expect(page.locator('body')).toBeVisible();
  });
});
