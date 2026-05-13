const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getCartLoginCredentials() {
  const email = process.env.CART_LOGIN_EMAIL;
  const password = process.env.CART_LOGIN_PASSWORD;
  if (!email || !password) {
    throw new Error('Для authInBag / authInBag2 задайте CART_LOGIN_EMAIL и CART_LOGIN_PASSWORD в окружении (.env).');
  }
  return { email, password };
}

const AIRPORT_SERVICES_PATH = '/searchairportservices';
const CERTIFICATES_PATH = '/certificates';
const HOTEL_SERVICES_PATH = '/searchhotelservices';
const SEARCH_EXCURSIONS_PATH = '/searchexcursions';
const SEARCH_INSURANCES_PATH = '/searchinsurances';
const TRANSFERS_PATH = '/searchtransfers';
const YACHT_RENT_PATH = '/searchyachtrent';

/** URL после «Добавить в корзину» на сертификатах: корзина, заказ или `/booking/<id>` (как на stage). */
const CERTIFICATE_AFTER_ADD_TO_CART_URL_RE =
  /\/(cart|bag|basket|order|checkout|zakaz|korz|korzina|booking|shopping|purchase)/i;

/**
 * @param {string} urlString
 * @returns {boolean}
 */
function isCertificatePostAddTargetUrl(urlString) {
  try {
    const u = new URL(urlString);
    if (/^about:/i.test(u.protocol)) return false;
    if (/\/certificates(\/|$|\?)/i.test(u.pathname)) return false;
    const pathAndQuery = `${u.pathname}${u.search}`;
    return CERTIFICATE_AFTER_ADD_TO_CART_URL_RE.test(pathAndQuery);
  } catch {
    return false;
  }
}

class FstravelAirportServicesPage extends BasePage {
  async open() {
    await this.page.goto(AIRPORT_SERVICES_PATH, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlays();
  }
}

/**
 * Общие шаги корзины/входа
 */
class FstravelCommonAllPages extends BasePage {
  /**
   * Открытие формы входа в корзине «Войти или зарегистрироваться»
   */
  async openCartLoginDialog() {
    const entry = this.page.getByText('Войти или зарегистрироваться', { exact: true });
    await entry.waitFor({ state: 'visible', timeout: 5000 });
    await entry.click();
  }

  async authInBag() {
    await this.openCartLoginDialog();
    const waitMs = 12_000;
    const { email, password } = getCartLoginCredentials();
    const emailInput = this.page.locator("input[name='LoginInput.Email']");
    const passInput = this.page.locator("input[name='LoginInput.Password']");

    await emailInput.waitFor({ state: 'visible', timeout: waitMs });
    await expect(emailInput).toBeEnabled({ timeout: waitMs });
    await emailInput.fill(email);

    await passInput.waitFor({ state: 'visible', timeout: waitMs });
    await expect(passInput).toBeEnabled({ timeout: waitMs });
    await passInput.fill(password);

    await sleep(2000);
    await passInput.waitFor({ state: 'visible', timeout: waitMs });
    await expect(passInput).toBeEnabled({ timeout: waitMs });
    await passInput.press('Enter');
  }

  async authInBag2() {
    const userIcon = this.page.locator('span.v-icon-user-14');
    await userIcon.waitFor({ state: 'visible' });
    await userIcon.click();
    const emailInput = this.page.locator("input[name='LoginInput.Email']");
    const passInput = this.page.locator("input[name='LoginInput.Password']");
    await emailInput.waitFor({ state: 'visible' });
    await expect(emailInput).toBeEnabled();
    const { email, password } = getCartLoginCredentials();
    await emailInput.fill(email);
    await passInput.waitFor({ state: 'visible' });
    await expect(passInput).toBeEnabled();
    await passInput.fill(password);
    await sleep(2000);
    await passInput.waitFor({ state: 'visible' });
    await expect(passInput).toBeEnabled();
    await passInput.press('Enter');
  }

