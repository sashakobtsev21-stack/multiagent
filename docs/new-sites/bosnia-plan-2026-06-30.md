# План реализации сайта — Bosnia and Herzegovina Guidebook (ЧЕРНОВИК на утверждение, 2026-06-30)

> Статус: **ЧЕРНОВИК для ревью владельца. Ничего не закоммичено.** Первый сайт второй волны сети (порядок запуска: **Босния → Армения → Сербия**).
> Входы: `docs/seo/bosnia-seo-2026-06-30.md` · `docs/PROFIT-ANALYSIS-2026-06-30.md` · `docs/NEW-SITE-BLUEPRINT.md` · `docs/NEW-SITE-CHECKLIST.md`.
> Учтены адверсариальные критики (линза «реальность спроса/конкуренции» + линза «деньги реальны»). Сомнительное помечено `⚠️`, требующее проверки перед публикацией — `🔍 фактчек`, дата-чувствительное — `🗓 держать актуальным`. Эти метки НЕ тащить в контент как факт.

---

## 1. Идентичность сайта

| Параметр | Решение |
|---|---|
| **Бренд** | **Bosnia and Herzegovina Guidebook** (короткое: «Bosnia Guidebook» в `short_name` манифеста/хедере) |
| **Языковая модель** | **EN-only** (английский). Донор скаффолда — `macedonia-site`/`albania-site` (en-only форк); донор Consent-баннера — `croatia-site`. `LANGS = ['en']`, DEFAULT=en на корне. uk.ts удаляется, ru-трек НЕ заводим. |
| **Почему EN-only** | Аудитория Боснии — Tier-1 Запад. Релокацию/номадов тоже ловим в EN (это US/UK/DE/NL спрос, не СНГ). По Боснии **ru-кластера нет** (в отличие от Армении/Сербии) — отдельного денежного смысла в ru здесь нет, а ru-показы не платят за рекламу и портят CWV/консент EN-ядра. |
| **Кандидат-домен** | **`bosniaguidebook.com`** (паттерн сети `{country}guidebook.com`). Альт.: `bosniaherzegovinaguidebook.com` (точнее, но длиннее — хуже для бренда/набора). 🔍 проверить доступность домена до закупки; завести off-domain (HTTP 200 + `Disallow`/preview до готовности — память `domains-live-verify-not-stale-registry`). |
| **GA4** | Своё новое GA4-свойство → свой `G-XXXXXXXX` (не копировать ID Грузии/форков). |
| **Валюта в контент-модели** | `PRICE_LEVELS` → **€** (евро как опорная валюта цен), но в тексте честно: нац. валюта **BAM/KM (конвертируемая марка)**, евро принимают НЕ везде — это отдельный угол money-страницы. |

### Гео (регионы / города / якоря)
- **Макрорегионы (`REGIONS`, синхронно enum в `content.config.ts` + лейблы в `i18n`, иначе падает `check-enums`):** предложение — 3 макрорегиона по турлогике, а не 142 общины:
  - **`herzegovina`** (юг/средиземноморье: Mostar, Blagaj, Počitelj, Kravice, Trebinje, Stolac, Neum) — главный коммерч-регион;
  - **`sarajevo-region`** (Сараево + олимпийские горы Jahorina/Bjelašnica/Igman, Konjic, Lukomir);
  - **`northern-bosnia`** (Una NP/Bihać, Jajce/Pliva, Sutjeska/Tjentište, Banja Luka, Travnik).
  - _Альтернатива:_ административные `federation-bih` / `republika-srpska` / `brcko` — но для тревел-навигации хуже (турист мыслит «Герцеговина/Сараево/север», а не энтитетами). **Рекомендация: турлогические 3 региона.** 🔍 финально утвердить набор регионов до старта (меняется потом только синхронно в 3 местах).
