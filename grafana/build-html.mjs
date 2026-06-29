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
  ${stat(`${d.summary.publishedToday}`, 'Опубликовано сегодня (статей)', 'green')}
  ${stat(`${d.summary.pendingTomorrow}`, 'На завтра написать', d.summary.pendingTomorrow ? 'amber' : 'green')}
</div>`;

const slotCell = (items, urlBySlug) => {
  if (!items || !items.length) return '<span class="muted">—</span>';
  return '<div class="slotlist">' + items.map((it) => {
    const mk = it.done ? '<span class="ok">✓</span>' : '<span class="todo">○</span>';
    const title = esc(it.title);
    const link = (it.done && it.slug && urlBySlug && urlBySlug[it.slug])
      ? `<a href="${urlBySlug[it.slug]}" target="_blank" rel="noopener" style="color:#7fb4f5;text-decoration:none">${title}</a>`
      : title;
    return `<div class="slotrow">${mk} ${link}</div>`;
  }).join('') + '</div>';
};

const artsCell = (s) => {
  const parts = Object.entries(s.articlesBySection || {})
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${esc(k)} <b>${v}</b>`).join(' · ');
  return `<div class="artn">${s.articlesTotal || 0}</div><div class="artbreak">${parts || '—'}</div>`;
};

const siteRows = d.sites.map((s) => {
  const ok = s.ci === 'success';
  const inProg = /progress|queued|requested|waiting|pending|running|in_progress/i.test(s.ci || '');
  const ci = ok ? '<span class="badge bg">ок</span>'
    : s.ci === 'failure' ? '<span class="badge br">упал</span>'
    : inProg ? '<span class="badge bp">⏳ идёт деплой</span>'
    : `<span class="badge bn">${esc(s.ci)}</span>`;
  return `<tr>
    <td class="nm"><span class="dot ${ok ? 'g' : 'r'}"></span>${FLAG[s.key] || ''} ${esc(s.name)}<div class="langs">${esc(s.langs)}</div></td>
    <td>${ci}</td>
    <td>${artsCell(s)}</td>
    <td>${slotCell(s.yesterdayItems, s.urlBySlug)}</td>
    <td>${slotCell(s.todayItems, s.urlBySlug)}</td>
    <td>${slotCell(s.tomorrowItems, s.urlBySlug)}</td>
    <td>${slotCell(s.dayAfterItems, s.urlBySlug)}</td>
  </tr>`;
}).join('');

const pubToday = d.sites.flatMap((s) => (s.publishedToday || []).map((p) => ({ ...p, key: s.key })));
const pubTodayHtml = pubToday.length ? `
  <h2>Опубликовано сегодня (${pubToday.length})</h2>
  <div class="panel" style="padding:6px 16px">
    ${pubToday.map((p) => `<div style="padding:8px 0;border-top:1px solid var(--line2)"><span class="badge ${p.isNews ? 'bn' : 'bg'}" style="margin-right:9px">${p.isNews ? '📰 новость' : '📄 статья'}</span><a href="${p.url}" target="_blank" rel="noopener" style="color:#7fb4f5;text-decoration:none">${FLAG[p.key] || ''} ${esc(p.title)}</a></div>`).join('')}
  </div>` : '';

const commitRows = [...(d.commits || [])].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 16)
  .map((c) => `<tr><td class="muted nowrap">${fmt(c.time)}</td><td class="nowrap">${FLAG[c.site] || ''} ${esc(c.name)}</td><td><span class="hash">${esc(c.hash)}</span> ${esc(c.subject)}</td></tr>`).join('');

// --- SEO/трафик (GSC + GA4), если есть seoNetwork ---
const seoRows = d.sites.filter((s) => s.seo).map((s) => {
  const g = s.seo.gsc || {}, a = s.seo.ga4 || {};
  const tq = g.topQueries && g.topQueries[0] ? g.topQueries[0].q : '—';
  const t1 = a.tier1Pct || 0;
  return `<tr>
    <td class="nm">${FLAG[s.key] || ''} ${esc(s.name)}</td>
    <td><b>${g.clicks28 ?? 0}</b></td>
    <td class="muted">${g.impressions28 ?? 0}</td>
    <td>${g.position28 ?? '—'}</td>
    <td>${a.sessions28 ?? 0}</td>
    <td class="${t1 >= 40 ? 'green' : ''}">${t1}%</td>
    <td class="muted">${esc(tq)}</td>
  </tr>`;
}).join('');
const sn = d.seoNetwork;
const seoSection = sn ? `
  <h2>Трафик и индексация · Google (GSC + GA4)</h2>
  <div class="summary">
    ${stat(sn.clicks28 ?? 0, 'Клики из поиска (28д)', 'green')}
    ${stat(sn.impressions28 ?? 0, 'Показы в поиске (28д)', 'green')}
    ${stat(sn.sessions7 ?? 0, 'Сессии (7 дней)', 'green')}
    ${stat(sn.users28 ?? 0, 'Пользователи (28д)', 'green')}
  </div>
  <div class="panel">
    <table>
      <colgroup><col style="width:20%"><col style="width:11%"><col style="width:12%"><col style="width:13%"><col style="width:13%"><col style="width:10%"><col style="width:21%"></colgroup>
      <thead><tr><th>Сайт</th><th>Клики (GSC)</th><th>Показы</th><th>Ср. позиция</th><th>Сессии (28д)</th><th>Tier-1</th><th>Топ-запрос</th></tr></thead>
      <tbody>${seoRows}</tbody>
    </table>
  </div>` : '';

