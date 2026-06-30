# Per-repo deep audit — Montenegro Guidebook (montenegroguidebook.com)

**Дата:** 2026-06-30 · **Аудитор:** 1B (deep per-repo) · **Режим:** READ-ONLY (ничего не менялось, без commit/push/build)
**Репо:** `sashakobtsev21-stack/montenegro-site` · **Клон:** `sites/montenegro-site` · **Ветка main, рабочее дерево чистое**
**Модель сайта:** en-led + ru (двуязычный; uk удалён 2026-06-22) · **Стек:** Astro 6.4.6 / Cloudflare Workers (Static Assets) + Worker-роут `/go/`

> Источник правды — файлы, git, гейты, curl. Все числа пересчитаны самостоятельно. Сверка с MASTER-AUDIT/доками — только как гипотеза.

---

## Факты (пересчитано из git)

| Метрика | Факт | Источник |
|---|---|---|
| Статьи (articles) | **29 en + 29 ru** | `git ls-files src/content/articles/**` |
| Маршруты (routes) | **3 en + 3 ru** | `git ls-files src/content/routes/**` |
| Рестораны (restaurants) | **3 en + 3 ru** (все с cover) | grep cover |
| Услуги (services) | **пусто** (только .gitkeep) — noindex + вне sitemap | `git ls-files`, astro.config filter |
| Города (cities-коллекция) | **пусто** по дизайну (город = `category:cities` статья) | CLAUDE.md |
| Паритет en/ru | **1:1** (35/35 по всем коллекциям) | gate `check-parity` |
| Гейт-бейслайны | **photo=[], dedup={[],[]}, links=[]** — ВСЕ пустые | `scripts/.*-baseline.json` |
| Live-проверка | home 200 · /ru/ 200 · sitemap-index 200 · /go/safetywing 302 | curl |

HANDOFF.md заявляет «29 + 3 маршрута» — **совпадает с git** (точность доков по счётчику подтверждена).

---

## Находки

### 🔧 Тех-SEO / индексируемость — крепко

**[Low 🔧] AUDIT.md «Открыто» отстал от ратчета фото-гейта** — `AUDIT.md` (раздел «Открыто») всё ещё пишет «Добор фото до ≥5… Гейт check-photos пока требует cover+≥3», но гейт уже ужесточён до ≥5 (commit `624f76f`), а добор выполнен (HANDOFF: 6 статей добиты, qa=GO). · влияние: устаревший пункт в ledger → ложная картина «открытого» долга. · фикс: перенести фото-пункт из «Открыто» в «Закрыто». · усилие: S. · вердикт: **doc-drift, исправить при следующей правке** (P1-4 «фото-дефицит» подтверждён закрытым независимо: 0 статей < порога).

**[Low 🔧] robots.txt — устаревший комментарий «ru/uk»** — `public/robots.txt:5` «Карта сайта… (обе версии ru/uk)»; uk удалён 2026-06-22. · влияние: косметика (на краулинг не влияет, Sitemap-директива и Disallow корректны). · фикс: «ru/uk» → «en/ru». · усилие: S. · вердикт: косметика.

Подтверждено рабочим (доказательства):
- **sitemap** (`astro.config.mjs:100-132`): i18n en/ru, x-default→en (`serialize`), `lastmod` из `updatedAt/publishedAt`, фильтр исключает `/go/`, пустой `/relocation/services/` и demo-слаги. ✓
- **hreflang/canonical** (`BaseLayout.astro:68-174`): canonical на каждой не-utility, взаимные hreflang en↔ru + x-default→en, mirrorPath, `availableLangs` (ru только если перевод есть). Взаимность hreflang проверяется в `qa.mjs:220-231` (critical при невзаимности). ✓
- **robots** (`public/robots.txt`): `Disallow: /go/`, Sitemap-директива на прод-домен. ✓
- **title≤60 / desc≤155 (в символах):** пересчёт по ИСТИННОМУ числу символов (Python) → **0 нарушений** из 70 md. ⚠️ Bash `${#var}` (байты) даёт ложные «над лимитом» для кириллицы — это ровно кейс памяти `seo-meta-length-chars-not-bytes`; не доверять байтовому счёту. Гейт `check-parity` (TITLE_MAX=60 через `.length` = код-юниты) и `qa.mjs` (decode + `.length`) считают символы корректно → qa=GO согласован. ✓
- **JSON-LD** (`BaseLayout.astro:94-107`): Organization + WebSite со стабильными @id (E-E-A-T). ✓

