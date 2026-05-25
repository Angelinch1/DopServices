/**
 * Логин для сценариев «корзина» (AuthPage). Значения задаются в `.env`, см. `.env.example`.
 * @returns {{ email: string, password: string }}
 */
function getBasketTestCredentials() {
  const email = process.env.BASKET_TEST_EMAIL?.trim();
  const password = process.env.BASKET_TEST_PASSWORD?.trim();
  if (!email || !password) {
    throw new Error('Задайте в .env: BASKET_TEST_EMAIL и BASKET_TEST_PASSWORD');
  }
  return { email, password };
}

module.exports = { getBasketTestCredentials };
