# Черновой план реализации сайта «Армения» (на утверждение владельцу) — 2026-06-30

> **Статус: ЧЕРНОВИК. Ничего не закоммичено и не запущено — план на ревью.** Второй сайт в очереди запуска сети (Босния → **Армения** → Сербия). EN-first форк движка Грузии (Astro 6.4.6 SSG + Cloudflare Workers).
> Входы: `docs/seo/armenia-seo-2026-06-30.md`, `docs/PROFIT-ANALYSIS-2026-06-30.md`, `docs/NEW-SITE-BLUEPRINT.md`, `docs/NEW-SITE-CHECKLIST.md`, формат-эталон `docs/seo/montenegro-seo-2026-06-22.md`, источник правды по партнёрам `sites/montenegro-site/src/data/partners.json`.
> В план встроены правки из двух адверсариальных ревью (спрос/конкуренция + денежные связки). Сомнительное помечено **⚠️** и НЕ тащится как факт.

---

## 1. Языковая модель, бренд, домен, гео

**Языковая модель: ПОЛНЫЙ БИЛИНГВ EN + ru (весь сайт на двух языках) — решение владельца 2026-07-01.**
- `LANGS = ['en', 'ru']`: en на корне `/`, ru на `/ru/`; паритет slug, взаимные hreflang en↔ru + x-default→en, переключатель языка в шапке. ru-движок донора (montenegro) оживить из дормантного `src/i18n/ru.ts.dormant` → `ru.ts`. Это **отличие Армении от Боснии (en-only) и Сербии (en + ru-релокация-кластер фаст-фоллоу)** — у Армении ru-сторона полная.
- **Весь контент — парой en + ru** (как у Грузии/Черногории/Хорватии): каждая статья пишется и переводится на оба языка одним коммитом, `check-parity` стережёт, чтобы половину пары не опубликовали. → контент-объём ~×2 против EN-only — заложить в каденс и токен-бюджет наполнения (38 тем §2 = 38 пар en+ru).
- **Почему полный билингв (а не EN-only + точечный ru-кластер):** Армения — де-факто двуязычная страна и **топ ру-релокации/номадов с 2022** (огромный эвергрин ru-спрос). Владелец выбрал полный охват обоих рынков.
- **⚠️ Денежная оговорка (остаётся честной):** ru-трафик ≈ 0 RPM для дисплей-рекламы, и доходного партнёра под релокацию у сети пока нет. Поэтому **EN-сторона — под дисплей-доход (Tier-1, путь к Mediavine/Raptive), ru-сторона — траст + affiliate-трек** (релокация/банки/страховка/билеты — высокий чек). Растим обе стороны параллельно; ru-монетизацию подключаем по мере заведения реального affiliate.
- **На реализацию (Фаза 3 контент):** флип `LANGS=['en','ru']` в `content.config.ts` + `i18n/types.ts`, `ru.ts.dormant`→`ru.ts`, `/ru/`-роуты, LangSwitcher вкл., sitemap ru-locale, взаимные hreflang. Донор копии всё равно `montenegro-site` (несёт ru-способные компоненты — billingv-инфра уже есть, просто раздормантить).

**Бренд:** Armenia Guidebook. `manifest.name = "Armenia Guidebook"`, siteName в i18n, CLAUDE.md/SPEC.md репо — под Армению.

**Кандидат-домен:** `armeniaguidebook.com` (паттерн сети `{country}guidebook.com`). Проверить доступность и поднять off-domain (HTTP 200 до индексации) — память `domains-live-verify-not-stale-registry`.

