const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');
const { SearchPage } = require('../../pages/SearchPage');

test.describe('fstravel — услуги в аэропорту (stage)', () => {
  test('страница услуг в аэропорту открывается', async ({ page }) => {
    // связь автотеста с TestIt
    testit.externalId('000');
    testit.workItemIds(['000']);
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('airportServices');

    await expect(page).toHaveURL(/\/searchairportservices/);
    await expect(page.locator('body')).toBeVisible();
  });
});
