# Serbia Guidebook — ЧЕРНОВОЙ план реализации (на утверждение владельцу)

> Статус: **ЧЕРНОВИК на ревью** (2026-06-30). Третий сайт волны (Босния → Армения → **Сербия**). EN-first.
> Источники: `docs/seo/serbia-seo-2026-06-30.md`, `docs/PROFIT-ANALYSIS-2026-06-30.md`, `docs/NEW-SITE-BLUEPRINT.md`, `docs/NEW-SITE-CHECKLIST.md`, формат-эталон `docs/seo/montenegro-seo-2026-06-22.md`.
> В план вшиты выводы двух адверсариальных ревью (спрос/конкуренция + денежные связки). Сомнительное помечено `[!]`; ничего не закоммичено — владелец коммитит после ревью.

---

## 1. Языковая модель, бренд, домен, гео

### Языковая модель
- **EN-first** (запуск только английский, как macedonia/albania, либо как montenegro en+ru — см. ниже). Аудитория ядра: Tier-1 Запад — **UK/Ирландия** (короткий лет ~2.5 ч, дешёвые рейсы Wizz/Air Serbia от £28–50), Германия, Нидерланды, скандинавы; США/Канада/Австралия (безвиз 90 дней). Решение владельца 2026-06-30: новые сайты EN-first.
- **ru-релокация-кластер — фаст-фоллоу, НЕ на старте.** Подключаем отдельным языковым треком (паритет slug, hreflang + x-default) после того, как EN-ядро наберёт траст и дисплей-порог. **Денежно ru-кластер пока НЕ подтверждён** (см. §4 — рабочих affiliate под релокацию/банки у нас сегодня нет) — это причина не считать его доходным до заведения конкретного партнёра. Из этого следует выбор донора:
  - **Рекомендация: донор `cp -r sites/montenegro-site` (en+ru-движок), но ru-папки/словарь оставить пустыми до фаст-фоллоу.** Так EN-ядро запускается чистым (как en-only), а ru-трек включается позже без повторного скаффолда i18n. Альтернатива — стартовать как en-only (macedonia) и доращивать ru позже (дороже: возврат uk-удалённой i18n-структуры). `[!]` финальный выбор донора — за владельцем; по умолчанию беру montenegro ради будущего ru без переделок.
- Язык — строго из пути (`/ru/` → ru, иначе DEFAULT=en). Без автодетекта/гео-редиректов (стандарт сети).

### Бренд / домен
- Бренд: **Serbia Guidebook**.
- Кандидат-домен: **`serbiaguidebook.com`** (по конвенции сети `{country}guidebook.com`: georgiaguidebook / montenegroguidebook / …). `[!]` доступность домена не проверена в этом черновике — владельцу проверить/зарегистрировать перед скаффолдом (off-domain-гейт: домен живой HTTP 200 до индексации).
- GA4 — **новое свойство, свой `G-…`** (не переиспользовать чужой ID). Consent Mode v2 (паттерн croatia) на старте.