**Гео (регионы → enum `REGIONS` в content.config + лейблы в словарях, иначе `check-enums` падает).** Армения = 10 марзов + Ереван. Практичный набор для каталога (можно сгруппировать как у Черногории в макрорегионы, чтобы не плодить тонкие фильтры):
- **Центр/столица:** Yerevan (город-хаб, ≥15 фото) + Ararat marz (Khor Virap), Armavir (Echmiadzin, Zvartnots), Kotayk (Garni/Geghard, Tsaghkadzor), Aragatsotn (Aragats, Amberd).
- **Юг:** Vayots Dzor (Areni, Noravank, Jermuk), Syunik (Tatev, Goris, Wings of Tatev).
- **Север:** Gegharkunik (Lake Sevan, Dilijan-вход), Tavush (Dilijan NP), Lori (Haghpat/Sanahin), Shirak (Gyumri).
- **Базовые города-якоря (accessFrom / городские статьи):** Yerevan (столица), Gyumri, Dilijan, Goris, Jermuk; Tatev/Areni/Sevan — как достопримечательности-якоря, не города.
- `PRICE_LEVELS` — валюта **֏ (AMD)** или `€`-эквивалент для читателя Tier-1 (решить: в эталоне Балкан €; Армения — драм; предлагаю **указывать AMD + примерный USD/EUR**, т.к. аудитория западная). **⚠️ помечаю как точку решения владельца.**

---

## 2. Стартовый core-corpus (front-load до запуска) — 38 тем

Принцип: front-load (всё опорное до запуска), порядок = «магниты объёма вперёд» (PROFIT §1: itinerary/capital/season тянут к дисплей-порогам и раздают внутренние ссылки). Ориентир брифа ~35–50; даю **38** (опорные хабы + столица ≥15 фото + 4 города ≥10 + 2 маршрута + денежные кластеры + сравнения). Все темы — из P0/P1 SEO-кластеров. Для каждой: title · slug · 💰-связка · кластер.

> **Денежные пометки выверены по `partners.json` (адверсариальное ревью денег):** рабочие везде — localrent, aviasales, kiwitaxi, yesim, safetywing, trip-hotels. **trip-tours по Армении — РАБОЧИЙ** (Trip.com отдаёт глубокий тур-инвентарь по Еревану: Garni/Geghard, Khor-Virap-Noravank-Tatev, Sevan — в отличие от Боснии, где Trip.com по турам пуст). GYG/Viator/Booking/DiscoverCars в нашем наборе НЕТ (удалены сетью 2026-06-30) — не упоминать как связку.

### Волна 0 — магниты объёма (опорные хабы, публиковать первыми)
| # | Title | slug | 💰 | Кластер |
|---|---|---|---|---|
| 1 | Armenia Itinerary: The Perfect 7 Days (2026) | `armenia-7-day-itinerary` | localrent / trip-hotels | P0 Itineraries |
| 2 | 10 Days in Armenia: Ultimate Road Trip Itinerary | `armenia-10-day-itinerary` | localrent / trip-tours | P0 Itineraries |
| 3 | How Many Days Do You Need in Armenia? | `how-many-days-in-armenia` | trip-tours / trip-hotels | P0 Itineraries |
| 4 | 5 Days in Armenia: First-Timer's Itinerary | `armenia-5-day-itinerary` | localrent / trip-tours | P0 Itineraries |
| 5 | Armenia Road Trip: Routes, Stops & Driving Times | `armenia-road-trip` | localrent | P0 Itineraries |
| 6 | Things to Do in Yerevan: Complete Guide (2026) | `things-to-do-in-yerevan` | trip-tours / trip-hotels | P0 Yerevan hub |
| 7 | Best Day Trips from Yerevan | `day-trips-from-yerevan` | trip-tours / localrent | P0 Yerevan hub |
| 8 | Best Places to Visit in Armenia (Map & Guide) | `best-places-to-visit-in-armenia` | trip-tours / localrent | P0 Nature |
| 9 | Best Time to Visit Armenia (Month by Month) | `best-time-to-visit-armenia` | trip-hotels | P0 Season |

