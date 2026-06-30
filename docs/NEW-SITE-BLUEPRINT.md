# NEW-SITE-BLUEPRINT — эталон сборки нового сайта-путеводителя

> READ-ONLY аудит-артефакт (2026-06-30). Источник правды — файлы донора `sites/gruzia-site` и форков `sites/{montenegro,croatia,albania,macedonia}-site`, пересчитано по ФС/git, не по старым докам. Назначение: из движка-донора и форков извлечь воспроизводимый эталон, чтобы стандовый новый сайт (Босния → Армения → Сербия) собирался **off-domain**, EN-first, аддитивно к сети, без переделок на поздних этапах. Пошаговый скаффолд — `docs/NEW-SITE-CHECKLIST.md`.

Решения владельца 2026-06-30, зашитые в блюпринт: новые сайты **EN-first** (как montenegro/croatia: en ведущий + опц. ru; albania/macedonia — только en); каденс/KPI — по данным GSC (KPI = показы/позиции/доход по кластерам, не число статей); 4-й гейт «одна интент-страница» (`check-dedup`) — уже live в 5 репо; фото-гейт ≥5 (`check-photos` инлайн-ratchet) — уже live.

---

## 0. Что такое «новый сайт» в этой сети
Новый сайт — это **форк движка Грузии** (Astro 6.4.6 SSG + Tailwind 4 + Leaflet, Cloudflare Workers Static Assets, контент-коллекции, QA-гейты, фото-пайплайн, ~20–21 субагент, скиллы `add-content`/`news`/`full-audit`). Грузия — единственный сайт с инлайн-GA и тремя языками ru/uk/en; EN-форки (montenegro/croatia/albania/macedonia) уже несут **анг­лизированную контент-модель** и **Consent-Mode-паттерн аналитики** — для новых EN-сайтов донор «по факту» = **montenegro-site** (en+ru) или **albania/macedonia-site** (только en), а Грузия — источник движка/гейтов/скриптов. Память сети: `shared-engine-port-fixes-to-all-forks` (5 сайтов = форки; общий фикс тиражируется на все).

**Самый практичный способ скаффолда:** `cp -r` готового EN-форка (montenegro для en+ru, macedonia для en-only), а НЕ Грузии — тогда категории/i18n/CSP/консент уже в EN-форме, остаётся ~30 точек переименования. Из Грузии берём только то, что в форке могло отстать (свежие `scripts/*` гейты, агенты-эталоны).

---

## 1. Стек и гейты (npm scripts)

`package.json` (донор `georgia-guidebook`, форк → `{country}-guidebook`):
- **Зависимости (prod):** `astro@6.4.6`, `@astrojs/sitemap@3.7.3`, `leaflet@1.9.4`, `rehype-external-links@^3.0.0`.
- **devDeps:** `@astrojs/check`, eslint(+astro,+ts), `@tailwindcss/vite@4.3.0`, `tailwindcss@4.3.0`, `@types/leaflet`, `chrome-launcher`, `lighthouse`, `playwright-core`, prettier(+astro), typescript, `vite@7.3.5`. `overrides: @tailwindcss/vite→vite:$vite`. `engines.node >=20`.
- **scripts:** `dev/build/preview/check` (astro), `lint/format/format:check`.

