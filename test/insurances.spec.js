const { test, expect } = require('@playwright/test');
const { testit } = require('testit-adapter-playwright');

test.describe('fstravel — страхование', () => {
  test('Страница поиска страховок', async ({ page }) => {
    // связь автотеста с TestIt
    //testit.externalId('5f683de3ef89e828128409129474b71a');
    //testit.workItemIds(['16c41edf-8601-4989-9169-93a49a0695f4']);
    //testit.displayName('Страница поиска страховок');

    await page.goto('/searchinsurances', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/searchinsurances/);
    await expect(page.locator('body')).toBeVisible();
  });
});
