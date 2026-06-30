# NEW-SITE-CHECKLIST — пошаговый скаффолд нового сайта (off-domain)

> Спутник `docs/NEW-SITE-BLUEPRINT.md`. Порядок строго сверху вниз. **Off-domain:** новый сайт строится и тестируется ДО публичной индексации (домен живой HTTP 200, но `Disallow`/preview, пока не готов). EN-first. Порядок запуска сети: **Босния → Армения → Сербия**. Числа/слаги ниже пересчитаны по ФС донора 2026-06-30 — при расхождении источник правды файлы, не этот чек-лист.
>
> Обозначения: `{country}` = slug (bosnia/armenia/serbia), `{Country}` = бренд (Bosnia/Armenia/Serbia), `{domain}` = `{country}guidebook.com`. Языки: en-only → как macedonia/albania; en+ru → как montenegro/croatia.

---

## Этап A. Выбор донора и копия
- [ ] **A1.** Выбрать донора форка по языкам: **en+ru → `cp -r sites/montenegro-site`**; **en-only → `cp -r sites/macedonia-site`** (или albania). Грузию НЕ копировать (ru-категории, инлайн-GA, sha256-CSP, uk). Донор агентов чище всего — `croatia-site` (0/20).
- [ ] **A2.** Скопировать в `sites/{country}-site/`. Удалить из копии: `node_modules/`, `dist/`, `.astro/`, `.git/` (свой репо заведём отдельно), весь `src/content/{articles,routes,restaurants,services}/**` кроме структуры папок (`.gitkeep`), `briefs/*`, старые доки прогресса донора (PROGRESS/HANDOFF/AUDIT/KALENDAR — заведём свои).
- [ ] **A3.** Подтянуть из Грузии (донор-движок) то, что в форке могло отстать: `scripts/*.mjs` гейты (особенно `check-dedup.mjs`, `check-photos.mjs`, `qa.mjs`), `src/loaders/*`. Сверить версии (`diff`).
- [ ] **A4.** Очистить бейслайны: `scripts/.dedup-baseline.json` → `{"reversePairs":[],"titlePairs":[]}`; `scripts/.photo-baseline.json` → `[]`. (У нового сайта нет легаси-долга.)

## Этап B. Идентичность сборки (package/astro/wrangler)
- [ ] **B1.** `package.json`: `name`→`{country}-guidebook`, `description`→страна. Скрипты/депсы НЕ трогать (`test` уже = enums+parity+photos+interlinks+dedup).
- [ ] **B2.** `astro.config.mjs`: `site:'https://{domain}'`; sitemap `i18n.defaultLocale`/`locales` под LANGS; в `filter` сверить regex пустых услуг/demo со своими слагами категорий.
- [ ] **B3.** `wrangler.jsonc`: `name:'{country}-site'`. Остальное (assets/main/observability) как есть.
- [ ] **B4.** `npm ci` локально НЕ нужен для аудита; для реальной сборки — да (но не в рамках READ-ONLY этапа).

## Этап C. Контент-модель (content.config.ts + i18n)
- [ ] **C1.** `src/content.config.ts`: `LANGS` под сайт (`['en']` / `['en','ru']`). `export const collections` — 5 штук без изменений.
- [ ] **C2.** `CATEGORIES` — en-набор (взять из донора-форка: attractions/cities/food/entertainment/routes/transport/car-rental/relocation/insurance/news/planning). routes-коллекция `category: literal('routes')`.
- [ ] **C3.** `REGIONS` → регионы/общины страны + столица. `PRICE_LEVELS` → валюта (€/local). `CUISINE_KEYS`/`ATTRACTION_TYPES`/`RAZVL_TYPES`/`SERVICE_RUBRICS` → под страну.
- [ ] **C4.** `src/i18n/`: en-only → удалить `uk.ts`, убрать uk из `index.ts`/`types.ts`. Перевести/заменить siteName и весь UI-копирайт под бренд. `EDA_CITY_PAGES`→города страны; `*_SLUGS`/`HUB_AFFILIATE_PARTNER`/`LOCALE` синхронно с content.config.
- [ ] **C5.** Запустить `node scripts/check-enums.mjs` — обязан пройти (enum-слаги ↔ словари). Это первый сигнал, что i18n↔config согласованы.
- [ ] **C6.** Город = статья `category:'cities'`. Папки `src/content/cities/{lang}/` оставить **пустыми**. Не наполнять коллекцию `cities`.

