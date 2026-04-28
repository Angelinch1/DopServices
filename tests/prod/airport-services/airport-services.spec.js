const { test, expect } = require('@playwright/test');
const { FstravelAirportServicesPage } = require('../../../pages/airport-services/FstravelAirportServicesPage');

test.describe('fstravel — услуги в аэропорту (prod)', () => {
  test('страница услуг в аэропорту открывается', async ({ page }) => {
    const airportPage = new FstravelAirportServicesPage(page);
    await airportPage.open();

    await expect(page).toHaveURL(/\/searchairportservices/);
    await expect(page.locator('body')).toBeVisible();
  });
});
