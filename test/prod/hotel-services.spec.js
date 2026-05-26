const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');
const { SearchPage } = require('../../pages/SearchPage');

test.describe('fstravel — услуги в отеле (prod)', () => {
  test('Страница услуг в отеле открывается', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('hotelServices');

    await expect(page).toHaveURL(/\/searchhotelservices/);
    await expect(page.locator('body')).toBeVisible();
  });
});
