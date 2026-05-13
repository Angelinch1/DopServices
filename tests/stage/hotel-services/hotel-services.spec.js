const { test, expect } = require('@playwright/test');
const { FstravelHotelServicesPage } = require('../../../pages/AllPages');

test.describe('fstravel — услуги в отеле (stage)', () => {
  test('страница услуг в отеле открывается', async ({ page }) => {
    const hotelPage = new FstravelHotelServicesPage(page);
    await hotelPage.open();

    await expect(page).toHaveURL(/\/searchhotelservices/);
    await expect(page.locator('body')).toBeVisible();
  });
});