Контент-гейты (ядро дисциплины; **наследуются клонами 1-в-1**):
| script | файл | роль |
|---|---|---|
| `test:links` | `scripts/check-links.mjs` | внутр. ссылки + `/go/`-редиректы (формат `/{cat}/{slug}/`, `/ru/…`) |
| `test:parity` | `scripts/check-parity.mjs` | паритет языковых версий (для en-only — тривиально проходит) |
| `test:enums` | `scripts/check-enums.mjs` | enum-слаги ↔ i18n-словари (attractionTypes/regions/cuisineKeys/serviceRubrics…) |
| `test:photos` | `scripts/check-photos.mjs` | **ratchet #2:** cover обязателен у articles/routes + ≥5 фото статья / ≥2 новость / cover+фото-на-остановку маршрут; ≤200 КБ; бейслайн `scripts/.photo-baseline.json` |
| `test:interlinks` | `scripts/check-interlinks.mjs` | ≥2 внутр. ссылки, анти-сироты |
| `test:dedup` | `scripts/check-dedup.mjs` | **ratchet #3 (④ гейт):** slug-коллизии (HARD FAIL), обратные транспорт-пары X-to-Y/Y-to-X, почти-дубли заголовков (Jaccard ≥0.85); бейслайн `scripts/.dedup-baseline.json` |
| `test` | — | `check-enums && check-parity && check-photos && check-interlinks && check-dedup` |
| `qa` | `scripts/qa.mjs` | **финальный GO/NO-GO:** гейты + чистая сборка + статический аудит `dist/` (SEO/hreflang/schema/a11y/перф/CSP). ⚠️ выходит 0 даже при NO-GO → проверять строку **«ВЕРДИКТ»**, не `$?` (память `qa-verdict-not-exit-code`) |
| `qa:responsive` | `scripts/qa-responsive.mjs` | overflow на мобильной ширине |
| `qa:browser` | `qa-lighthouse.mjs && qa-responsive.mjs` | mobile-Lighthouse (нужен системный Chrome) |
| `new` | `scripts/new-content.mjs` | скелет контента |
| `build:covers` | `scripts/build-cover-variants.mjs` | srcset-варианты обложек + `cover-variants.json` |

Прочие скрипты (наследуются): `build-gallery.mjs`, `build-route-geometry.mjs`, `make-og.mjs`, `dup-scan.mjs`, фото-кандидаты `commons-candidates.mjs`/`commons-meta.mjs`/`openverse-candidates.mjs`/`unsplash-candidates.mjs`/`build-unsplash.mjs`.

> **check-dedup + check-photos уже в `npm test` донора и всех 5 форков** — это «гейты сети» из решения владельца, при `cp -r` форка переезжают автоматически. Их бейслайны (`.dedup-baseline.json`, `.photo-baseline.json`) у нового сайта должны быть **пустыми** (нет легаси), иначе фиктивно гасят настоящие нарушения.

**Loaders:** `src/loaders/contentGlob.ts` + `getCollectionSafe.ts` (используются в `content.config.ts` и шаблонах) — копировать как есть.

---

## 2. Схема коллекций (`src/content.config.ts`, zod)

5 коллекций: **articles · routes · cities · restaurants · services**. `export const collections = { articles, routes, cities, restaurants, services }`.

- **`LANGS`** — массив языков сайта. Грузия `['ru','uk','en']`; montenegro/croatia `['en','ru']`; albania/macedonia → `['en']`. **DEFAULT = первый/en на корне.**
- **`articleBase`** (фабрика, расширяется `routes`): title, `yearInTitle` (bool, подставляет тек. год — для денежных гайдов), description (≤155), slug, lang (enum LANGS), category (enum CATEGORIES), publishedAt/updatedAt/verifiedAt, featuredOrder, geo{coord,address}, qualityMark, website/instagram, attractionType/region/razvlType (опц. фильтры каталога), tags, cover{src,alt}(опц.)+coverCredit, gallery[]{src,alt,credit}, accessFrom{…}, visit{price,hours,note,checkedAt}, affiliate[]{partner,label,priceFrom,position}, sources[], demo, draft. _(Поле `hotelWidget` удалено вместе с виджетом Trip.com 2026-06 — не воспроизводить в новых сайтах.)_
- **`routes`** = `articleBase.extend({ category: literal, cover: image (обяз.), days, distanceKm, budgetFrom{amount,currency}, stops[]{name,km,coord,stayMin?,note?,photo?}, bestSeason[MONTHS] })`.
- **`cities`** — короткая схема (name/region/coord/lang/slug/summary/cover?/article:reference). **ПУСТАЯ И НЕ ИСПОЛЬЗУЕТСЯ** во всех 5 (задел под API §23). НЕ наполнять.
- **`restaurants`** — name/slug/lang/city/cuisine(+cuisineKey enum)/priceLevel/geo/mapUrl/ratingNote/review{loved,watch}/hours/dishes/sponsored/coverIllustrative/placeType…
- **`services`** — name/slug/lang/rubric(enum)/city/summary/url(regex https)/contact/sponsored/demo…

