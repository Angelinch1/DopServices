const { test, expect } = require('@playwright/test');
const { FstravelYachtRentPage } = require('../../../pages/AllPages');

test.describe('fstravel — аренда яхт (stage)', () => {
  test('страница поиска яхт открывается', async ({ page }) => {
    const yachtPage = new FstravelYachtRentPage(page);
    await yachtPage.open();

    await expect(page).toHaveURL(/\/searchyachtrent/);
    await expect(page.locator('body')).toBeVisible();
  });
});
