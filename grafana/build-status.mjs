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

// web-база GitHub из remote-URL (для кликабельных ссылок на коммиты)
const repoWeb = (remote) => { const m = (remote || '').match(/github\.com[:/]([^/]+)\/([^/.]+)/); return m ? `https://github.com/${m[1]}/${m[2]}` : ''; };

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

  const web = repoWeb(sh('git', ['-C', repo, 'remote', 'get-url', 'origin']));
  const logRaw = sh('git', ['-C', repo, 'log', '-6', '--format=%h|%cI|%s']);
  const commits = logRaw
    ? logRaw.split('\n').filter(Boolean).map((l) => { const [h, t, ...r] = l.split('|'); return { hash: h, time: t, subject: r.join('|'), url: web ? `${web}/commit/${h}` : '' }; })
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
// Правила (чтобы дашборд не превращался в кашу):
//  • пункт принадлежит своей ПЕРВОЙ дате в строке (а не любому совпадению — иначе
//    «выполнен 28.06» в строке слота 29.06 двоит пункт на два дня);
//  • маркер [Статья]/[Article]/[Маршрут] определяет тип = article, даже если в строке
//    дальше затесались «Замер»/«перелинк» (Грузия пишет замер и статью одной строкой);
//  • для статьи «готово» = только публикационные маркеры ([x]/ОПУБЛИКОВАНО/✅ к статье).
//    «✅ Замер» относится к ЗАМЕРУ, а не к статье на той же строке;
//  • дубли в пределах дня схлопываем.
function calendarFor(key, token) {
  const file = path.join(HUB, 'sites', `${key}-site`, 'KALENDAR.md');
  if (!fs.existsSync(file)) return { items: [] };
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const items = [];
  const seen = new Set();
  for (const line of lines) {
    if (!/^\s*-\s/.test(line)) continue; // только пункты списка
    // слотовая дата строки. ПРИОРИТЕТ — дата `ОПУБЛИКОВАНО YYYY-MM-DD` (реальная дата
    // публикации): опубликованная строка часто не имеет префикса `Вт 30.06 —` и при этом
    // упоминает ДРУГИЕ DD.MM в аннотациях (напр. «слот 01.07 FOLDED сюда») — без приоритета
    // ISO пункт уезжал бы на чужой день и пропадал с дашборда. Иначе — первая DD.MM в строке;
    // если и её нет — любая ISO-дата YYYY-MM-DD → DD.MM.
    let firstDate;
    const pubIso = line.match(/ОПУБЛИКОВАНО\s+\d{4}-(\d{2})-(\d{2})/i);
    if (pubIso) firstDate = `${pubIso[2]}.${pubIso[1]}`;
    else {
      firstDate = (line.match(/\b\d{2}\.\d{2}\b/) || [])[0];
      if (!firstDate) { const iso = line.match(/\b\d{4}-(\d{2})-(\d{2})\b/); if (iso) firstDate = `${iso[2]}.${iso[1]}`; }
    }
    if (firstDate !== token) continue; // пункт = его слотовая дата
    const hasArticle = /\[(?:Статья|Article|Маршрут)\]/.test(line);
    const isNews = /\/news/.test(line) || line.includes('📰');
    const isMeasure = line.includes('📊') || /Замер/.test(line);
    if (!hasArticle && !isNews && !isMeasure) continue; // не задача
    const type = hasArticle ? 'article' : isNews ? 'news' : 'measure';
    const measureMark = /[✅✔]\s*Замер/.test(line); // ✅ относится к замеру, не к статье
    let done;
    if (type === 'article') {
      done = /\[x\]/i.test(line) || /ОПУБЛИКОВАНО/i.test(line) || (/[✅✔]/.test(line) && !measureMark);
    } else {
      done = /\[x\]/i.test(line) || /ОПУБЛИКОВАНО/i.test(line) || /[✅✔]/.test(line) || /\bSKIP\b/i.test(line);
    }
    let title = '';
    const art = line.match(/\[(?:Статья|Article|Маршрут)\]\s*([^·—]+)/);
    if (art) title = art[1].trim();
    else {
      const slugM = line.match(/`([^`]+)`/);
      title = type === 'news' ? (slugM ? slugM[1] : 'дайджест новостей') : (slugM ? slugM[1] : type === 'measure' ? 'Замер GA/GSC' : '');
    }
    const cat = (line.match(/категори[яи]\s+\*{0,2}([a-zA-Zа-яёА-ЯЁ-]+)/) || [])[1] || '';
    title = title.replace(/\s+$/, '').slice(0, 60);
    let slug = '';
    const pathM = line.match(/\/((?:[a-z0-9-]+\/)*[a-z0-9-]+)\//);
    if (pathM) { const p = pathM[1].split('/'); slug = p[p.length - 1]; }
    const sig = `${type}|${title}|${slug}`;
    if (seen.has(sig)) continue; // дедуп в пределах дня
    seen.add(sig);
    items.push({ type, title, cat, done, slug });
  }
  return { items };
}

// Что показываем в ячейке дня:
//  • замеры (📊) на дашборде не показываем — это не контент;
//  • для будущих дней (завтра/послезавтра) показываем только «к написанию» (○),
//    готовые статьи там быть не должны (план = что предстоит написать).
const cellItems = (its, { future = false } = {}) =>
  its.filter((i) => i.type !== 'measure').filter((i) => (future ? !i.done : true));

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
  const out = { published: [], urlBySlug: {}, pubs: [] };
  const dom = DOMAIN[key];
  const bySlug = {};
  // статьи И маршруты (у маршрутов свой /routes/-URL; без них ссылки в ячейках пропадают)
  for (const coll of ['articles', 'routes']) {
    const base = path.join(repo, 'src', 'content', coll);
    if (!fs.existsSync(base)) continue;
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
        const cat = (fm.match(/^category:\s*'?"?([A-Za-z0-9_-]+)/m) || [])[1] || (coll === 'routes' ? 'routes' : '');
        const title = (fm.match(/^title:\s*['"]?(.+?)['"]?\s*$/m) || [])[1] || slug;
        const pub = (fm.match(/^publishedAt:\s*'?"?([0-9-]+)/m) || [])[1] || '';
        if (!bySlug[slug]) bySlug[slug] = { slug, cat, isNews: cat === 'news' || cat === 'novosti', langs: {}, title, pub };
        bySlug[slug].langs[lang] = true;
        if (lang === 'en') bySlug[slug].title = title;
        if (pub) bySlug[slug].pub = pub;
      }
    }
  }
  for (const s of Object.values(bySlug)) {
    const lang = s.langs.en ? 'en' : Object.keys(s.langs)[0];
    const prefix = lang === 'en' ? '' : '/' + lang;
    const url = `https://${dom}${prefix}/${s.cat}/${s.slug}/`;
    out.urlBySlug[s.slug] = url;
    if (s.pub) out.pubs.push(s.pub); // дата публикации (для тренда роста сети)
    if (s.pub === todayIso) out.published.push({ title: s.title, url, isNews: s.isNews });
  }
  return out;
}