### Контент-модель городов (важно — иначе клон плодит лишнюю коллекцию)
**Город = статья.** Категория: Грузия `goroda`; **EN-форки `cities`** (проверено по montenegro: `category: 'cities'` × 4 файла, коллекция `cities/` пуста). URL `/{cities|goroda}/{slug}/`. Коллекция-схема `cities` есть, но папки `src/content/cities/{lang}/` **пусты** — так задумано. Память `cities-as-goroda-articles`.

### Англизация CATEGORIES (ключевое отличие EN-форка от Грузии)
Грузия (ru-слаги) → EN-форк (en-слаги), проверено по montenegro:
`dostoprimechatelnosti→attractions`, `goroda→cities`, `eda→food`, `razvlecheniya→entertainment`, `marshruty→routes`, `transport→transport`, `arenda-avto→car-rental`, `relokatsiya→relocation`, `strahovka→insurance`, `novosti→news`, `planirovanie→planning`. (Грузия `routes`-коллекция `category: literal('marshruty')`; montenegro — `literal('routes')`.) Валюта `PRICE_LEVELS`: Грузия `₾`, Черногория/Балканы `€`. **Для нового сайта брать EN-набор из форка**, не переводить вручную.

---

## 3. i18n (`src/i18n/`)

Файлы: `index.ts` (точка входа + helpers), `types.ts` (типы + экспорт слаг-наборов), `ru.ts`/`uk.ts`/`en.ts` (словари). EN-форк держит только нужные (`en.ts`+`ru.ts`+`index.ts`+`types.ts`; uk удалён).
- Язык — из пути (`/uk/`→uk, `/ru/`→ru, иначе DEFAULT). Без автодетекта/гео-редиректов.
- Helpers: `t(lang)`, `langPrefix`, `mirrorPath`, `sectionHref`, `articleHref` (`/{cat}/{slug}/`), `formatDate` (Intl, UTC), `monthName`, `*Label` (attractionType/region/razvlType/serviceRubric).
- Конфиг-наборы, привязанные к гео и enum (правятся под страну): `EDA_CITY_PAGES` (per-city страницы еды: key+slug+citySlug), `SECTION_KEYS`/`ALL_SECTION_KEYS`/`PRIMARY_TILE_KEYS` (порядок IA), `HUB_AFFILIATE_PARTNER` (хаб→партнёр Trip.com), `MONTH_SLUGS`, `LOCALE` (ru-RU/uk-UA/en-US), `REGION_SLUGS`/`ATTRACTION_TYPE_SLUGS`/`RAZVL_TYPE_SLUGS`/`SERVICE_RUBRIC_SLUGS`/`CUISINE_KEY_SLUGS` (↔ enum в content.config, сверяет `check-enums`).
- **Регионы (`REGIONS`) — строго гео:** Грузия = 11 мхаре + Тбилиси. Новый сайт → перечень регионов/жудании/общин страны + столица; синхронно enum в content.config + лейблы в словарях, иначе `check-enums` падает.

**SEO-меты в символах, не байтах** (title ≤60 / desc ≤155) — кириллица 2 байта/символ даёт ложные «над лимитом» (память `seo-meta-length-chars-not-bytes`).

---

## 4. Монетизация (`/go/` + partners.json)

