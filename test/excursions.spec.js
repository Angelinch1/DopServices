const { test, expect } = require('@playwright/test');
//const { testit } = require('testit-adapter-playwright');
const { SearchPage } = require('../pages/SearchPage');
const { AuthPage } = require('../pages/AuthPage');
const { getBasketTestCredentials } = require('../config/basketCredentials');
const { BasketPage } = require('../pages/BasketPage');
/**
 * @param {import('@playwright/test').Page} page
 * @param {number} [ms=500]
 */
const pause = (page, ms = 500) => page.waitForTimeout(ms);

test.describe('fstravel — поиск экскурсий', () => {
  test('Страница поиска экскурсий', async ({ page }) => {
    // связь автотеста с TestIt
    //testit.externalId('958574fb2b3bba1790177c0a52006332');
    //testit.workItemIds(['9b84744b-3d03-4814-8e0a-2f6e017a0309']);
    //testit.displayName('Страница поиска экскурсий');
    const searchPage = new SearchPage(page);
    await searchPage.openBookingSection('excursions');

    await expect(page).toHaveURL(/\/searchexcursions/);
    await expect(page.locator('body')).toBeVisible();
  });

  test.describe('Корзина не авторизованного пользователя', () => {
    test('Корзина не авторизованного пользователя', async ({ page }) => {
      // связь автотеста с TestIt
      //testit.externalId('634a907d9a9b76952051bf22ce070bce');
      //testit.workItemIds(['4b1159bb-d715-467a-afaa-457ed0059815']);
      //testit.displayName('Корзина не авторизованного пользователя');
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

      /** @type {BasketPage} */
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

  test('Анимация перехода в корзину на доп. услугах', async ({ page }) => {
    // связь автотеста с TestIt
    //testit.externalId('189c9980-5cf9-4622-be56-68705ad4603b');
    //testit.workItemIds(['525221fa446b1f4b532ba8c1fc1123a7']);
    //testit.displayName('Анимация перехода в корзину на доп. услугах');
    test.setTimeout(120_000);

    const search = new SearchPage(page);
    const { email, password } = getBasketTestCredentials();
    
    /** @type {BasketPage} */
     let basket;
    await test.step('Открыть страницу поиска экскурсий', async () => {
      await search.openBookingSection('excursions');
    });

    await test.step('Авторизоваться', async () => {
      await page.getByRole('img').nth(3).click();
      await pause(page);
      await page.locator("input[name='LoginInput.Email']").fill(email);
      await page.locator("input[name='LoginInput.Password']").fill(password);
       await page.locator("input[name='LoginInput.Password']").press('Enter');
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

    await test.step('Добавить в корзину предложение с услугой — анимация красного шарика', async () => {
      basket = await search.addRandomOfferToCart({ expectFlyAnimation: true });
    });

    await test.step('Открылась корзина /booking', async () => {
      await basket.expectCartVisible();
    });

    await test.step('Вернуться на страницу поиска', async () => {
      await page.bringToFront();
    });

    await test.step('У иконки корзины отображается красная точка', async () => {
      await expect(page.locator('a[href*="booking"] .dot, a[href*="booking"] .badge').first()).toBeVisible();
    });
  });

  test.describe('Валидация к полю выбора отеля', () => {
    test('Валидация к полю выбора отеля проживания на курорте', async ({ page }) => {
      // связь автотеста с TestIt
      //testit.externalId('e2357a6a5d14c34a83904dc518dee06a');
      //testit.workItemIds(['2b53c03a-750f-48ab-97e9-a91c35c87067']);
      //testit.displayName('Валидация к полю выбора отеля проживания на курорте');
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
        await pause(cart, 300);
      };

      /** Список после клика может остаться открытым — тогда blur не убирает фокус с поля */
      const leaveHotelField = async () => {
        await cart.keyboard.press('Escape');
        await pause(cart, 300);
        await hotelField.blur();
        await pause(cart, 250);
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