const sites = [];
const runsFlat = [];
const commitsFlat = [];
const allPubs = []; // даты публикаций по всей сети (из publishedAt) — для тренда роста

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
    publishedToday: scan.published,
    urlBySlug: scan.urlBySlug,
    yesterdayItems: cellItems(y.items),
    todayItems: cellItems(t.items),
    tomorrowItems: cellItems(tm.items, { future: true }),
    dayAfterItems: cellItems(da.items, { future: true }),
    articlesTotal: arts.total,
    articlesBySection: arts.bySection,
  });
  for (const r of d.runs) runsFlat.push({ site: s.key, name: s.name, ...r });
  for (const c of d.commits) commitsFlat.push({ site: s.key, name: s.name, ...c });
  for (const p of scan.pubs) allPubs.push(p);
}

// --- история роста сети по дням (из publishedAt всех статей) ---
// published[d] = сколько вышло в этот день; cumulative[d] = всего статей на конец дня.
function buildHistory(pubs, days = 30) {
  const perDay = {};
  for (const p of pubs) perDay[p] = (perDay[p] || 0) + 1;
  const series = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = isoDay(new Date(now.getTime() - i * DAY));
    const published = perDay[date] || 0;
    const cumulative = pubs.filter((p) => p <= date).length;
    series.push({ date, published, cumulative });
  }
  return series;
}
const history = buildHistory(allPubs, 30);
const sumRange = (n, off = 0) => history.slice(history.length - n - off, history.length - off).reduce((a, x) => a + x.published, 0);
const contentDelta = {
  totalDated: allPubs.length,
  today: sumRange(1),
  last7: sumRange(7),
  prev7: sumRange(7, 7),
  last30: sumRange(30),
};

const summary = {
  total: SITES.length,
  deployedToday: sites.filter((s) => s.deployedToday).length,
  ciGreen: sites.filter((s) => s.ciGreen).length,
  publishedToday: sites.reduce((a, s) => a + (s.publishedToday || []).length, 0),
  pendingTomorrow: sites.reduce((a, s) => a + (s.tomorrowItems || []).filter((i) => !i.done && i.type === 'article').length, 0),
};

// --- SEO/трафик из gsc-ga.json (его готовит build-gsc-ga.mjs), если файл есть ---
let seoNetwork = null;
try {
  const sg = JSON.parse(fs.readFileSync(path.join(__dirname, 'shared', 'gsc-ga.json'), 'utf8'));
  seoNetwork = { ...sg.network, generatedAt: sg.generatedAt };
  for (const s of sites) if (sg.sites && sg.sites[s.key]) s.seo = sg.sites[s.key];
} catch {}

const out = { generatedAt: now.toISOString(), yesterday, today, tomorrow, dayAfter, summary, contentDelta, history, seoNetwork, sites, runs: runsFlat, commits: commitsFlat };

const outDir = path.join(__dirname, 'shared');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'status.json'), JSON.stringify(out, null, 2), 'utf8');
console.log(`status.json: ${sites.length} sites, ${runsFlat.length} runs → ${path.join(outDir, 'status.json')}`);
console.log(`summary: deployed ${summary.deployedToday}/${summary.total} · CI green ${summary.ciGreen}/${summary.total} · published today ${summary.publishedToday}/${summary.total} · pending tomorrow ${summary.pendingTomorrow}`);
