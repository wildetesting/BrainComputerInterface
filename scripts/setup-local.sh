#!/usr/bin/env bash
# Creates a local folder and clones the Flipper dashboard app.
# Usage: bash scripts/setup-local.sh [destination]
#
# Examples:
#   bash scripts/setup-local.sh
#   bash scripts/setup-local.sh ~/Projects/flipper-dashboard

set -euo pipefail

REPO_URL="https://github.com/wildetesting/BrainComputerInterface.git"
BRANCH="cursor/flipper-dashboard-555c"
DEFAULT_DIR="${HOME}/flipper-dashboard"

DEST="${1:-$DEFAULT_DIR}"

echo "→ Creating folder: ${DEST}"
mkdir -p "$(dirname "${DEST}")"
mkdir -p "${DEST}"

if [ -d "${DEST}/.git" ]; then
  echo "→ Git repo already exists at ${DEST}"
  cd "${DEST}"
  git fetch origin
  git checkout "${BRANCH}" 2>/dev/null || git checkout -b "${BRANCH}" "origin/${BRANCH}"
  git pull origin "${BRANCH}" || true
else
  echo "→ Cloning ${REPO_URL}"
  git clone --branch "${BRANCH}" "${REPO_URL}" "${DEST}"
  cd "${DEST}"
fi

echo "→ Installing dependencies"
npm install

echo ""
echo "Done! App folder: ${DEST}"
echo ""
echo "Start the app:"
echo "  cd ${DEST}"
echo "  npm run dev"
echo ""
echo "Open in browser:"
echo "  http://localhost:3000"
echo "  http://localhost:3000/guides/sd-card"