### 💰 Монетизация — дисциплина чистая, 2 болванки (action владельца)

**[Medium 💰] EN-партнёрки discovercars/getyourguide/booking + EKTA — прямые URL без атрибуции** — `src/data/partners.json:33-56`: `ekta`/`discovercars`/`getyourguide`/`booking` имеют голый `urlTemplate` (напр. `https://www.discovercars.com/`, `allowSubId:false`). Проверено на проде: `/go/discovercars?c=test` → 302 на голый `discovercars.com` (SubID не передаётся). · влияние: клики по этим партнёрам НЕ атрибутируются (потерянная комиссия), НО: **в контенте они не используются** (см. ниже) → реальной живой потери сейчас нет. · фикс: владелец регистрируется в Travelpayouts/сети → заменить на трекинг-ссылку + `allowSubId:true`. · усилие: M (вне кода — кабинет владельца). · вердикт: **owner-action, P2** (документировано в AUDIT.md/HANDOFF).

**Дисциплина `/go/` — отлично (доказательства):**
- Прямых партнёрских URL в теле контента — **0** (grep по trip.com/booking/getyourguide/discovercars/safetywing/airalo/aviasales/localrent/ektatraveling/tpx.gr). ✓
- Реально используемые партнёры (frontmatter `affiliate[].partner`): **EN** — trip-hotels×11, trip-tours×9, trip-carhire×7, trip-flights×3, safetywing×3, kiwitaxi×3; **RU** — trip-hotels×10, trip-tours×7, trip-carhire×6, localrent×4, safetywing×3, kiwitaxi×3, aviasales×3. → **контент использует только партнёров с рабочей атрибуцией** (Trip.com/SafetyWing/Kiwitaxi/Localrent/Aviasales), а болванки (discovercars/getyourguide/booking/ekta) в материалах НЕ висят. Прагматично: вместо неатрибутируемого DiscoverCars EN-статьи берут trip-carhire (рабочий SubID). ✓
- Живая атрибуция: `/go/trip-hotels?c=budva-nightlife` → `trip_sub1=budva-nightlife` (SubID работает). `AffiliateBox.astro:34,43` — `/go/{partner}?c={slug}` + `rel="sponsored nofollow noopener"` + disclosure. ✓
- Worker (`worker/index.ts`): анти-open-redirect (фолбэк только относительный путь своего сайта), только https-таргет, `allowSubId` читается. ✓
- Сегментация по языку: RU добавляет Localrent/Aviasales (CIS), EN — SafetyWing (Tier-1). ✓ Соответствует CLAUDE правилу 2 (с оговоркой про болванки выше).

### 📈 Качество контента — высокое, человечный тон; 1 тонкая статья + 1 dedup-риск

**[Medium 📈] Возможная каннибализация: `montenegro-7-day-itinerary` ↔ `montenegro-road-trip`** — обе в `routes/en`, обе покрывают один coast→mountains-луп (Kotor, Budva/Sveti Stefan, Skadar, Durmitor/Tara) за 6–7 дней; 7-day сам себя зовёт «2026 Road Trip», road-trip — «6–7 day». · доказательство: titles+descriptions двух файлов. · влияние: риск делёжки ранга по «montenegro road trip / itinerary». Гейт `check-dedup` (title-Jaccard ≥0.85, один язык) их пропускает — заголовки лексически расходятся, но ИНТЕНТ пересекается (мягкий дубль, который порог не ловит). · фикс: либо чётко развести (7-day = пошаговый день-за-днём с базами ночёвок; road-trip = логистика самостоятельного вождения: расстояния/заправки/перевалы/аренда — и взаимная перелинковка «план vs логистика»), либо свести в один pillar + раздел. · усилие: M. · вердикт: **разнести интенты в DEDUP-PLAN фазы 2** (не срочно — оба ранжируются по-разному, но кластер на 3 страницы про «сколько дней + 2 маршрута» стоит причесать).

