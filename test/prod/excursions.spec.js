const { test, expect } = require('@playwright/test');
const { SearchPage } = require('../../pages/SearchPage');

test.describe('fstravel — поиск экскурсий (prod)', () => {
  test('страница поиска экскурсий открывается', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('excursions');

    await expect(page).toHaveURL(/\/searchexcursions/);
    await expect(page.locator('body')).toBeVisible();
  });

  test.describe('Корзина не авторизованного пользователя', () => {
    test('Корзина не авторизованного пользователя', async ({ page }) => {
      test.setTimeout(120_000);

      const search = new SearchPage(page);

      await test.step('Открыть страницу поиска экскурсий', async () => {
        await search.openBookingSection('excursions');
      });

      await test.step('Выбрать страну', async () => {
        await search.selectCountry('Египет');
      });

      await test.step('Выбрать город', async () => {
        await search.selectCity('Шарм-эль-Шейх');
      });

      await test.step('Выбрать дату', async () => {
        await search.excursionPickDate('Дата экскурсии');
      });

      await test.step('Нажать «Найти»', async () => {
        await search.clickSearch();
      });

      await test.step('Дождаться выдачи', async () => {
        await expect(page).toHaveURL(/searchexcursions/i);
        await search.waitForSearchResults();
      });

      let basket;
      await test.step('Добавить в корзину', async () => {
        basket = await search.addRandomOfferToCart();
      });

      await test.step('Открылась корзина с /booking', async () => {
        await basket.expectCartVisible();
      });

      await test.step('Нет блока «Заполните данные по туристам»', async () => {
        await expect(
          basket.page.getByText('Заполните данные по туристам', { exact: true }),
        ).toHaveCount(0);
      });
    });
  });
});
