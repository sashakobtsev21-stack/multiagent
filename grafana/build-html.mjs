// Собирает красивый самодостаточный dashboard.html (тёмная панель) из grafana/shared/status.json.
// Данные вшиты в файл — открывается двойным кликом офлайн, сам обновляется раз в минуту.
// Запуск: node grafana/build-html.mjs  (данные готовит build-status.mjs).
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(here, 'shared', 'status.json');
const outFile = path.join(here, 'dashboard.html');

if (!fs.existsSync(dataFile)) {
  console.error('Нет shared/status.json — сначала запусти build-status.mjs.');
  process.exit(1);
}
const d = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

const FLAG = { gruzia: '🇬🇪', albania: '🇦🇱', montenegro: '🇲🇪', croatia: '🇭🇷', macedonia: '🇲🇰' };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (iso) => {
  const t = new Date(iso);
  if (isNaN(t)) return '—';
  return t.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const stat = (n, l, cls) => `<div class="stat"><div class="n ${cls}">${n}</div><div class="l">${l}</div></div>`;

const summary = `<div class="summary">
  ${stat(`${d.summary.deployedToday} / ${d.summary.total}`, 'Задеплоено сегодня', 'green')}
  ${stat(`${d.summary.ciGreen} / ${d.summary.total}`, 'CI зелёные', 'green')}
  ${stat(`${d.summary.publishedToday} / ${d.summary.total}`, 'Опубликовано сегодня', 'green')}
  ${stat(`${d.summary.pendingTomorrow}`, 'На завтра написать', d.summary.pendingTomorrow ? 'amber' : 'green')}
</div>`;

const slotCell = (text, count, done) => {
  if (!count) return '<span class="muted">—</span>';
  const mk = done ? '<span class="ok">✓</span>' : '<span class="todo">○</span>';
  return `${mk} ${esc(text)}`;
};

const siteRows = d.sites.map((s) => {
  const ok = s.ci === 'success';
  const ci = ok ? '<span class="badge bg">ок</span>'
    : (s.ci === 'failure' ? '<span class="badge br">упал</span>' : `<span class="badge bn">${esc(s.ci)}</span>`);
  return `<tr>
    <td class="nm"><span class="dot ${ok ? 'g' : 'r'}"></span>${FLAG[s.key] || ''} ${esc(s.name)} <span class="langs">${esc(s.langs)}</span></td>
    <td>${ci}</td>
    <td class="muted nowrap">${fmt(s.deployTime)}</td>
    <td>${esc(s.subject)}</td>
    <td>${slotCell(s.todayText, s.todayCount, s.todayDone)}</td>
    <td>${slotCell(s.tomorrowText, s.tomorrowCount, s.tomorrowDone)}</td>
  </tr>`;
}).join('');

const commitRows = [...(d.commits || [])].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 14)
  .map((c) => `<tr><td class="muted nowrap">${fmt(c.time)}</td><td class="nowrap">${FLAG[c.site] || ''} ${esc(c.name)}</td><td><span class="hash">${esc(c.hash)}</span> ${esc(c.subject)}</td></tr>`).join('');

