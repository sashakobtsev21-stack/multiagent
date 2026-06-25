// Публикует grafana/shared/status.json в ЗАКРЫТЫЙ (secret) GitHub gist и готовит
// файл дашборда для импорта в Grafana Cloud (с уже вписанной ссылкой на данные).
// Запускается ТОБОЙ (двойной клик publish-cloud.bat) — твоя машина, твой gh, твоё согласие.
// Повторный запуск обновляет тот же gist (данные на дашборде освежаются).
// Вывод в консоль — ASCII, чтобы не зависеть от кодировки терминала Windows.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));      // grafana/cloud
const sharedJson = path.join(here, '..', 'shared', 'status.json');
const template = path.join(here, '..', 'provisioning', 'dashboards', 'network-ops.json');
const outDash = path.join(here, 'network-ops-cloud.json');
const idFile = path.join(here, 'gist-id.txt');

if (!fs.existsSync(sharedJson)) {
  console.error('ERROR: grafana/shared/status.json not found — run build-status.mjs first (the .bat does this).');
  process.exit(1);
}
const content = fs.readFileSync(sharedJson, 'utf8');

function gh(args, input) {
  return execFileSync('gh', args, { input, encoding: 'utf8' });
}

const login = gh(['api', 'user', '--jq', '.login']).trim();

let id = fs.existsSync(idFile) ? fs.readFileSync(idFile, 'utf8').trim() : '';

if (id) {
  const payload = JSON.stringify({ files: { 'status.json': { content } } });
  gh(['api', '-X', 'PATCH', `gists/${id}`, '--input', '-'], payload);
  console.log(`Updated gist ${id}`);
} else {
  const payload = JSON.stringify({
    description: 'guidebooks network status (Grafana data source)',
    public: false,
    files: { 'status.json': { content } },
  });
  const res = JSON.parse(gh(['api', '-X', 'POST', 'gists', '--input', '-'], payload));
  id = res.id;
  fs.writeFileSync(idFile, id + '\n', 'utf8');
  console.log(`Created secret gist ${id}`);
}

const rawBase = `https://gist.githubusercontent.com/${login}/${id}/raw`;
const rawUrl = `${rawBase}/status.json`;

const dash = JSON.parse(fs.readFileSync(template, 'utf8'));
const v = dash.templating.list.find((x) => x.name === 'baseUrl');
if (v) {
  v.query = rawBase;
  v.current = { text: rawBase, value: rawBase };
}
dash.title = 'Network ops — deploys & calendar (Cloud)';
dash.uid = 'network-ops-cloud';
fs.writeFileSync(outDash, JSON.stringify(dash, null, 2), 'utf8');

console.log('');
console.log('Data link (private): ' + rawUrl);
console.log('Import this file into Grafana: ' + outDash);
console.log('Delete the publication anytime:  gh gist delete ' + id);
