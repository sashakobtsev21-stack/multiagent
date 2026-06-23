# Реестр сайтов

Все 5 — форки одного движка: **Astro 6.4.6 SSG**, Tailwind 4, Leaflet, деплой Cloudflare Workers (push в `main`), коллекции `articles/routes/cities/restaurants/services`, QA-гейты (`check-enums/parity/photos/interlinks/links`), фото-пайплайн, ~21–22 субагента в `.claude/agents`, скиллы `news`/`add-content`/`full-audit`. Языки: en/ru/uk. Новости: раздел 10 дней (`NEWS_SECTION_WINDOW=10`), главная 2 дня (`NEWS_HOME_WINDOW=2`), ежедневный `daily-news-rebuild.yml`.

| Параметр | Грузия | Албания | Черногория | Хорватия | Македония |
|---|---|---|---|---|---|
| Репо | gruzia-site | albania-site | montenegro-site | croatia-site | macedonia-site |
| Домен | georgiaguidebook.com (живой) | albaniaguidebook.com (?) | montenegroguidebook.com (плейсхолдер) | croatiaguidebook.com (плейсхолдер) | macedoniaguidebook.com (плейсхолдер) |
| Гео | ru/uk (СНГ) + en-трек | EN-first Tier-1 | EN-first Tier-1 | EN-first Tier-1 | EN-first Tier-1 |
| Языки (политика 2026-06-22) | en+ru+uk | **только en** | en+ru | en+ru | **только en** |
| Зрелость | зрелый (эталон) | частичный | частичный | скелет | скелет |
| Статьи (×3 яз) | 88 | 5 | 5 | 1 | 2 (сиды) |
| Города | 10 (как `goroda`) | 0 | 0 | 0 | 0 |
| Маршруты | 9 | 0 | 0 | 0 | 1 (сид) |
| Рестораны | 31 | 0 | 0 | 0 | 0 |
| Фото | 1215 | cover-only + TODO | 4/статью (ок) | cover+3 (ок) | placeholder.svg |
| `/news` скилл | ✅ грузинский | ❌ не локализован | ❌ не локализован | ✅ локализован | ❌ не локализован |
| Календарь по дням | ✅ KALENDAR.md | ❌ | ❌ | ❌ | ❌ |
| Столица | Тбилиси (флагман, 41 фото) | Тирана (нет) | Подгорица (нет) | Загреб (нет) | Скопье (нет) |

## Главные дыры по сайтам (для Этапа 1)
- **Грузия:** трекеры отстают от кода (CONTENT_PLAN ~70 статей/29 ресторанов vs факт 88/31); `cities` пустая (документировать модель goroda); ROADMAP.md закрыт/архивный; demo-рестораны `obrazec-*` и услуги `primer-*`; EKTA сломана; en-статьи частью линкуются на ru-пути. → нужен в основном **аудит документации и консистентности**, не перестройка.
- **Албания:** `bash.exe.stackdump` в корне (удалить); нет `src/i18n/uk.ts`; коллекция `news` заявлена, а папки нет; `/news` грузинский → локализовать (punetejashtme.gov.al, аэропорт TIA, лек ALL, Тирана/Саранда); 5 статей cover-only + `<!-- TODO: фото -->`; рассинхрон доков (README «пусто» vs 5 статей vs ROADMAP «55 страниц»); нет PROGRESS/HANDOFF/AUDIT; `docs/memory/MEMORY.md` пустой.
- **Черногория:** **нет `worker/index.ts` и `wrangler.jsonc`** (монетизация `/go/` не работает) + нет `partners.json`; `/news` грузинский → локализовать (gov.me/MUP, аэропорты Tivat/Podgorica/Dubrovnik, EUR); грузинские hero + og-default; `SETUP-GUIDE` про gruzia-site; `MEMORY.md` пустой; нет PROGRESS/HANDOFF; домен-плейсхолдер.
- **Хорватия:** грузинские следы в `SPEC.md` (не перемоделирован), `CONTENT_GUIDE` (EKTA/Сарпи), `add-content` SKILL (GEL); дубль `services/.gitkeep`; нет PROGRESS/HANDOFF/AUDIT/ROADMAP под Хорватию; `MEMORY.md` пустой; `/news` уже локализован (проверить); 1 статья.
- **Македония:** скиллы `full-audit`/`add-content` в описании всё ещё «Georgia Guidebook»; `/news` грузинский → локализовать; 2 сид-материала с `placeholder-cover.svg`; legacy `public/images/strahovka/`; нет PROGRESS/HANDOFF; `MEMORY.md` пустой; hero уже македонские (ок), `partners.json` подстроен (ок); домен-плейсхолдер.

Подробный отчёт: `docs/audit/AUDIT-2026-06-22.md`.
