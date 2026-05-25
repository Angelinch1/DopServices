const { test, expect } = require('@playwright/test');
const { SearchPage } = require('../../pages/SearchPage');

test.describe('fstravel — услуги в аэропорту (prod)', () => {
  test('страница услуг в аэропорту открывается', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('airportServices');

    await expect(page).toHaveURL(/\/searchairportservices/);
    await expect(page.locator('body')).toBeVisible();
  });
});
