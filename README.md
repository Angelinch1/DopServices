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

## Среды (stage / prod) и разделы сайта

Тесты разделены **по среде**; имя файла отражает раздел сайта:

```text
test/
  stage/                 ← только stage
    *.spec.js
  prod/                  ← только prod
    *.spec.js
```

В `playwright.config.js` два **проекта**:

| Проект            | Папка тестов      | baseURL (по умолчанию)     |
|-------------------|-------------------|----------------------------|
| `stage-chromium`  | `test/stage/**/*.spec.js` | `STAGE_BASE_URL` → stage   |
| `prod-chromium`   | `test/prod/**/*.spec.js`  | `PROD_BASE_URL` → прод     |

Page Object для всех разделов собраны в **`pages/AllPages.js`** (константы путей и классы с `open()`). В коде используются **относительные пути** (`/searchexcursions`, `/certificates`, …): итоговый адрес на stage — **`https://stage.fstravel.com` + путь**, например `https://stage.fstravel.com/searchexcursions` (для prod — **`https://fstravel.com` + тот же путь**).

Переопределение URL (PowerShell):

```powershell
$env:STAGE_BASE_URL="https://ваш-stage.example"; $env:PROD_BASE_URL="https://fstravel.com"
```

Скопируйте `.env.example` в `.env` и задайте значения локально; в CI задавайте переменные в окружении job. Файл `.env` подхватывается при старте через **`dotenv` в `config.js`** (подключается из `playwright.config.js`).

## Test IT (репортер)

Репортер **`testit-adapter-playwright`** подключён в `playwright.config.js`, параметры собираются в **`config.js`**.

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
| `npm test` | Все тесты **prod**, браузер **не** показывается |
| `npm run test:prod` | То же, что `npm test` |
| `npm run test:headed` | Все тесты **prod**, **окно браузера видно**, тесты идут **по одному** |
| `npm run test:stage` | Все тесты **stage**, без окна |
| `npm run test:stage:headed` | **stage**, окно браузера, по одному тесту |
| `npm run test:serial` | **prod** без окна, по одному тесту |
| `npm run test:stage:serial` | **stage** без окна, по одному тесту |
| `npm run test:all` | **prod**, затем **stage** |
| `npm run test:all:serial` | То же, по одному тесту |
| `npm run test:ui` | Stage, UI Mode |
| `npm run test:debug` | Stage, пошаговая отладка |

**Один файл** (пример — экскурсии на prod):

```bash
npm run test:headed -- test/prod/excursions.spec.js
```

**PowerShell:** если ругается на `npm.ps1`, пишите **`npm.cmd`** вместо **`npm`** (например `npm.cmd run test:headed`).

В **CI** воркер один и так (`playwright.config.js`). Локально на Windows без `--workers=1` иногда бывает **2** воркера — для скрытого браузера это нормально; для **headed** в скрипте уже **всегда один**, чтобы не открывалось несколько окон сразу.

**Видео:** в `.env` задайте `PW_VIDEO=on` или `retain-on-failure` (см. `playwright.config.js`).

## Браузер

Только **Chromium** (в каждом из двух проектов).

## Разделы портала (пути от `baseURL`)

| Раздел | Путь | Класс в `pages/AllPages.js` | `test/stage/` | `test/prod/` |
|--------|------|-----------------------------|----------------|---------------|
| Экскурсии | `/searchexcursions` | `FstravelSearchExcursionsPage` | `fstravel-search-excursions.spec.js` | `fstravel-search-excursions.spec.js` |
| Сертификаты | `/certificates` | `FstravelCertificatesPage` | `certificates.spec.js` | `certificates.spec.js` |
| Яхты | `/searchyachtrent` | `FstravelYachtRentPage` | `yacht-rent.spec.js` | `yacht-rent.spec.js` |
| Трансферы | `/searchtransfers` | `FstravelTransfersPage` | `transfers.spec.js` | `transfers.spec.js` |
| Страхование | `/searchinsurances` | `FstravelSearchInsurancesPage` | `insurances.spec.js` | `insurances.spec.js` |
| Услуги в аэропорту | `/searchairportservices` | `FstravelAirportServicesPage` | `airport-services.spec.js` | `airport-services.spec.js` |
| Услуги в отеле | `/searchhotelservices` | `FstravelHotelServicesPage` | `hotel-services.spec.js` | `hotel-services.spec.js` |

## Структура проекта

| Путь | Назначение |
|------|------------|
| `pages/BasePage.js` | Базовый класс Page Object |
| `pages/AllPages.js` | Пути и классы страниц по разделам сайта |
| `test/stage/*.spec.js` | Тесты для stage |
| `test/prod/*.spec.js` | Тесты для prod |
| `playwright.config.js` | Проекты stage/prod и репортеры |
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
