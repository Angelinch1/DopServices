const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');
const { SearchPage } = require('../pages/SearchPage');

test.describe('fstravel — трансферы', () => {
  test('Страница поиска трансферов', async ({ page }) => {
    // связь автотеста с TestIt
    testit.externalId('3e35a98f9307942559350f367b491129');
    testit.workItemIds(['2e313b54-21c7-4ff9-ac7a-c5e23a1e0c15']);
    testit.displayName('Страница поиска трансферов');

    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('transfers');

    await expect(page).toHaveURL(/\/searchtransfers/);
    await expect(page.locator('body')).toBeVisible();
  });
});