- **`worker/index.ts`** — Worker поверх Static Assets: единственная динамика — `/go/{partner}?c={slug}` → 302 на `urlTemplate` партнёра с `{subid}` (SubID атрибуция, если `allowSubId!==false`); неизвестный/невалидный (не https) target → безопасный фолбэк на свой сайт (анти-open-redirect); http→https 301. Логику НЕ менять без обновления partners.
- **`src/data/partners.json`** — карта `{partner: {urlTemplate, allowSubId}}`. У донора: Trip.com (carhire/hotels/transfers/tours, Allianceid/SID/trip_sub3 — **аккаунт-специфичны**), Travelpayouts `*.tpx.gr` (airalo/localrent/aviasales/yesim/kiwitaxi/bikesbooking), safetywing, EKTA (⚠️ временно прямой URL без атрибуции — известный P1 сети «EKTA сломана во всех 5», новому сайту НЕ копировать сломанный вид: ставить корректную tpx.gr-ссылку или не подключать).
- **Правило:** партнёрки только через `/go/{partner}` c `rel="sponsored nofollow noopener"`; 1–3 AffiliateBox на статью; прямые URL в контенте запрещены.
- Trip-параметры (Allianceid 8701645 / SID 319548076 / trip_sub3 D17960553) у форков переиспользуются (один кабинет Trip.com) — но **проверить, не нужен ли свой SID на гео**; tpx.gr-ссылки общие по аккаунту Travelpayouts.

---

## 5. Аналитика + Consent Mode v2 (развилка донора)

**Две реализации в сети — для нового EN-сайта брать паттерн Хорватии/Черногории, НЕ Грузии:**
- **Грузия (инлайн-GA):** `BaseLayout.astro` head — внешний `gtag/js?id=G-PV88LQSD3W` + **инлайн** `gtag('config',…)`. CSP `script-src` несёт **`'sha256-…'` хеш этого инлайна** → при смене ID/текста хеш надо пересчитывать. Consent Mode «минимум».
- **EN-форки (Consent-Mode-паттерн, эталон — `croatia-site`):** внешние `public/js/ga-init.js` (ставит `analytics_storage='denied'` ДО согласия) + `public/js/consent-banner.js` + компонент `src/components/CookieConsent.astro` (баннер accept/decline, выбор в storage). CSP остаётся **`script-src 'self' https://www.googletagmanager.com`** БЕЗ sha256 (нет инлайна → нечего хешировать). i18n несёт строки баннера.
- **GA4 measurement ID — СВОЙ на сайт** (проверено: gruzia `G-PV88LQSD3W`, montenegro `G-MMFK991W8V`, croatia `G-MD4WT1JQ57`). Новый сайт → новое GA4-свойство + ID.
- Правило 8: **одна аналитика** (GA4). Cloudflare Web Analytics отключена, тег-менеджеров нет, виджетов соцсетей/чатов нет.

> Реестр помечал Consent Mode v2 «✅ только Хорватия; AL/ME/MK — ❌». Для нового сайта это закрывается копированием CookieConsent+ga-init+consent-banner из croatia — тогда CSP без инлайн-хеша (меньше поддержки).

---

## 6. SEO-обвязка

- **`astro.config.mjs`:** `site:'https://{country}guidebook.com'`, `trailingSlash:'always'`, `output:'static'`, `build.format:'directory'`. `markdown.rehypePlugins:[rehypeExternalLinks {rel:['nofollow','noopener','noreferrer']}]` (внешние ссылки авто-nofollow). `@astrojs/sitemap` с `i18n{defaultLocale, locales}` (под LANGS сайта) + `filter` (выкидывает `/go/`, пустые услуги, demo-слаги) + `serialize` (x-default→default-lang, lastmod из updatedAt/publishedAt). Две функции на этапе конфига: `collectDemoSlugs()` (demo→noindex, вне карты) и `collectContentDates()` (lastmod).
- **`BaseLayout.astro`:** title/description, canonical, **взаимные hreflang по доступным языкам + x-default→DEFAULT_LANG**, OG/Twitter, JSON-LD Organization+WebSite, favicon (svg + png 48/96/180/192/512-maskable из `public/icons/`), manifest, theme-color, preload шрифтов, robots-noindex для utility/demo.
- **`public/`:** `robots.txt` (Allow /, Disallow /go/, Sitemap …/sitemap-index.xml), `_redirects` (301 при смене slug — URL не переименовывать после индексации), `_headers` (**CSP**, см. §5 + per-site connect-src: open-meteo, курсовый API — у Грузии nbg.gov.ge, у форков open.er-api/er-api), `favicon.svg`, `manifest.webmanifest` (name/short_name/description — бренд страны), `og-default.jpg`, `offline.html`, `sw.js`, `fonts/`, `icons/`, `js/` (anim-init.js + у EN-форков ga-init.js+consent-banner.js), `images/` (включая флаг хедера — у Грузии `ge-flag.svg`).
- Внутр. ссылки: формат `/{категория}/{slug}/` со слешем (+`/ru/`); иначе `test:links` падает (память `astro-internal-link-format`).

