# Grafana-пульт сети путеводителей

Пульт по 5 сайтам: **деплои/CI** (последний пуш, статус CI, авто-новости, история прогонов) + **контент-календарь** (темы на сегодня/завтра, что готово, что к написанию).

Grafana сама данные не собирает — её кормит генератор `build-status.mjs`, который читает реальный git + GitHub Actions + ваши `KALENDAR.md` и пишет `shared/status.json`. Grafana читает этот JSON через плагин-датасорс **Infinity**.

```
┌────────────────────┐   node build-status.mjs   ┌──────────────┐   Infinity    ┌─────────┐
│ git + GitHub Actions│ ───────────────────────▶ │ shared/      │ ◀──────────── │ Grafana │
│ + sites/*/KALENDAR  │                           │ status.json  │  (по URL)     │ панели  │
└────────────────────┘                            └──────────────┘               └─────────┘
```

## Что нужно
- **Node.js** (есть — на нём собраны сайты) и **GitHub CLI `gh`** (авторизован: `gh auth status`) — для генератора.
- **Docker Desktop** — для самого Grafana (либо нативная Grafana, см. ниже).

## Быстрый старт (Docker)
Из **корня хаба** (`C:\Users\Oleksandr\Desktop\multiagent`):

```bash
# 1) собрать свежие данные
node grafana/build-status.mjs

# 2) поднять Grafana + файловый сервер
docker compose -f grafana/docker-compose.yml up -d

# 3) открыть пульт (вход не нужен — анонимный admin)
#    http://localhost:3000  → дашборд «Сеть путеводителей — деплои и календарь»
```

Дашборд авто-рефрешится раз в минуту. Чтобы обновить данные — перезапустите шаг 1 (Grafana подхватит новый `status.json` сама).

Остановить: `docker compose -f grafana/docker-compose.yml down`.

## Автообновление данных
Генератор надо периодически перезапускать. Варианты:

- **Windows Task Scheduler** (каждые 15 мин):
  ```powershell
  schtasks /Create /SC MINUTE /MO 15 /TN "guidebooks-status" ^
    /TR "node \"C:\Users\Oleksandr\Desktop\multiagent\grafana\build-status.mjs\""
  ```
- **Вшить в `/work`**: добавить `node grafana/build-status.mjs` в конец утреннего цикла (тогда пульт свеж после каждой публикации).
- **GitHub Action**: собирать `status.json` в репозитории по cron и коммитить (нужно для Grafana Cloud — см. ниже).

## Без Docker (нативная Grafana на Windows)
1. Поставить Grafana (zip/installer), запустить `grafana-server.exe`.
2. Plugins → установить **Infinity** (`yesoreyeram-infinity-datasource`); добавить датасорс с `uid: infinity`.
3. Dashboards → Import → вставить `provisioning/dashboards/network-ops.json`.
4. Отдать `status.json` по HTTP, например из корня хаба: `npx serve grafana/shared -l 8088`.
5. В дашборде задать переменную **baseUrl** = `http://localhost:8088`.

## Grafana Cloud (хостинг, бесплатный тариф)
Данные должны быть доступны из интернета: пушьте `status.json` в публичный Gist или в репозиторий (или приватно — с GitHub-токеном в настройках Infinity), затем в переменной `baseUrl` укажите его URL. В остальном дашборд тот же.

## Оговорки
- **Cloudflare build status не подключён.** «Как прошёл деплой» показывается по **conclusion CI** (build+qa) как прокси — это надёжный сигнал «собралось/не собралось», но не сам факт раскатки на Cloudflare. Чтобы подтянуть реальный статус билдов Workers — нужен read-only Cloudflare API-токен (Account → Analytics/Workers), тогда генератор добавит поле в `status.json`.
- Разбор календаря эвристический (по формату строк `KALENDAR.md`): берёт пункты списка с датой сегодня/завтра и маркерами `[Статья]`/`📰`/`📊`; `[x]`/`ОПУБЛИКОВАНО`/`✅`/`SKIP` = готово.
- `shared/status.json` — генерируемый, в git хаба не коммитится (`.gitignore`).
