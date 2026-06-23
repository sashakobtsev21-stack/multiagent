#!/usr/bin/env bash
# Склонировать или обновить все 5 репозиториев в sites/
# Запуск из корня хаба:  bash scripts/clone-sites.sh
set -euo pipefail

OWNER="sashakobtsev21-stack"
REPOS=(gruzia-site albania-site montenegro-site croatia-site macedonia-site)
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/sites"

for r in "${REPOS[@]}"; do
  dir="$ROOT/sites/$r"
  if [ -d "$dir/.git" ]; then
    echo "== pull $r =="
    git -C "$dir" pull --ff-only
  else
    echo "== clone $r =="
    gh repo clone "$OWNER/$r" "$dir"
  fi
done
echo "Готово. Клоны в $ROOT/sites/"
