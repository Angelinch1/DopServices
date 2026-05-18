const { test, expect } = require('@playwright/test');
const { SearchPage } = require('../../../pages/SearchPage');

test.describe('fstravel — услуги в отеле (stage)', () => {
  test('страница услуг в отеле открывается', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('hotelServices');

    await expect(page).toHaveURL(/\/searchhotelservices/);
    await expect(page.locator('body')).toBeVisible();
  });
});
