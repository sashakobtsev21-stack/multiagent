// Ставит git-хук post-commit в хаб и в 5 клонов сайтов.
// После каждого коммита хук вызывает grafana/refresh.mjs (тротлинг внутри),
// который пересобирает локальный HTML-дашборд (build-status + build-html).
// Запуск: node grafana/install-refresh-hooks.mjs   (или двойной клик install-refresh-hooks.bat)
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));      // grafana
const hub = path.resolve(here, '..');
const refresh = path.join(hub, 'grafana', 'refresh.mjs').replaceAll('\\', '/');

const hook = `#!/bin/sh
# Auto-refresh local HTML dashboard after each commit. Installed by install-refresh-hooks.mjs.
node "${refresh}" >/dev/null 2>&1
exit 0
`;

const repoRel = ['', 'sites/gruzia-site', 'sites/albania-site', 'sites/montenegro-site', 'sites/croatia-site', 'sites/macedonia-site', 'sites/bosnia-site', 'sites/armenia-site', 'sites/serbia-site'];

let n = 0;
for (const rel of repoRel) {
  const repo = rel ? path.join(hub, rel) : hub;
  const hooksDir = path.join(repo, '.git', 'hooks');
  if (!fs.existsSync(hooksDir)) {
    console.log('skip (no .git/hooks): ' + repo);
    continue;
  }
  const dest = path.join(hooksDir, 'post-commit');
  fs.writeFileSync(dest, hook, { mode: 0o755 });
  try { fs.chmodSync(dest, 0o755); } catch {}
  console.log('installed: ' + dest);
  n++;
}
console.log(`done: ${n} post-commit hooks installed`);