---

## 7. Субагенты (`.claude/agents`) — ОБЯЗАТЕЛЬНАЯ деконтаминация

Донор Грузия: **21 агент**, все 21 упоминают Georgia/Грузию/Тбилиси (родные). Список: accessibility-auditor, architect, astro-platform-engineer, coder, content-editor, **en-translator, uk-translator**, fact-checker, monetization-strategist, perf-diagnostician, **photo-auditor, photo-researcher, photo-upgrade-researcher**, research-collector, reviewer, security-auditor, **seo-content-writer, seo-engineer, seo-strategist**, tester, ui-ux-auditor.

EN-форки уже частично деконтаминированы (проверено по ФС 2026-06-30): **croatia 0/20**, **montenegro 1/20**, **albania 2/21**, **macedonia 2/21** агентов всё ещё содержат «Georgia». uk-translator у en-only форков удалён (20 vs 21). **Самый чистый донор агентов = croatia-site (0/20).**

> **Гейт перед `/work` на новом сайте:** в агентах не должно остаться «Georgia/Грузия/Тбилиси/georgiaguidebook» — `s/Georgia/{Country}/`, обновить гео-примеры (города/регионы/кухня), убрать uk-translator если сайт без uk. Память `network-content-lessons` («процесс с агентами»). Также скрипты: у macedonia найден `scripts/_commons-verify.mjs` с грузинским UA/email — при `cp -r` проверить `scripts/*` на хардкод `georgiaguidebook.com`/`alkosletat@`.

---

## 8. Скиллы (`.claude/skills`)

Per-repo: **`add-content`** (конвейер бриф→скелет→текст→фото→перевод→фактчек→приёмка→QA; обёртка над new-content/commons-candidates/build-gallery/гейтами + проектными агентами), **`news`** (дайджест-агрегатор: сбор→фильтр→рерайт→черновики с фото→превью владельцу→публикация только после «ок»), **`full-audit`** (~11 спец-агентов параллельно → обсуждение → синтез). Скиллы форков уже локализованы (0 файлов с «Georgia» во всех 4 EN-форках) — но **в тексте скилла зашиты язык-пары и страна** (montenegro: «пары en/ru, en ведущий»; albania: «только en») → под новый сайт выставить языки/страну/категории. Хаб-скиллы (`work`/`news`/`content`) живут в хабе и оркеструют все сайты (см. §точки подключения).

---

## 9. CI / деплой / новости

- `.github/workflows/ci.yml` — гейты+сборка на push; `daily-news-rebuild.yml` — ежедневная пересборка ленты (раздел хранит 10 дней, главная 2: `NEWS_SECTION_WINDOW=10`/`NEWS_HOME_WINDOW=2` в `NewsPage.astro`).
- Деплой = **push в `main`** (Cloudflare Workers Build: `npm run build`→`wrangler deploy`). `wrangler.jsonc`: `name:'{country}-site'`, `compatibility_date`, `main:'./worker/index.ts'`, `assets{directory:'./dist', binding:'ASSETS', html_handling:'auto-trailing-slash'}`, observability. Превью-деплои на ветках.
- Репозиторий: `sashakobtsev21-stack/{country}-site` (приватный, ветка `main`).

---

## 10. ~30 точек переименования/конфига (file → что менять)

