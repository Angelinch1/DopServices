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

Тесты разделены **по среде** и **по разделу** (подпапка = часть сайта):

```text
tests/
  stage/                 ← только stage
    excursions/          ← пример: раздел «экскурсии»
      *.spec.js
    <другой-раздел>/
  prod/                  ← только prod
    excursions/
    <другой-раздел>/
```

В `playwright.config.js` два **проекта**:

| Проект            | Папка тестов      | baseURL (по умолчанию)     |
|-------------------|-------------------|----------------------------|
| `stage-chromium`  | `tests/stage/**`  | `STAGE_BASE_URL` → stage   |
| `prod-chromium`   | `tests/prod/**`   | `PROD_BASE_URL` → прод     |

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

| Команда | Описание |
|---------|----------|
| `npm test` | Только **prod** (по умолчанию) |
| `npm run test:serial` | **prod**, один воркер (если на Windows мешает `spawn EBUSY`) |
| `npm run test:stage` | Только **stage** |
| `npm run test:stage:serial` | **stage**, один воркер |
| `npm run test:prod` | Только **prod** (то же, что `npm test`) |
| `npm run test:all` | **Обе** среды подряд |
| `npm run test:all:serial` | Обе среды, один воркер |
| `npm run test:headed` | **prod**, браузер на экране |

Локально на **Windows** по умолчанию используются **2 воркера** (в CI по-прежнему **1**), чтобы реже ловить `spawn EBUSY` при нескольких Chromium. Нужно своё число — переменная окружения **`PW_WORKERS`** (например `PW_WORKERS=1`) или флаг **`--workers`** у `playwright test`.
| `npm run test:ui` | Stage, UI Mode |
| `npm run test:debug` | Stage, отладка |

Запуск одного файла на prod:

```bash
npx playwright test tests/prod/excursions/fstravel-search-excursions.spec.js --project=prod-chromium
```

**Видео прогона** (файл `video.webm` внутри `test-results/<папка-теста>/`): задайте значение Playwright для опции `video`, например `on` или `retain-on-failure` (только при падении). В `playwright.config.js` читается **`PW_VIDEO`** (подхватывается из `.env` через `config.js`).

PowerShell:

```powershell
$env:PW_VIDEO='on'; npm run test:stage -- tests/stage/certificates/certificates.spec.js
```

**Смотреть браузер во время прогона** — флаг **`--headed`**, например: `npx playwright test ... --project=stage-chromium --headed` (или `npm run test:headed` для prod по скрипту в `package.json`).

## Браузер

Только **Chromium** (в каждом из двух проектов).

## Разделы портала (пути от `baseURL`)

| Раздел | Путь | Класс в `pages/AllPages.js` | `tests/stage/` | `tests/prod/` |
|--------|------|-----------------------------|----------------|---------------|
| Экскурсии | `/searchexcursions` | `FstravelSearchExcursionsPage` | `excursions/` | `excursions/` |
| Сертификаты | `/certificates` | `FstravelCertificatesPage` | `certificates/` | `certificates/` |
| Яхты | `/searchyachtrent` | `FstravelYachtRentPage` | `yachts/` | `yachts/` |
| Трансферы | `/searchtransfers` | `FstravelTransfersPage` | `transfers/` | `transfers/` |
| Страхование | `/searchinsurances` | `FstravelSearchInsurancesPage` | `insurances/` | `insurances/` |
| Услуги в аэропорту | `/searchairportservices` | `FstravelAirportServicesPage` | `airport-services/` | `airport-services/` |
| Услуги в отеле | `/searchhotelservices` | `FstravelHotelServicesPage` | `hotel-services/` | `hotel-services/` |

## Структура проекта

| Путь | Назначение |
|------|------------|
| `pages/BasePage.js` | Базовый класс Page Object |
| `pages/AllPages.js` | Пути и классы страниц по разделам сайта |
| `tests/stage/<раздел>/` | Тесты для stage |
| `tests/prod/<раздел>/` | Тесты для prod |
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