**[Low 📈] `durmitor-national-park` — 1164 слова (< порога статьи 1200)** — `articles/en` (category=attractions), 6 содержательных H2 (Black Lake, Bobotov Kuk, Tara/rafting, getting there). · влияние: на 36 слов ниже стандарта 1200; контент компактный, не «вода». · фикс: +1 абзац (напр. сезонность/входной сбор парка из источника) до 1200+. · усилие: S. · вердикт: минор.

**Тон/правдивость — выборка 3 материала (НЕ все):**
- `renting-a-car-in-montenegro` (1245 сл): конкретика (TGD/TIV/DBV, «green card», ~25 серпантинов Kotor–Lovćen), 3 `<figure>` с CC-атрибуцией, цены не выдуманы. Носительский EN, без ИИ-штампов. ✓
- `montenegro-entry-requirements` (2044 сл, YMYL): дисклеймер с датой проверки (28.06.2026), 6 офиц. источников (gov.me/gov.uk/state.gov/ETIAS), правило 90/180, 24-ч регистрация, ETIAS-нюанс (ME не в Schengen). Образцовая YMYL-страница. ✓
- `budva-nightlife` (1555 сл): 9 фото (cover+gallery×3+inline) с атрибуцией, `visit.note` про «цены уточняйте» + `checkedAt` (не выдуманы), живой тон. ✓
- **Новости (7 шт <1200 слов) — НЕ нарушение:** все `category:news`, мерило новости = 1500–2000 знаков; по факту 1595–3034 знака (visa-russia 2836, exit-festival 3034) — норму выдерживают/превышают. Тонких статей-заглушек НЕ найдено.

### 🛡 Безопасность — образцово

