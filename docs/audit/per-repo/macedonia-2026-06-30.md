# Per-repo deep audit — North Macedonia Guidebook (1B)

**Дата:** 2026-06-30 · **Режим:** READ-ONLY (ничего не менялось, без commit/push/build) · **Источник правды:** файлы + git + dist, не старые доки.
**Репо:** `sashakobtsev21-stack/macedonia-site` · **Клон:** `C:/Users/Oleksandr/Desktop/multiagent/sites/macedonia-site` · **Домен:** macedoniaguidebook.com · **Язык:** en (EN-only) · **Ветка:** main (чисто).

## Сводка по факту (пересчитано)
- **Контент (git ls-files, не-draft):** статьи **27**, маршрут **1** (`north-macedonia-7-day-itinerary`), рестораны **3**, коллекция `cities` **0** (город = статья `category=cities` — модель соблюдена: things-to-do-in-skopje/ohrid/bitola/tetovo), `services` **0** (директория пуста, под noindex + вне sitemap — осознанно, см. astro.config filter).
- **Черновиков нет** (`draft:true` отсутствует) — всё опубликовано.
- **Гейт-бейслайны пусты:** `.dedup-baseline.json` = `{reversePairs:[],titlePairs:[]}`, `.photo-baseline.json` = `[]`, `.links-baseline.json` = `[]` → ноль grandfathered-исключений (чистый старт всех ratchet-гейтов).
- **Тех-стек:** Astro 6.4.6, @astrojs/sitemap 3.7.3, Tailwind 4, Leaflet 1.9.4; output static, trailingSlash always; хостинг Cloudflare Workers (Static Assets) + Worker-роут `/go/`.

## Измерения (подтверждено независимо)

### Индексируемость / тех-SEO — ЗДОРОВО
- **sitemap:** `dist/sitemap-index.xml` + `sitemap-0.xml` собраны; URL с трейлинг-слешем; `/go/`, пустой `/relocation/services/` и demo-слаги отфильтрованы (astro.config.mjs:107–115); `lastmod` из updatedAt/publishedAt (P2-9), x-default→en в serialize.
- **hreflang/canonical:** BaseLayout.astro:149/157/159 — `rel=canonical` + `alternate hreflang={l}` + `hreflang=x-default→en`; служебные (404) без canonical/hreflang (зеркал нет). Корректно для одноязычного сайта.
- **robots.txt:** `Allow: /`, `Disallow: /go/`, Sitemap указан. (Минорная стяжка: комментарий всё ещё говорит «en/ru/uk» — фактически только en.)
- **_redirects:** `/en/*`, `/ru/*`, `/uk/*` → `/:splat` 301 (миграция на одноязычность закрыта).
- **Длины title≤60 / desc≤155 (в СИМВОЛАХ, node-пересчёт):** **0 нарушений** на всех 27 статьях + маршрут. ⚠️ Bash `wc -m` ложно показал things-to-do-in-tetovo desc=156 из-за многобайтных `Š` — это ровно ловушка памяти `seo-meta-length-chars-not-bytes`; по символам = 154, OK.

### Качество контента — ЗДОРОВО (выборка 2 money-страниц + рестораны)
- `north-macedonia-trip-cost` (2140 слов, ранг GSC 8.12): живой тон, конкретные диапазоны €/MKD, 9 источников с инлайн-цитатами (Numbeo/FlixBus/JSP/официальный прайс аэропорта), peg-факт 61.3644 MKD/EUR. Не ИИ-вода.
- `north-macedonia-travel-insurance` (1845 слов): YMYL-дисклеймер на месте (blockquote), EHIC корректно помечен невалидным вне ЕС, виза РФ с 21.03.2022 верно, мягкие формулировки «some sources indicate» + «verify mfa.gov.mk». Эталон YMYL-аккуратности.
- **Объём корпуса:** все вечнозелёные 1277–2439 слов (cost-of-living 2439 и trip-cost 2140 чуть длинноваты, но норм для денег); новости 341/386 слов (≈стандарт). Тонких заглушек нет.
- **Рестораны (3):** реальные места (Destan с 1913, консенсус >4★), `coverIllustrative:true` честно помечает «иллюстрация, не фото заведения», CC-кредит присутствует, чужие отзывы не копируются (свой review.loved/watch). Без партнёрок (корректно).

### Монетизация — ЗДОРОВО, 1 известный долг
- **`/go/`-дисциплина соблюдена:** в контенте партнёрские ссылки только через ключи partner (trip-hotels/airalo/safetywing/trip-tours), прямых URL партнёрок в .md нет. AffiliateBox.astro:44 жёстко ставит `rel="sponsored nofollow noopener" target="_blank"`. Worker /go/ имеет анти-open-redirect (safeFallback на свой origin).
- **partners.json:** общий сетевой файл; рабочие трекинг-ссылки Trip.com (Allianceid 8701645) + Travelpayouts tpx.gr (airalo/localrent/aviasales/yesim/kiwitaxi/bikesbooking) с SubID; SafetyWing referenceID. **EKTA = ВРЕМЕННО прямой `ektatraveling.com` без атрибуции** (документировано в $schema-note: присланная tpx.gr-ссылка вела на VisitorsCoverage с «marker is not subscribed»). Это единственная болванка/недолинкованный партнёр.

