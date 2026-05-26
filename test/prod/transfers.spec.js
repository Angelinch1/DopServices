const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');
const { SearchPage } = require('../../pages/SearchPage');

test.describe('fstravel — трансферы (prod)', () => {
  test('Страница поиска трансферов открывается', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('transfers');

    await expect(page).toHaveURL(/\/searchtransfers/);
    await expect(page.locator('body')).toBeVisible();
  });
});
