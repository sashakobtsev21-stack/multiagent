// Тянет данные Google Search Console + GA4 через сервис-аккаунт (headless, без OAuth-логинов).
// Ключ: grafana/.gsc-ga-key.json (gitignored). Авторизация — самодельный JWT (RS256, без npm-зависимостей).
// Пока реализован тест доступа: список GSC-сайтов, видимых сервис-аккаунту.
// Полный сбор (search-analytics + sitemaps + GA4 runReport → status.json) добавлю после выдачи доступа.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const keyPath = path.join(here, '.gsc-ga-key.json');
if (!fs.existsSync(keyPath)) {
  console.error('Нет ключа grafana/.gsc-ga-key.json — положи JSON сервис-аккаунта туда.');
  process.exit(1);
}
const key = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

const b64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// JWT Bearer → access token (scope-набор задаётся вызовом)
async function getToken(scopes) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({ iss: key.client_email, scope: scopes.join(' '), aud: key.token_uri, exp: now + 3600, iat: now })
  );
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${b64url(signer.sign(key.private_key))}`;
  const r = await fetch(key.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  });
  const j = await r.json();
  if (!j.access_token) throw new Error('Token error: ' + JSON.stringify(j));
  return j.access_token;
}

export { getToken };

// === ПУЛЛЕР: GSC (запросы/индексация/sitemap) + GA4 (трафик/каналы/Tier-1) → shared/gsc-ga.json ===
const cfgPath = path.join(here, '.gsc-ga-config.json');
const cfg = fs.existsSync(cfgPath) ? JSON.parse(fs.readFileSync(cfgPath, 'utf8')) : { sites: {} };

// Троттлинг: GSC/GA4 данные обновляются ~раз в день/час, не чаще. Не дёргаем API каждые 2 мин
// (дашборд пересобирается чаще, но кэширует gsc-ga.json). --force для принудительного пересбора.
const outFile = path.join(here, 'shared', 'gsc-ga.json');
const FORCE = process.argv.includes('--force');
if (!FORCE && fs.existsSync(outFile)) {
  const ageMin = (Date.now() - fs.statSync(outFile).mtimeMs) / 60000;
  if (ageMin < 30) { console.log(`gsc-ga.json свежий (${ageMin.toFixed(0)} мин) — пропуск (node build-gsc-ga.mjs --force для пересбора).`); process.exit(0); }
}

const isoAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
const TIER1 = new Set(['United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 'France', 'Netherlands', 'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Ireland', 'Belgium', 'Austria', 'New Zealand', 'Finland']);

const token = await getToken([
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
]);
const gsc = (siteUrl, body) =>
  fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).then((r) => r.json());
const ga4 = (propId, body) =>
  fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propId}:runReport`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).then((r) => r.json());

const out = { generatedAt: new Date().toISOString(), sites: {}, network: { clicks28: 0, impressions28: 0, sessions7: 0, users28: 0 } };
const start28 = isoAgo(28), end = isoAgo(1);
const daily = {}; // дата → {clicks, impr, sessions} (сумма по сети, для графиков-трендов)
const ga4date = (s) => s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6, 8);

