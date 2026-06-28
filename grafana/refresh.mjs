// Пересобирает локальный HTML-дашборд после коммита (с тротлингом).
// Вызывается git-хуком post-commit во всех 6 репо. Без Grafana/Cloud/gist —
// только локальные build-status.mjs + build-html.mjs → grafana/dashboard.html.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const stamp = path.join(here, 'shared', '.last-refresh');
const THROTTLE_MS = 45_000; // не чаще раза в 45 сек (серия коммитов = одна пересборка)

try {
  const last = fs.existsSync(stamp) ? Number(fs.readFileSync(stamp, 'utf8')) || 0 : 0;
  if (Date.now() - last < THROTTLE_MS) process.exit(0);
} catch {}

try {
  execFileSync('node', [path.join(here, 'build-status.mjs')], { stdio: 'ignore' });
  execFileSync('node', [path.join(here, 'build-html.mjs')], { stdio: 'ignore' });
  fs.mkdirSync(path.dirname(stamp), { recursive: true });
  fs.writeFileSync(stamp, String(Date.now()));
} catch {}
