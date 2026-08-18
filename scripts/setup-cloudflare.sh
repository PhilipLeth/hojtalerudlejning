#!/bin/bash
# Idempotent Cloudflare-opsætning + deploy for furniture-viz.
#
# Køres af GitHub Actions på hvert push til main — og kan køres lokalt:
#   npm run build
#   CLOUDFLARE_API_TOKEN=... PLATFORM_SECRET=... bash scripts/setup-cloudflare.sh
#
# Gør følgende og springer over, hvad der allerede findes:
#   1. Pages-projektet "furniture-viz"
#   2. KV-namespace "furniture-viz-data" → id skrives ind i wrangler.toml
#   3. R2-bucket "furniture-viz-media"
#   4. Synker app-hemmeligheder som er sat i miljøet
#   5. Deployer out/ til produktion
#
# Token laves på dash.cloudflare.com → My Profile → API Tokens og skal kunne:
#   Account → Cloudflare Pages: Edit
#   Account → Workers KV Storage: Edit
#   Account → Workers R2 Storage: Edit
set -euo pipefail
cd "$(dirname "$0")/.."

PROJEKT="furniture-viz"
KV_TITEL="furniture-viz-data"
BUCKET="furniture-viz-media"
export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-3e5a00606c7d80a43b229f6d15994043}"
API="https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID"
W="npx --yes wrangler@4"

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "FEJL: Sæt CLOUDFLARE_API_TOKEN (se kommentaren øverst i dette script)." >&2
  exit 1
fi
if [ ! -d out ]; then
  echo "FEJL: out/ mangler — kør 'npm run build' først." >&2
  exit 1
fi

cf() { # cf METODE /sti [json-body]
  curl -sS -X "$1" "$API$2" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    ${3:+--data "$3"}
}
py() { python3 -c "import sys, json; d = json.load(sys.stdin); $1"; }

echo "== 1/5 Pages-projekt =="
if cf GET "/pages/projects/$PROJEKT" | py "sys.exit(0 if d.get('success') else 1)"; then
  echo "   '$PROJEKT' findes allerede"
else
  cf POST "/pages/projects" "{\"name\":\"$PROJEKT\",\"production_branch\":\"main\"}" \
    | py "ok = d.get('success'); print('   oprettet' if ok else 'FEJL: ' + json.dumps(d.get('errors'))); sys.exit(0 if ok else 1)"
fi

echo "== 2/5 KV-namespace =="
KV_ID=$(cf GET "/storage/kv/namespaces?per_page=100" \
  | py "print(next((n['id'] for n in d.get('result') or [] if n['title'] == '$KV_TITEL'), ''))")
if [ -z "$KV_ID" ]; then
  KV_ID=$(cf POST "/storage/kv/namespaces" "{\"title\":\"$KV_TITEL\"}" | py "print(d['result']['id'])")
  echo "   oprettet: $KV_ID"
else
  echo "   findes: $KV_ID"
fi
# Skriv id'et ind i wrangler.toml (kun én id-linje findes — KV-blokken)
python3 - "$KV_ID" <<'PY'
import re, sys
kv_id = sys.argv[1]
sti = "wrangler.toml"
indhold = open(sti).read()
nyt = re.sub(r'(?m)^id = ".*"$', f'id = "{kv_id}"', indhold, count=1)
open(sti, "w").write(nyt)
print(f"   wrangler.toml: id = {kv_id}")
PY

echo "== 3/5 R2-bucket =="
cf POST "/r2/buckets" "{\"name\":\"$BUCKET\"}" | py "
ok = d.get('success')
fejl = json.dumps(d.get('errors') or []).lower()
print('   oprettet' if ok else ('   findes allerede' if 'exist' in fejl else '   FEJL: ' + fejl))
sys.exit(0 if ok or 'exist' in fejl else 1)"

echo "== 4/5 App-hemmeligheder =="
for NAVN in PLATFORM_SECRET GEMINI_API_KEY GEMINI_MODEL RESEND_API_KEY MAIL_FROM RATE_LIMIT_HOUR; do
  VAERDI="${!NAVN:-}"
  if [ -n "$VAERDI" ]; then
    printf '%s' "$VAERDI" | $W pages secret put "$NAVN" --project-name="$PROJEKT" >/dev/null
    echo "   $NAVN sat"
  fi
done
if [ -z "${PLATFORM_SECRET:-}" ]; then
  echo "   OBS: PLATFORM_SECRET er ikke sat — den er påkrævet for at oprette butikker og for master-login."
fi
if [ -z "${GEMINI_API_KEY:-}" ]; then
  echo "   OBS: GEMINI_API_KEY er ikke sat — appen kører i demo-mode (ingen AI-indsættelse)."
fi

echo "== 5/5 Deploy =="
$W pages deploy out --project-name="$PROJEKT" --branch=main --commit-dirty=true

echo
echo "FÆRDIG:"
echo "  App:   https://$PROJEKT.pages.dev  (demo-butik: /t/demo, admin: /admin)"
echo "  Husk:  commit wrangler.toml hvis KV-id'et lige er blevet skrevet ind."
