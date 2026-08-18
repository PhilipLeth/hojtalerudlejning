# furniture-viz

SaaS: møbelbutikkers kunder ser butikkens møbler **i deres eget billede**.
Kunden fotograferer sin have/stue, vælger produkter, en AI-billedmodel
indsætter møblerne fotorealistisk, og kunden sender en tilbudsforespørgsel.

Fuld produktbeskrivelse, arkitektur og opgaveliste: **[PRD.md](PRD.md)**.

## URL-oversigt

| Sti | Hvad |
|---|---|
| `/` | Platform-landing (sælger SaaS'en til butikker) |
| `/t/<slug>` | Slutkunde-appen for en butik (fx `/t/demo`) |
| `/admin` | Butiks-admin (produkter, forespørgsler, indstillinger) |

En **demo-tenant** (`/t/demo`) bootstrapper sig selv med seks franske
havemøbler første gang den rammes — ingen seeding nødvendig. Uden
`GEMINI_API_KEY` kører genereringen i demo-mode (kundens foto returneres
med DEMO-mærkat), så hele flowet kan klikkes igennem gratis.

## Lokal udvikling

```bash
npm install
npm run dev        # kun UI (API-kald fejler — brug preview for fuldt flow)
npm run preview    # next build + wrangler pages dev out (statics + functions + lokal KV/R2)
npm test           # vitest
```

## Opsætning i Cloudflare (engangs, ~10 min)

1. **KV + R2:**
   ```bash
   npx wrangler kv namespace create furniture-viz-data   # indsæt id i wrangler.toml
   npx wrangler r2 bucket create furniture-viz-media
   ```
2. **Pages-projekt:** opret `furniture-viz` i Cloudflare-dashboardet med
   Git-integration til dette repo (build: `npm ci && npm run build`, output:
   `out`) — så deployer hvert push. Alternativt manuelt:
   `npx wrangler pages deploy out --project-name=furniture-viz --branch=main`.
3. **Secrets/vars** (Pages → Settings → Environment variables):
   - `PLATFORM_SECRET` (påkrævet) — opret tenants + master-adgang til admin
   - `GEMINI_API_KEY` (fra [Google AI Studio](https://aistudio.google.com)) — aktiverer AI; udelades = demo-mode
   - `GEMINI_MODEL` (valgfri, default `gemini-2.5-flash-image`)
   - `RESEND_API_KEY` + `MAIL_FROM` (valgfri) — forespørgsels-mails
4. **Opret første rigtige tenant:**
   ```bash
   curl -X POST https://<dit-domæne>/api/platform/tenants \
     -H "Authorization: Bearer $PLATFORM_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"slug":"reg","name":"Regs Møbler","notifyEmail":"reg@example.dk"}'
   # → svaret indeholder engangs-adgangskoden til /admin
   ```
5. Del linket `https://<dit-domæne>/t/reg` (eller QR-kode) med butikkens kunder.

## Flyt til eget repo (opgave 0.4)

Koden ligger midlertidigt som orphan-branch i `hojtalerudlejning`-repoet
(sessionens GitHub-adgang måtte ikke oprette nye repos). Historikken er ren
og uafhængig. Flyt den sådan — opret først et tomt privat repo
`philipleth/furniture-viz` på github.com (uden README):

```bash
git clone --branch claude/furniture-viz-saas-1q8jkz \
  https://github.com/PhilipLeth/hojtalerudlejning.git furniture-viz
cd furniture-viz
git branch -m main
git remote set-url origin https://github.com/PhilipLeth/furniture-viz.git
git push -u origin main
```
