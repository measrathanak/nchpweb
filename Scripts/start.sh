#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[NPCHWEB Starter] Starting Docker services..."
docker compose --env-file .env up -d --build

echo "[NPCHWEB Starter] Running warmup scripts..."
"$ROOT_DIR/Scripts/warmup-web.sh"
"$ROOT_DIR/Scripts/warmup-typo3.sh"

echo "[NPCHWEB Starter] Stack is ready."