| # | Файл | Было (Грузия / форк-донор) | Стало ({country}) |
|---|---|---|---|
| 1 | `package.json` `name` | `georgia-guidebook` | `{country}-guidebook` |
| 2 | `package.json` `description` | «Georgia…» | страна |
| 3 | `astro.config.mjs` `site` | `https://georgiaguidebook.com` | `https://{country}guidebook.com` |
| 4 | `astro.config.mjs` sitemap `i18n.locales`/`defaultLocale` | en/ru/uk | по LANGS сайта (en-first) |
| 5 | `astro.config.mjs` `filter` (пустые услуги/demo regex) | гео-слаги | сверить слаги категорий |
| 6 | `wrangler.jsonc` `name` | `gruzia-site` | `{country}-site` |
| 7 | `src/content.config.ts` `LANGS` | `['ru','uk','en']` | `['en']` или `['en','ru']` |
| 8 | `src/content.config.ts` `CATEGORIES` | ru-слаги | **en-слаги** (взять из форка) |
| 9 | `src/content.config.ts` `REGIONS` | 11 мхаре+Тбилиси | регионы страны+столица |
| 10 | `src/content.config.ts` `PRICE_LEVELS` | `₾` | `€`/валюта |
| 11 | `src/content.config.ts` `CUISINE_KEYS`/`ATTRACTION_TYPES`/`RAZVL_TYPES`/`SERVICE_RUBRICS` | гео | под страну |
| 12 | `src/content.config.ts` routes `category: literal` | `'marshruty'` | `'routes'` (en) |
| 13 | `src/i18n/{ru,uk,en}.ts` | весь UI-копирайт + siteName | бренд/страна; удалить uk.ts если en-only |
| 14 | `src/i18n/index.ts` `EDA_CITY_PAGES` | tbilisi/batumi/kutaisi | города страны |
| 15 | `src/i18n/index.ts` `*_SLUGS`/`HUB_AFFILIATE_PARTNER` | гео | синхронно с content.config |
| 16 | `src/i18n/index.ts` `LOCALE` | ru-RU/uk-UA/en-US | по LANGS |
| 17 | `src/data/partners.json` Trip `SID`/`Allianceid`/`trip_sub3` | аккаунт Грузии | свериться (свой SID?), `kwd=Georgia`→страна |
| 18 | `src/data/partners.json` EKTA | сломанный прямой URL | корректная tpx.gr или убрать |
| 19 | `BaseLayout.astro` GA4 ID | `G-PV88LQSD3W` | новый `G-…` свойства |
| 20 | `public/_headers` CSP `script-src` | sha256 инлайна (Грузия) | **убрать sha256, взять consent-паттерн форка** |
| 21 | `public/_headers` CSP `connect-src` | nbg.gov.ge (курс) | API курса страны (open.er-api/er-api) |
| 22 | `public/js/ga-init.js` GA4 ID | форк-ID | новый ID (consent-default denied) |
| 23 | `public/robots.txt` | Georgia + sitemap-домен | страна + `https://{country}guidebook.com/sitemap-index.xml` |
| 24 | `public/manifest.webmanifest` `name`/`short_name`/`description` | Georgia Guidebook | `{Country} Guidebook` |
| 25 | `public/_redirects` | старые 301 Грузии | очистить (свой сайт без истории) |
| 26 | `public/images/` флаг хедера + обложки | `ge-flag.svg` + грузинские | флаг страны + свои фото |
| 27 | `public/og-default.jpg` | Грузия | свой |
| 28 | `theme-color`/`tokens.css` бренд-цвета | wine `#6b1f2e` | при желании бренд страны |
| 29 | `CLAUDE.md` (репо) | Georgia Guidebook | страна, языки, категории |
| 30 | `SPEC.md` | продукт Грузии | продукт/ниша страны (источник правды репо) |
| 31 | `.claude/agents/*` | Georgia/Тбилиси/uk-translator | `s/Georgia/{Country}/`, гео-примеры, убрать uk если en-only (см. §7) |
| 32 | `.claude/skills/*` (add-content/news/full-audit) | язык-пары/страна | EN-first язык-политика + страна |
| 33 | `scripts/*` (напр. `_commons-verify.mjs`) | хардкод `georgiaguidebook.com`/`alkosletat@` UA/email | страна |
| 34 | `scripts/.dedup-baseline.json` / `.photo-baseline.json` | легаси Грузии | **пустые** (нет легаси у нового сайта) |
| 35 | репозиторий + remote | — | создать приватный `sashakobtsev21-stack/{country}-site`, `main` |

