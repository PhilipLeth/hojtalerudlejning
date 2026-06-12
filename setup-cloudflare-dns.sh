#!/bin/bash
# Setup Cloudflare DNS for lejhojtaler.dk
#
# Usage:
#   1. Create API token at https://dash.cloudflare.com/profile/api-tokens
#      - Template: "Edit zone DNS"
#      - Zone Resources: Include → All zones
#   2. Run: CLOUDFLARE_TOKEN=xxx ./setup-cloudflare-dns.sh
#
# Or use Global API Key:
#   CF_EMAIL=your@email.com CF_KEY=xxx ./setup-cloudflare-dns.sh

set -euo pipefail

ACCOUNT_ID="3e5a00606c7d80a43b229f6d15994043"
DOMAIN="lejhojtaler.dk"

# Auth header
if [ -n "${CLOUDFLARE_TOKEN:-}" ]; then
  AUTH=(-H "Authorization: Bearer $CLOUDFLARE_TOKEN")
elif [ -n "${CF_KEY:-}" ] && [ -n "${CF_EMAIL:-}" ]; then
  AUTH=(-H "X-Auth-Key: $CF_KEY" -H "X-Auth-Email: $CF_EMAIL")
else
  echo "Error: Set CLOUDFLARE_TOKEN or CF_EMAIL+CF_KEY"
  echo ""
  echo "Get token: https://dash.cloudflare.com/profile/api-tokens"
  echo "  Template: 'Edit zone DNS'"
  echo "  Zone Resources: Include → All zones"
  exit 1
fi

echo "=== Creating zone: $DOMAIN ==="
ZONE_RESP=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones" \
  "${AUTH[@]}" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"$DOMAIN\",\"account\":{\"id\":\"$ACCOUNT_ID\"},\"type\":\"full\",\"jump_start\":true}")

SUCCESS=$(echo "$ZONE_RESP" | python3 -c "import json,sys; print(json.load(sys.stdin).get('success',''))")

if [ "$SUCCESS" != "True" ]; then
  # Check if zone already exists
  ZONE_RESP=$(curl -s "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" "${AUTH[@]}")
  ZONE_ID=$(echo "$ZONE_RESP" | python3 -c "import json,sys; r=json.load(sys.stdin).get('result',[]); print(r[0]['id'] if r else '')")
  if [ -z "$ZONE_ID" ]; then
    echo "Error creating zone:"
    echo "$ZONE_RESP" | python3 -m json.tool
    exit 1
  fi
  echo "Zone already exists: $ZONE_ID"
else
  ZONE_ID=$(echo "$ZONE_RESP" | python3 -c "import json,sys; print(json.load(sys.stdin)['result']['id'])")
  echo "Zone created: $ZONE_ID"
fi

# Get nameservers
NS_RESP=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID" "${AUTH[@]}")
NS=$(echo "$NS_RESP" | python3 -c "import json,sys; print('\n'.join(json.load(sys.stdin)['result'].get('name_servers',[])))")
echo ""
echo "=== Nameservers (set these at Simply.com) ==="
echo "$NS"

# Delete any existing DNS records for root and www
echo ""
echo "=== Cleaning existing DNS records ==="
EXISTING=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$DOMAIN" "${AUTH[@]}")
echo "$EXISTING" | python3 -c "
import json,sys
for r in json.load(sys.stdin).get('result',[]):
    print(f\"  Deleting {r['type']} {r['name']} -> {r['content']}\")" 2>/dev/null || true

# Delete existing records for root
echo "$EXISTING" | python3 -c "
import json,sys
for r in json.load(sys.stdin).get('result',[]):
    print(r['id'])" 2>/dev/null | while read -r rid; do
  [ -n "$rid" ] && curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$rid" "${AUTH[@]}" > /dev/null
done

# Delete existing www records
EXISTING_WWW=$(curl -s "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=www.$DOMAIN" "${AUTH[@]}")
echo "$EXISTING_WWW" | python3 -c "
import json,sys
for r in json.load(sys.stdin).get('result',[]):
    print(f\"  Deleting {r['type']} {r['name']} -> {r['content']}\")" 2>/dev/null || true

echo "$EXISTING_WWW" | python3 -c "
import json,sys
for r in json.load(sys.stdin).get('result',[]):
    print(r['id'])" 2>/dev/null | while read -r rid; do
  [ -n "$rid" ] && curl -s -X DELETE "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$rid" "${AUTH[@]}" > /dev/null
done

# Create CNAME for root (Cloudflare does CNAME flattening)
echo ""
echo "=== Creating DNS records ==="
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  "${AUTH[@]}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"CNAME\",\"name\":\"@\",\"content\":\"speaker-rental.pages.dev\",\"proxied\":true}" | python3 -c "
import json,sys
r=json.load(sys.stdin)
if r['success']: print('  ✅ CNAME @ -> speaker-rental.pages.dev (proxied)')
else: print(f'  ❌ Error: {r[\"errors\"]}')"

# Create CNAME for www
curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
  "${AUTH[@]}" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"CNAME\",\"name\":\"www\",\"content\":\"speaker-rental.pages.dev\",\"proxied\":true}" | python3 -c "
import json,sys
r=json.load(sys.stdin)
if r['success']: print('  ✅ CNAME www -> speaker-rental.pages.dev (proxied)')
else: print(f'  ❌ Error: {r[\"errors\"]}')"

echo ""
echo "=== SSL Settings ==="
# Set SSL to Full (strict)
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/ssl" \
  "${AUTH[@]}" \
  -H "Content-Type: application/json" \
  -d '{"value":"full"}' | python3 -c "
import json,sys
r=json.load(sys.stdin)
if r['success']: print('  ✅ SSL mode: Full')
else: print(f'  ❌ Error: {r[\"errors\"]}')"

# Enable Always Use HTTPS
curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/settings/always_use_https" \
  "${AUTH[@]}" \
  -H "Content-Type: application/json" \
  -d '{"value":"on"}' | python3 -c "
import json,sys
r=json.load(sys.stdin)
if r['success']: print('  ✅ Always Use HTTPS: on')
else: print(f'  ❌ Error: {r[\"errors\"]}')"

echo ""
echo "=== Done! ==="
echo ""
echo "Next steps:"
echo "  1. Go to Simply.com → $DOMAIN → Nameservers"
echo "  2. Change nameservers to:"
echo "$NS" | sed 's/^/     /'
echo "  3. Wait 5-30 min for DNS propagation"
echo "  4. https://$DOMAIN will be live with SSL"
