const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');
const { SearchPage } = require('../pages/SearchPage');

test.describe('fstravel — аренда яхт', () => {
  test('Страница поиска яхт', async ({ page }) => {
    // связь автотеста с TestIt
    testit.externalId('027bcb274793bea6595e691c361205bc');
    testit.workItemIds(['c5b57752-9e5c-4dfc-8b4d-33cdfccc760c']);
    testit.displayName('Страница поиска яхт');

    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('yachts');

    await expect(page).toHaveURL(/\/searchyachtrent/);
    await expect(page.locator('body')).toBeVisible();
  });
});
