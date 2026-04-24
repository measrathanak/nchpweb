#!/bin/bash

# NPCH Website Next.js - Startup Script
# Starts the development environment with Docker Compose

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Starting NPCH Website (Next.js + TYPO3 Backend)..."
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
    echo "✓ Loaded .env.local"
else
    echo "⚠️  .env.local not found, using defaults"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

echo ""
echo "Starting Docker Compose services..."
docker compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if frontend is running
if docker ps | grep -q npchweb_starter_next; then
    echo "✓ Frontend (Next.js) started on http://localhost:${FRONTEND_PORT:-3000}"
else
    echo "❌ Frontend failed to start"
    docker compose logs web
    exit 1
fi

# Check if TYPO3 API is accessible
if docker ps | grep -q npchweb_starter_typo3; then
    echo "✓ API (TYPO3) started on http://localhost:8888"
else
    echo "❌ API failed to start"
fi

echo ""
echo "✅ All services running!"
echo ""
echo "Access your site at: http://localhost:${FRONTEND_PORT:-3000}"
echo ""
echo "View logs with: docker compose logs -f"
echo "Stop services with: docker compose down"
