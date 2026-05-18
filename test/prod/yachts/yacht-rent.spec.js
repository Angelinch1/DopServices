const { test, expect } = require('@playwright/test');
const { SearchPage } = require('../../../pages/SearchPage');

test.describe('fstravel — аренда яхт (prod)', () => {
  test('страница поиска яхт открывается', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('yachts');

    await expect(page).toHaveURL(/\/searchyachtrent/);
    await expect(page.locator('body')).toBeVisible();
  });
});