### Гео (регионы / города / якоря)
Под `REGIONS` в `content.config.ts` + лейблы в i18n (синхронно, иначе `check-enums` падает). Предлагаемая модель (как у montenegro — макрорегионы, не все округа):
- **Регионы (макро, кандидат):** `belgrade` (столица-регион) · `vojvodina` (север: Нови-Сад, Фрушка-Гора, Сремски-Карловци) · `western-serbia` (Златибор, Мокра-Гора, Тара) · `eastern-serbia` (Джердап/Iron Gate, Голубац, Стара-Планина) · `southern-serbia` (Ниш, Копаоник, Врнячка-Баня, Devil's Town). `[!]` точное число/названия регионов — финализировать при скаффолде (можно 5 макрорегионов; синхронно enum+словари+sitemap).
- **Города/опорные точки (база каталога и accessFrom):** **Belgrade** (столица, ≥15 фото), **Novi Sad** (≥10), **Niš** (≥10), **Zlatibor** (база запада), **Kopaonik** (ски/спа). Города директории еды (`EDA_CITY_PAGES`): Belgrade, Novi Sad (+ опц. Niš).
- **Якоря-магниты (iconic, тянут спрос):** Kalemegdan, Skadarlija, St Sava, Ada Ciganlija (Белград); splavovi (речные клубы); Šargan Eight, Drvengrad/Kustendorf, Mokra Gora (запад); Tara/Drina viewpoints, Iron Gate gorge + Golubac fortress, Lepenski Vir, Devil's Town, Petrovaradin (Нови-Сад), EXIT (событие), Fruška Gora (вино+монастыри), Kopaonik (лыжи).
- Аэропорт-хаб один — **BEG (Nikola Tesla)** — упрощает «куда лететь» и loop-маршруты из Белграда.
- Валюта `PRICE_LEVELS` — **RSD/динар** (отображать; для бюджет-якорей пара €/RSD). `connect-src` курсового API — открытый (open.er-api), open-meteo оставить.

---

## 2. Стартовый core-corpus (front-load до запуска) — **40 тем**

Все темы — из P0/P1 SEO-кластеров. Ориентир брифа ~35–50; беру **40** (хабы + столица ≥15 фото + 2 города ≥10 + маршруты + денежные кластеры + сравнения). Поле: **title · slug · 💰-связка · кластер**. 💰 уточнены под реально подключённый партнёрский набор (см. §4); там, где SEO-док вешал тур на пустого партнёра/несущественную связку — поправлено и помечено `[!]`.

### A. Itineraries / planning — верхняя воронка, раздаёт ссылки (P0) — 5
1. Serbia Itinerary: The Perfect 7 Days (2026 Road Trip) · `serbia-7-day-itinerary` · 💰 localrent / trip-hotels · Itineraries `[!]` высокая конкуренция (wander-lush, misstourist, fivefoottraveler) — берём как перелинковочный хаб, не как «лёгкий ранг»
2. How Many Days Do You Need in Serbia? · `how-many-days-in-serbia` · 💰 trip-tours / trip-hotels · Itineraries
3. 10 Days in Serbia: The Complete Road Trip Itinerary · `serbia-10-day-itinerary` · 💰 localrent · Itineraries
4. Serbia Road Trip: Routes, Stops & Driving Times · `serbia-road-trip` · 💰 localrent · Itineraries (диффер. = честная логистика часы/км до запада/востока из BEG)
5. Long Weekend in Belgrade: 3-Day Itinerary · `belgrade-3-day-itinerary` · 💰 trip-hotels / trip-tours · Itineraries (короткий цикл решения UK — приоритет)

### B. Belgrade hub — столица ≥15 фото (P0) — 5
6. Things to Do in Belgrade: Complete Guide (2026) · `things-to-do-in-belgrade` · 💰 trip-tours / trip-hotels · Belgrade hub (это «столица» — ≥15 фото)
7. Kalemegdan Fortress & Belgrade Old Town: Visiting Guide · `kalemegdan-fortress-belgrade` · 💰 trip-tours · Belgrade hub
8. Where to Stay in Belgrade: Best Areas & Hotels · `where-to-stay-in-belgrade` · 💰 trip-hotels · Belgrade hub (прямой transactional)
9. Belgrade Neighbourhoods: Dorćol, Savamala & Skadarlija · `belgrade-neighbourhoods` · 💰 trip-hotels · Belgrade hub
10. Is Belgrade Worth Visiting? A Weekend Break Guide · `is-belgrade-worth-visiting` · 💰 trip-hotels / aviasales · Belgrade hub (толкать зимой — дешёвые рейсы UK)

### C. Belgrade nightlife & stag — №1 кошелёк (P0) — 3
11. Belgrade Nightlife: Splavovi, Clubs & Bars (2026) · `belgrade-nightlife` · 💰 trip-hotels / trip-tours · Nightlife
12. Belgrade Splav Guide: The Famous River Clubs · `belgrade-splavovi-river-clubs` · 💰 trip-hotels · Nightlife
13. Belgrade Stag & Bachelor Party Guide · `belgrade-stag-party-guide` · 💰 trip-hotels / kiwitaxi / trip-tours · Nightlife `[!]` конкуренция за stag-запросы ВЫСОКАЯ и платная (целые домены-агентства); ниша репутационно-чувствительная (стрипперы/эскорт в чужих листингах) — выдержать тон бренда, партнёрки только `/go/`, не перехват «по лёгкому»

### D. Getting around: авто / аэропорт / трансфер — transactional-деньги (P0) — 4
14. Car Rental in Serbia: Tips & Where to Book · `car-rental-serbia` · 💰 localrent / safetywing · Transport (ядро дохода road-trip)
15. Driving in Serbia: Rules, Roads, Tolls & IDP · `driving-in-serbia` · 💰 localrent / safetywing · Transport (раздел **IDP для US/non-EU** — подтверждён US Embassy, реальная боль американцев, оправдывает авто-affiliate)
16. Belgrade Airport to City Centre: Transfers & Options · `belgrade-airport-to-city-centre` · 💰 kiwitaxi · Transport `[!]` ОБЯЗАТЕЛЬНО оговорка: бесплатный транспорт Белграда (с 2025) **НЕ распространяется** на аэропортовый автобус A1 и E-линии — иначе фактическая ошибка
17. Getting Around Serbia: Buses, Trains & Car Rental · `getting-around-serbia` · 💰 localrent / kiwitaxi · Transport

### E. Day trips from Belgrade & Danube — тур+авто (P0) — 4
18. Best Day Trips from Belgrade · `day-trips-from-belgrade` · 💰 trip-tours / localrent · Day trips (хаб; «тур vs своя машина» по таймингу)
19. Iron Gate & Golubac Fortress: Danube Day Trip Guide · `iron-gate-golubac-danube` · 💰 trip-tours / localrent · Day trips `[!]` ниша НЕ пустая — serbianadventures/toursfrombelgrade держат коммерцию плотно; диффер. = честный тайминг, не «недопокрыто»
20. Sremski Karlovci: Wine, Monasteries & a Day Trip · `sremski-karlovci-day-trip` · 💰 trip-tours · Day trips
21. Lepenski Vir: Europe's Oldest Settlement · `lepenski-vir` · 💰 trip-tours · Day trips

### F. Western Serbia: Zlatibor / Mokra Gora / Drvengrad / Šargan-8 (P0) — 4
22. Zlatibor Travel Guide: Things to Do & Where to Stay · `zlatibor-travel-guide` · 💰 trip-hotels / localrent · Western Serbia (база ≥10 фото)
23. Šargan Eight Railway: Tickets, Timetable & What to Expect · `sargan-eight-railway` · 💰 trip-tours · Western Serbia `[!]` расписание/билеты Шарган-8 — year-specific, фактчек из источника перед публикацией
24. Drvengrad (Kustendorf): Kusturica's Wooden Village · `drvengrad-mokra-gora` · 💰 trip-tours / trip-hotels · Western Serbia
25. Mokra Gora & Western Serbia: A Complete Guide · `mokra-gora-guide` · 💰 localrent / trip-tours · Western Serbia

### G. National parks & nature (P0) — 4
26. Tara National Park: Complete Guide (Drina Viewpoints & Hiking) · `tara-national-park` · 💰 localrent / trip-tours · Nature `[!]` ниша НЕ пустая (grumpycamel/takeyourbackpack/serbia.travel — свежие 2026-гайды); диффер. = логистика+ночёвка в Златиборе/Баина-Башта
27. Đerdap National Park & the Iron Gate Gorge · `djerdap-iron-gate-national-park` · 💰 trip-tours / localrent · Nature
28. Stara Planina: Waterfalls, Peaks & Hiking · `stara-planina-guide` · 💰 localrent · Nature
29. Fruška Gora National Park: Monasteries, Wine & Trails · `fruska-gora-national-park` · 💰 trip-tours / localrent · Nature (мост к вину Vojvodina)

### H. Best time / weather — сезонный объём, дисплейное топливо (P0) — 2
30. Best Time to Visit Serbia (Month by Month) · `best-time-to-visit-serbia` · 💰 trip-hotels · Season
31. Serbia in Winter: Skiing, Spas & City Breaks · `serbia-in-winter` · 💰 trip-hotels / kiwitaxi · Season (мост к Kopaonik/спа)

### I. Money / eSIM / safety / budget — высокомаржинальный affiliate (P1) — 4
32. Best eSIM for Serbia: Plans Compared · `best-esim-serbia` · 💰 yesim · Practicalities (низковоронный transactional, партнёр подтверждён от $0.54)
33. Is Serbia Expensive? Trip Cost & Daily Budget (2026) · `serbia-trip-cost-budget` · 💰 trip-hotels / safetywing · Practicalities (топ-pull «лучшее цена/качество в Европе»)
34. Is Serbia Safe for Tourists? · `is-serbia-safe` · 💰 safetywing · Practicalities
35. Money in Serbia: Dinar, Cards & Cash Tips · `money-in-serbia` · 💰 нет · Practicalities `[!]` унифицировать метку между 3 доками: на money-странице eSIM-врезка — слабая натяжка → оставляю `💰 нет` (как в SEO-доке)

### J. Second/third cities + food/wine + comparisons (P1) — 5
36. Novi Sad Travel Guide: Things to Do (2026) · `novi-sad-travel-guide` · 💰 trip-hotels / trip-tours · Cities (≥10 фото; связать с EXIT-логистикой)
37. Niš Travel Guide: Skull Tower & Southern Serbia · `nis-travel-guide` · 💰 trip-hotels / trip-tours · Cities (≥10 фото; ворота юга → Devil's Town)
38. Serbian Food: 12 Dishes You Must Try · `serbian-food-dishes` · 💰 trip-tours · Food (вовлечение + перелинковка; rakija=UNESCO)
39. Serbian Wine Regions: Fruška Gora & Beyond · `serbian-wine-regions` · 💰 trip-tours · Food (растущий тур-интент)
40. Serbia vs Croatia: Which to Visit · `serbia-vs-croatia` · 💰 нет · Comparison (перехват выбора, кросс-сайт на Хорватию)

> **Отложено из стартового корпуса (волна 2+, не во front-load):** Kopaonik Ski Resort 2026 (сезонно — готовить к осени), Serbian Spas (Vrnjačka/Sokobanja), EXIT Festival (event — даты года перед публикацией), Devil's Town, Petrovaradin Fortress, Šargan-расширения, Rakija explained, What to Eat in Belgrade, hiking-in-serbia, Belgrade splav-deep, Bosnia vs Serbia, cheap-flights-to-belgrade, best-esim-варианты. Это естественный добор по GSC-сигналу — НЕ генерить пачкой без фактуры.

**Сводка корпуса:** 40 тем · столица Belgrade (≥15 фото) · города Novi Sad + Niš (≥10) · Zlatibor как база запада (≥10) · 5 itinerary-хабов · маршрут road-trip (коллекция `routes` — loop из BEG) · денежные кластеры (авто/трансфер/eSIM/страховка/where-to-stay) · 1 сравнение. Топ-доходные узлы фронтлоадятся первыми (см. §3).

---

## 3. Скелет контент-плана

**Принцип:** front-load корпус **«магниты объёма вперёд»**, затем **~1/день (5/нед)**, темп right-size по GSC. **KPI = деньги/показы/позиции по кластерам, НЕ число статей** (решение владельца). Один материал ПОЛНОСТЬЮ до публикации (гейты ①–④ + qa=GO), потом следующий (память `finish-one-item-before-next`). Банковать каждую статью коммитом+push сразу (память `work-crash-safety`).

**Волна 1 — магниты объёма + №1 кошелёк (старт):**
- `serbia-7-day-itinerary` (хаб, раздаёт ссылки) → `things-to-do-in-belgrade` (столица ≥15) → `belgrade-nightlife` + `belgrade-stag-party-guide` (самый быстрый деньго-узел Сербии) → `best-time-to-visit-serbia` (сезонный объём) → `belgrade-3-day-itinerary`.

**Волна 2 — transactional-деньги + day-trips:**
- `car-rental-serbia` + `driving-in-serbia` (IDP) → `belgrade-airport-to-city-centre` (с оговоркой A1/E-линии) → `best-esim-serbia` → `where-to-stay-in-belgrade` → `day-trips-from-belgrade` + `iron-gate-golubac-danube`.

**Волна 3 — запад/природа/города/добор:**
- `zlatibor-travel-guide` → `sargan-eight-railway` + `drvengrad-mokra-gora` + `mokra-gora-guide` → `tara-national-park` + `djerdap-iron-gate-national-park` → `novi-sad-travel-guide` + `nis-travel-guide` → food/wine + `serbia-vs-croatia` + остаток practicalities.

**Сезонные/событийные (вне линейного темпа, по календарю):** ски/спа Копаоник — готовить к осени (декабрь–март сезон); EXIT — летнее событие, даты года проверять; «is Belgrade worth visiting»/«cheap flights» — толкать зимой (низ цен рейсов из UK).

**Каденс по GSC (right-size):** после первых ~2–4 недель смотреть показы/позиции/доход по кластерам; усиливать то, что растёт (вероятно nightlife/itinerary/car-rental), не гнать вал ради числа. Дашборд на будущих датах — только `○` (память `dashboard-sync-after-calendar-change`).

**ru-релокация-кластер — фаст-фоллоу** (после EN-базы и набора траста): ~12 тем (ВНЖ через ИП/паушал, банки, ДМС, стоимость жизни, аренда Белграда). **Запускать как доходный ТОЛЬКО после заведения реального affiliate** под релокацию (см. §4) — иначе это YMYL-трафик без монетизации. YMYL-фактуру (паушал-пороги ~6 млн динар/год, госпошлины, лояльные банки) — кросс-фактчек из первоисточника на момент публикации.

---

## 4. Монетизация (из PROFIT-ANALYSIS + ревью денежных связок)

### Партнёрский набор — что РЕАЛЬНО подключено и подтверждено для Сербии
Источник правды — `sites/montenegro-site/src/data/partners.json` (форкнется). Адверсариальное ревью денежных связок (живая проверка наличия supply, 2026-06-30):

**✅ Подтверждено (партнёр живой + товар/гео есть для Сербии):**
- **localrent** (авто, Belgrade/Nikola Tesla) — **сильнейшая связка**; «страну не раскрыть без авто» (road-trip запад/восток).
- **trip-hotels** (отели Белграда от $18; St Regis/Mama Shelter) — все where-to-stay/itinerary.
- **trip-tours** (туры) — **для Сербии supply ЕСТЬ: 82 bookable day-tour** (Iron Gate/Golubac, Tara NP, Drvengrad+Šargan-8, Novi Sad) — совпадает с money-страницами. Для Сербии trip-tours = реальный backbone (в отличие от Боснии, где Trip.com по турам пуст). В partners.json у trip-tours `kwd=Montenegro` → при форке **сменить на `kwd=Serbia`**.
- **kiwitaxi** (трансферы BEG + межгород, вкл. Belgrade→Sarajevo) — airport-transfer/cross-border.
- **aviasales** (рейсы, metasearch гео-агностик) — flights to Belgrade / which-airport (Wizz/Air Serbia).
- **yesim** (eSIM, Сербия от $0.54, выделенная страница) — best-eSIM transactional, высокая маржа.
- **safetywing** (страховка, гео-агностик) — safe/budget/nomad/hiking. Нюанс: `allowSubId:false` → атрибуция по клику слабее (без SubID), партнёр рабочий.

**⚠️ Натянуто / решить до контента (из ревью денежных связок):**
- **`[!]` bikesbooking** — в Белграде есть мото/скутер, но это **нишевый низкий объём**; в стартовом корпусе Сербии байк-связку НЕ форсим как доходную (метку bikesbooking ни на одну из 40 тем не вешал). Если делать — максимум велопрокат по Белграду, не магистральная монетизация.
- **`[!]` ru-релокация (релокация-сервис / банки / insurance) — affiliate ГИПОТЕТИЧЕСКИЙ, не реальный.** В partners.json и в подтверждённом наборе Travelpayouts **этих партнёров НЕТ**. Релокант-конторы — сервис-компании без публичной CPA через Travelpayouts (вступать индивидуально); сербские банки розничного affiliate под нерезидентов де-факто не дают; Wise/Revolut — пользовательский referral, не affiliate-сеть, и локальный сербский счёт (что ищет релокант) не открывают. **Вывод: ru-кластер как доход = 0 рабочих партнёров сегодня.** Из набора по ru реально работают только `yesim` (связь) и частично `safetywing`/insurance (не местная ДМС). **Не планировать ru-кластер доходным, пока не заведён конкретный партнёр** (CPA-сеть релокации / прямой деал).
- **`[!]` EKTA** — в partners.json сломана (прямой URL без атрибуции, известный P1 сети). Новому сайту **НЕ копировать сломанный вид**: либо корректная tpx.gr-ссылка из кабинета, либо не подключать. (DiscoverCars/GetYourGuide/Booking в сети удалены 2026-06-30 — те же нужды закрыты Trip.com/KiwiTaxi.)

### Приоритетные связки по кластерам (Сербия)
1. **trip-hotels + trip-tours + kiwitaxi на Belgrade nightlife/splavovi + stag** — высокобюджетная ниша (€500–1200/чел за уикенд), конвертит в отели+трансфер+туры. **№1 кошелёк SRB.**
2. **localrent + safetywing — car-rental + driving (IDP-боль US/non-EU)** — прямой transactional, ядро road-trip-рынка.
3. **trip-tours + localrent — Iron Gate / Golubac / day trips from Belgrade** (хаб-город → весь day-trip спрос; supply подтверждён).
4. **trip-hotels — where to stay in Belgrade + 3-day** (прямой transactional).
5. **yesim / safetywing — eSIM/страховка** (низковоронные, высокомаржинальные).

### Сквозной приём (как у работающих сайтов)
- Партнёрки **только через `/go/{partner}`** с `rel="sponsored nofollow noopener"`; 1–3 AffiliateBox/статью; прямые URL запрещены.
- Itinerary-верх воронки раздаёт внутренние ссылки на денежные страницы (авто/отели/туры).
- Каждая transactional-страница = 1 намерение (анти-каннибализация, гейт ④).

### Путь к дисплей-рекламе (из PROFIT-ANALYSIS — пороги пересчитаны 2026)
Старая лестница Ezoic→Mediavine→Raptive устарела. Актуальная:
- **~1 000 сессий/сайт →** подключить **Journey by Mediavine** (70% паблишеру) + AdSense-страховка → первый дисплей-доход. RPM Tier-1 трэвел: ~$3–5 старт → **$8–12 к 90 дням**.
- **25 000 pv/сайт при ≥50% Tier-1 →** заявка в **Raptive** (премиум-RPM). **EN-first US/UK/DE/NL/AU-профиль Сербии прямо бьёт в условие «≥50% Tier-1»** → квалификация быстрее «смешанного» гео. Сербия — самый быстрый климб сети (Белград-бренд, дешёвые рейсы UK, найтлайф).
- **$5 000 ad-rev/12 мес →** авто-апгрейд Journey → **Mediavine Official**.
- **Affiliate — с первой денежной страницы** (не ждёт порогов). ru-кошелёк — отдельным треком, только после заведения партнёра.
- **Перф-бюджет (обязателен для RPM):** ленивые ад-слоты с зарезервированной высотой (без CLS); фото webp ≤200 КБ; ад-скрипты после контента; **Consent Mode v2 + CMP обязателен** (EU-трафик DE/NL/скандинавы — иначе RPM по EU обнуляется и сети режут). Privacy/cookie-policy + баннер — сразу на старте (условие приёма в Mediavine/Raptive).

---

## 5. Скаффолд (по NEW-SITE-CHECKLIST) — наследуемые гейты и точки

Полный пошаговый порядок — **`docs/NEW-SITE-CHECKLIST.md`** (этапы A→K). Резюме обязательного для Сербии:

- **Донор + копия (этап A):** `cp -r sites/montenegro-site` (en+ru-движок, ru-папки пустыми до фаст-фоллоу); донор агентов чище всего — `croatia-site` (0/20 «Georgia»). Удалить из копии `node_modules/`/`dist/`/`.astro/`/`.git/`/контент донора/брифы/доки прогресса. **Бейслайны очистить пустыми:** `scripts/.dedup-baseline.json` → `{"reversePairs":[],"titlePairs":[]}`; `scripts/.photo-baseline.json` → `[]` (у нового сайта нет легаси-долга — иначе фиктивно гасят настоящие нарушения).
- **30+ точек конфига (этап B–F, таблица §10 блюпринта):** `package.json` name→`serbia-guidebook`; `astro.config.mjs` site→`https://serbiaguidebook.com` + sitemap i18n под LANGS; `wrangler.jsonc` name→`serbia-site`; `content.config.ts` LANGS/CATEGORIES(en-набор)/REGIONS(Сербия)/PRICE_LEVELS(RSD)/routes `literal('routes')`; i18n en-копирайт+бренд+`EDA_CITY_PAGES`(Belgrade/Novi Sad)+`*_SLUGS`+`LOCALE`; `partners.json` trip `kwd=Serbia` + EKTA не-сломанный; **GA4 свой `G-…`** + consent-паттерн croatia (CSP `script-src` без sha256-инлайна); `_headers` connect-src курс-API; robots/manifest/og/иконки/флаг Сербии; `CLAUDE.md`+`SPEC.md` под Сербию.
- **Деконтаминация (этап G — ГЕЙТ перед /work):** `grep -rIl "Georgia\|Грузи\|Тбилиси\|georgiaguidebook"` → **0** в `.claude/agents/`, `.claude/skills/`, `scripts/` (донор macedonia имел `_commons-verify.mjs` с грузинским UA/email). uk-translator убрать, если без uk на старте.
- **Наследуемые гейты сети (переезжают с `cp -r`, не выключать):**
  - `check-dedup` (④ гейт «одна интент-страница»): slug-коллизии HARD FAIL, обратные транспорт-пары X-to-Y/Y-to-X, почти-дубли заголовков Jaccard ≥0.85.
  - `check-photos` (ratchet #2): cover обязателен + ≥5 фото статья / ≥2 новость / cover+фото-на-остановку маршрут; ≤200 КБ.
  - `check-interlinks` (≥2 внутр. ссылки, анти-сироты); `check-enums`/`check-parity`/`test:links`.
  - `qa` = финальный **ВЕРДИКТ GO/NO-GO** (проверять строку «ВЕРДИКТ», не exit code — память `qa-verdict-not-exit-code`).
  - **Consent Mode v2** (CookieConsent.astro + ga-init.js denied-by-default + consent-banner.js — паттерн croatia).
- **12 точек оркестратора (этап J, без них сайт невидим для /work, /news, дашборда):** `grafana/build-status.mjs` (SITES+DOMAIN), `grafana/build-html.mjs` (FLAG 🇷🇸), `grafana/install-refresh-hooks.mjs` (repoRel `sites/serbia-site` → post-commit хук), хаб-скиллы `work`/`news`/`content` (строка сайта), `docs/SITES-REGISTRY.md`, `docs/calendars/serbia-KALENDAR.md` (hub-копия, будущее только `○`), `docs/seo/serbia-seo-…md` (есть), `docs/MASTER-PLAN.md` (число сайтов/порядок), пересборка дашборда.
- **Definition of ready (этап K):** qa=GO; дедуп/фото зелёные на пустых бейслайнах; деконтаминация 0 «Georgia»; GA4 свой + consent работает + CSP без чужого sha256; `/go/` без сломанного EKTA; домен HTTP 200 + GSC-проперти; дашборд видит сайт; доки/календарь/реестр актуальны и закоммичены (репо сайта + репо хаба).

---

## Приложение: что помечено сомнительным (`[!]`) — сводка для ревью
1. **Выбор донора** (montenegro en+ru с пустыми ru vs macedonia en-only) — за владельцем; по умолчанию montenegro ради будущего ru без переделок.
2. **Домен `serbiaguidebook.com`** — доступность не проверена; зарегистрировать до скаффолда.
3. **«Лёгкость» gap-разделов SEO-дока завышена** — природа (Tara/Iron Gate/Stara Planina), вторые города, stag: спрос реален, но ниши НЕ пустые (6–10 свежих 2026-гайдов + плотная коммерция OTA/агентств). В план заложен диффер. = **логистика/тайминг/свежесть**, а не «недопокрыто».
4. **YMYL дата-чувствительно:** бесплатный транспорт Белграда **НЕ** включает аэропорт A1/E-линии (обязательная оговорка); Шарган-8 расписание/билеты, паушал-пороги, лояльные банки (ru) — фактчек из первоисточника на момент публикации; «£22 round-trip из UK» — не давать жёстким числом, держать «от £28–50».
5. **ru-релокация-кластер денежно НЕ подтверждён** — рабочих affiliate под релокацию/банки/insurance сегодня нет; не считать кластер доходным до заведения конкретного партнёра.
6. **bikesbooking** — нишевый низкий объём; не магистральная монетизация (метки не ставил).
7. **trip-tours** — для Сербии supply подтверждён (82 тура), в отличие от Боснии; при форке сменить `kwd=Montenegro`→`kwd=Serbia`.
