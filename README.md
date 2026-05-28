# DopServices

Автотесты на **JavaScript** и **Playwright** с архитектурой **Page Object**. Отчётность: **Allure** и репортер **Test IT** (`config.js`); скриншоты и trace по умолчанию выключены; **видео** — через переменную **`PW_VIDEO`** (см. раздел «Команды запуска»).

## Требования

- Node.js 18+
- npm

## Установка

```bash
npm install
npx playwright install chromium
```

## Среды (preprod / prerelease)

Все спеки лежат в **`test/*.spec.js`**. Хост задаётся переменной **`BASE_URL`**:

| URL по умолчанию в скриптах | Назначение |
|----------------------------|------------|
| `https://preprod.fstravel.com` | preprod |
| `https://prerelease.fstravel.com` | prerelease |

Если **`BASE_URL` не задана** (например, просто `npx playwright test`), в **`playwright.config.js`** используется **`https://preprod.fstravel.com`**.

Page Object в **`pages/AllPages.js`** использует **относительные пути** (`/searchexcursions`, `/certificates`, …): итоговый адрес — **`BASE_URL` + путь**, например `https://preprod.fstravel.com/searchexcursions`.

Переопределение вручную (PowerShell):

```powershell
$env:BASE_URL="https://prerelease.fstravel.com"; npx playwright test
```

Скрипты **`npm run test:preprod`** / **`test:prerelease`** задают `BASE_URL` в стиле Unix (`VAR=value команда`). В **cmd.exe** так не работает — используйте **Git Bash**, **WSL**, или переменную в PowerShell, как выше.

Скопируйте `.env.example` в `.env` и при необходимости задайте `BASE_URL` локально; в CI — переменные в окружении job. Файл `.env` подхватывается при старте через **`dotenv` в `config.js`** (подключается из `playwright.config.js`).

## Test IT (репортер)

Репортер **`testit-adapter-playwright`** всегда подключён в `playwright.config.js`, параметры собираются в **`config.js`**.

В CI можно задавать **короткие имена**; если соответствующая переменная **`TMS_*` уже задана**, она не перезаписывается. Дублировать одно и то же в двух видах не обязательно (например, достаточно только `TMS_ADAPTER_MODE` или только `ADAPTER_MODE`).

| Короткое имя (CI) | Имя в стиле Test IT (`TMS_*`) |
|-------------------|-------------------------------|
| `URL` | `TMS_URL` |
| `USER_PRIVATE_TOKEN` | `TMS_PRIVATE_TOKEN` |
| `PROJECT_ID` | `TMS_PROJECT_ID` |
| `CONFIGURATION_ID` | `TMS_CONFIGURATION_ID` |
| `TEST_RUN_ID` | `TMS_TEST_RUN_ID` |
| `TEST_RUN_NAME` | `TMS_TEST_RUN_NAME` |
| `ADAPTER_MODE` | `TMS_ADAPTER_MODE` |

Режимы адаптера и прочие детали — в [документации пакета](https://www.npmjs.com/package/testit-adapter-playwright).

## Команды запуска

| Команда | Что делает |
|---------|------------|
| `npm test` | Все тесты, `BASE_URL` из `.env` или **preprod** по умолчанию в конфиге |
| `npm run test:preprod` | Тесты против **https://preprod.fstravel.com** |
| `npm run test:prerelease` | Тесты против **https://prerelease.fstravel.com** |
| `npm run test:ui` | UI Mode, тот же `BASE_URL`, что и у `npm test` |
| `npm run test:ui:preprod` | UI Mode на preprod |
| `npm run test:ui:prerelease` | UI Mode на prerelease |

**Один файл** (пример — экскурсии):

```bash
npm run test:preprod -- test/excursions.spec.js
```

**PowerShell:** если ругается на **`npm.ps1`** или **`npx.ps1`** (политика выполнения / подпись), вызывайте **`npm.cmd`** и **`npx.cmd`** (например `npx.cmd playwright test`), либо используйте **cmd.exe** вместо PowerShell.

**Параллельность:** по умолчанию **`workers: 1`** и **`fullyParallel: false`** — тесты выполняются **по одному**, в предсказуемом порядке. Параллельный прогон: **`PW_WORKERS=2`** или **`npx playwright test --workers=4`**.

**Видео:** в `.env` задайте `PW_VIDEO=on` или `retain-on-failure` (см. `playwright.config.js`).

## Браузер

Только **Chromium** (проект `chromium` в `playwright.config.js`).

## Разделы портала (пути от `baseURL`)

| Раздел | Путь | Класс в `pages/AllPages.js` | Спека |
|--------|------|-----------------------------|--------|
| Экскурсии | `/searchexcursions` | `FstravelSearchExcursionsPage` | `excursions.spec.js` |
| Сертификаты | `/certificates` | `FstravelCertificatesPage` | `certificates.spec.js` |
| Яхты | `/searchyachtrent` | `FstravelYachtRentPage` | `yacht.spec.js` |
| Трансферы | `/searchtransfers` | `FstravelTransfersPage` | `transfers.spec.js` |
| Страхование | `/searchinsurances` | `FstravelSearchInsurancesPage` | `insurances.spec.js` |
| Услуги в аэропорту | `/searchairportservices` | `FstravelAirportServicesPage` | `airport-services.spec.js` |
| Услуги в отеле | `/searchhotelservices` | `FstravelHotelServicesPage` | `hotel-services.spec.js` |

## Структура проекта

| Путь | Назначение |
|------|------------|
| `pages/BasePage.js` | Базовый класс Page Object |
| `pages/AllPages.js` | Пути и классы страниц по разделам сайта |
| `test/*.spec.js` | E2E-тесты (среда через `BASE_URL`) |
| `playwright.config.js` | `baseURL`, репортеры, проект Chromium |
| `config.js` | Загрузка `.env`, маппинг переменных в `TMS_*`, репортер Test IT |
| `allure-results/` | Сырые данные Allure |

## Allure

| Команда | Описание |
|---------|----------|
| `npm run allure:serve` | Открыть отчёт по `allure-results` |
| `npm run allure:generate` | Собрать `allure-report/` |
| `npm run allure:open` | Открыть `allure-report/` |

## Репозиторий

```text
https://gitlab.fstravel.com/fun-sun/autotests/dopservices.git
```
