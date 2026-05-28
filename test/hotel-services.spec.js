const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');
const { SearchPage } = require('../pages/SearchPage');

test.describe('fstravel — услуги в отеле', () => {
  test('Страница поиска услуг в отеле', async ({ page }) => {
    // связь автотеста с TestIt
    testit.externalId('fe326add712ef0c8bf06a48d297dab35');
    testit.workItemIds(['af781a8b-5f45-4f86-b827-abf86f400089']);
    testit.displayName('Страница поиска услуг в отеле');

    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('hotelServices');

    await expect(page).toHaveURL(/\/searchhotelservices/);
    await expect(page.locator('body')).toBeVisible();
  });
});
