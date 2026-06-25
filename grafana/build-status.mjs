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
const today = ddmm(now);
const tomorrowDate = new Date(now.getTime() + 86400000);
const tomorrow = ddmm(tomorrowDate);
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

  return {
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
    items.push({ type, title, cat, done });
  }
  const text = items.length
    ? items.map((i) => `${i.type === 'news' ? '📰 ' : i.type === 'measure' ? '📊 ' : ''}${i.title}${i.cat ? ` (${i.cat})` : ''}`).join(' · ')
    : '—';
  const done = items.length > 0 && items.every((i) => i.done);
  return { items, text, done };
}

const sites = [];
const runsFlat = [];
for (const s of SITES) {
  const d = deployInfo(s.key);
  const t = calendarFor(s.key, today);
  const tm = calendarFor(s.key, tomorrow);
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
    todayText: t.text,
    todayDone: t.done,
    todayCount: t.items.length,
    tomorrowText: tm.text,
    tomorrowDone: tm.done,
    tomorrowCount: tm.items.length,
  });
  for (const r of d.runs) runsFlat.push({ site: s.key, name: s.name, ...r });
}

const summary = {
  total: SITES.length,
  deployedToday: sites.filter((s) => s.deployedToday).length,
  ciGreen: sites.filter((s) => s.ciGreen).length,
  publishedToday: sites.filter((s) => s.todayCount > 0 && s.todayDone).length,
  pendingTomorrow: sites.filter((s) => s.tomorrowCount > 0 && !s.tomorrowDone).length,
};

const out = { generatedAt: now.toISOString(), today, tomorrow, summary, sites, runs: runsFlat };

const outDir = path.join(__dirname, 'shared');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'status.json'), JSON.stringify(out, null, 2), 'utf8');
console.log(`status.json: ${sites.length} sites, ${runsFlat.length} runs → ${path.join(outDir, 'status.json')}`);
console.log(`summary: deployed ${summary.deployedToday}/${summary.total} · CI green ${summary.ciGreen}/${summary.total} · published today ${summary.publishedToday}/${summary.total} · pending tomorrow ${summary.pendingTomorrow}`);