### Волна 1 — столица + монастыри (главный коммерч-кластер) + опорные деньги
| # | Title | slug | 💰 | Кластер |
|---|---|---|---|---|
| 10 | Where to Stay in Yerevan: Best Areas & Hotels | `where-to-stay-in-yerevan` | trip-hotels | P0 Yerevan hub · transactional |
| 11 | Yerevan Food Guide: Khorovats, Wine Bars & GUM Market | `yerevan-food-guide` | trip-tours | P0 Yerevan hub |
| 12 | The Yerevan Cascade & Cafesjian Museum: Visiting Guide | `yerevan-cascade-complex` | — | P0 Yerevan hub |
| 13 | Khor Virap, Noravank & Tatev Day Tour: Worth It? | `khor-virap-noravank-tatev-day-tour` | trip-tours | P0 Monasteries · transactional |
| 14 | Wings of Tatev & Tatev Monastery: Complete Guide | `tatev-monastery-wings-of-tatev` | trip-tours / localrent | P0 Monasteries |
| 15 | Garni Temple & Geghard Monastery: Day Trip from Yerevan | `garni-temple-geghard-monastery` | trip-tours / kiwitaxi | P0 Monasteries |
| 16 | Khor Virap Monastery & Mount Ararat Views: Visiting Guide | `khor-virap-monastery` | trip-tours / localrent | P0 Monasteries |
| 17 | Noravank Monastery & the Red Cliffs: How to Visit | `noravank-monastery` | trip-tours | P0 Monasteries |
| 18 | Best Monasteries in Armenia (Map & Guide) | `best-monasteries-in-armenia` | trip-tours / localrent | P0 Monasteries |

### Волна 2 — transactional-деньги (авто/трансфер/eSIM/рейсы) + Кавказ-комбо
| # | Title | slug | 💰 | Кластер |
|---|---|---|---|---|
| 19 | Car Rental in Armenia: Tips & Where to Book | `car-rental-armenia` | localrent / safetywing | P0 Getting around · transactional |
| 20 | Driving in Armenia: Roads, Rules & What to Know | `driving-in-armenia` | localrent | P0 Getting around |
| 21 | Do You Need a Car in Armenia? Car vs Tours vs Marshrutka | `getting-around-armenia` | trip-tours / localrent | P0 Getting around |
| 22 | Yerevan Airport (Zvartnots) to City: Taxi, Transfer & Bus | `zvartnots-airport-to-yerevan-city` | kiwitaxi | P0 Getting around · transactional |
| 23 | How to Get to Armenia: Flights & Zvartnots Airport | `how-to-get-to-armenia-flights` | aviasales | P0 Getting around · transactional |
| 24 | Best eSIM for Armenia: Plans Compared (2026) | `best-esim-armenia` | yesim | P1 Practicalities · transactional |
| 25 | Yerevan to Tbilisi: Bus, Train, Marshrutka & Transfer | `yerevan-to-tbilisi` | kiwitaxi / aviasales | P1 Caucasus combo · transactional |
| 26 | Armenia & Georgia Itinerary: Combine Both in 10–14 Days | `armenia-georgia-itinerary` | localrent / trip-tours | P1 Caucasus combo |

### Волна 3 — природа/озёра/горы (дифференциатор + объём)
| # | Title | slug | 💰 | Кластер |
|---|---|---|---|---|
| 27 | Lake Sevan: Sevanavank, Beaches & How to Visit | `lake-sevan-armenia` | localrent / trip-tours | P0 Nature |
| 28 | Dilijan Travel Guide: Armenia's Switzerland | `dilijan-travel-guide` | trip-hotels / trip-tours | P0 Nature |
| 29 | Northern Armenia: Lori, Haghpat & Sanahin Monasteries | `northern-armenia-lori-monasteries` | localrent / trip-hotels | P0 Nature |
| 30 | Dilijan National Park: Hikes, Monasteries & Parz Lake | `dilijan-national-park` | trip-hotels / safetywing | P1 Outdoor |
| 31 | Hiking in Armenia: Best Trails & the Transcaucasian Trail | `hiking-in-armenia` | safetywing / trip-tours | P1 Outdoor |

