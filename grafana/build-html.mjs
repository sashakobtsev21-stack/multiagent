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

const FLAG = { gruzia: '🇬🇪', albania: '🇦🇱', montenegro: '🇲🇪', croatia: '🇭🇷', macedonia: '🇲🇰', bosnia: '🇧🇦', armenia: '🇦🇲', serbia: '🇷🇸' };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (iso) => {
  const t = new Date(iso);
  if (isNaN(t)) return '—';
  return t.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const stat = (n, l, cls) => `<div class="stat"><div class="n ${cls}">${n}</div><div class="l">${l}</div></div>`;

const totalArticles = d.sites.reduce((a, s) => a + (s.articlesTotal || 0), 0);
const summary = `<div class="summary">
  ${stat(`${(d.seoNetwork && d.seoNetwork.clicks28) || 0}`, 'Клики из поиска (28д)', 'green')}
  ${stat(`${d.summary.ciGreen} / ${d.summary.total}`, 'CI зелёные', d.summary.ciGreen === d.summary.total ? 'green' : 'red')}
  ${stat(`${totalArticles}`, 'Всего статей в сети', '')}
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
  const fail = s.ci === 'failure';
  const inProg = !ok && !fail && /progress|queued|requested|waiting|pending|running|in_progress/i.test(s.ci || '');
  const dotCls = ok ? 'g' : fail ? 'r' : inProg ? 'p' : 'n';
  const ci = ok ? '<span class="badge bg">✓ ок</span>'
    : fail ? '<span class="badge br">✕ упал</span>'
    : inProg ? '<span class="badge bp"><i class="spin"></i>деплой</span>'
    : `<span class="badge bn">${esc(s.ci)}</span>`;
  return `<tr>
    <td class="nm"><span class="dot ${dotCls}"></span>${FLAG[s.key] || ''} ${esc(s.name)}<div class="langs">${esc(s.langs)}</div></td>
    <td>${ci}</td>
    <td>${artsCell(s)}</td>
    <td>${slotCell(s.yesterdayItems, s.urlBySlug)}</td>
    <td>${slotCell(s.todayItems, s.urlBySlug)}</td>
    <td>${slotCell(s.tomorrowItems, s.urlBySlug)}</td>
    <td>${slotCell(s.dayAfterItems, s.urlBySlug)}</td>
  </tr>`;
}).join('');


const commitRows = [...(d.commits || [])].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 16)
  .map((c) => {
    const inner = `<span class="hash">${esc(c.hash)}</span> ${esc(c.subject)}`;
    const cell = c.url ? `<a href="${c.url}" target="_blank" rel="noopener" class="commitlink">${inner}</a>` : inner;
    return `<tr><td class="muted nowrap">${fmt(c.time)}</td><td class="nowrap">${FLAG[c.site] || ''} ${esc(c.name)}</td><td>${cell}</td></tr>`;
  }).join('');

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

// --- мини-графики: inline SVG (тренды) + CSS-бары (сравнение). Без внешних библиотек — работает офлайн ---
const svgLine = (pts, w, h, color) => {
  if (!pts.length) return '<div class="muted" style="padding:14px">нет данных</div>';
  const max = Math.max(1, ...pts), n = pts.length;
  const X = (i) => (n <= 1 ? w / 2 : (i / (n - 1)) * (w - 6) + 3);
  const Y = (v) => h - 3 - (v / max) * (h - 6);
  const line = pts.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const area = `M${X(0).toFixed(1)},${(h - 3).toFixed(1)} ` + pts.map((v, i) => `L${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ') + ` L${X(n - 1).toFixed(1)},${(h - 3).toFixed(1)} Z`;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" preserveAspectRatio="none"><path d="${area}" fill="${color}" opacity=".13"/><path d="${line}" fill="none" stroke="${color}" stroke-width="1.7" vector-effect="non-scaling-stroke"/></svg>`;
};
const svgBars = (items, color) => `<div class="bars">${items.map((i) => {
  const max = Math.max(1, ...items.map((x) => x.value));
  return `<div class="barrow"><span class="barlbl">${i.label}</span><span class="bartrack"><span class="barfill" style="width:${(i.value / max * 100).toFixed(0)}%;background:${color}"></span></span><span class="barval">${i.value}</span></div>`;
}).join('')}</div>`;
const seoSites = d.sites.filter((s) => s.seo);
const daily = (sn && sn.daily) || [];
// показы GSC отстают ~2 дня → последние дни нулевые; обрезаем хвост, чтобы график не показывал ложный «обрыв»
const imprDaily = (() => { const a = daily.slice(); while (a.length > 1 && a[a.length - 1].impr === 0) a.pop(); return a; })();
const dd = (s) => s.slice(8) + '.' + s.slice(5, 7); // YYYY-MM-DD → DD.MM
const dRange = daily.length ? `${dd(daily[0].date)} → ${dd(daily[daily.length - 1].date)}` : '';
const peak = (k) => Math.max(0, ...daily.map((x) => x[k]));
const t1color = (p) => (p >= 40 ? '#4ade80' : p >= 20 ? '#fbbf24' : '#f87171');
// вертикальные столбики по дням (CSS, чёткие; tooltip дата+значение при наведении)
const vbars = (rows, key, color) => {
  const max = Math.max(1, ...rows.map((r) => r[key]));
  const cols = rows.map((r) => `<span class="vcol" data-t="${dd(r.date)}" data-v="${r[key]}"><i class="vbar" style="height:${Math.max(2, r[key] / max * 100).toFixed(0)}%;background:${color}"></i></span>`).join('');
  return `<div class="vbars">${cols}</div><div class="vbars-x"><span>${rows.length ? dd(rows[0].date) : ''}</span><span>${rows.length ? dd(rows[rows.length - 1].date) : ''}</span></div>`;
};
const tier1Bars = seoSites.map((s) => {
  const p = s.seo.ga4.tier1Pct || 0;
  return `<div class="barrow"><span class="barlbl">${FLAG[s.key] || ''} ${esc(s.name)}</span><span class="bartrack"><span class="barfill" style="width:${p}%;background:${t1color(p)}"></span></span><span class="barval">${p}%</span></div>`;
}).join('');

const chartsSection = sn ? `
  <h2>Графики</h2>
  <div class="charts">
    <div class="panel chart"><div class="chart-h">📊 Показы в поиске по дням — всего <b>${sn.impressions28}</b> за 28д · пик/день ${peak('impr')} <span class="muted" style="font-weight:400">· GSC отстаёт ~2 дня</span></div>${vbars(imprDaily, 'impr', '#4ade80')}</div>
    <div class="panel chart"><div class="chart-h">📊 Сессии по дням (GA4) — <b>${sn.sessions7}</b> за 7д · пик/день ${peak('sessions')}</div>${vbars(daily, 'sessions', '#7fb4f5')}</div>
    <div class="panel chart"><div class="chart-h">📊 Клики из поиска по сайтам (28д)</div>${svgBars(seoSites.map((s) => ({ label: (FLAG[s.key] || '') + ' ' + esc(s.name), value: s.seo.gsc.clicks28 || 0 })), '#4ade80')}</div>
    <div class="panel chart"><div class="chart-h">📊 Сессии по сайтам (28д)</div>${svgBars(seoSites.map((s) => ({ label: (FLAG[s.key] || '') + ' ' + esc(s.name), value: s.seo.ga4.sessions28 || 0 })), '#7fb4f5')}</div>
    <div class="panel chart" style="grid-column:1/-1"><div class="chart-h">🌍 Доля Tier-1 трафика (дорогой западный) по сайтам — <span style="color:#4ade80">зелёный ≥40%</span> · <span style="color:#fbbf24">жёлтый 20–40%</span> · <span style="color:#f87171">красный &lt;20%</span></div><div class="bars">${tier1Bars}</div></div>
  </div>` : '';

// --- индексация: страниц в выдаче (proxy) + всего в sitemap ---
const indexSection = sn ? `
  <h2>Индексация в Google</h2>
  <div class="panel">
    <table>
      <colgroup><col style="width:34%"><col style="width:33%"><col style="width:33%"></colgroup>
      <thead><tr><th>Сайт</th><th>Страниц в выдаче (≥1 показ, 28д)</th><th>Всего страниц (в sitemap)</th></tr></thead>
      <tbody>${seoSites.map((s) => { const g = s.seo.gsc || {}, sm = g.sitemap || {}; return `<tr><td class="nm">${FLAG[s.key] || ''} ${esc(s.name)}</td><td><b>${g.pagesWithImpr ?? 0}</b></td><td class="muted">${sm.submitted ?? 0}</td></tr>`; }).join('')}</tbody>
    </table>
  </div>
  <div class="chart-f" style="margin:7px 2px 0">«В выдаче» = страницы, реально показанные в Google за 28 дн (proxy «работает в индексе»). Точного числа «в индексе» Google через API не отдаёт (поле sitemap.indexed устарело → 0; точная цифра — в интерфейсе GSC, отчёт «Страницы»).</div>` : '';

// --- гайд «для чайников» (разворачиваемый блок внизу) ---
const guide = `
<details class="guide">
  <summary>📖 Гайд: что значит каждый показатель (для чайников)</summary>
  <div class="guide-body">
    <div>
      <h4>Плитки сверху</h4>
      <p><b>Клики из поиска (28д)</b> — сколько раз за 28 дней люди кликнули на сайты в результатах Google и зашли.</p>
      <p><b>CI зелёные</b> — у скольких из 5 сайтов последняя автосборка прошла без ошибок. Зелёная — всё ок; краснеет — что-то сломалось.</p>
      <p><b>Всего статей в сети</b> — суммарно опубликованных статей по всем 5 сайтам (= сумма колонки «Статьи · разделы»). Считается коллекция статей (включая города-статьи и новости); маршруты/итинерари — отдельно, в это число не входят.</p>
      <p><b>На завтра написать</b> — сколько статей запланировано на завтра по календарю.</p>
      <h4>Таблица «Сайты»</h4>
      <p><b>CI</b> — статус последней автосборки/деплоя сайта: <b style="color:#4ade80">✓ ок</b> — собралось и выложилось · <b style="color:#fbbf24">⏳ деплой</b> — идёт сборка прямо сейчас (точка мигает, статьи появятся ссылками через 1–2 мин) · <b style="color:#f87171">✕ упал</b> — сборка со сбоем.</p>
      <p><b>Статьи · разделы</b> — всего статей на сайте, с разбивкой по разделам.</p>
      <p><b>Вчера / Сегодня / Завтра / Послезавтра</b> — план по дням: <b>✓</b> = опубликовано (кликабельно), <b>○</b> = ещё к написанию. Будни — по 3 темы/день на EN-сайтах (Грузия — 1/день).</p>
      <h4>Последние коммиты</h4>
      <p>Список последних изменений на сайтах (что и когда). <b>Кликни по строке</b> — откроется сам коммит на GitHub.</p>
    </div>
    <div>
      <h4>Трафик и индексация (данные Google)</h4>
      <p><b>Клики</b> — переходы из поиска Google (28 дн).</p>
      <p><b>Показы</b> — сколько раз сайт показался в результатах поиска (увидели ссылку, без клика).</p>
      <p><b>Ср. позиция</b> — средняя позиция в выдаче. 1 = самый верх; чем меньше число, тем выше.</p>
      <p><b>Сессии (28д)</b> — визитов на сайт (из Google Analytics). Один визит = одна сессия.</p>
      <p><b>Tier-1</b> — доля дорогого западного трафика (США / UK / ЕС / Австралия…). Больше = дороже реклама.</p>
      <p><b>Топ-запрос</b> — по какому запросу сайт чаще всего показывается в Google.</p>
      <h4>Индексация в Google</h4>
      <p><b>Страниц в выдаче</b> — сколько страниц реально показывались в Google (≥1 показ за 28 дн).</p>
      <p><b>Всего страниц (в sitemap)</b> — сколько страниц сайт декларирует Google.</p>
      <h4>Графики</h4>
      <p><b>Показы по дням</b> — столбик = показы за день. GSC отстаёт ~2 дня → последние дни пустые (это задержка данных, не падение).</p>
      <p><b>Сессии по дням</b> — визиты за день (свежие, без задержки).</p>
      <p><b>Клики / Сессии по сайтам</b> — сравнение сайтов между собой.</p>
      <p><b>Доля Tier-1</b> — у каждого сайта: 🟢 ≥40% хорошо · 🟡 20–40% · 🔴 &lt;20%.</p>
      <h4>Воронка (как связаны цифры)</h4>
      <p>Увидели в поиске (<b>показ</b>) → кликнули (<b>клик</b>) → зашли на сайт (<b>сессия</b>).</p>
    </div>
  </div>
</details>`;

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
.dot.g{background:var(--green)}.dot.r{background:var(--red)}.dot.n{background:var(--muted)}
.dot.p{background:var(--amber);animation:pulse 1.1s ease-in-out infinite}
@keyframes pulse{0%,100%{opacity:1;box-shadow:0 0 0 0 rgba(251,191,36,.45)}50%{opacity:.6;box-shadow:0 0 0 5px rgba(251,191,36,0)}}
.badge{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;padding:3px 11px;border-radius:999px;white-space:nowrap;vertical-align:middle}
.bg{background:#16261b;color:var(--green)}.br{background:#2a1618;color:var(--red)}.bn{background:#1c2330;color:var(--soft)}
.bp{color:var(--amber);background:linear-gradient(100deg,#251f0d 0%,#46380f 50%,#251f0d 100%);background-size:220% 100%;animation:shimmer 1.5s linear infinite}
@keyframes shimmer{0%{background-position:140% 0}100%{background-position:-140% 0}}
.spin{width:9px;height:9px;border:2px solid rgba(251,191,36,.3);border-top-color:var(--amber);border-radius:50%;animation:spin .7s linear infinite;flex:none}
@keyframes spin{to{transform:rotate(360deg)}}
.ok{color:var(--green);margin-right:3px}.todo{color:var(--amber);margin-right:3px}
.slotlist{display:flex;flex-direction:column;gap:6px}
.slotrow{padding:5px 8px;background:rgba(255,255,255,.022);border:1px solid var(--line2);border-radius:7px;line-height:1.4}
.muted{color:var(--muted)}
.artn{font-size:20px;font-weight:700}
.artbreak{font-size:11.5px;color:var(--muted);margin-top:3px;line-height:1.5}
.charts{display:grid;grid-template-columns:repeat(2,1fr);gap:13px;margin-bottom:10px}
@media(max-width:720px){.charts{grid-template-columns:1fr}}
.chart{padding:13px 15px}
.chart-h{font-size:12.5px;color:var(--muted);margin-bottom:9px}
.chart-h b{color:var(--ink);font-size:14px}
.bars{display:flex;flex-direction:column;gap:7px}
.barrow{display:flex;align-items:center;gap:9px;font-size:12.5px}
.barlbl{width:128px;flex:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bartrack{flex:1;height:9px;background:var(--line2);border-radius:6px;overflow:hidden}
.barfill{display:block;height:100%;border-radius:6px}
.barval{width:44px;flex:none;text-align:right;color:var(--soft);font-variant-numeric:tabular-nums}
.chart-f{font-size:11px;color:var(--muted);margin-top:7px}
.vbars{display:flex;align-items:stretch;gap:2px;height:62px}
.vcol{flex:1;display:flex;align-items:flex-end;cursor:default}
.vcol:hover .vbar{opacity:.6}
.vbar{width:100%;min-height:2px;border-radius:2px 2px 0 0;display:block}
.vbars-x{display:flex;justify-content:space-between;font-size:10.5px;color:var(--muted);margin-top:5px}
#tt{position:fixed;display:none;background:#0f141c;border:1px solid var(--line);color:var(--ink);font-size:12px;font-weight:600;padding:4px 9px;border-radius:6px;pointer-events:none;z-index:99;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.5)}
.commitlink{color:inherit;text-decoration:none}
.commitlink:hover,.commitlink:hover .hash{color:#7fb4f5}
.commitlink:hover{text-decoration:underline}
.guide{margin-top:26px;background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:0 18px}
.guide summary{cursor:pointer;padding:16px 2px;font-size:14px;font-weight:600;color:var(--ink);list-style:none}
.guide summary::-webkit-details-marker{display:none}
.guide summary::before{content:'▸  ';color:var(--muted)}
.guide[open] summary::before{content:'▾  '}
.guide-body{display:grid;grid-template-columns:1fr 1fr;gap:0 30px;padding:2px 0 18px;font-size:13px;line-height:1.55}
@media(max-width:720px){.guide-body{grid-template-columns:1fr}}
.guide-body h4{font-size:11.5px;text-transform:uppercase;letter-spacing:.3px;color:#7fb4f5;margin:13px 0 3px;font-weight:600}
.guide-body p{margin:3px 0;color:var(--soft)}
.guide-body b{color:var(--ink)}
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
      <colgroup><col style="width:12%"><col style="width:11%"><col style="width:13%"><col style="width:16%"><col style="width:16%"><col style="width:16%"><col style="width:16%"></colgroup>
      <thead><tr><th>Сайт</th><th>CI</th><th>Статьи · разделы</th><th>Вчера</th><th>Сегодня</th><th>Завтра</th><th>Послезавтра</th></tr></thead>
      <tbody>${siteRows}</tbody>
    </table>
  </div>
  ${seoSection}
  ${indexSection}
  ${chartsSection}
  <h2>Последние коммиты</h2>
  <div class="panel">
    <table>
      <colgroup><col style="width:11%"><col style="width:16%"><col style="width:73%"></colgroup>
      <thead><tr><th>Время</th><th>Сайт</th><th>Коммит</th></tr></thead>
      <tbody>${commitRows}</tbody>
    </table>
  </div>
  ${guide}
  <div class="foot">
    <div class="legend"><span><span class="ok">✓</span> опубликовано / ок</span><span><span class="todo">○</span> к написанию</span></div>
    <div>${d.sites.length} сайтов · данные ~2 мин + мгновенно после коммита/деплоя · страница 30 сек</div>
  </div>
</div>
<div id="tt"></div>
<script>
(function(){var tt=document.getElementById('tt');
document.addEventListener('mouseover',function(e){var c=e.target.closest&&e.target.closest('.vcol');if(c){tt.textContent=c.dataset.t+': '+c.dataset.v;tt.style.display='block';}});
document.addEventListener('mousemove',function(e){if(tt.style.display==='block'){var x=e.clientX+12,y=e.clientY+12;if(x>window.innerWidth-90){x=e.clientX-90;}tt.style.left=x+'px';tt.style.top=y+'px';}});
document.addEventListener('mouseout',function(e){if(e.target.closest&&e.target.closest('.vcol')){tt.style.display='none';}});})();
</script>
</body>
</html>`;

fs.writeFileSync(outFile, html, 'utf8');
console.log('dashboard.html: ' + outFile + ' (' + (html.length / 1024).toFixed(0) + ' КБ)');
