const { test, expect } = require('@playwright/test');
const { SearchPage } = require('../../pages/SearchPage');

test.describe('fstravel — страхование (stage)', () => {
  test('страница поиска страхования открывается', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('insurances');

    await expect(page).toHaveURL(/\/searchinsurances/);
    await expect(page.locator('body')).toBeVisible();
  });
});
