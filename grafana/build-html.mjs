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

const slot = (label, text, count, done) => {
  if (!count) return `<span><b>${label}</b><span class="muted">—</span></span>`;
  const mk = done ? '<span class="ok">✓</span>' : '<span class="todo">○</span>';
  return `<span><b>${label}</b>${mk} ${esc(text)}</span>`;
};

const siteRow = (s) => {
  const ok = s.ci === 'success';
  const ci = ok ? '<span class="badge bg">CI ок</span>'
    : (s.ci === 'failure' ? '<span class="badge br">CI упал</span>' : `<span class="badge bn">${esc(s.ci)}</span>`);
  const warn = s.recentFailures > 0 ? `<span class="meta amber">⚠ ${s.recentFailures} падений</span>` : '';
  return `<div class="site">
    <div class="srow">
      <div class="name"><span class="dot ${ok ? 'g' : 'r'}"></span>${FLAG[s.key] || ''} ${esc(s.name)} <span class="langs">${esc(s.langs)}</span></div>
      <div class="right">${warn}${ci}<span class="meta">деплой ${fmt(s.deployTime)}</span></div>
    </div>
    <div class="cal">
      ${slot('Сегодня', s.todayText, s.todayCount, s.todayDone)}
      ${slot('Завтра', s.tomorrowText, s.tomorrowCount, s.tomorrowDone)}
    </div>
  </div>`;
};

const runsSorted = [...d.runs].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);
const runRows = runsSorted.map((r) => {
  const ok = r.result === 'success';
  return `<tr><td><span class="dot ${ok ? 'g' : 'r'}" style="display:inline-block;margin-right:8px"></span>${ok ? 'success' : 'failure'}</td><td>${esc(r.name)}</td><td class="muted">${esc(r.workflow)}</td><td class="muted">${fmt(r.time)}</td></tr>`;
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
.wrap{max-width:1060px;margin:0 auto}
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
.site{padding:14px 18px;border-top:1px solid var(--line2)}
.site:first-child{border-top:none}
.srow{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.name{font-size:16px;font-weight:600;display:flex;align-items:center;gap:9px}
.langs{font-size:12px;color:var(--muted);font-weight:400}
.right{display:flex;align-items:center;gap:11px;flex-wrap:wrap}
.dot{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.dot.g{background:var(--green)}.dot.r{background:var(--red)}
.meta{font-size:12px;color:var(--muted);white-space:nowrap}
.meta.amber{color:var(--amber)}
.badge{font-size:12px;font-weight:600;padding:3px 10px;border-radius:999px;white-space:nowrap}
.bg{background:#16261b;color:var(--green)}.br{background:#2a1618;color:var(--red)}.bn{background:#1c2330;color:var(--soft)}
.cal{margin-top:10px;display:flex;flex-wrap:wrap;gap:7px 26px;font-size:13px;color:var(--soft)}
.cal b{color:var(--muted);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.3px;margin-right:7px}
.ok{color:var(--green);margin-right:4px}.todo{color:var(--amber);margin-right:4px}
.muted{color:var(--muted)}
.runs table{width:100%;border-collapse:collapse;font-size:14px}
.runs th{text-align:left;font-size:11px;color:var(--muted);font-weight:600;padding:11px 16px;text-transform:uppercase;letter-spacing:.3px;border-bottom:1px solid var(--line)}
.runs td{padding:9px 16px;border-top:1px solid var(--line2)}
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
    ${d.sites.map(siteRow).join('')}
  </div>
  <h2>История прогонов CI</h2>
  <div class="panel runs">
    <table>
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
console.log('dashboard.html (тёмная): ' + outFile + ' (' + (html.length / 1024).toFixed(0) + ' КБ)');