### Фото — ЗЕЛЁНЫЙ (подтверждено независимо, P1-4 закрыт)
- Пересчёт по каждой статье (cover+gallery+inline figures): **0 статей под порогом ≥5** (новости d-festival/ohrid-airport = 2 при min-новость 2 — ОК). Skopje=16, Ohrid=18, Bitola=13, Tetovo=11 — превышают цели столица≥15/город≥10.
- check-photos.mjs валит ERROR на cover>200КБ / отсутствие cover у articles/routes; рестораны/услуги/города — WARN. **WARN не сработал:** все 3 ресторана имеют cover. Фото-бейслайн пуст → реально ноль легаси под порогом.

### Безопасность — ЗДОРОВО
- **_headers:** CSP `default-src 'self'`, `script-src 'self' googletagmanager` (без `unsafe-inline` в скриптах), `frame-ancestors 'none'`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`; HSTS preload, X-Frame-Options DENY, Permissions-Policy (geolocation/mic/camera/payment off + interest-cohort off), nosniff. Кэш immutable для _astro/fonts.
- **Consent Mode v2 — ЕСТЬ и корректен:** ga-init.js — default `denied` по всем 4 сигналам (ad_storage/ad_user_data/ad_personalization/analytics_storage), GA cookieless до согласия; consent-banner.js поднимает до granted по Accept (ключ `mk-consent`). Единственная аналитика GA4 (G-4XYMNPQ34N) — соответствует rule 9.

### a11y / перф (статически) — ЗДОРОВО
- **JS-бюджет:** каждый файл public/js ≤10КБ (max map-init 10.1КБ, lightbox 9.3КБ), грузятся условно/lazy → <50КБ/страница соблюдается. HotelWidget/Leaflet — click-to-load.
- **alt/h1/schema:** qa.mjs валит как critical: `<img>` без alt, отсутствие canonical, непарсящийся JSON-LD, невзаимный hreflang, img>200КБ, inline `on*=`/`javascript:`-URL. PROGRESS фиксирует серию из 11 a11y-фиксов (порт с эталона gruzia 284cb30: aria-label nav, уник. id, контраст стрелок WCAG 1.4.11, focus-visible, тач-чипы ≥44px).

### Точность доков — ЗДОРОВО
- HANDOFF (2026-06-30): «Статей ~27» = git-факт 27. PROGRESS top 2026-06-30, последний коммит совпадает с git log. Де-сиротинг честно отмечает, что у `skopje-nightlife` нет 2-го естественного родителя (оставлена 1 ссылка). Доки синхронны с кодом.
- В контенте нет висящих TODO/FIXME/example.com/`[требует сверки]`/placeholder.

### /work-готовность (форк-остатки) — ЧИСТО
- grep `georgia|грузи|GEL|сарпи|tbilisi|batumi` по `.claude/ scripts/ worker/ src/`: **0 реальных остатков**. Совпадения — глагол «грузится» (loads) и осознанный guard в fact-checker.md:25 («флаг ru/uk-артефакты или донорские грузинские факты GEL/Сарпи»). Слаги английские, LANGS=['en'].
- Мелочь: partners.json $segmentation-note и fonts.css описывают ru/uk-сегментацию/кириллицу (наследие донора) — для EN-only мёртвый, но безвредный код; cyrillic woff2 всё ещё в public/fonts (вес).

---

## Находки (severity · теги · доказательство · влияние · фикс · усилие · вердикт)

**[High · 💰] EKTA — временный прямой URL без атрибуции, доход теряется**
`src/data/partners.json:43` → `"ekta": { "urlTemplate": "https://ektatraveling.com/", allowSubId:false }`. Клики по EKTA уходят без SubID → атрибуция/комиссия не засчитываются.
· влияние: страховой кластер — доказанный спрос по сети (GSC: insurance топ-показы у albania/croatia); потеря конверсий по MK-страховке.
· фикс: вступить в программу EKTA в Travelpayouts, заменить на корректную tpx.gr-ссылку, вернуть `?sub_id={subid}` + `allowSubId:true`. Сетевой файл — фикс тиражируется на все 5 сайтов.
· усилие: S (1 строка + кабинет). · вердикт: ИСПРАВИТЬ (вне READ-ONLY; общий для сети).

**[Low · 🔧] robots.txt и partners.json/fonts.css содержат ru/uk-наследие донора**
`public/robots.txt:3` «карта … en/ru/uk»; `partners.json` $segmentation-note про RU/UK→Localrent; `src/styles/fonts.css` + `public/fonts/*cyrillic*` — кириллические woff2.
· влияние: косметика + лишний вес шрифтов (кириллица не нужна EN-only); риск спутать будущего исполнителя. Не влияет на индексацию/рендер.
· фикс: обновить комментарий robots; при желании выпилить cyrillic-woff2 и unicode-range из fonts.css. byLang в partners.json оставить (общий сетевой файл — у gruzia RU/UK живые).
· усилие: S. · вердикт: housekeeping (низкий приоритет).

**[Low · 🔧] Дублирующиеся/устаревшие доки в корне репо**
`ROADMAP.md` + `ROADMAP-FIX.md` + `AUDIT.md` + `AUDIT-2026-06-22.md` сосуществуют; `docs/_georgia-reference/` = 64 файла справки донора.
· влияние: шум при онбординге; риск рассинхрона (правило «доки актуальны»). _georgia-reference только в docs/, код не трогает.
· фикс: слить ROADMAP-FIX → ROADMAP, архивировать AUDIT-2026-06-22; _georgia-reference оставить как референс или вынести из репо.
· усилие: S. · вердикт: housekeeping.

**[Low · 🛡] npm audit high/critical в build-tooling (esbuild/vite)**
`scripts/qa.mjs:90` помечает medium, не блокирует GO; vite 7.3.5 / astro 6.4.6.
· влияние: уязвимости в dev-/build-зависимостях, в прод-бандл статики не попадают. Реальный, но низкий риск.
· фикс: мажорный апгрейд Astro (решение владельца) — отложено осознанно.
· усилие: M. · вердикт: принято (мониторить).

**Анти-каннибализация (④ гейт) — РИСКОВ НЕ НАЙДЕНО.** Транспортный кластер интент-различен: `how-to-get-to-ohrid-from-skopje` (how-to) vs `ohrid-to-bitola`/`skopje-to-bitola` (разные origin, не reverse-пара) vs `tirana-to-ohrid-skopje` (кросс-бордер). Ohrid-кластер: `lake-ohrid` (достопримечательность) / `things-to-do-in-ohrid` (город) / `where-to-stay-in-ohrid` (жильё) / `ohrid-boat-trip-sveti-naum` (активность) — разные намерения. check-dedup (slug-коллизии + reverse-пары + title-Jaccard≥0.85) проходит с пустым бейслайном.

---

## Рекомендация 1H — язык / реклама (строго АДДИТИВНО)
- **Язык: оставить EN-only.** GSC топ-гео MK 92 / US / NL / UK / DE / GR — Tier-1 EN-аудитория подтверждается; ru/uk удалены осознанно, ранжирующего ru/uk-следа нет → нечего «не рвать». Новые ru/uk НЕ добавлять (нарушит модель и распылит малый домен).
- **Реклама: аддитивно.** Дисплей-реклама на Tier-1-трафике (STRATEGY O5) — открытое решение; включать ТОЛЬКО явным решением владельца (конфликтует с CSP/перф-духом — потребует правки `script-src`/`frame-src` и пересмотра перф-бюджета). Пока трафик молодой (261 показ) — рано; сперва нарастить показы.
- **Партнёрки:** закрыть EKTA (High выше) — единственный денежный долг; остальная связка `/go/` рабочая.

## Рекомендация 1I — каденс / KPI (по данным GSC, KPI = деньги/показы, НЕ число статей)
- **KPI (не количество статей):** (1) рост **показов** MK (база 261 → цель ×3–4 к след. замерам); (2) **позиции** ранжирующих страниц на стр.1 — `d-festival-dojran` (6.41) и `north-macedonia-trip-cost` (8.12) уже близко; (3) **доход**: клики по `/go/` insurance/car-rental/eSIM (после фикса EKTA).
- **Каденс — точечно, под клаймб, а не вал:**
  1. **Усилить уже ранжирующее** перелинковкой/глубиной: `north-macedonia-trip-cost` (8.12) и страховую (доказанный сетевой спрос на insurance) — добавить входящие из safe/visa/budget, освежить даты. Самый дешёвый выигрыш.
  2. **Новости — держать недельный дайджест:** `d-festival-dojran` уже дал 6 кликов/124 показа — событийная свежесть = ранний двигатель малого домена. Не убирать.
  3. **Релокация/номады кластер** (cost-of-living уже 2439 слов, ранг есть) — приоритетный маржинальный, менее сезонный: добить регистрацию DOO/DOOEL, 10% налог, ВНЖ (YMYL — только первоисточники).
- **Темп:** в рамках сетевого «3 статьи/будень на 4 EN-сайта» Македония получает долю под клаймб ранжирующих кластеров (планирование/insurance/relocation/Ohrid), а не массовую генерёнку. Сверять с GSC-замером Пн 2026-07-06.
