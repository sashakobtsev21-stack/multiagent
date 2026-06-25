// Собирает красивый самодостаточный dashboard.html из grafana/shared/status.json.
// Данные вшиты в файл (никаких внешних запросов) — открывается двойным кликом офлайн.
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

const stat = (n, l, cls = '') => `<div class="stat ${cls}"><div class="n">${n}</div><div class="l">${l}</div></div>`;

const summary = `
<div class="summary">
  ${stat(`${d.summary.deployedToday} / ${d.summary.total}`, 'Задеплоено сегодня', 'green')}
  ${stat(`${d.summary.ciGreen} / ${d.summary.total}`, 'CI зелёные', 'green')}
  ${stat(`${d.summary.publishedToday} / ${d.summary.total}`, 'Опубликовано сегодня', 'green')}
  ${stat(`${d.summary.pendingTomorrow}`, 'На завтра написать', 'amber')}
</div>`;

const slot = (text, count, done, doneTxt, todoTxt) => {
  if (!count) return '<span class="muted">—</span>';
  const b = done ? `<span class="badge b-green">✓ ${doneTxt}</span>` : `<span class="badge b-amber">○ ${todoTxt}</span>`;
  return `${b} <span class="slot">${esc(text)}</span>`;
};

const siteCard = (s) => {
  const ok = s.ci === 'success';
  const ciBadge = ok
    ? '<span class="badge b-green">✓ CI ок</span>'
    : (s.ci === 'failure' ? '<span class="badge b-red">✗ CI упал</span>' : `<span class="badge b-gray">${esc(s.ci)}</span>`);
  const extra = [];
  if (s.newsRebuild === 'success') extra.push('<span class="badge b-green">новости ✓</span>');
  else if (s.newsRebuild === 'failure') extra.push('<span class="badge b-red">новости ✗</span>');
  if (s.recentFailures > 0) extra.push(`<span class="badge b-amber">⚠ ${s.recentFailures} падений CI</span>`);
  const extraRow = extra.length ? `<div class="row"><div class="k">Ещё</div><div class="v">${extra.join(' ')}</div></div>` : '';
  return `
  <div class="site ${ok ? '' : 'bad'}">
    <div class="shead">
      <div class="name">${FLAG[s.key] || ''} ${esc(s.name)} <span class="langs">${esc(s.langs)}</span></div>
      ${ciBadge}
    </div>
    <div class="deploy"><span class="muted">деплой</span> ${fmt(s.deployTime)} · ${esc(s.subject)}</div>
    <div class="row"><div class="k">Сегодня</div><div class="v">${slot(s.todayText, s.todayCount, s.todayDone, 'опубл.', 'в работе')}</div></div>
    <div class="row"><div class="k">Завтра</div><div class="v">${slot(s.tomorrowText, s.tomorrowCount, s.tomorrowDone, 'готово', 'написать')}</div></div>
    ${extraRow}
  </div>`;
};

const runsSorted = [...d.runs].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 15);
const runRows = runsSorted.map((r) => {
  const ok = r.result === 'success';
  return `<tr><td><span class="dot ${ok ? 'g' : 'r'}"></span>${ok ? 'success' : 'failure'}</td><td>${esc(r.name)}</td><td class="muted">${esc(r.workflow)}</td><td class="muted">${fmt(r.time)}</td></tr>`;
}).join('');

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="60">
<title>Пульт сети — ${esc(d.today)}</title>
<style>
:root{--bg:#f4f5f7;--card:#fff;--ink:#111827;--muted:#6b7280;--line:#e7e8ec;
--green:#15803d;--green-bg:#dcfce7;--red:#b91c1c;--red-bg:#fee2e2;--amber:#b45309;--amber-bg:#fef3c7;--gray-bg:#eef0f3}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 -apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:30px 18px}
.wrap{max-width:1080px;margin:0 auto}
.top{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:22px}
h1{font-size:25px;margin:0;font-weight:700;letter-spacing:-.01em}
.sub{color:var(--muted);font-size:14px;margin-top:5px}
.updated{font-size:13px;color:var(--muted);background:var(--card);border:1px solid var(--line);border-radius:999px;padding:7px 14px;white-space:nowrap}
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:8px}
@media(max-width:720px){.summary{grid-template-columns:repeat(2,1fr)}}
.stat{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.stat .n{font-size:30px;font-weight:700;line-height:1.05}
.stat .l{font-size:13px;color:var(--muted);margin-top:7px}
.stat.green .n{color:var(--green)}.stat.amber .n{color:var(--amber)}
h2{font-size:15px;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);margin:30px 0 13px;font-weight:600}
.sites{display:grid;grid-template-columns:repeat(auto-fit,minmax(335px,1fr));gap:16px}
.site{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--green);border-radius:14px;padding:15px 18px}
.site.bad{border-left-color:var(--red)}
.shead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:11px}
.name{font-size:17px;font-weight:700;display:flex;align-items:center;gap:8px}
.langs{font-size:12px;color:var(--muted);font-weight:400}
.deploy{font-size:13px;color:#374151;padding-bottom:4px}
.badge{font-size:12px;font-weight:600;padding:3px 9px;border-radius:999px;white-space:nowrap;display:inline-block}
.b-green{background:var(--green-bg);color:var(--green)}.b-red{background:var(--red-bg);color:var(--red)}
.b-amber{background:var(--amber-bg);color:var(--amber)}.b-gray{background:var(--gray-bg);color:var(--muted)}
.row{display:flex;gap:10px;padding:8px 0;border-top:1px solid var(--line)}
.row .k{font-size:11px;color:var(--muted);min-width:62px;flex-shrink:0;text-transform:uppercase;letter-spacing:.3px;padding-top:3px}
.row .v{font-size:14px}
.slot{display:inline}
.muted{color:var(--muted)}
.runs{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.runs table{width:100%;border-collapse:collapse;font-size:14px}
.runs th{text-align:left;font-size:11px;color:var(--muted);font-weight:600;padding:11px 16px;background:#fafbfc;text-transform:uppercase;letter-spacing:.3px}
.runs td{padding:9px 16px;border-top:1px solid var(--line)}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:8px;vertical-align:middle}
.dot.g{background:var(--green)}.dot.r{background:var(--red)}
.foot{margin-top:24px;color:var(--muted);font-size:13px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px}
.legend span{margin-right:14px}
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
  <div class="sites">
    ${d.sites.map(siteCard).join('')}
  </div>
  <h2>История прогонов CI</h2>
  <div class="runs">
    <table>
      <thead><tr><th>Итог</th><th>Сайт</th><th>Workflow</th><th>Время</th></tr></thead>
      <tbody>${runRows}</tbody>
    </table>
  </div>
  <div class="foot">
    <div class="legend"><span>✓ опубликовано / ок</span><span>○ к написанию</span><span>✗ ошибка</span></div>
    <div>${d.sites.length} сайтов · страница сама обновляется раз в минуту</div>
  </div>
</div>
</body>
</html>`;

fs.writeFileSync(outFile, html, 'utf8');
console.log('dashboard.html: ' + outFile + ' (' + (html.length / 1024).toFixed(0) + ' КБ)');