- **Опорные города (= статьи `category: cities`, коллекция `cities` пустая — память `cities-as-goroda-articles`):** Sarajevo (столица, ≥15 фото), Mostar (≥10), Trebinje, Jajce, Bihać, опц. Banja Luka/Konjic/Travnik по мере добора.
- **Города директории еды (`EDA_CITY_PAGES`):** Sarajevo, Mostar (старт); Trebinje — добор.
- **Точки «как доехать» (`accessFrom`):** Sarajevo (SJJ), Mostar, + **Dubrovnik / Split (Хорватия)** как внешние точки входа day-trip-трафика (ключевая особенность Боснии — половина спроса приходит из хорватских хабов).

---

## 2. Стартовый core-corpus (front-load до запуска) — **38 тем**

Принцип (из BLUEPRINT/PROFIT): сначала **informational-локомотивы объёма** (тянут к дисплей-порогам и раздают внутренние ссылки), **сразу со встроенными affiliate-блоками**, чтобы affiliate капал ещё до рекламы. Один материал — ПОЛНОСТЬЮ до публикации (гейты ①–④ + qa=GO), потом следующий (память `finish-one-item-before-next`). Ориентир брифа ~35–50 → **38 стартовых тем** ниже. Все темы взяты из P0/P1 SEO-кластеров; slug и кластер совпадают с `bosnia-seo-2026-06-30.md`.

> **💰-связки исправлены по адверсариальному ревью денег.** Главное: **Trip.com `trip-tours` по Боснии ПУСТ** (0 routes — подтверждено вебом 2026-06-30; живая тур-коммерция там у GetYourGuide/Viator, которых в нашем `partners.json` НЕТ). Поэтому day-trip/тур-темы Боснии **НЕ вешаем на `trip-tours`** — монетизируем через `localrent` (само-драйв) + `kiwitaxi` (трансфер, подтверждён живым) + `trip-hotels`. Тур-аффилиат как продукт → **TODO-решение владельца** (см. §4): либо завести GYG/Viator через Travelpayouts, либо оставить day-trips на авто+трансфер+отель. В таблице тур-метка показана как `⚠️ tours(TODO)`.

### Опорные хабы и itinerary-локомотивы (Волна 1 — магниты объёма)
| # | Title | slug | кластер | 💰-связка |
|---|---|---|---|---|
| 1 | Bosnia and Herzegovina Itinerary: The Perfect 7 Days (2026 Road Trip) | `bosnia-7-day-itinerary` | Itineraries P0 | localrent / trip-hotels |
| 2 | How Many Days Do You Need in Bosnia and Herzegovina? | `how-many-days-in-bosnia` | Itineraries P0 | trip-hotels / localrent |
| 3 | 10 Days in Bosnia & Herzegovina: The Ultimate Road Trip | `bosnia-10-day-itinerary` | Itineraries P0 | localrent |
| 4 | Bosnia Road Trip: Routes, Stops & Driving Times | `bosnia-road-trip` | Itineraries P0 | localrent |
| 5 | 3 Days in Bosnia: Sarajevo & Mostar First-Timer's Itinerary | `3-days-in-bosnia` | Itineraries P0 | kiwitaxi / trip-hotels |
| 6 | Balkans Itinerary: Croatia, Bosnia & Montenegro in 2 Weeks | `balkans-2-week-itinerary` | Itineraries P0 | localrent / trip-hotels |

### Столица Sarajevo (хаб ≥15 фото + war/история)
| # | Title | slug | кластер | 💰-связка |
|---|---|---|---|---|
| 7 | Things to Do in Sarajevo: Complete Guide (2026) — **столичный хаб, ≥15 фото** | `things-to-do-in-sarajevo` | Sarajevo P0 | trip-hotels / ⚠️ tours(TODO) |
| 8 | Sarajevo in 2 Days: The Perfect Itinerary | `sarajevo-2-day-itinerary` | Sarajevo P0 | trip-hotels |
| 9 | Sarajevo War Tour & Tunnel of Hope: How to Visit | `sarajevo-tunnel-of-hope` | Sarajevo P0 | ⚠️ tours(TODO) / trip-hotels |
| 10 | Siege of Sarajevo: Sites, Sniper Alley & History Explained | `siege-of-sarajevo-sites` | Sarajevo P0 | ⚠️ tours(TODO) |
| 11 | Baščaršija: Sarajevo's Old Bazaar (What to See & Eat) | `bascarsija-old-town` | Sarajevo P0 | trip-hotels |
| 12 | Where to Stay in Sarajevo: Best Areas & Hotels | `where-to-stay-in-sarajevo` | Sarajevo P0 | trip-hotels |