### Волна 4 — города №2/№3 (4 города ≥10 фото) + еда/вино/культура (USP-магниты)
| # | Title | slug | 💰 | Кластер |
|---|---|---|---|---|
| 32 | Gyumri Travel Guide: Armenia's Second City | `gyumri-travel-guide` | trip-hotels / localrent | P1 Cities |
| 33 | Goris & the Road to Tatev: Travel Guide | `goris-travel-guide` | trip-hotels / localrent | P1 Cities |
| 34 | Jermuk: Spa Town, Waterfall & Mineral Springs | `jermuk-travel-guide` | trip-hotels / trip-tours | P1 Cities |
| 35 | Armenian Wine: Areni, Vayots Dzor & Best Wineries | `armenian-wine-regions-guide` | trip-tours / localrent | P1 Wine & food |
| 36 | Armenian Food: 15 Dishes You Have to Try | `armenian-food-dishes` | trip-tours | P1 Wine & food |

### Волна 5 — practicalities/деньги-страницы (низковоронные, высокая конверсия) + сравнение
| # | Title | slug | 💰 | Кластер |
|---|---|---|---|---|
| 37 | Armenia Visa & Entry Requirements (2026) | `armenia-visa-entry-requirements` | safetywing | P1 Practicalities · **YMYL** |
| 38 | Armenia vs Georgia: Which to Visit? | `armenia-vs-georgia` | — | P1 Caucasus combo · сравнение |

