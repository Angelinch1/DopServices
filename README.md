# DopServices

Автотесты на **JavaScript** и **Playwright** с архитектурой **Page Object**. Отчётность — **только Allure**; скриншоты, видео и trace Playwright отключены.

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

Page Object логично класть по разделу, например `pages/excursions/`. В коде используются **относительные пути** (`/searchexcursions`, `/certificates`, …): итоговый адрес на stage — **`https://stage.fstravel.com` + путь**, например `https://stage.fstravel.com/searchexcursions` (для prod — **`https://fstravel.com` + тот же путь**).

Переопределение URL (PowerShell):

```powershell
$env:STAGE_BASE_URL="https://ваш-stage.example"; $env:PROD_BASE_URL="https://fstravel.com"
```

Скопируйте `.env.example` в `.env` и задайте значения в CI/локально (Playwright сам `.env` не читает — переменные должны быть в окружении или подключите `dotenv` в `playwright.config.js` при необходимости).

## Команды запуска

| Команда | Описание |
|---------|----------|
| `npm test` | Только **prod** (по умолчанию) |
| `npm run test:stage` | Только **stage** |
| `npm run test:prod` | Только **prod** (то же, что `npm test`) |
| `npm run test:all` | **Обе** среды подряд |
| `npm run test:headed` | Stage, браузер на экране |
| `npm run test:ui` | Stage, UI Mode |
| `npm run test:debug` | Stage, отладка |

Запуск одного файла на prod:

```bash
npx playwright test tests/prod/excursions/fstravel-search-excursions.spec.js --project=prod-chromium
```

## Браузер

Только **Chromium** (в каждом из двух проектов).

## Разделы портала (пути от `baseURL`)

| Раздел | Путь | `pages/` | `tests/stage/` | `tests/prod/` |
|--------|------|----------|----------------|---------------|
| Экскурсии | `/searchexcursions` | `excursions/` | `excursions/` | `excursions/` |
| Сертификаты | `/certificates` | `certificates/` | `certificates/` | `certificates/` |
| Яхты | `/searchyachtrent` | `yachts/` | `yachts/` | `yachts/` |
| Трансферы | `/searchtransfers` | `transfers/` | `transfers/` | `transfers/` |
| Услуги в аэропорту | `/searchairportservices` | `airport-services/` | `airport-services/` | `airport-services/` |
| Услуги в отеле | `/searchhotelservices` | `hotel-services/` | `hotel-services/` | `hotel-services/` |

## Структура проекта

| Путь | Назначение |
|------|------------|
| `pages/<раздел>/` | Page Object по разделу сайта |
| `tests/stage/<раздел>/` | Тесты для stage |
| `tests/prod/<раздел>/` | Тесты для prod |
| `playwright.config.js` | Проекты stage/prod и репортеры |
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
