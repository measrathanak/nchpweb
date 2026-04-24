#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$ROOT_DIR/.env"

WEB_URL="${REVALIDATE_BASE_URL:-http://localhost:${WEB_PORT:-3000}}"
ENDPOINT="$WEB_URL/api/revalidate"
SCOPE="${1:-all}"
UID="${2:-}"
LOCALES="${3:-}"

if [[ -z "${REVALIDATE_SECRET:-}" ]]; then
  echo "[NPCHWEB Starter] REVALIDATE_SECRET is not configured; skipping cache revalidation."
  exit 0
fi

TIMESTAMP="$(date +%s%3N)"

if [[ -n "$UID" ]]; then
  BODY="{\"scope\":\"$SCOPE\",\"uid\":$UID"
else
  BODY="{\"scope\":\"$SCOPE\""
fi

if [[ -n "$LOCALES" ]]; then
  IFS=',' read -r -a locale_array <<< "$LOCALES"
  BODY+=",\"locales\":["
  for index in "${!locale_array[@]}"; do
    locale="${locale_array[$index]}"
    [[ "$index" -gt 0 ]] && BODY+="," 
    BODY+="\"$locale\""
  done
  BODY+="]"
fi

BODY+="}"

SIGNATURE="$(printf '%s.%s' "$TIMESTAMP" "$BODY" | openssl dgst -sha256 -hmac "$REVALIDATE_SECRET" -binary | xxd -p -c 256)"

echo "[NPCHWEB Starter] Revalidating $ENDPOINT with scope=$SCOPE${UID:+ uid=$UID}${LOCALES:+ locales=$LOCALES}..."
curl -fsS -X POST "$ENDPOINT" \
  -H "content-type: application/json" \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "x-revalidate-timestamp: $TIMESTAMP" \
  -H "x-revalidate-signature: $SIGNATURE" \
  -d "$BODY"

echo
echo "[NPCHWEB Starter] Revalidation complete."
