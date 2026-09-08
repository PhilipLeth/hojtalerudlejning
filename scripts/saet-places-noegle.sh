#!/bin/bash
# Sætter Google Places-nøglen som secret på Pages-projektet og tjekker, at
# anmeldelserne kommer igennem.
#
#   bash scripts/saet-places-noegle.sh AIza...
#
# Nøglen laves i Google Cloud Console (projekt lejecenter → Credentials →
# "Lejhojtaler Places (server)"). Scriptet findes, fordi wranglers skjulte
# prompt og en lang echo-linje begge er lette at få galt i halsen.
set -euo pipefail

cd "$(dirname "$0")/.."

# Fjern mellemrum og linjeskift — en kopieret nøgle fra en ombrudt skærm har dem tit
NOEGLE="$(printf '%s' "${1:-}" | tr -d '[:space:]')"

if [[ -z "$NOEGLE" ]]; then
  echo "Brug: bash scripts/saet-places-noegle.sh <nøgle>" >&2
  exit 1
fi
if [[ ! "$NOEGLE" =~ ^AIza[A-Za-z0-9_-]{35}$ ]]; then
  echo "Det ligner ikke en Google API-nøgle (skal begynde med AIza og være 39 tegn). Fik ${#NOEGLE} tegn." >&2
  exit 1
fi

export CLOUDFLARE_ACCOUNT_ID=3e5a00606c7d80a43b229f6d15994043

echo "Sætter GOOGLE_PLACES_API_KEY på speaker-rental …"
printf '%s' "$NOEGLE" | npx wrangler pages secret put GOOGLE_PLACES_API_KEY --project-name=speaker-rental

echo
echo "Tjekker https://lejhojtaler.dk/api/anmeldelser …"
SVAR="$(curl -s -m 20 "https://lejhojtaler.dk/api/anmeldelser")"
ANTAL="$(printf '%s' "$SVAR" | python3 -c 'import json,sys; print(len(json.load(sys.stdin).get("reviews", [])))' 2>/dev/null || echo 0)"

if [[ "$ANTAL" -gt 0 ]]; then
  echo "Virker: $ANTAL anmeldelser kommer igennem. Sitet viser dem nu."
else
  echo "Secret'en er sat, men endpointet svarer stadig tomt. Det plejer at betyde, at Pages skal deployes igen — skriv 'sat' til Claude, så klarer den resten."
fi
