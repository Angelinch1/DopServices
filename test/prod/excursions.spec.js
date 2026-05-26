const { test, expect } = require('@playwright/test');
const { SearchPage } = require('../../pages/SearchPage');
const { AuthPage } = require('../../pages/AuthPage');

const pause = (page, ms = 1500) => page.waitForTimeout(ms);

test.describe('fstravel — поиск экскурсий (prod)', () => {
  test('Страница поиска экскурсий открывается', async ({ page }) => {
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('excursions');

    await expect(page).toHaveURL(/\/searchexcursions/);
    await expect(page.locator('body')).toBeVisible();
  });

  test.describe('Корзина экскурсии не авторизованного пользователя', () => {
    test('Корзина экскурсии не авторизованного пользователя', async ({ page }) => {
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

      await test.step('Нет текста «Заполните данные по туристам»', async () => {
        await expect(
          basket.page.getByText('Заполните данные по туристам', { exact: true }),
        ).toHaveCount(0);
      });
    });
  });

  test.describe('Валидация к полю выбора отеля', () => {
    test('Валидация к полю выбора отеля проживания на курорте', async ({ page }) => {
      test.setTimeout(120_000);

      const validation = 'Укажите место, откуда Вас заберет гид';
      const search = new SearchPage(page);

      await search.openBookingSection('excursions');
      await pause(page);
      await search.selectCountry('Египет');
      await pause(page);
      await search.selectCity('Шарм-эль-Шейх');
      await pause(page);
      await search.excursionPickDate('Дата экскурсии');
      await pause(page);
      await search.clickSearch();
      await pause(page);
      await expect(page).toHaveURL(/searchexcursions/i);
      await search.waitForSearchResults();
      await pause(page);

      const basket = await search.addRandomOfferToCart();
      await basket.expectCartVisible();
      await pause(basket.page);

      const cart = basket.page;

      await test.step('Авторизация в корзине', async () => {
        await new AuthPage(cart).authInBag();
        await pause(cart);
      });

      const hotelField = cart.getByRole('textbox', { name: 'Выберите отель проживания*' });

      const clickHotelField = async () => {
        await basket.closeBanners();
        await hotelField.scrollIntoViewIfNeeded();
        await expect(hotelField).toBeEnabled({ timeout: 10_000 });
        await hotelField.click({ force: true });
        await pause(cart, 400);
      };

      /** Список после клика может остаться открытым — тогда blur не убирает фокус с поля */
      const leaveHotelField = async () => {
        await cart.keyboard.press('Escape');
        await pause(cart, 400);
        await hotelField.blur();
        await pause(cart, 300);
        await cart.getByText('Отель проживания на курорте', { exact: true }).click();
        await pause(cart);
      };

      await test.step('Нажать на поле «Выберите отель проживания»', async () => {
        await clickHotelField();
      });

      await test.step('Убрать фокус — отображается валидация', async () => {
        await leaveHotelField();
        await expect(cart.getByText(validation)).toBeVisible();
      });

      await test.step('Нажать на поле и выбрать отель — валидация пропадает', async () => {
        await clickHotelField();
        const hauza = cart.getByText('Hauza').first();
        await hauza.waitFor({ state: 'visible', timeout: 20_000 });
        await hauza.click();
        await pause(cart);
        await expect(cart.getByText(validation)).toHaveCount(0);
      });

      await test.step('Повторно нажать на поле и убрать фокус — без валидации, в поле выбранный отель', async () => {
        await clickHotelField();
        await leaveHotelField();
        await expect(cart.getByText(validation)).toHaveCount(0);
        await expect(hotelField).toHaveValue(/Hauza/i);
      });
    });
  });
});