  /**
   * Клик по кнопке бронирования 
   */
  async booking() {
    const button = this.page.locator('div.theme-yellow-booking').filter({ visible: true }).first();
    await expect(button).toBeVisible({ timeout: 10_000 });
    await button.click();
  }
}

class FstravelCertificatesPage extends BasePage {
  async open() {
    await this.page.goto(CERTIFICATES_PATH, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlays();
  }

  /** Номинал 10 ₽ в выпадающем списке (как в Java). */
  async selectCertificateNominalTenRubles() {
    const nameFields = this.page.locator('input#name.form__field').filter({ visible: true });
    await nameFields.first().waitFor({ state: 'visible', timeout: 25_000 });
    await expect(nameFields).toHaveCount(2, { timeout: 15_000 });

    const scope = this.page.locator('main, [role="main"], body').first();
    const chevron = scope.locator('.v-icon-chevron-down-bold').first();
    await chevron.waitFor({ state: 'visible', timeout: 15_000 });
    await chevron.scrollIntoViewIfNeeded();
    await chevron.click();

    const nominal = this.page.getByText(/10[\s\u202f]*₽/).filter({ visible: true }).first();
    await nominal.waitFor({ state: 'visible', timeout: 15_000 });
    await nominal.click();
  }

  /**
   * Popmechanic («Будьте в курсе!» / push) на сертификатах — закрыть «Нет, спасибо», если окно есть.
   */
  async dismissPopmechanicSubscriptionPopupIfVisible() {
    const root = this.page
      .locator('.popmechanic-js-wrapper, [id^="popmechanic-form-"], .popmechanic-js-form')
      .filter({ visible: true })
      .first();
    if (!(await root.isVisible().catch(() => false))) return;

    const noThanks = root.getByText('Нет, спасибо', { exact: true });
    try {
      await noThanks.click({ timeout: 3000 });
    } catch {
      await this.page.keyboard.press('Escape');
    }
    await root.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  /**
   * Отправитель / получатель: ФИО, телефоны (vue-tel-input), email.
   * @param {{ senderName?: string, receiverName?: string, phone?: string, email?: string }} [opts]
   */
  async fillCertificateSenderRecipient(opts = {}) {
    await this.dismissOverlays({ maxPasses: 4 });
    await this.dismissPopmechanicSubscriptionPopupIfVisible();

    const senderName = opts.senderName ?? 'Иванов Иван Иванович';
    const receiverName = opts.receiverName ?? 'Петрова Анна Ивановна';
    const phone = opts.phone ?? '7900123456';
    const email = opts.email ?? 'javaFsAutotest@fstravel.com';

    const names = this.page.locator('input#name.form__field').filter({ visible: true });
    await expect(names).toHaveCount(2, { timeout: 20_000 });
    await names.nth(0).waitFor({ state: 'visible', timeout: 15_000 });
    await names.nth(0).scrollIntoViewIfNeeded();
    await names.nth(0).fill(senderName);
    await names.nth(1).waitFor({ state: 'visible', timeout: 15_000 });
    await names.nth(1).scrollIntoViewIfNeeded();
    await names.nth(1).fill(receiverName);
    await this.dismissPopmechanicSubscriptionPopupIfVisible();

    const phones = this.page.locator('input.vti__input').filter({ visible: true });
    await expect(phones).toHaveCount(2, { timeout: 20_000 });
    await phones.nth(0).waitFor({ state: 'visible', timeout: 15_000 });
    await phones.nth(0).scrollIntoViewIfNeeded();
    await phones.nth(0).click();
    await phones.nth(0).fill(phone);
    await phones.nth(1).waitFor({ state: 'visible', timeout: 15_000 });
    await phones.nth(1).scrollIntoViewIfNeeded();
    await phones.nth(1).click();
    await phones.nth(1).fill(phone);
    await this.dismissPopmechanicSubscriptionPopupIfVisible();

    const emails = this.page.locator('input.form__field#email').filter({ visible: true });
    await expect(emails).toHaveCount(2, { timeout: 20_000 });
    await emails.nth(0).waitFor({ state: 'visible', timeout: 15_000 });
    await emails.nth(0).scrollIntoViewIfNeeded();
    await emails.nth(0).fill(email);
    await emails.nth(1).waitFor({ state: 'visible', timeout: 15_000 });
    await emails.nth(1).scrollIntoViewIfNeeded();
    await emails.nth(1).fill(email);
    await this.dismissPopmechanicSubscriptionPopupIfVisible();
  }

  /**
   * «Добавить в корзину» — на портале корзина **всегда** открывается в **новой вкладке** (`window.open` / target=_blank).
   * Ждём событие `popup`, затем загрузку и URL корзины / booking на этой вкладке.
   * Запасной вариант: поиск новой страницы в `context.pages()`, если событие не пришло.
   * @returns {Promise<import('@playwright/test').Page>}
   */
  async clickAddCertificateToCartPopup() {
    await this.dismissPopmechanicSubscriptionPopupIfVisible();
    const addBtn = this.page.getByText('Добавить в корзину', { exact: true });
    await addBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await addBtn.scrollIntoViewIfNeeded();

    const ctx = this.page.context();

    try {
      const [cartPage] = await Promise.all([
        this.page.waitForEvent('popup', { timeout: 45_000 }),
        addBtn.click(),
      ]);

      await cartPage.waitForLoadState('domcontentloaded');
      await cartPage.waitForURL((url) => isCertificatePostAddTargetUrl(url.toString()), {
        timeout: 45_000,
      });
      return cartPage;
    } catch (firstError) {
      const deadline = Date.now() + 20_000;
      while (Date.now() < deadline) {
        for (const p of ctx.pages()) {
          if (p === this.page) continue;
          let url = '';
          try {
            url = p.url();
          } catch {
            continue;
          }
          if (isCertificatePostAddTargetUrl(url)) {
            await p.waitForLoadState('domcontentloaded').catch(() => {});
            return p;
          }
        }
        await sleep(150);
      }

      const urls = ctx
        .pages()
        .map((p) => {
          try {
            return p.url();
          } catch {
            return '(tab closed)';
          }
        })
        .join(' | ');
      const err = new Error(
        `Корзина должна открыться в новой вкладке: не получено событие popup и не найден целевой URL. Вкладки: ${urls}`,
      );
      err.cause = firstError;
      throw err;
    }
  }

  /**
   * @param {{ betweenStepsMs?: number }} [options]
   */
  async _fillTouristNamesAndDocuments(options = {}) {
    const between = options.betweenStepsMs ?? 0;
    const step = async () => {
      if (between > 0) await sleep(between);
    };

    const lastName = this.page.locator('#lastName');
    const firstName = this.page.locator('#firstName');
    const middleName = this.page.locator('#middleName');

    await lastName.waitFor({ state: 'visible', timeout: 5000 });
    await lastName.fill('Петров');
    await step();
    await firstName.waitFor({ state: 'visible', timeout: 5000 });
    await firstName.fill('Сергей');
    await step();
    await middleName.waitFor({ state: 'visible', timeout: 5000 });
    await middleName.fill('Иванович');
    await step();
    await lastName.waitFor({ state: 'visible', timeout: 5000 });
    await lastName.fill('Петров');
    await step();

    await this.page.getByText('Номер документа', { exact: true }).locator('..').locator('input').fill('124416');
    await this.page.getByText(/[CС]ерия документа/).locator('..').locator('input').fill('1566');
  }

  /** Паузы 1 с между шагами */
  async addTouristInfo2() {
    await this._fillTouristNamesAndDocuments({ betweenStepsMs: 1000 });
  }

  /**
   * Экран ввода данных туриста (в корзине после авторизации)
   */
  async addTouristInfoCertificates() {
    await this._fillTouristNamesAndDocuments({ betweenStepsMs: 0 });
  }

  /**
   * Клик по кнопке бронирования
   */
  async bookingCertificates() {
    const button = this.page.locator('div.theme-yellow-booking').filter({ visible: true }).first();
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeEnabled();
    await button.evaluate((el) => {
      el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    });
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  /**
   * Читает номер бронирования из заголовка после оплаты/брони
   * @returns {Promise<string>} только цифры номера
   */
  async getBookingNumberFromPayHeader() {
    const header = this.page.locator('h4.bookingPay__header-text');
    await header.waitFor({ state: 'attached', timeout: 20_000 });
    await header.waitFor({ state: 'visible', timeout: 10_000 });
    const bookingText = await header.innerText();
    return bookingText.replace(/\D+/g, '');
  }
}

class FstravelHotelServicesPage extends BasePage {
  async open() {
    await this.page.goto(HOTEL_SERVICES_PATH, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlays();
  }
}

class FstravelSearchExcursionsPage extends BasePage {
  async open() {
    await this.page.goto(SEARCH_EXCURSIONS_PATH, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlays();
  }
}

class FstravelSearchInsurancesPage extends BasePage {
  async open() {
    await this.page.goto(SEARCH_INSURANCES_PATH, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlays();
  }
}

class FstravelTransfersPage extends BasePage {
  async open() {
    await this.page.goto(TRANSFERS_PATH, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlays();
  }
}

class FstravelYachtRentPage extends BasePage {
  async open() {
    await this.page.goto(YACHT_RENT_PATH, { waitUntil: 'domcontentloaded' });
    await this.dismissOverlays();
  }
}

module.exports = {
  AIRPORT_SERVICES_PATH,
  CERTIFICATES_PATH,
  CERTIFICATE_AFTER_ADD_TO_CART_URL_RE,
  isCertificatePostAddTargetUrl,
  HOTEL_SERVICES_PATH,
  SEARCH_EXCURSIONS_PATH,
  SEARCH_INSURANCES_PATH,
  TRANSFERS_PATH,
  YACHT_RENT_PATH,
  FstravelAirportServicesPage,
  FstravelCommonAllPages,
  FstravelCertificatesPage,
  FstravelHotelServicesPage,
  FstravelSearchExcursionsPage,
  FstravelSearchInsurancesPage,
  FstravelTransfersPage,
  FstravelYachtRentPage,
};
