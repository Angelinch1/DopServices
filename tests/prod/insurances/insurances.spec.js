const { test, expect } = require('@playwright/test');
const { FstravelSearchInsurancesPage } = require('../../../pages/AllPages');

test.describe('fstravel — страхование (prod)', () => {
  test('страница поиска страховок открывается', async ({ page }) => {
    const insurancesPage = new FstravelSearchInsurancesPage(page);
    await insurancesPage.open();

    await expect(page).toHaveURL(/\/searchinsurances/);
    await expect(page.locator('body')).toBeVisible();
  });
});