### Mostar + Croatia-gateway (главный коммерч-узел; деньга на авто+трансфер+отель)
| # | Title | slug | кластер | 💰-связка |
|---|---|---|---|---|
| 13 | Things to Do in Mostar: Complete Guide (2026) — **город ≥10 фото** | `things-to-do-in-mostar` | Mostar P0 | trip-hotels / localrent |
| 14 | Dubrovnik to Mostar Day Trip: Tour, Bus or Car | `dubrovnik-to-mostar-day-trip` | Mostar P0 | **kiwitaxi / localrent** ⚠️ tours(TODO) |
| 15 | Split to Mostar Day Trip: Tour vs Doing It Yourself | `split-to-mostar-day-trip` | Mostar P0 | **kiwitaxi / localrent** ⚠️ tours(TODO) |
| 16 | Stari Most: Mostar's Old Bridge (History, Divers & Tips) | `stari-most-old-bridge` | Mostar P0 | trip-hotels |
| 17 | Best Day Trips from Mostar (Blagaj, Počitelj, Kravice) | `day-trips-from-mostar` | Mostar P0 | **localrent / kiwitaxi** |
| 18 | Where to Stay in Mostar: Best Areas & Hotels | `where-to-stay-in-mostar` | Mostar P0 | trip-hotels |

### Герцеговина — достопримечательности петли
| # | Title | slug | кластер | 💰-связка |
|---|---|---|---|---|
| 19 | Blagaj Tekke: Visiting the Dervish House on the Buna | `blagaj-tekke` | Herzegovina P0 | localrent / kiwitaxi |
| 20 | Kravice Waterfalls: Complete Visiting Guide (2026) | `kravice-waterfalls` | Herzegovina P0 | localrent |
| 21 | Počitelj: Bosnia's Ottoman Hilltop Town | `pocitelj-ottoman-town` | Herzegovina P0 | localrent |
| 22 | Trebinje Travel Guide: Old Town, Wine & Day Trips — **город ≥10 фото** | `trebinje-travel-guide` | Herzegovina P0 | trip-hotels / localrent |

### Природа и нацпарки (дифференциатор; ⚠️ «пробел» переоценён — см. §6)
| # | Title | slug | кластер | 💰-связка |
|---|---|---|---|---|
| 23 | Una National Park: Rafting, Waterfalls & Bihać — **город Bihać ≥10 фото** | `una-national-park` | Nature P0 | localrent / ⚠️ tours(TODO) |
| 24 | Rafting in Bosnia: Una, Tara & Vrbas Rivers Compared | `rafting-in-bosnia` | Nature P0 | ⚠️ tours(TODO) / localrent |
| 25 | Jajce: Waterfall, Fortress & Pliva Lakes Guide — **город ≥10 фото** | `jajce-waterfall-fortress` | Nature P0 | trip-hotels / localrent |
| 26 | Sutjeska National Park & Maglić: Bosnia's Highest Peak | `sutjeska-national-park` | Nature P0 | localrent |
| 27 | Best Waterfalls in Bosnia and Herzegovina | `best-waterfalls-in-bosnia` | Nature P0 | localrent |