## Этап D. Монетизация
- [ ] **D1.** `src/data/partners.json`: оставить рабочие tpx.gr/Trip-партнёры; в Trip `kwd=Georgia`→страна; свериться, нужен ли свой Trip SID на гео. **EKTA — НЕ копировать сломанный прямой URL** (ставить корректную tpx.gr-ссылку из кабинета Travelpayouts или удалить запись).
- [ ] **D2.** `worker/index.ts` — логику `/go/` НЕ менять. Убедиться, что `import partners.json` резолвится.
- [ ] **D3.** Проверить `npm run test:links` (после минимального контента) — `/go/`-цели валидны.

## Этап E. Аналитика + Consent Mode v2 (паттерн форка, без инлайн-хеша)
- [ ] **E1.** Завести новое **GA4-свойство** → получить `G-XXXXXXXX`.
- [ ] **E2.** Убедиться, что используется consent-паттерн форка (НЕ инлайн Грузии): есть `public/js/ga-init.js` (`analytics_storage='denied'` по умолчанию) + `public/js/consent-banner.js` + `src/components/CookieConsent.astro`. Если копировали macedonia/albania без эталонного баннера — **перенести `CookieConsent.astro`+`ga-init.js`+`consent-banner.js`+i18n-строки из `croatia-site`** (Consent Mode v2 эталон сети).
- [ ] **E3.** Прописать новый GA4-ID в `ga-init.js` (и в BaseLayout loader-URL). Удалить любой инлайн `gtag('config',…)`, если затесался от Грузии.
- [ ] **E4.** `public/_headers` CSP `script-src 'self' https://www.googletagmanager.com` **без `sha256-`** (инлайна нет). `connect-src` — заменить курсовый API Грузии (`nbg.gov.ge`) на API страны (open.er-api/er-api как у форков) + open-meteo оставить.

## Этап F. SEO-обвязка / public
- [ ] **F1.** `public/robots.txt` → страна + `Sitemap: https://{domain}/sitemap-index.xml`. На off-domain этапе допустимо временно `Disallow: /` пока не готов (вернуть `Allow: /` к запуску).
- [ ] **F2.** `public/manifest.webmanifest` → `name:'{Country} Guidebook'`, `short_name`, `description`.
- [ ] **F3.** `public/_redirects` — очистить (нет истории URL). `public/og-default.jpg` → свой. Флаг хедера: заменить `ge-flag.svg` на флаг страны + поправить ссылку в `Header.astro`/токенах.
- [ ] **F4.** Иконки `public/icons/*` (favicon-48/96, apple-touch-180, icon-192/512/512-maskable) + `favicon.svg` → ребрендинг (или временно донора, заменить до запуска). `theme-color`/`tokens.css` бренд-цвета — опц.
- [ ] **F5.** Проверить hreflang/canonical: `BaseLayout.astro` сам строит по `availableLangs`+`x-default`→DEFAULT_LANG — убедиться, что DEFAULT = en.

## Этап G. Деконтаминация агентов/скиллов/скриптов (ГЕЙТ перед /work)
- [ ] **G1.** `grep -rIl "Georgia\|Грузи\|Тбилиси\|georgiaguidebook" .claude/agents/` → **0**. Заменить `s/Georgia/{Country}/`, обновить гео-примеры (города/регионы/кухня/факты), удалить `uk-translator.md` если en-only.
- [ ] **G2.** `grep -rIl "Georgia\|Грузи" .claude/skills/` → 0; в тексте add-content/news/full-audit выставить язык-политику (EN-first) + страну + категории.
- [ ] **G3.** `grep -rIl "georgiaguidebook\.com\|alkosletat@\|Georgia Guidebook" scripts/` → 0 (донор macedonia имел `scripts/_commons-verify.mjs` с грузинским UA/email — поправить).
- [ ] **G4.** `CLAUDE.md` (репо) и `SPEC.md` — переписать под продукт/нишу/языки/категории страны (SPEC = источник правды репо).

## Этап H. Минимальный контент + первый зелёный qa
- [ ] **H1.** `node scripts/new-content.mjs <type> <slug> --title "…"` — создать каркасы (учесть: донорский new-content.mjs Грузии вшивает ru/uk/en + ru-категории; на EN-форке проверить, что генерит правильные языки/категории, иначе поправить массивы `LANGS`/`ARTICLE_CATEGORIES` в скрипте).
- [ ] **H2.** Довести минимум по стандартам сети: статья 1200–2000 слов + **≥5 фото** (cover+≥4, ≤200 КБ, CC/своё с атрибуцией); новость 1500–2000 знаков + ≥2 фото; факты только из источника; ≥2 внутр. ссылки; партнёрки через `/go/`. Человечный тон — жёсткий гейт (память `human-tone-hard-gate`).
- [ ] **H3.** `npm run build` чистый → `npm test` (5 гейтов) зелёный → `npm run test:links` → `npm run qa` и **прочитать строку «ВЕРДИКТ» = GO** (exit 0 ≠ GO).
- [ ] **H4.** `npm run qa:responsive` + визуальный осмотр на ~375px (главная/хаб/статья/город) глазами (память `test-on-mobile-devices`).