**Покрытие требований брифа:** опорные хабы (itinerary/things-to-do/best-time/best-places) ✅ · столица Yerevan ≥15 фото (#6,10,11,12) ✅ · 4 города ≥10 фото (Gyumri/Goris/Jermuk #32–34 + Dilijan #28 как город-курорт) ✅ · 2+ маршрута (`armenia-road-trip` #5 + `armenia-georgia-itinerary` #26; routes-коллекция — оформить как `category:routes` с stops/days/distanceKm) ✅ · денежные кластеры: страховка (safetywing #19,30,31,37), транспорт (localrent/kiwitaxi/aviasales #19–23,25), where-to-stay (#10) ✅ · eSIM (#24) ✅ · сравнения (#38, + `how-many-days` #3) ✅.

**Резерв на добор после запуска (не в стартовом корпусе, по сигналам GSC):** `armenia-in-september`, `armenia-in-winter` (ski Tsaghkadzor — к ноябрю), `armenia-weather-by-month`, `mount-aragats-hike` (**⚠️ БЕЗ bikesbooking — см. §4; вести на safetywing/trip-tours**), `areni-winery-guide`, `yerevan-brandy-factory-tour`, `yerevan-nightlife-wine-bars`, `transcaucasian-trail-armenia`, `armenia-adventure-activities`, `is-armenia-safe`, `armenia-trip-cost-budget`, `money-in-armenia-dram-cards` (💰 нет — унифицировать с сетью, см. §4), `armenia-border-crossings` (**датированная YMYL-страница, см. ниже**).

---

## ⚠️ YMYL и дата-чувствительная фактура (ОБЯЗАТЕЛЬНО исправить при написании — из адверсариального ревью)

Эти пункты НЕ тащить из SEO-дока как факт; на страницах — только датированный статус + дисклеймер + кросс-фактчек на момент публикации:

1. **Виза — РАЗВЕСТИ ДВА РЕЖИМА (критично, страница #37).** SEO-док конфлейтит:
   - Постоянный безвиз — **~68 стран до 180 дней** (US/UK/EU/AU/NZ — да). Это и есть «general travel hook».
   - «**113 стран / temp visa-exemption Jan 1 – Jul 1 2026**» — это ДРУГОЕ: временное освобождение для **держателей ВНЖ** US/EU/UK/GCC, и оно **истекает 01.07.2026** (на следующий день после даты этого плана). **Нельзя подавать «visa-free for 100+ countries» как общий тревел-крючок.** На странице визы — два явных блока, дата проверки, обновить статус после 01.07.2026.
2. **Граница с Турцией и Азербайджаном — НЕ «закрыто навсегда».** Закрыта (land) с 1993 — факт. НО в начале 2026 идёт активное сближение Турция–Армения (рейсы Стамбул–Ереван, готовность КПП Маргара/Алиджан). Страницу `armenia-border-crossings` и упоминания в itinerary писать **только как датированный статус** («as of 2026…»), держать актуальной, не как вечную константу.
3. **Ценовой якорь тура $45 → реалистичный диапазон.** SEO-док даёт «Khor Virap–Noravank–Tatev ~$45/чел»; живые листинги GYG/Viator **~$69/чел** (15 ч, 8:30–23:00). На странице #13 — диапазон (напр. «from ~$45 group / ~$69 typical», 💰 trip-tours), фактчек цены на момент публикации.
4. **Yerevan→Tbilisi тариф ⚠️ спорный.** SEO-док: «marshrutka 8000 AMD ~6 ч»; со стороны Тбилиси выдача даёт flat 50 GEL. **Не печатать жёсткую цифру** — диапазон + «уточняйте», т.к. направление/тариф расходятся (страница #25).
5. **USP-якоря фактчекнуть из первоисточника:** «Transcaucasian Trail армянский участок открыт 2022, ~820 км», «Areni-1 — древнейшая винодельня ~6100 лет», «первая христианская страна (301 г.)». Сильные magnet-факты, но именно их репутационно опасно дать с гуляющей цифрой — подтвердить при написании.
6. **Денежные якоря** (аренда ~$32–42/день, eSIM от ~$0.60/ГБ, поезд/маршрутка) — кросс-фактчек на момент публикации каждой страницы (память `verify-repo-state-independently`).

## ⚠️ Тон «лёгкости» — понизить в gap-формулировках (системный перекос всех 3 SEO-доков)

Адверсариальное ревью спроса: раздел «Пробел конкурентов» систематически переоценён. По «Gyumri», «Dilijan NP», «Lake Sevan», «northern Armenia» уже стоят 6–10 свежих англо-гайдов (wander-lush, absolutearmenia, armenia.travel, GYG, TripAdvisor). **Спрос реален — «лёгкая конкуренция» НЕТ.** В брифах писателю: дифференциатор = **честная логистика по часам/км + «тур vs своя машина» + свежесть 2026 + датированные practical-страницы**, а НЕ «ниша пустая». Соответствует прямому требованию владельца «Армению НЕ переоценивать как лёгкую». KPI — деньги/показы по кластерам (GSC), не «мы первые».

---

## 3. Скелет контент-плана

**Принцип (PROFIT §4 + память `finish-one-item-before-next`):** один материал ПОЛНОСТЬЮ до публикации (текст 1200–2000 слов + ≥5 фото + перелинковка ≥2 + qa=GO), потом следующий. Front-load корпуса, далее ~1/день (5/нед, будни), темп right-size по GSC.

- **Фаза front-load (до «запуска» = снятия `Disallow`):** Волны 0→5 в порядке таблицы (магниты объёма → монастыри/деньги → транспорт → природа → города/еда → practicalities). 38 тем. Это даёт сети траст + дисплей-порог + перелинковочный костяк до индексации.
- **После запуска:** ~1 статья/будень (15/нед на сайт сети — но Армения один из трёх параллельных репо, реальный темп right-size по мощности); добор из «резерва» по сигналам GSC (что показывается/растёт — то добиваем; сезонное — с опережением 2–3 мес).
- **Сезонность (из SEO-дока):** главный сезон апрель–октябрь; sweet-spots — **май** (цветение) и **сентябрь** (harvest/вино). Itinerary/car-rental/monasteries разгонять **янв–апр**; «Armenia in September» — к июлю; зимний ski (Tsaghkadzor) — к ноябрю. События (проверять год!): Areni Wine Festival (нач. октября), Yerevan Wine Days (кон. мая), Vardavar (июль), Golden Apricot (июль).
- **KPI = деньги/показы/позиции по кластерам (не число статей)** — память сети, явное решение владельца. Вехи монетизации — см. §4.
- **ru-кластер релокации — фаст-фоллоу ПОСЛЕ EN-базы**, отдельным языковым треком (паритет slug, hreflang). **⚠️ запускать как траст-трафик, НЕ как доход** (нет партнёра, §4). Перед публикацией ru — YMYL-фактчек (Минюст/налоговая/банки Армении), особенно реформа иммз-закона **с 01.11.2026** (горячий угол «успеть подать ВНЖ по старым правилам до даты») и обяз. медстрахование с 2027.

---

## 4. Монетизация (из PROFIT-ANALYSIS + ревью денег)

**Сдвиг по дисплей-рекламе (PROFIT §0):** лестница теперь **AdSense/Journey (с ~1k сессий, 70%) → Raptive @ 25k pv при ≥50% Tier-1 ИЛИ Mediavine Official @ $5k/год → Raptive 100k**. Наша EN-first US/UK/DE/NL/AU-аудитория прямо бьёт в условие «≥50% Tier-1» → квалифицируемся быстрее. RPM travel в Journey ~$3–5 старт → $8–12 к 90 дням. **Гео важнее объёма** — EN-first ускоряет деньги.

**Приоритетные affiliate-связки (выверено по `partners.json`, рабочие по Армении):**
1. **localrent (авто)** — сильнейшая связка. Localrent живой в Yerevan/Zvartnots (EVN). «Страну не раскрыть без авто» — честный драйвер (нет общественного транспорта к монастырям). 💰 #1.
2. **trip-tours (туры)** — **по Армении РАБОЧИЙ** (Trip.com отдаёт Garni/Geghard, Khor-Virap-Noravank-Tatev, Sevan; 4.8★/2137 отзывов в инвентаре). Массовый продукт через Ереван. Связка «нужна машина ИЛИ тур» = чистая affiliate-боль. 💰 #2.
3. **yesim (eSIM)** — Армения один из самых дешёвых eSIM-рынков (от ~$0.60/ГБ), низкая воронка, высокая конверсия. 💰 #3.
4. **kiwitaxi (трансферы) + aviasales (рейсы)** — Yerevan↔Tbilisi (Кавказ-комбо) + аэропорт-трансфер. **⚠️ kiwitaxi по Армении скорее межгород (Tbilisi→Yerevan), аэропорт-трансфер EVN слабее выражен** — перед публикацией #22 (`zvartnots-airport-to-yerevan`) проверить, что трансфер реально бронируется; если нет — вести страницу на trip-tours/aviasales, не на пустой kiwitaxi.
5. **trip-hotels (отели)** — deep-инвентарь Yerevan (от ~$35). `where-to-stay` (#10) + itinerary-хабы. 💰 прямой transactional.
6. **safetywing (страховка)** — гео-агностична, ссылка живая. Метки на «is safe»/hiking/visa/nomad. Нюанс: `allowSubId:false` (атрибуция по клику слабее), но партнёр рабочий.

**ИСПРАВЛЕНИЯ меток (из ревью денег — внести в брифы):**
- **⚠️ bikesbooking по Армении = только ВЕЛОСИПЕДЫ (скутеров/мото нет).** SEO-док вешал `bikesbooking` на `mount-aragats-hike` — **снять**: на высокогорный хайк (3000+ м) ни байк, ни скутер не ложатся, и нужного товара нет. Для Армении bikesbooking уместен максимум как велопрокат по Еревану/Дилижану, не как hike-монетизация. На горных страницах — safetywing/trip-tours.
- **Унифицировать `💰 нет` на money-страницах между 3 сайтами:** `money-in-armenia-dram-cards` оставить **💰 нет** (eSIM-врезка на «валюта/карты» — слабая натяжка; в Bosnia/Armenia SEO-док помечал yesim непоследовательно). Решение: money/currency-страницы — без партнёра, как Serbia.
- **Рейсы — на `aviasales`** (в partners.json `trip-flights` помечен «не используется»). Подтверждено.

**⚠️ ru-релокация (Армения) — affiliate ГИПОТЕТИЧЕСКИЙ, не реальный (критично для §1, §3):**
- В `partners.json` НЕТ ни одного партнёра под релокацию/банки/долгосрочную аренду; в подтверждённом наборе Travelpayouts их тоже нет. Релокант-конторы (relocation2armenia/ArmGate-тип) — сервис-компании без публичной affiliate-программы через Travelpayouts (вступать индивидуально). Банки Армении (Ardshinbank/Ameria/IDBank) розничного affiliate под нерезидентов де-факто не дают; Wise/Revolut — только user-referral.
- **Вывод:** ru-кластер релокации сегодня = **0 рабочих доходных партнёров.** Из нашего набора по ru работают только `yesim` (связь) и частично `safetywing` (но это не локальная ДМС). **Не планировать ru-кластер как доходный, пока не заведён конкретный партнёр** (CPA-сеть релокации или прямой деал). Иначе — YMYL-трафик без монетизации. ru-кластер оправдан как траст/трафик и под будущий высокий чек лида, но это задача «завести партнёра», а не готовая связка.

**Путь к рекламе (вехи, PROFIT §4):** ~1000 сессий/сайт → Journey by Mediavine (70%) + AdSense-страховка (первый дисплей-доход); 25k pv при ≥50% Tier-1 → заявка в Raptive; $5k ad-rev/12 мес → авто-апгрейд Journey→Mediavine Official. Affiliate — с первой опубликованной денежной страницы (не ждёт порогов). **Перф-бюджет обязателен** (дисплей бьёт по CWV): фото webp ≤200 КБ, ленивые ad-слоты без CLS, ad-скрипты после контента. **Consent Mode v2 + CMP** на старте (EU-трафик DE/NL/скандинавы) — иначе сети режут RPM; брать паттерн croatia (CookieConsent.astro + ga-init.js + consent-banner.js, CSP без инлайн-sha256).

---

## 5. Скаффолд

**Источник правды по сборке:** `docs/NEW-SITE-CHECKLIST.md` (этапы A→K) + `docs/NEW-SITE-BLUEPRINT.md` (~30 точек конфига + деконтаминация + 12 точек оркестратора). Не дублирую — ссылаюсь. Ключевое для Армении:

- **A1 донор:** `cp -r sites/macedonia-site` (en-only). Донор агентов чище всего — `croatia-site` (0/20). Подтянуть из Грузии свежие `scripts/*` гейты (`check-dedup.mjs`/`check-photos.mjs`/`qa.mjs`).
- **A4 бейслайны ПУСТЫЕ:** `.dedup-baseline.json → {"reversePairs":[],"titlePairs":[]}`, `.photo-baseline.json → []` (нет легаси-долга).
- **C2/C3 контент-модель:** `LANGS=['en']`; CATEGORIES — en-набор форка (attractions/cities/food/entertainment/routes/transport/car-rental/relocation/insurance/news/planning); **REGIONS → 10 марзов + Ереван** (§1); PRICE_LEVELS → AMD/€ (**⚠️ решение владельца**); CUISINE_KEYS/ATTRACTION_TYPES под Армению. `check-enums` обязан пройти (C5).
- **C6 город = статья** `category:'cities'`; коллекцию `cities` НЕ наполнять (папки пустые).
- **D1 партнёры:** оставить рабочие tpx.gr/Trip; в Trip `kwd=Montenegro→Armenia`; **EKTA НЕ копировать сломанным** (корректная tpx.gr или удалить). bikesbooking оставить в карте, но НЕ вешать на горные хайки (§4).
- **E1–E4 аналитика:** новое GA4-свойство (свой `G-…`); consent-паттерн форка (НЕ инлайн Грузии); CSP `script-src 'self' https://www.googletagmanager.com` без sha256; connect-src — API курса (open.er-api) + open-meteo.
- **G1–G4 деконтаминация (ГЕЙТ перед /work):** 0 «Georgia/Грузи/Тбилиси/georgiaguidebook» в `.claude/agents` / `.claude/skills` / `scripts` / доках; `s/Georgia/Armenia/`, гео-примеры (города/регионы/кухня), убрать `uk-translator.md` (en-only); CLAUDE.md+SPEC.md репо под Армению.
- **Наследуемые гейты (live в сети, переезжают при `cp -r`):** `check-dedup` (④ «одна интент-страница», slug-коллизии HARD FAIL, обратные транспорт-пары, near-duplicate Jaccard≥0.85), `check-photos` (cover + ≥5 фото статья / ≥2 новость / фото-на-остановку маршрут, ≤200 КБ), `check-interlinks` (≥2, анти-сироты), Consent Mode v2. Финал — `npm run qa` = **ВЕРДИКТ GO** (не exit 0; память `qa-verdict-not-exit-code`).
- **J1–J10 оркестратор (12 точек, иначе сайт невидим для /work и дашборда):** `grafana/build-status.mjs` SITES `{key:'armenia',name:'Армения',langs:'en'}` + DOMAIN `armenia:'armeniaguidebook.com'`; `build-html.mjs` FLAG `armenia:'🇦🇲'`; `install-refresh-hooks.mjs` repoRel `'sites/armenia-site'` + запустить (post-commit хук); хаб-скиллы work/news/content + строка сайта; `SITES-REGISTRY.md`; `docs/calendars/armenia-KALENDAR.md` (на будущих датах только `○`); этот SEO-док уже на месте; `MASTER-PLAN.md` число/порядок сайтов; пересборка дашборда.
- **Definition of ready (этап K):** qa=GO; 0 «Georgia»; свой GA4 + consent + CSP без чужого sha256; `/go/` без сломанного EKTA; домен HTTP 200; GSC-проперти; дашборд видит сайт; доки/календарь/реестр актуальны и закоммичены в репо сайта И репо хаба.

---

## Открытые вопросы владельцу (точки решения)
1. **PRICE_LEVELS:** AMD (драм) vs €-эквивалент для Tier-1-читателя? (предлагаю AMD + примерный USD/EUR).
2. **ru-кластер релокации:** заводим ли реального affiliate (CPA-релокация / прямой деал с релокант-конторой / банк) ДО запуска ru-трека, или ru идёт как чистый траст-трафик без монетизации? Сейчас доходных партнёров под него — ноль.
3. **kiwitaxi EVN:** до публикации страницы аэропорт-трансфера подтвердить, что трансфер реально бронируется (иначе вести на trip-tours/aviasales).
4. Домен `armeniaguidebook.com` — подтвердить и зарегистрировать.

---

### Памятки сети, релевантные плану
`shared-engine-port-fixes-to-all-forks` · `cities-as-goroda-articles` · `astro-internal-link-format` · `seo-meta-length-chars-not-bytes` · `qa-verdict-not-exit-code` · `human-tone-hard-gate` · `one-intent-page-anti-cannibalization` · `always-interlink-content` · `finish-one-item-before-next` · `verify-repo-state-independently` · `domains-live-verify-not-stale-registry` · `descriptive-commit-messages` · `dashboard-sync-after-calendar-change`.
