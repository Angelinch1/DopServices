const { test, expect } = require('@playwright/test');
const { SearchPage } = require('../../../pages/SearchPage');

test.describe('fstravel — поиск экскурсий (stage)', () => {
  test('страница поиска экскурсий открывается', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('excursions');

    await expect(page).toHaveURL(/\/searchexcursions/);
    await expect(page.locator('body')).toBeVisible();
  });
});