### Деньги: транспорт / аэропорты / трансферы (transactional ядро)
| # | Title | slug | кластер | 💰-связка |
|---|---|---|---|---|
| 28 | Car Rental in Bosnia: Tips & Where to Book (2026) | `car-rental-bosnia` | Getting around P0 | **localrent / safetywing** |
| 29 | Driving in Bosnia and Herzegovina: Rules, Roads & Parking | `driving-in-bosnia` | Getting around P0 | localrent |
| 30 | Which Airport to Fly Into for Bosnia (Sarajevo, Tuzla, Mostar) 🗓 | `which-airport-for-bosnia` | Getting around P0 | aviasales / kiwitaxi |
| 31 | Sarajevo to Mostar: Train, Bus or Car (Scenic Route Guide) | `sarajevo-to-mostar` | Getting around P0 | localrent / kiwitaxi |
| 32 | Dubrovnik to Sarajevo: Bus, Transfer or Drive | `dubrovnik-to-sarajevo` | Getting around P0 | kiwitaxi / localrent |
| 33 | Airport Transfers in Bosnia (Sarajevo, Tuzla, Dubrovnik) | `bosnia-airport-transfers` | Getting around P0 | kiwitaxi |

### Сезон / деньги-практика / сравнения / номады (Волна 2–3 добор)
| # | Title | slug | кластер | 💰-связка |
|---|---|---|---|---|
| 34 | Best Time to Visit Bosnia and Herzegovina (Month by Month) | `best-time-to-visit-bosnia` | Best time P0 | trip-hotels |
| 35 | Best eSIM for Bosnia and Herzegovina: Plans Compared | `best-esim-bosnia` | Practicalities P1 | **yesim** |
| 36 | Is Bosnia and Herzegovina Safe for Tourists? (2026) | `is-bosnia-safe` | Practicalities P1 | safetywing |
| 37 | Is Bosnia Expensive? Trip Cost & Daily Budget (2026) | `bosnia-trip-cost-budget` | Practicalities P1 | trip-hotels / safetywing |
| 38 | Bosnia Digital Nomad Guide: Visa Reality, Cost & Wi-Fi (2026) 🔍 | `bosnia-digital-nomad-guide` | Nomad P1 | safetywing / yesim |

**Маршруты-коллекция `routes` (минимум 1–2 на старте, фото каждой остановки):** `bosnia-7-day-itinerary` и/или `bosnia-10-day-itinerary` оформить как `routes` (cover + `days/distanceKm/budgetFrom/stops[]` с фото каждой остановки + `bestSeason`), остальные itinerary — как `articles`. Это закрывает требование «маршрут(ы)» в корпусе.

**Что НАМЕРЕННО отложено из старта (фаст-фоллоу после набора траста):** `bosnia-weather-by-month`, `bosnia-in-winter`, food-кластер (`bosnian-food-guide`/`cevapi-bosnia`/`best-food-in-sarajevo`/`bosnian-coffee-culture`), adventure (`skiing-in-bosnia`/`hiking-in-bosnia`/`lukomir-village-hike`), `herzegovina-wine-route`, `sutjeska`-добор/`bosnia-swimming-spots`, остальные номад-темы (`cost-of-living-sarajevo`/`moving-to-bosnia`/`coworking-sarajevo`), `bosnia-vs-croatia`, `bosnia-money-currency`, `bosnia-travel-insurance`. Это ~20+ тем второй очереди → общий план сайта ~58–60 тем, из которых **38 во front-load**.

---

## 3. Скелет контент-плана (каденс + KPI)

