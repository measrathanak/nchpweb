#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT_DIR/.env"

WEB_URL="http://localhost:${WEB_PORT:-3000}"

echo "[NPCHWEB Starter] Warming web endpoints..."
curl -fsS "$WEB_URL/" >/dev/null || true
curl -fsS "$WEB_URL/en" >/dev/null || true
curl -fsS "$WEB_URL/km" >/dev/null || true
curl -fsS "$WEB_URL/en/articles" >/dev/null || true
curl -fsS "$WEB_URL/api/typo3/articles?page=1&limit=5&language=en" >/dev/null || true

echo "[NPCHWEB Starter] Web warmup complete."