const html = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="refresh" content="30">
<title>Пульт сети — ${esc(d.today)}</title>
<style>
:root{--bg:#0b0f16;--panel:#0f141c;--line:#222a37;--line2:#1c2330;--ink:#e7eaf0;--muted:#7e8696;--soft:#aab2c0;
--green:#4ade80;--amber:#fbbf24;--red:#f87171}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 -apple-system,Segoe UI,Roboto,Arial,sans-serif;padding:30px 18px}
.wrap{max-width:1500px;margin:0 auto}
.top{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap;margin-bottom:22px}
h1{font-size:24px;margin:0;font-weight:700;letter-spacing:-.01em}
.sub{color:var(--muted);font-size:14px;margin-top:5px}
.upd-wrap{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.updated{font-size:13px;color:var(--soft);background:var(--panel);border:1px solid var(--line);border-radius:999px;padding:7px 14px;white-space:nowrap}
.refresh{font:600 13px/1 inherit;color:var(--ink);background:#16261b;border:1px solid #1f3a29;border-radius:999px;padding:8px 15px;cursor:pointer;white-space:nowrap;transition:background .12s,border-color .12s}
.refresh:hover{background:#1c3324;border-color:#2c5238}
.refresh:active{transform:translateY(1px)}
.summary{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:26px}
@media(max-width:720px){.summary{grid-template-columns:repeat(2,1fr)}}
.stat{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:16px 18px}
.stat .n{font-size:30px;font-weight:700;line-height:1.05}
.stat .l{font-size:13px;color:var(--muted);margin-top:7px}
.green{color:var(--green)}.amber{color:var(--amber)}.red{color:var(--red)}
h2{font-size:13px;text-transform:uppercase;letter-spacing:.4px;color:var(--muted);margin:28px 0 12px;font-weight:600}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}
table{width:100%;border-collapse:collapse;font-size:13px;table-layout:fixed}
th{text-align:left;font-size:11px;color:var(--muted);font-weight:600;padding:12px 13px;text-transform:uppercase;letter-spacing:.3px;border-bottom:1px solid var(--line)}
td{padding:12px 13px;border-top:1px solid var(--line2);vertical-align:top;overflow-wrap:anywhere}
tbody tr:nth-child(even) td{background:rgba(255,255,255,.018)}
.nm{font-weight:600}
.langs{font-size:11px;color:var(--muted);font-weight:400;margin-top:2px}
.nowrap{white-space:nowrap}
.dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:8px;vertical-align:middle}
.dot.g{background:var(--green)}.dot.r{background:var(--red)}
.badge{font-size:12px;font-weight:600;padding:3px 11px;border-radius:999px;white-space:nowrap}
.bg{background:#16261b;color:var(--green)}.br{background:#2a1618;color:var(--red)}.bn{background:#1c2330;color:var(--soft)}
.bp{background:#2a2410;color:var(--amber);animation:pulse 1.3s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.ok{color:var(--green);margin-right:3px}.todo{color:var(--amber);margin-right:3px}
.slotlist{display:flex;flex-direction:column;gap:6px}
.slotrow{padding:5px 8px;background:rgba(255,255,255,.022);border:1px solid var(--line2);border-radius:7px;line-height:1.4}
.muted{color:var(--muted)}
.artn{font-size:20px;font-weight:700}
.artbreak{font-size:11.5px;color:var(--muted);margin-top:3px;line-height:1.5}
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
      <div class="sub">Деплои и контент-календарь · вчера ${esc(d.yesterday)} · сегодня ${esc(d.today)} · завтра ${esc(d.tomorrow)} · послезавтра ${esc(d.dayAfter)}</div>
    </div>
    <div class="upd-wrap">
      <span class="updated">обновлено ${new Date(d.generatedAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
      <button class="refresh" onclick="location.reload()" title="Перечитать свежие данные (пересборка идёт автоматически каждые 15 мин и после каждого коммита/work)">↻ Обновить</button>
    </div>
  </div>
  ${summary}
  <h2>Сайты</h2>
  <div class="panel">
    <table>
      <colgroup><col style="width:12%"><col style="width:6%"><col style="width:18%"><col style="width:16%"><col style="width:16%"><col style="width:16%"><col style="width:16%"></colgroup>
      <thead><tr><th>Сайт</th><th>CI</th><th>Статьи · разделы</th><th>Вчера</th><th>Сегодня</th><th>Завтра</th><th>Послезавтра</th></tr></thead>
      <tbody>${siteRows}</tbody>
    </table>
  </div>
  ${seoSection}
  <h2>Последние коммиты</h2>
  <div class="panel">
    <table>
      <colgroup><col style="width:11%"><col style="width:16%"><col style="width:73%"></colgroup>
      <thead><tr><th>Время</th><th>Сайт</th><th>Коммит</th></tr></thead>
      <tbody>${commitRows}</tbody>
    </table>
  </div>
  ${pubTodayHtml}
  <div class="foot">
    <div class="legend"><span><span class="ok">✓</span> опубликовано / ок</span><span><span class="todo">○</span> к написанию</span></div>
    <div>${d.sites.length} сайтов · данные ~2 мин + мгновенно после коммита/деплоя · страница 30 сек</div>
  </div>
</div>
</body>
</html>`;

fs.writeFileSync(outFile, html, 'utf8');
console.log('dashboard.html: ' + outFile + ' (' + (html.length / 1024).toFixed(0) + ' КБ)');
