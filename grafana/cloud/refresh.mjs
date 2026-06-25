// Пересобирает status.json и обновляет закрытый gist (источник данных Grafana Cloud).
// Вызывается git-хуком post-commit после каждого коммита. Тротлинг: не чаще раза в 45с,
// чтобы серия коммитов (например, во время /work) не дёргала gist десятки раз.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));      // grafana/cloud
const grafanaDir = path.join(here, '..');
const sharedDir = path.join(grafanaDir, 'shared');
const lock = path.join(sharedDir, '.last-refresh');
const MIN_MS = 45000;

try {
  if (fs.existsSync(lock) && Date.now() - fs.statSync(lock).mtimeMs < MIN_MS) {
    process.exit(0); // недавно уже обновляли — пропускаем
  }
} catch {}

fs.mkdirSync(sharedDir, { recursive: true });
fs.writeFileSync(lock, new Date().toISOString());

try {
  execFileSync('node', [path.join(grafanaDir, 'build-status.mjs')], { stdio: 'ignore' });
  execFileSync('node', [path.join(grafanaDir, 'build-html.mjs')], { stdio: 'ignore' });
  execFileSync('node', [path.join(here, 'make-cloud.mjs')], { stdio: 'ignore' });
} catch {
  // тихо: post-commit не должен мешать коммиту; если gh недоступен/нет gist-id — просто пропустим
  process.exit(0);
}