**Без находок (доказательства):**
- **CSP** (`public/_headers`): `default-src 'self'`; `script-src 'self' + googletagmanager` (БЕЗ `unsafe-inline` — гейт `qa.mjs:251` это валит как critical, qa=GO значит чисто); `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`; connect-src ограничен (open-meteo/er-api/GA). + HSTS preload, XFO DENY, nosniff, Referrer-Policy, Permissions-Policy (interest-cohort=()). ✓
- **Consent Mode v2** (`public/js/analytics.js` + `CookieConsent.astro`): default `denied` по всем 4 (ad_storage/ad_user_data/ad_personalization/analytics_storage); `granted` только при согласии (localStorage `mg-consent`); guard по hostname (`/(^|\.)montenegroguidebook\.com$/` — dev/preview/evil-домены статистику не шлют). Единственная аналитика (GA4), внешний self-скрипт (без inline → CSP не ослаблен). ✓
- **/go/** — не open-redirect (см. монетизацию). ✓

### 🔧 a11y / перф — статически чисто

- **JS-бюджет ≤50 КБ/стр:** все `public/js/*.js` мелкие (max map-init 10.1 КБ, lightbox 9.3 КБ); 113 КБ — это ВСЕ скрипты репо, а гейт `qa.mjs:209-216` считает ПОДКЛЮЧЁННЫЕ на конкретной странице и валит >50 КБ → qa=GO значит ни одна страница не превышает. ✓
- **alt/h1/width-height:** `qa.mjs` валит `<img>` без alt (critical), >1 `<h1>` (medium), `<img>` без width/height (minor-CLS). Фигуры в статьях имеют width/height (пример: `renting-a-car` figure width=1280 height=960). qa=GO. ✓
- Шрифты preload (Unbounded/Manrope), font-display swap, immutable-кэш `_astro`/`fonts`. ✓
- _Перф главной (Lighthouse mobile 89, hero-LCP) — известный Medium из AUDIT.md; браузерный слой вне READ-аудита, не перепроверял._

### 🔧 /work-готовность (форк-гигиена) — чисто

- Остатки «Georgia/Грузия/GEL/Сарпи/Tbilisi/lari» в `.claude/agents/*` и `scripts/*`: **0 реальных** (grep дал только `грузил/грузит` = рус. глагол «загружать» в комментариях astro-engineer/build-cover-variants — ложные срабатывания). Осознанный провенанс «форк движка Georgia» в SPEC/README + архив `docs/_georgia-reference/` — по дизайну, не трогать. ✓
- Гео-enums локализованы (coastal/central/northern), i18n только en/ru (uk нет). ✓
- Скиллы репо на месте: add-content / news / full-audit (Montenegro-специфичные). ✓

---

## GSC-сигналы (из `docs/audit/GSC-baseline-2026-06-28.md`)

- **Montenegro: 12 кликов / 621 показ** (неделя №1, старт 0→621). Топ-гео: **NL 137, UK 98**, ME, US, DE, RU → **EN-first Tier-1 подтверждён**, RU — вторичный (есть, но не ведущий).
- **Новости = ранний двигатель:** `news/visa-russia` 177 показов **поз 4.55**, `flynas` 59, `made-in-ny-jazz` 34 (**поз 6.18**) — реально ранжируются (свежесть + низкая конкуренция событий). → недельный дайджест оправдан.
- **Сетевой сигнал «деньги №1» = страховка:** на albania/croatia огромный спрос на travel-insurance при слабом ранге (поз 64–94). У montenegro есть `montenegro-travel-insurance` (1558 сл) — кандидат на тот же климб (углубить + перелинковка с visa/entry/budget).
- Развлечения/nightlife — недооценённый кластер со спросом (budva nightlife) — у нас уже есть.

---

## Рекомендации

### 1H — Язык / реклама (строго аддитивно)
- **EN — ведущий, растить; ru НЕ трогать (ранжируется).** Паритет 29/29 держать (gate `check-parity`). GSC подтверждает Tier-1 (NL/UK/US/DE) на EN — приоритет тем и ключей от EN-интента; RU-переводы продолжать как вторичный рынок, но не как драйвер плана.
- **Реклама: дисплей НЕ подключать** (CSP/перф-конфликт, решение владельца; пересмотр при доле Tier-1 ≥40%). Монетизация — только партнёрки через `/go/`.
- **Действие владельца (P2):** зарегистрировать DiscoverCars/GetYourGuide/Booking + починить EKTA-атрибуцию в Travelpayouts → заменить болванки в `partners.json` на трекинг-ссылки (`allowSubId:true`). До тех пор EN-статьи корректно используют trip-carhire/safetywing (атрибуция работает) — потери минимальны.

### 1I — Каденс / KPI (по данным GSC; KPI = деньги/показы, НЕ число статей)
- **Каденс:** держать темп (план до 31.07: 3 темы/будень + маршрут по Вс), но **не гнать число ради числа** — KPI = показы/позиции/доход по кластерам. Приоритет публикаций сместить на доказанные спросом кластеры:
  1. **Страховка** (`montenegro-travel-insurance`) — углубить + перелинковать с entry-requirements/visa-russia/cost-of-living → климб с «молодого» ранга (сетевой паттерн: insurance = высокий интент + 💰).
  2. **Новости еженедельно** — ранний трафик (visa-russia поз 4.55, jazz поз 6.18); продолжать /news-дайджест.
  3. **Nightlife/развлечения** — недооценённый кластер со спросом.
- **Перелинковка на уже ранжирующиеся** (visa-russia, made-in-ny-jazz, entry-requirements) с новых статей — поднимать их позиции.
- **Гигиена кластера маршрутов:** развести `7-day-itinerary` vs `road-trip` (Medium-dedup выше) до фазы новых публикаций, чтобы не углублять каннибализацию.
- **Следующий замер GSC — Пн 06.07:** сверить показы/позиции, отметить выросшие страницы (метрика прогресса — рост показов/позиций, не +N статей).

---

## Итог
Сайт в крепком состоянии: тех-SEO/hreflang/canonical/sitemap корректны, CSP + Consent Mode v2 образцовы, `/go/`-дисциплина чистая (0 прямых URL, живая атрибуция SubID), фото-гейт ≥5 зелёный (0 статей под порогом — P1-4 закрыт), 4-й гейт `check-dedup` live с пустым бейслайном, форк-гигиена чистая (0 грузинских хвостов). **Critical/High — нет.** Открытое: 1×Medium монетизация (болванки EN-партнёрок — action владельца, в контенте не используются), 1×Medium контент (мягкая каннибализация двух маршрутов — мимо порога гейта), мелочи (durmitor −36 слов; doc-drift в AUDIT.md/robots.txt).
