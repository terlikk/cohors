#!/usr/bin/env bash
# One-line installer: clones the repo and hands off to the pretty
# terminal launcher (bin/cli.mjs). Usage:
#   curl -fsSL https://raw.githubusercontent.com/terlikk/printflow/main/scripts/install.sh | bash
set -euo pipefail

REPO="https://github.com/terlikk/printflow"
DIR="${AGENT_DIR:-agent-hq}"

VIOLET='\033[38;5;141m'; DIM='\033[2m'; RED='\033[31m'; GREEN='\033[32m'; NC='\033[0m'

printf "\n${VIOLET}"
printf '   ▄▀█ █▀▀ █▀▀ █▄░█ ▀█▀   █░█ █▀█\n'
printf '   █▀█ █▄█ ██▄ █░▀█ ░█░   █▀█ ▀▀█\n'
printf "${NC}${DIM}   twój zespół agentów AI · open source · MIT${NC}\n\n"

command -v git >/dev/null 2>&1 || { printf "   ${RED}✗ Potrzebny git${NC}\n"; exit 1; }
command -v node >/dev/null 2>&1 || { printf "   ${RED}✗ Potrzebny Node 20+ (https://nodejs.org)${NC}\n"; exit 1; }

if [ -d "$DIR" ]; then
  printf "   ${GREEN}✓${NC} Katalog ${DIR} już istnieje — aktualizuję\n"
  git -C "$DIR" pull --ff-only --quiet || true
else
  printf "   ${GREEN}✓${NC} Pobieram kod do ./%s\n" "$DIR"
  git clone --depth 1 --quiet "$REPO" "$DIR"
fi

cd "$DIR"
exec node bin/cli.mjs
