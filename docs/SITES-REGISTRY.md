# Реестр сайтов

> Реестр — инвентарь состояния сети (репо/домены/языки/счётчики), **не источник SEO-данных** (показы/позиции/клики — только GSC). Счётчики статей и статусы сверены по факту 2026-06-30 (`git ls-files` / `curl`).

Все 5 — форки одного движка: **Astro 6.4.6 SSG**, Tailwind 4, Leaflet, деплой Cloudflare Workers (push в `main`), коллекции `articles/routes/cities/restaurants/services`, QA-гейты (`check-enums/parity/photos/interlinks/links`), фото-пайплайн, ~21–22 субагента в `.claude/agents`, скиллы `news`/`add-content`/`full-audit`. Языки — по сайту (общая en/ru/uk только у Грузии; см. строку «Языки» ниже). Новости: раздел 10 дней (`NEWS_SECTION_WINDOW=10`), главная 2 дня (`NEWS_HOME_WINDOW=2`), ежедневный `daily-news-rebuild.yml`.

| Параметр | Грузия | Албания | Черногория | Хорватия | Македония |
|---|---|---|---|---|---|
| Репо | gruzia-site | albania-site | montenegro-site | croatia-site | macedonia-site |
| Домен | georgiaguidebook.com (живой, HTTP 200; GSC через DNS-TXT — данные идут) | albaniaguidebook.com (живой, HTTP 200) | montenegroguidebook.com (живой, HTTP 200) | croatiaguidebook.com (живой, HTTP 200) | macedoniaguidebook.com (живой, HTTP 200) |
| Гео | ru/uk (СНГ) + en-трек | EN-first Tier-1 | EN-first Tier-1 (+ru) | EN-first Tier-1 (+ru) | EN-first Tier-1 |
| Языки (политика 2026-06-22) | en+ru+uk | **только en** | en+ru | en+ru | **только en** |
| Зрелость | зрелый (эталон) | рабочий (en) | рабочий (en+ru) | рабочий (en+ru) | рабочий (en) |
| Статьи (на язык; вкл. новости + города-goroda) | 91 | 25 | 29 | 27 | 27 |
| worker / wrangler / partners.json | ✅ | ✅ | ✅ | ✅ | ✅ |
| Города | модель `goroda` (коллекция `cities` пуста у всех 5) | goroda | goroda | goroda | goroda |
| Маршруты (на язык) | 9 | 1 | 1 | 1 | 1 |
| Рестораны (на язык) | 31 | 3 | 3 | 3 | 3 |
| Фото | богато (флагман Тбилиси) | ⚠️ дефицит: 5 статей cover-only + 5 TODO | ок (5 гайдов cover+3) | ок (DNV cover+3) | ок (covers — реальные CC) |
| `/news` скилл | ✅ локализован | ✅ локализован (1 остаток) | ✅ локализован | ✅ локализован | ✅ локализован |
| Календарь по дням (KALENDAR.md) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Consent Mode v2 | ✅ есть (добавлен 2026-06-30) | ✅ есть | ✅ есть | ✅ эталон | ✅ есть |
| Субагенты `.claude/agents` | родные (Грузия) | ✅ деконтам. (P2-4) | ✅ чисто | ✅ чисто | ✅ деконтам. (P2-4) |
| Столица | Тбилиси (флагман) | Тирана | Подгорица (15 фото) | Загреб | Скопье |

## Состояние на 2026-06-24 (по факту ФС; детали — `docs/audit/MASTER-AUDIT-2026-06-24.md`)

Сеть технически единообразна и крепче, чем фиксировал прежний реестр: движок/гейты/worker/partners/календари — у всех 5. Прежние «дыры» (нет worker у Черногории, «скелеты», пустые MEMORY, 1–5 статей, нет PROGRESS/HANDOFF, `/news` грузинский) — **устарели**, пересчитано в таблице выше.

**Открытые приоритеты (актуальный план — `docs/audit/FIX-LIST-2026-06-30.md`):**
- **Домены/GSC:** все 5 доменов живые (HTTP 200, сверено 2026-06-30) — прежний P0 «подтвердить домен» закрыт. Остаётся owner-action по GSC (Request Indexing + sitemap).
- **Consent Mode v2:** есть у всех 5 (Грузия добавлена 2026-06-30 P1-1; 4 форка — раньше). Прежний P2 закрыт.
- **P1 деньги:** EKTA — прямой URL без атрибуции (живая утечка только на 1 странице macedonia; на 4 — спящая болванка, owner-action); у Черногории — болванки discovercars/getyourguide/booking (0 использований, дремлют).
- **P1 контент/SEO:** Албания — фото-добор + точечная докрутка тонких money-страниц по GSC.
- **P1 автоматизация:** деконтаминация промптов `.claude/agents/*` форков под язык репо (en-only) — частично сделано (Грузия/P2-4); проверить остаток.

Прежний отчёт Этапа 1: `docs/audit/AUDIT-2026-06-22.md` (исторический, частично устарел).

## Новые сайты (Фаза 3, scaffolded 2026-06-30, off-domain — НЕ запущены)

3 новых форка движка, EN-first: собраны, проходят build+test, запушены в публичные репо, но **без контента и без живого домена** (не индексируются). В `/work`-ротацию НЕ входят до запуска (память `new-sites-tech-ready-before-content`). Подключены к дашборду (grafana). Планы — `docs/new-sites/{country}-plan-2026-06-30.md`; SEO — `docs/seo/{country}-seo-2026-06-30.md`.

| Параметр | Босния | Армения | Сербия |
|---|---|---|---|
| Репо (public) | bosnia-site | armenia-site | serbia-site |
| Домен (кандидат, НЕ куплен) | bosniaguidebook.com | armeniaguidebook.com | serbiaguidebook.com |
| Языки | en (навсегда) | en (+ ru-релокация фаст-фоллоу; ru-движок дормант) | en (+ ru-релокация фаст-фоллоу; ru-движок дормант) |
| Донор скаффолда | albania | montenegro | montenegro |
| Старт-корпус (план) | ~38 тем | ~38 тем | ~40 тем |
| Статус | scaffolded ✅ build+test GO, 0 контента | scaffolded ✅ | scaffolded ✅ |
| Owner-action до запуска | GA4-свойство (сейчас G-PENDING), Cloudflare deploy, покупка домена, GSC; брендовые флаг/иконки | то же | то же |

