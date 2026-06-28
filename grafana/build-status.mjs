// Генератор status.json для Grafana (Infinity datasource).
// Собирает по 5 сайтам: статус деплоя/CI (git + GitHub Actions) и темы
// календаря на сегодня/завтра (из sites/<repo>/KALENDAR.md).
// Запуск:  node grafana/build-status.mjs
// Результат: grafana/shared/status.json  (его читает Grafana через Infinity).
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HUB = path.resolve(__dirname, '..');
const OWNER = 'sashakobtsev21-stack';

const SITES = [
  { key: 'gruzia', name: 'Грузия', langs: 'ru/uk/en' },
  { key: 'albania', name: 'Албания', langs: 'en' },
  { key: 'montenegro', name: 'Черногория', langs: 'en/ru' },
  { key: 'croatia', name: 'Хорватия', langs: 'en/ru' },
  { key: 'macedonia', name: 'Македония', langs: 'en' },
];

const sh = (cmd, args, cwd) => {
  try {
    return execFileSync(cmd, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
};

const pad = (n) => String(n).padStart(2, '0');
const ddmm = (d) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`;
const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const now = new Date();
const DAY = 86400000;
const yesterday = ddmm(new Date(now.getTime() - DAY));
const today = ddmm(now);
const tomorrow = ddmm(new Date(now.getTime() + DAY));
const dayAfter = ddmm(new Date(now.getTime() + 2 * DAY));
const todayIso = isoDay(now);

// --- деплои / CI из GitHub Actions + git ---
function deployInfo(key) {
  const repo = path.join(HUB, 'sites', `${key}-site`);
  const last = sh('git', ['-C', repo, 'log', '-1', '--format=%h|%cI|%s']);
  const [commit = '', cTime = '', ...rest] = last.split('|');
  const subject = rest.join('|');

  let runs = [];
  const raw = sh('gh', [
    'run', 'list', '-R', `${OWNER}/${key}-site`, '-L', '12',
    '--json', 'workflowName,conclusion,status,createdAt,event',
  ]);
  if (raw) {
    try { runs = JSON.parse(raw); } catch { runs = []; }
  }
  const ciRuns = runs.filter((r) => r.workflowName === 'CI');
  const latestCi = ciRuns[0] || null;
  const recentFailures = ciRuns.slice(0, 6).filter((r) => r.conclusion === 'failure').length;
  const newsRun = runs.find((r) => /news/i.test(r.workflowName)) || null;

  const logRaw = sh('git', ['-C', repo, 'log', '-6', '--format=%h|%cI|%s']);
  const commits = logRaw
    ? logRaw.split('\n').filter(Boolean).map((l) => { const [h, t, ...r] = l.split('|'); return { hash: h, time: t, subject: r.join('|') }; })
    : [];

  return {
    commits,
    commit,
    deployTime: cTime,
    subject,
    ci: latestCi ? latestCi.conclusion || latestCi.status : 'unknown',
    recentFailures,
    newsRebuild: newsRun ? newsRun.conclusion || newsRun.status : 'n/a',
    deployedToday: cTime.startsWith(todayIso),
    runs: ciRuns.slice(0, 8).map((r) => ({ workflow: r.workflowName, time: r.createdAt, result: r.conclusion || r.status })),
  };
}

// --- разбор календаря на конкретную дату (DD.MM) ---
function calendarFor(key, token) {
  const file = path.join(HUB, 'sites', `${key}-site`, 'KALENDAR.md');
  if (!fs.existsSync(file)) return { items: [], text: '—', done: false };
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const items = [];
  for (const line of lines) {
    if (!line.includes(token)) continue;
    const isTask = /\[Статья\]/.test(line) || /\/news/.test(line) || line.includes('📰') || line.includes('📊') || /Замер/.test(line);
    if (!isTask) continue;
    // отсечь сноски/аннотации к другим датам — берём только строки-пункты списка
    if (!/^\s*-\s/.test(line)) continue;
    const done = /\[x\]/i.test(line) || /ОПУБЛИКОВАНО/i.test(line) || line.includes('✅') || /\bSKIP\b/i.test(line);
    let type = 'article';
    if (line.includes('📊') || /Замер/.test(line)) type = 'measure';
    else if (/\/news/.test(line) || line.includes('📰')) type = 'news';
    let title = '';
    const art = line.match(/\[Статья\]\s*([^·—]+)/);
    if (art) title = art[1].trim();
    else {
      const slug = line.match(/`([^`]+)`/);
      title = type === 'news' ? (slug ? slug[1] : 'дайджест новостей') : (slug ? slug[1] : type === 'measure' ? 'Замер GA/GSC' : '');
    }
    const cat = (line.match(/категори[яи]\s+\*{0,2}([a-zA-Zа-яёА-ЯЁ-]+)/) || [])[1] || '';
    title = title.replace(/\s+$/,'').slice(0, 60);
    let slug = '';
    const pathM = line.match(/\/((?:[a-z0-9-]+\/)*[a-z0-9-]+)\//);
    if (pathM) { const p = pathM[1].split('/'); slug = p[p.length - 1]; }
    items.push({ type, title, cat, done, slug });
  }
  const text = items.length
    ? items.map((i) => `${i.type === 'news' ? '📰 ' : i.type === 'measure' ? '📊 ' : ''}${i.title}${i.cat ? ` (${i.cat})` : ''}`).join(' · ')
    : '—';
  const done = items.length > 0 && items.every((i) => i.done);
  return { items, text, done };
}

// --- количество статей по разделам (коллекция articles, без черновиков) ---
function countArticles(repo) {
  const base = path.join(repo, 'src', 'content', 'articles');
  const out = { total: 0, bySection: {} };
  if (!fs.existsSync(base)) return out;
  // берём самый полный языковой каталог (для Грузии это ru/uk, для остальных en)
  let dir = null, max = -1;
  for (const l of ['en', 'ru', 'uk']) {
    const dd = path.join(base, l);
    if (fs.existsSync(dd)) {
      const c = fs.readdirSync(dd).filter((f) => f.endsWith('.md')).length;
      if (c > max) { max = c; dir = dd; }
    }
  }
  if (!dir) return out;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.md')) continue;
    const txt = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const fm = m ? m[1] : '';
    if (/^draft:\s*true/m.test(fm)) continue; // черновики не считаем
    const cat = (fm.match(/^category:\s*['"]?([A-Za-z0-9_-]+)['"]?/m) || [])[1] || 'прочее';
    out.bySection[cat] = (out.bySection[cat] || 0) + 1;
    out.total++;
  }
  return out;
}

// --- опубликованное СЕГОДНЯ (ссылки для дашборда) ---
const DOMAIN = { gruzia: 'georgiaguidebook.com', albania: 'albaniaguidebook.com', montenegro: 'montenegroguidebook.com', croatia: 'croatiaguidebook.com', macedonia: 'macedoniaguidebook.com' };
function scanArticles(repo, key) {
  const out = { published: [], urlBySlug: {} };
  const base = path.join(repo, 'src', 'content', 'articles');
  if (!fs.existsSync(base)) return out;
  const dom = DOMAIN[key];
  const bySlug = {};
  for (const lang of fs.readdirSync(base)) {
    const dd = path.join(base, lang);
    let st; try { st = fs.statSync(dd); } catch { continue; }
    if (!st.isDirectory()) continue;
    for (const f of fs.readdirSync(dd)) {
      if (!f.endsWith('.md')) continue;
      const txt = fs.readFileSync(path.join(dd, f), 'utf8');
      const fm = (txt.match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
      if (/^draft:\s*true/m.test(fm)) continue;
      const slug = (fm.match(/^slug:\s*'?"?([^'"\n\r]+)/m) || [])[1] || f.replace(/\.md$/, '');
      const cat = (fm.match(/^category:\s*'?"?([A-Za-z0-9_-]+)/m) || [])[1] || '';
      const title = (fm.match(/^title:\s*['"]?(.+?)['"]?\s*$/m) || [])[1] || slug;
      const pub = (fm.match(/^publishedAt:\s*'?"?([0-9-]+)/m) || [])[1] || '';
      if (!bySlug[slug]) bySlug[slug] = { slug, cat, isNews: cat === 'news' || cat === 'novosti', langs: {}, title, pub };
      bySlug[slug].langs[lang] = true;
      if (lang === 'en') bySlug[slug].title = title;
      if (pub) bySlug[slug].pub = pub;
    }
  }
  for (const s of Object.values(bySlug)) {
    const lang = s.langs.en ? 'en' : Object.keys(s.langs)[0];
    const prefix = lang === 'en' ? '' : '/' + lang;
    const url = `https://${dom}${prefix}/${s.cat}/${s.slug}/`;
    out.urlBySlug[s.slug] = url;
    if (s.pub === todayIso) out.published.push({ title: s.title, url, isNews: s.isNews });
  }
  return out;
}

const sites = [];
const runsFlat = [];
const commitsFlat = [];
// --- Cloudflare: реальная раскатка (Workers deployments API), если есть токен grafana/.cf-token ---
const CF_ACCT = '5a2cd7ffa43485cd3f8678e96d5ac4af';
const cfToken = (() => { try { return fs.readFileSync(path.join(__dirname, '.cf-token'), 'utf8').trim(); } catch { return ''; } })();
async function fetchCfDeploys() {
  const out = {};
  if (!cfToken || typeof fetch !== 'function') return out;
  await Promise.all(SITES.map(async (s) => {
    try {
      const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCT}/workers/scripts/${s.key}-site/deployments`, { headers: { Authorization: `Bearer ${cfToken}` } });
      const j = await r.json();
      const ds = (j.result && j.result.deployments) || j.result || [];
      const last = Array.isArray(ds) ? ds[0] : null;
      if (last) out[s.key] = { time: last.created_on, id: last.id, source: last.source };
    } catch {}
  }));
  return out;
}
const cfDeploys = await fetchCfDeploys();

for (const s of SITES) {
  const d = deployInfo(s.key);
  const y = calendarFor(s.key, yesterday);
  const t = calendarFor(s.key, today);
  const tm = calendarFor(s.key, tomorrow);
  const da = calendarFor(s.key, dayAfter);
  const arts = countArticles(path.join(HUB, 'sites', `${s.key}-site`));
  const scan = scanArticles(path.join(HUB, 'sites', `${s.key}-site`), s.key);
  sites.push({
    key: s.key,
    name: s.name,
    langs: s.langs,
    deployTime: d.deployTime,
    commit: d.commit,
    subject: d.subject,
    ci: d.ci,
    ciGreen: d.ci === 'success',
    recentFailures: d.recentFailures,
    newsRebuild: d.newsRebuild,
    deployedToday: d.deployedToday,
    cfDeploy: cfDeploys[s.key] || null,
    publishedToday: scan.published,
    urlBySlug: scan.urlBySlug,
    yesterdayItems: y.items, todayItems: t.items, tomorrowItems: tm.items, dayAfterItems: da.items,
    articlesTotal: arts.total,
    articlesBySection: arts.bySection,
    yesterdayText: y.text, yesterdayDone: y.done, yesterdayCount: y.items.length,
    todayText: t.text, todayDone: t.done, todayCount: t.items.length,
    tomorrowText: tm.text, tomorrowDone: tm.done, tomorrowCount: tm.items.length,
    dayAfterText: da.text, dayAfterDone: da.done, dayAfterCount: da.items.length,
  });
  for (const r of d.runs) runsFlat.push({ site: s.key, name: s.name, ...r });
  for (const c of d.commits) commitsFlat.push({ site: s.key, name: s.name, ...c });
}

const summary = {
  total: SITES.length,
  deployedToday: sites.filter((s) => s.deployedToday).length,
  ciGreen: sites.filter((s) => s.ciGreen).length,
  publishedToday: sites.filter((s) => s.todayCount > 0 && s.todayDone).length,
  pendingTomorrow: sites.filter((s) => s.tomorrowCount > 0 && !s.tomorrowDone).length,
};

const out = { generatedAt: now.toISOString(), yesterday, today, tomorrow, dayAfter, summary, sites, runs: runsFlat, commits: commitsFlat };

const outDir = path.join(__dirname, 'shared');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'status.json'), JSON.stringify(out, null, 2), 'utf8');
console.log(`status.json: ${sites.length} sites, ${runsFlat.length} runs → ${path.join(outDir, 'status.json')}`);
console.log(`summary: deployed ${summary.deployedToday}/${summary.total} · CI green ${summary.ciGreen}/${summary.total} · published today ${summary.publishedToday}/${summary.total} · pending tomorrow ${summary.pendingTomorrow}`);