const runRows = [...d.runs].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 12)
  .map((r) => {
    const ok = r.result === 'success';
    return `<tr><td class="nowrap"><span class="rdot ${ok ? 'g' : 'r'}">●</span> ${ok ? 'success' : 'failure'}</td><td>${esc(r.name)}</td><td class="muted">${esc(r.workflow)}</td><td class="muted nowrap">${fmt(r.time)}</td></tr>`;
  }).join('');

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="60">
<title>Пульт сети — ${esc(d.today)}</title>
<style>
:root{--bg:#0b0f16;--panel:#0f141c;--line:#222a37;--line2:#1c2330;--ink:#e7eaf0;--muted:#7e8696;--soft:#aab2c0;
--green:#4ade80;--amber:#fbbf24;--red:#f87171}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 -apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:30px 18px}
.wrap{max-width:1140px;margin:0 auto}
.top{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap;margin-bottom:22px}
h1{font-size:24px;margin:0;font-weight:700;letter-spacing:-.01em}
.sub{color:var(--muted);font-size:14px;margin-top:5px}
.updated{font-size:13px;color:var(--soft);background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:7px 14px;white-space:nowrap}
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:26px}
@media(max-width:720px){.summary{grid-template-columns:repeat(2,1fr)}}
.stat{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.stat .n{font-size:30px;font-weight:700;line-height:1.05}
.stat .l{font-size:13px;color:var(--muted);margin-top:7px}
.green{color:var(--green)}.amber{color:var(--amber)}.red{color:var(--red)}
h2{font-size:13px;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);margin:28px 0 12px;font-weight:600}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}
table{width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed}
th{text-align:left;font-size:11px;color:var(--muted);font-weight:600;padding:12px 14px;text-transform:uppercase;letter-spacing:.3px;border-bottom:1px solid var(--line)}
td{padding:12px 14px;border-top:1px solid var(--line2);vertical-align:top;overflow-wrap:anywhere}
tbody tr:nth-child(even) td{background:rgba(255,255,255,.018)}
.nm{font-weight:600}
.langs{font-size:12px;color:var(--muted);font-weight:400}
.nowrap{white-space:nowrap}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:8px;vertical-align:middle}
.dot.g{background:var(--green)}.dot.r{background:var(--red)}
.rdot.g{color:var(--green)}.rdot.r{color:var(--red)}
.badge{font-size:12px;font-weight:600;padding:3px 11px;border-radius:999px;white-space:nowrap}
.bg{background:#16261b;color:var(--green)}.br{background:#2a1618;color:var(--red)}.bn{background:#1c2330;color:var(--soft)}
.ok{color:var(--green);margin-right:3px}.todo{color:var(--amber);margin-right:3px}
.muted{color:var(--muted)}
.hash{color:var(--soft);font-family:ui-monospace,Consolas,monospace;font-size:12px}
.foot{margin-top:22px;color:var(--muted);font-size:13px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
.legend span{margin-right:16px}
</style>
</head>
<body>
<div class="wrap">
  <div class="top">
    <div>
      <h1>Сеть путеводителей</h1>
      <div class="sub">Деплои и контент-календарь · сегодня ${esc(d.today)}, завтра ${esc(d.tomorrow)}</div>
    </div>
    <div class="updated">обновлено ${fmt(d.generatedAt)}</div>
  </div>
  ${summary}
  <h2>Сайты</h2>
  <div class="panel">
    <table>
      <colgroup><col style="width:16%"><col style="width:7%"><col style="width:12%"><col style="width:23%"><col style="width:21%"><col style="width:21%"></colgroup>
      <thead><tr><th>Сайт</th><th>CI</th><th>Деплой</th><th>Коммит</th><th>Сегодня</th><th>Завтра</th></tr></thead>
      <tbody>${siteRows}</tbody>
    </table>
  </div>
  <h2>Последние коммиты</h2>
  <div class="panel">
    <table>
      <colgroup><col style="width:14%"><col style="width:18%"><col style="width:68%"></colgroup>
      <thead><tr><th>Время</th><th>Сайт</th><th>Коммит</th></tr></thead>
      <tbody>${commitRows}</tbody>
    </table>
  </div>
  <h2>История прогонов CI</h2>
  <div class="panel">
    <table>
      <colgroup><col style="width:18%"><col style="width:22%"><col style="width:30%"><col style="width:30%"></colgroup>
      <thead><tr><th>Итог</th><th>Сайт</th><th>Workflow</th><th>Время</th></tr></thead>
      <tbody>${runRows}</tbody>
    </table>
  </div>
  <div class="foot">
    <div class="legend"><span><span class="ok">✓</span> опубликовано / ок</span><span><span class="todo">○</span> к написанию</span><span>● success / failure</span></div>
    <div>${d.sites.length} сайтов · страница сама обновляется раз в минуту</div>
  </div>
</div>
</body>
</html>`;

fs.writeFileSync(outFile, html, 'utf8');
console.log('dashboard.html (тёмная, таблицы): ' + outFile + ' (' + (html.length / 1024).toFixed(0) + ' КБ)');