for (const [key, s] of Object.entries(cfg.sites || {})) {
  const site = { ga4: {}, gsc: {} };
  const siteUrl = 'sc-domain:' + s.domain;
  try {
    const tot = await gsc(siteUrl, { startDate: start28, endDate: end });
    const tr = tot.rows && tot.rows[0];
    site.gsc.clicks28 = tr ? tr.clicks : 0;
    site.gsc.impressions28 = tr ? tr.impressions : 0;
    site.gsc.ctr28 = tr ? +(tr.ctr * 100).toFixed(1) : 0;
    site.gsc.position28 = tr ? +tr.position.toFixed(1) : 0;
    const q = await gsc(siteUrl, { startDate: start28, endDate: end, dimensions: ['query'], rowLimit: 6 });
    site.gsc.topQueries = (q.rows || []).map((x) => ({ q: x.keys[0], clicks: x.clicks, impr: x.impressions, pos: +x.position.toFixed(1) }));
    const pg = await gsc(siteUrl, { startDate: start28, endDate: end, dimensions: ['page'], rowLimit: 2000 });
    site.gsc.pagesWithImpr = (pg.rows || []).length;
    const sm = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`, { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json());
    let submitted = 0, indexed = 0;
    for (const m of sm.sitemap || []) for (const c of m.contents || []) { submitted += +(c.submitted || 0); indexed += +(c.indexed || 0); }
    site.gsc.sitemap = { count: (sm.sitemap || []).length, submitted, indexed };
    const gd = await gsc(siteUrl, { startDate: start28, endDate: end, dimensions: ['date'], rowLimit: 100 });
    for (const r of gd.rows || []) { const k = r.keys[0]; daily[k] = daily[k] || { clicks: 0, impr: 0, sessions: 0 }; daily[k].clicks += r.clicks; daily[k].impr += r.impressions; }
  } catch (e) { site.gsc.error = String(e).slice(0, 120); }

  try {
    const t28 = await ga4(s.ga4, { dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }] });
    const r28 = t28.rows && t28.rows[0];
    site.ga4.sessions28 = r28 ? +r28.metricValues[0].value : 0;
    site.ga4.users28 = r28 ? +r28.metricValues[1].value : 0;
    const t7 = await ga4(s.ga4, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }], metrics: [{ name: 'sessions' }] });
    site.ga4.sessions7 = t7.rows && t7.rows[0] ? +t7.rows[0].metricValues[0].value : 0;
    const ch = await ga4(s.ga4, { dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }], dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 5 });
    site.ga4.channels = (ch.rows || []).map((x) => ({ name: x.dimensionValues[0].value, sessions: +x.metricValues[0].value }));
    const co = await ga4(s.ga4, { dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }], dimensions: [{ name: 'country' }], metrics: [{ name: 'sessions' }], orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 50 });
    let tier1 = 0, totalS = 0;
    for (const x of co.rows || []) { const v = +x.metricValues[0].value; totalS += v; if (TIER1.has(x.dimensionValues[0].value)) tier1 += v; }
    site.ga4.tier1Pct = totalS ? Math.round((tier1 / totalS) * 100) : 0;
    site.ga4.topCountries = (co.rows || []).slice(0, 5).map((x) => ({ c: x.dimensionValues[0].value, sessions: +x.metricValues[0].value }));
    const ad = await ga4(s.ga4, { dateRanges: [{ startDate: '28daysAgo', endDate: 'today' }], dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }], limit: 40 });
    for (const r of ad.rows || []) { const k = ga4date(r.dimensionValues[0].value); daily[k] = daily[k] || { clicks: 0, impr: 0, sessions: 0 }; daily[k].sessions += +r.metricValues[0].value; }
  } catch (e) { site.ga4.error = String(e).slice(0, 120); }

  out.sites[key] = site;
  out.network.clicks28 += site.gsc.clicks28 || 0;
  out.network.impressions28 += site.gsc.impressions28 || 0;
  out.network.sessions7 += site.ga4.sessions7 || 0;
  out.network.users28 += site.ga4.users28 || 0;
}

out.network.daily = Object.keys(daily).sort().map((d) => ({ date: d, clicks: daily[d].clicks, impr: daily[d].impr, sessions: daily[d].sessions }));
fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(out, null, 2), 'utf8');
console.log('gsc-ga.json: сеть — клики', out.network.clicks28, '· показы', out.network.impressions28, '· сессий(7д)', out.network.sessions7, '· пользоват.(28д)', out.network.users28);
for (const [k, s] of Object.entries(out.sites))
  console.log('  •', k.padEnd(11), 'GSC клики', String(s.gsc.clicks28).padStart(4), 'показы', String(s.gsc.impressions28).padStart(6), 'поз', s.gsc.position28, '· GA4 сессий28', String(s.ga4.sessions28).padStart(4), 'Tier1', (s.ga4.tier1Pct || 0) + '%');
