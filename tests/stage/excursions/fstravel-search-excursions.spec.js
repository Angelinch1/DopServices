const { test, expect } = require('@playwright/test');
const { FstravelSearchExcursionsPage } = require('../../../pages/excursions/FstravelSearchExcursionsPage');

test.describe('fstravel — поиск экскурсий (stage)', () => {
  test('страница поиска экскурсий открывается', async ({ page }) => {
    const searchPage = new FstravelSearchExcursionsPage(page);
    await searchPage.open();

    await expect(page).toHaveURL(/\/searchexcursions/);
    await expect(page.locator('body')).toBeVisible();
  });
});
