#!/usr/bin/env bash

# NPCH Website - Stop Script
# Stops all Docker Compose services

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[NPCHWEB] Stopping Docker services..."

if command -v docker-compose &> /dev/null; then
    docker-compose down
else
    docker compose down
fi

echo "[NPCHWEB] ✅ All services have been stopped."