---

## 11. 12 точек подключения к оркестратору (хаб) — БЕЗ них сайт «невидим» для /work, /news и дашборда

| # | Файл хаба | Якорь | Что добавить |
|---|---|---|---|
| 1 | `grafana/build-status.mjs` | `SITES` (≈стр. 15) | `{ key:'{country}', name:'Страна', langs:'en' }` |
| 2 | `grafana/build-status.mjs` | `DOMAIN` (≈стр. 189) | `{country}: '{country}guidebook.com'` |
| 3 | `grafana/build-html.mjs` | `FLAG` (≈стр. 18) | `{country}: '🏳'` (эмодзи-флаг страны) |
| 4 | `grafana/install-refresh-hooks.mjs` | `repoRel` (≈стр. 19) | `'sites/{country}-site'` (ставит post-commit хук на клон) |
| 5 | `.claude/skills/work` | таблица сайтов | строка нового сайта (языки/каденс по GSC) |
| 6 | `.claude/skills/news` | таблица сайтов | страна + источники новостей |
| 7 | `.claude/skills/content` | таблица сайтов | страна + календарь |
| 8 | `docs/SITES-REGISTRY.md` | таблица | колонка сайта (репо/домен/гео/языки/состояние) |
| 9 | `docs/calendars/` | hub-копия | `{country}-KALENDAR.md` (зеркало `sites/{country}-site/KALENDAR.md`) |
| 10 | `docs/seo/` | per-site SEO | `{country}-seo-YYYY-MM-DD.md` (GSC-baseline кластеры) |
| 11 | `docs/MASTER-PLAN.md` | проза «5 сайтов» | обновить число сайтов и порядок (Босния→Армения→Сербия) |
| 12 | post-commit хук на новый клон | `sites/{country}-site/.git/hooks/post-commit` | ставится через `node grafana/install-refresh-hooks.mjs` (после п.4) → обновляет дашборд после коммитов сайта |

> После любого изменения календаря — синхронизировать дашборд: hub-копия `docs/calendars/*` + пересборка (`build-status.mjs`+`build-html.mjs`); на будущих датах в плане только `○` (память `dashboard-sync-after-calendar-change`, `dashboard-calendar-parser-pitfalls`). Календарь парсится `build-status.mjs:calendarFor()` — задача = строка списка с `[Article]`/`/news`/датой; статус публикации `[x]`/`ОПУБЛИКОВАНО YYYY-MM-DD`/`✅`.

---

## 12. Гейты приёмки нового сайта (definition of ready перед /work)
1. `npm run qa` = **ВЕРДИКТ GO** (не только exit 0). 2. `check-dedup`/`check-photos` зелёные на пустых бейслайнах. 3. Все 5 коллекций строятся пустыми/с минимумом. 4. hreflang/canonical/sitemap/robots корректны на новом домене. 5. GA4-ID свой, consent-баннер работает, CSP без чужого sha256. 6. `/go/` редиректит на рабочие партнёрки (или partners пуст — не сломанный EKTA). 7. Агенты/скиллы/скрипты деконтаминированы (0 «Georgia»). 8. 12 точек оркестратора подключены, дашборд видит сайт. 9. Off-domain: домен живой HTTP 200 ДО индексации (память `domains-live-verify-not-stale-registry`), GSC-проперти заведено. 10. Доки/календарь/реестр актуальны и закоммичены в репо хаба + репо сайта (правило 7).