1. **Front-load корпус (нед. 1–~3):** опубликовать 38 стартовых тем «волнами объёма» (BLUEPRINT/PROFIT §4):
   - **Волна 1 (нед. 1–2):** itinerary-локомотивы (#1–6), столичный хаб (#7) + war (#9), Mostar-узел (#13–15), best-time (#34). Это топливо дисплей-порога + перелинковочные центры.
   - **Волна 2 (нед. 2–3):** транспорт/авто/аэропорты (#28–33), eSIM (#35), where-to-stay (#12, #18), герцеговина-достопримечательности (#19–22), Mostar day-trips (#17).
   - **Волна 3 (нед. 3):** природа/парки (#23–27), Sarajevo-добор (#8, #10, #11), safety/budget/nomad (#36–38), Stari Most (#16).
2. **После корпуса — ~1 статья/день (≈5/неделю)**, темп **right-size по GSC** (BLUEPRINT: каденс/KPI от данных GSC, не план «N статей»). Падают показы/нет климба по кластеру → сбавить и углубить существующее; растёт — добор соседних тем кластера.
3. **KPI = деньги/показы/позиции по кластерам, НЕ число статей.** Вехи монетизации (PROFIT §4): **~1 000 сессий → Journey by Mediavine** (70%) + AdSense-страховка; **25 000 pv при ≥50% Tier-1 → заявка в Raptive** (наш EN-first профиль это условие выполняет); **$5 000 ad-rev/12 мес → авто-апгрейд Journey→Mediavine Official**. Affiliate — с первой опубликованной денежной страницы (не ждёт порогов).
4. **Сезонная привязка публикаций (SEO §сезонность):** itinerary/Mostar-day-trip/car-rental/rafting разгонять февраль–май (планирование лета); «Bosnia in September» — к июлю; зимний ски-трек (Jahorina/Bjelašnica) готовить к октябрю–ноябрю; зимние шины **15 ноя–15 апр** (🔍 подтверждено — держать на car-rental/driving). **Чувствительная дата:** 11 июля — годовщина Сребреницы (тактично, не как «событие»).
5. **Дисциплина:** каждая статья — сразу коммит+push (память `work-crash-safety`); тронул календарь → синхрон hub-копии `docs/calendars/bosnia-KALENDAR.md` + пересборка дашборда; будущие даты в плане — только `○` (память `dashboard-sync-after-calendar-change`).

---

## 4. Монетизация (из PROFIT-ANALYSIS + адверсариальный ревью денег)

### Подтверждённые связки (партнёр живой + товар/гео есть) — на них строим план
- **`localrent` (аренда авто) — ядро дохода.** Боснию не раскрыть без машины (петля Sarajevo→Mostar→Герцеговина). Сильнейшая связка сайта. Стоит на itinerary/road-trip/driving/природе/day-trips.
- **`kiwitaxi` (трансферы) — подтверждён живым** (Sarajevo SJJ + межгород вкл. Dubrovnik→Mostar / Sarajevo→Tjentište). **Несёт day-trip-конверсию вместо пустого trip-tours.** Стоит на Dubrovnik/Split→Mostar, Dubrovnik→Sarajevo, аэропорт-трансферах.
- **`trip-hotels` (отели) — deep-инвентарь Sarajevo/Mostar/Trebinje.** Стоит на where-to-stay / itinerary / город-хабах.
- **`yesim` (eSIM) — выделенная страница Bosnia от ~$0.54.** Высокомаржинальный низковоронный transactional. Стоит на `best-esim-bosnia` (и только там — на money/валюте НЕ вешать, см. ниже).
- **`aviasales` (рейсы) — metasearch, гео-агностичен.** Стоит на `which-airport-for-bosnia` (Wizz/Ryanair каналы).
- **`safetywing` (страховка) — гео-агностична, ссылка живая.** Стоит на safety / nomad / winter / budget. Нюанс: `allowSubId:false` → атрибуция по клику слабее (без SubID), но партнёр рабочий.

### 🔴 Дыра №1 — Босния БЕЗ тур-партнёра (решение владельца ДО контент-плана)
**`trip-tours` (Trip.com package-tours) по Боснии возвращает 0 routes** (подтверждено вебом 2026-06-30; контраст: Сербия 82 тура / Армения 2137 отзывов / **Босния 0**). А SEO-док ставит `trip-tours` топ-1 доходной темой Боснии (Dubrovnik/Split→Mostar) и меткой на ~20 тем. Живая тур-коммерция Боснии — у **GetYourGuide/Viator**, которых в `partners.json` **НЕТ** (DiscoverCars/GYG/Booking удалены сетью 2026-06-30). **Без решения половина «топ-доходных» Боснии не конвертит.**
- **Вариант A (рекомендация, без новых партнёрок):** day-trip/тур-темы Боснии монетизировать через `localrent` (само-драйв петля) + `kiwitaxi` (трансфер Дубровник→Мостар, подтверждён) + `trip-hotels`. Тур-метку снять / пометить `⚠️ tours(TODO)`. План §2 уже свёрстан под этот вариант.
- **Вариант B (если нужен тур-аффилиат как продукт):** **отдельной задачей до контента** завести GetYourGuide и/или Viator через Travelpayouts (`*.tpx.gr` — как остальные), добавить ключ в `partners.json`, тогда вернуть тур-метки. Это самый объёмный коммерч-узел страны — потенциально оправдывает заведение.
- **🔍 решение владельца:** A или B (или A сейчас + B позже).

### 🟡 Мелкие правки меток (из ревью денег)
- **`bikesbooking`** для Боснии = реальные **скутер/мото от €5** (Sarajevo) — ок, но ниша низкого объёма; в стартовый корпус байк-тему НЕ выносим (фаст-фоллоу при желании).
- **`💰 нет`** оставить на чисто-инфо темах (`bosnia-weather-by-month`, `bosnian-coffee-culture`, `bosnia-vs-croatia`). На **money/валюте** (`bosnia-money-currency`) eSIM-врезку НЕ ставить — это натяжка; унифицировать `💰 нет` на money-страницах между тремя доками сети.
- **`ekta`** (страховка) — в сети сломана (прямой URL без атрибуции). **НЕ копировать сломанный вид** в новый `partners.json`: либо корректная tpx.gr-ссылка из кабинета, либо не подключать; страховку вести на `safetywing`.

### Путь к рекламе (PROFIT §0–1)
Лестница 2026 (пороги упали ~в 4 раза): **AdSense/Journey (с ~1k сессий) → Raptive @ 25k pv (≥50% Tier-1) ИЛИ Mediavine Official @ $5k/год → Raptive 100k.** EN-first US/UK/DE/NL/AU-профиль бьёт прямо в условие «≥50% Tier-1» → квалифицируемся быстрее. **Обязательно на старте:** Consent Mode v2 + CMP (паттерн `croatia-site`) — без него EU-RPM (DE/NL/скандинавы) обнуляется и сети режут; перф-бюджет (ленивые ad-слоты без CLS, фото webp ≤200 КБ, ad-скрипты после контента) — дисплей-RPM напрямую зависит от CWV. На входе AdSense auto-ads держать в узде, чтобы не убить CWV до прихода нормальной сети.

---

## 5. Скаффолд (ссылка на чек-лист + наследуемые гейты)

Полный пошаговый порядок — **`docs/NEW-SITE-CHECKLIST.md`** (этапы A→K). Здесь — что критично для Боснии:
- **Донор копии (A1):** `cp -r sites/macedonia-site` (en-only) → `sites/bosnia-site/`. Удалить `node_modules/`, `dist/`, `.astro/`, `.git/`, весь контент доноров кроме структуры папок, доки прогресса донора. Подтянуть из Грузии свежие `scripts/*` гейты (`check-dedup.mjs`/`check-photos.mjs`/`qa.mjs`) + `src/loaders/*`.
- **Деконтаминация (этап G, ГЕЙТ перед `/work`):** `grep -rIl "Georgia\|Грузи\|Тбилиси\|georgiaguidebook"` по `.claude/agents/`, `.claude/skills/`, `scripts/` → **0**. Самый чистый донор агентов — `croatia-site` (0/20). Убрать `uk-translator.md` (en-only). Поправить `scripts/_commons-verify.mjs` (грузинский UA/email). `CLAUDE.md`+`SPEC.md` репо — под Боснию.
- **Бейслайны пустые (A4):** `.dedup-baseline.json` → `{"reversePairs":[],"titlePairs":[]}`; `.photo-baseline.json` → `[]`. Иначе фиктивно гасят настоящие нарушения нового сайта.
- **Наследуемые гейты (наследуются `cp -r` 1-в-1, проверить зелёными на пустых бейслайнах):**
  - **`check-dedup` (④ гейт «одна интент-страница»):** slug-коллизии HARD FAIL, обратные транспорт-пары (X-to-Y/Y-to-X = одна стр.), почти-дубли заголовков (Jaccard ≥0.85). _Релевантно Боснии:_ `dubrovnik-to-mostar-day-trip` vs `dubrovnik-to-sarajevo` — РАЗНЫЕ интенты (ок); `sarajevo-to-mostar` односторонняя — не плодить `mostar-to-sarajevo`.
  - **`check-photos` (ratchet #2):** cover обязателен у articles/routes + **≥5 фото статья** / ≥2 новость / cover+фото-на-остановку маршрут; ≤200 КБ. Столица Sarajevo ≥15, города ≥10 (стандарт сети).
  - **`check-interlinks`:** ≥2 внутр. ссылки, анти-сироты (память `always-interlink-content`: статья ≥2, в обе стороны; кросс-сайт контекстно — напр. `dubrovnik-to-mostar` → страница Дубровника на Croatia Guidebook).
  - **Consent Mode v2 / CookieConsent:** перенести `CookieConsent.astro`+`ga-init.js`+`consent-banner.js`+i18n-строки из `croatia-site`; CSP `script-src 'self' https://www.googletagmanager.com` **без sha256** (нет инлайна); `connect-src` курс-API форка (open.er-api), open-meteo оставить.
- **Оркестратор (этап J, 12 точек — без них сайт невидим для /work/news/дашборда):** `grafana/build-status.mjs` (`SITES`+`DOMAIN`), `grafana/build-html.mjs` (`FLAG` 🇧🇦), `grafana/install-refresh-hooks.mjs` (`repoRel` + post-commit хук), хаб-скиллы `work/news/content`, `SITES-REGISTRY.md`, `docs/calendars/bosnia-KALENDAR.md`, `docs/seo/bosnia-seo-*.md` (есть), `MASTER-PLAN.md` (число сайтов/порядок), пересборка дашборда.
- **Definition of ready (этап K):** `npm run qa` = **ВЕРДИКТ GO** (не exit 0 — память `qa-verdict-not-exit-code`); деконтаминация 0 «Georgia»; GA4 свой + консент работает; `/go/` без сломанного EKTA; домен HTTP 200 + GSC-проперти; дашборд видит сайт; доки/календарь/реестр закоммичены в репо сайта + репо хаба.

---

## 6. Адверсариальные пометки (НЕ тащить как факт — проверить/смягчить перед публикацией)

**⚠️ «Лёгкость» переоценена (системный перекос SEO-дока — линза спроса/конкуренции).** Спрос реален, но «недопокрыто / низкая конкуренция / быстро ранжироваться» по природе и второму эшелону НЕ выдерживает живой выдачи:
- **Una NP / Sutjeska / Jajce / waterfalls / rafting** — по «Una national park» уже 8+ англо-гайдов (backpackadventures, chasingthedonkey, stay.ba, johnbills…). Это **конкурентная, а не пустая** ниша. Дифференциатор = **логистика/тайминг/свежесть 2026 + ночёвка в Тьентиште/Бихаче**, а НЕ «пусто». В контенте не обещать лёгкий ранг.
- **Реальный пробел — не «темы», а угол подачи:** честная логистика по часам/км, «тур vs своя машина», датированные practical-страницы (визы-нет/границы/шины/free-transport-исключения). Тут независимый контент реально выигрывает у OTA.

**🔍 фактчек перед публикацией (дата-чувствительная YMYL/денежная фактура):**
- **⚠️ Mostar Wizz-рейсы — НЕ подтверждено.** Веб 2026: экспансия Wizz в ex-Yu реальна, но центр — **Tuzla** (2-й самолёт + именованные маршруты с 29–31.03.2026) и Sarajevo; **Mostar в списках маршрутов НЕТ**. На `which-airport-for-bosnia` НЕ писать «новые рейсы Wizz в Mostar» как факт — только подтверждённое (Tuzla-база, Sarajevo ↔ London Luton с 31.03.2026). 🗓 держать актуальным.
- **⚠️ «две автостанции Мостара (Восток/Запад)»** — перепроверить перед страницей Mostar/day-trip, не выдавать как факт без источника.
- **«Sarajevo–Mostar поезд — один из лучших в мире»** — **частично подтверждается** (The Guardian и The Telegraph упоминали маршрут среди лучших ж/д-путешествий — вторичные источники seat61/lll.ba). НО первоисточник Guardian не открыт напрямую → 🔍 подтвердить точную атрибуцию и формулировку перед цитатой на E-E-A-T-странице (память `verify-repo-state-independently`), либо подать как «featured by UK press», не вешая жёсткую цитату.
- **Денежные якоря** (Tunnel €10.50, Blagaj 10 BAM, ćevapi €4–5, цены аренды) — правдоподобны, но именно они устаревают; кросс-фактчекер обязан подтвердить из источника при написании КАЖДОЙ страницы (даты/цены — только из источника текущего года).

**✅ ПОДТВЕРЖДЕНО (можно как опорные углы):** day-trip-узел Dubrovnik/Split→Mostar (реальный объём); Sarajevo war / Tunnel of Hope; **зимние шины 15 ноя–15 апр** (дословно); **landmines 1.6% / ~965 км², вне турмаршрутов, на асфальте безопасно** (госисточники — спокойный, сильный safety-угол); digital-nomad «формальной визы НЕТ, 90 дней + регистрация компании на 12 мес» (честный угол); Tuzla-база Wizz + Sarajevo↔London Luton с 31.03.2026 (🗓 дата-чувствительно).

---

## РЕЗЮМЕ (для владельца)

- **Сайт:** Bosnia and Herzegovina Guidebook, **EN-only**, домен-кандидат `bosniaguidebook.com`, гео = 3 турлогических региона (Герцеговина / Сараево+горы / север), якоря — Sarajevo (≥15 фото) + Mostar/Trebinje/Jajce/Bihać (≥10).
- **Стартовый корпус: 38 тем** (front-load) из P0/P1; общий план сайта ~58–60 (≈20 во вторую очередь).
- **Топ-кластеры:** itineraries/road-trip (локомотив объёма) · Sarajevo + war/Tunnel · **Mostar + Croatia-gateway day-trips (главный коммерч-узел)** · Герцеговина-петля · транспорт/авто/аэропорты · природа/рафтинг · eSIM/safety/nomad.
- **Деньги:** ядро — `localrent` + `kiwitaxi` + `trip-hotels` + `yesim` + `safetywing` + `aviasales` (все подтверждены живыми по Боснии).
- **🔴 ГЛАВНОЕ РЕШЕНИЕ ДО КОНТЕНТА: Босния БЕЗ тур-партнёра.** `trip-tours` (Trip.com) по Боснии = **0 туров**; день-трипы (топ-1 доход) переверстаны на авто+трансфер+отель (Вариант A). Альтернатива — завести **GetYourGuide/Viator через Travelpayouts** до контента (Вариант B). Нужен выбор A/B.
- **Помечено сомнительным (`⚠️`/🔍):** переоценка «лёгкости» природы/севера (выдача плотная — углом брать логистику/свежесть, не «пусто»); **Mostar Wizz-рейсы НЕ подтверждены**; «две автостанции Мостара» — перепроверить; «Guardian про поезд» — подтвердить точную атрибуцию; денежные якоря (Tunnel/Blagaj/ćevapi/аренда) — фактчек на момент публикации; `ekta` не копировать сломанной; на money-странице eSIM-врезку не ставить.
- **KPI** = деньги/показы по кластерам (не число статей); каденс после корпуса ~5/нед, right-size по GSC. Скаффолд — по `NEW-SITE-CHECKLIST` (30 точек конфига + деконтаминация G + 12 точек оркестратора J), наследуемые гейты check-dedup/check-photos/Consent v2.
