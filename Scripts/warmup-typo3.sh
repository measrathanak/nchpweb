#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT_DIR/.env"

TYPO3_URL="http://localhost:${TYPO3_PORT:-8888}"

echo "[NPCHWEB Starter] Warming TYPO3 endpoints..."
curl -fsS "$TYPO3_URL/" >/dev/null || true
curl -fsS "$TYPO3_URL/typo3rest/articles?page=1&limit=1&language=en" >/dev/null || true

echo "[NPCHWEB Starter] TYPO3 warmup complete."