## Этап I. Репозиторий + деплой off-domain
- [ ] **I1.** Создать приватный `sashakobtsev21-stack/{country}-site`, ветка `main`. `git init` в `sites/{country}-site/`, remote, первый коммит (понятное сообщение — память `descriptive-commit-messages`).
- [ ] **I2.** Cloudflare Workers Build на репо (`npm run build`→`wrangler deploy`); подключить домен `{domain}` (или workers.dev для off-domain превью). Проверить `curl -I https://{domain}` → HTTP 200 (память `domains-live-verify-not-stale-registry`).
- [ ] **I3.** Завести GSC-проперти (DNS-TXT), submit sitemap. На off-domain — можно отложить индексацию (robots), но проперти завести заранее для baseline.
- [ ] **I4.** CI: убедиться, что `.github/workflows/ci.yml` (гейты+сборка) и `daily-news-rebuild.yml` работают на новом репо.

## Этап J. Подключение к оркестратору (12 точек — БЕЗ них сайт невидим)
- [ ] **J1.** `grafana/build-status.mjs` `SITES` (≈15): `{ key:'{country}', name:'{Страна}', langs:'en' }`.
- [ ] **J2.** `grafana/build-status.mjs` `DOMAIN` (≈189): `{country}: '{domain}'`.
- [ ] **J3.** `grafana/build-html.mjs` `FLAG` (≈18): `{country}: '🏳'` (эмодзи-флаг).
- [ ] **J4.** `grafana/install-refresh-hooks.mjs` `repoRel` (≈19): добавить `'sites/{country}-site'`, затем `node grafana/install-refresh-hooks.mjs` (ставит post-commit хук на новый клон — 12-я точка).
- [ ] **J5.** Хаб-скиллы `.claude/skills/{work,news,content}` — добавить строку сайта (языки EN-first, источники новостей, каденс по GSC).
- [ ] **J6.** `docs/SITES-REGISTRY.md` — колонка сайта (репо/домен/гео/языки/зрелость/состояние).
- [ ] **J7.** `docs/calendars/{country}-KALENDAR.md` — hub-копия календаря (зеркало репо). На будущих датах только `○`.
- [ ] **J8.** `docs/seo/{country}-seo-YYYY-MM-DD.md` — SEO-кластеры/GSC-baseline (KPI = показы/позиции/доход, не число статей).
- [ ] **J9.** `docs/MASTER-PLAN.md` — обновить число сайтов и порядок запуска.
- [ ] **J10.** Пересобрать дашборд: `node grafana/build-status.mjs && node grafana/build-html.mjs`; глазами сверить окно вчера/сегодня/завтра/послезавтра с реальностью.

## Этап K. Финальная сверка (definition of ready)
- [ ] **K1.** `npm run qa` ВЕРДИКТ GO; `check-dedup`/`check-photos` зелёные на пустых бейслайнах.
- [ ] **K2.** Деконтаминация: 0 «Georgia» в agents/skills/scripts/доках.
- [ ] **K3.** GA4-ID свой; consent-баннер работает; CSP без чужого sha256; `/go/` без сломанного EKTA.
- [ ] **K4.** Домен HTTP 200; GSC-проперти заведено; hreflang/sitemap/robots корректны на новом домене.
- [ ] **K5.** Дашборд видит сайт; 12 точек оркестратора подключены.
- [ ] **K6.** Доки/календарь/реестр/MASTER-PLAN актуальны; всё закоммичено и запушено — в **репо сайта** И в **репо хаба** `sashakobtsev21-stack/multiagent` (правило 7). После этого сайт готов к `/work`.

---

### Памятки сети, релевантные скаффолду
`shared-engine-port-fixes-to-all-forks` · `cities-as-goroda-articles` · `astro-internal-link-format` · `seo-meta-length-chars-not-bytes` · `qa-verdict-not-exit-code` · `human-tone-hard-gate` · `dashboard-sync-after-calendar-change` · `dashboard-calendar-parser-pitfalls` · `descriptive-commit-messages` · `domains-live-verify-not-stale-registry` · `network-content-lessons` · `verify-repo-state-independently`.
