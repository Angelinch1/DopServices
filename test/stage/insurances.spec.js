const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');
const { SearchPage } = require('../../pages/SearchPage');

test.describe('fstravel — страхование (stage)', () => {
  test('страница поиска страхования открывается', async ({ page }) => {
    // связь автотеста с TestIt
    testit.externalId('000');
    testit.workItemIds(['000']);
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('insurances');

    await expect(page).toHaveURL(/\/searchinsurances/);
    await expect(page.locator('body')).toBeVisible();
  });
});
