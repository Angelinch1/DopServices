const { test, expect } = require('@playwright/test');
const { SearchPage } = require('../pages/SearchPage');

test.describe('fstravel — услуги в аэропорту', () => {
  test('Страница услуг в аэропорту', async ({ page }) => {
    // связь автотеста с TestIt
    //testit.externalId('a076d00ff56e492f0f738721491300dd');
    //testit.workItemIds(['d312ba72-df6f-431e-8804-8aa0da008d34']);
    //testit.displayName('Страница услуг в аэропорту');

    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('airportServices');

    await expect(page).toHaveURL(/\/searchairportservices/);
    await expect(page.locator('body')).toBeVisible();
  });
});
