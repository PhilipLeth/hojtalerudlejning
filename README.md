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

## Cloudflare-integration (indbygget og selv-provisionerende)

Repoet sætter selv alt op i Cloudflare. GitHub Actions
(`.github/workflows/deploy.yml`) tester og bygger på hvert push, og på
`main` kører den `scripts/setup-cloudflare.sh`, som idempotent:

1. opretter Pages-projektet **furniture-viz** (hvis det mangler),
2. opretter KV-namespacet **furniture-viz-data** og skriver id'et ind i `wrangler.toml`,
3. opretter R2-bucketen **furniture-viz-media**,
4. synker app-hemmeligheder til Pages,
5. deployer `out/` til produktion → **https://furniture-viz.pages.dev**

### Engangsopsætning (~5 min)

1. Lav et API-token på [dash.cloudflare.com → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   med rettighederne *Cloudflare Pages: Edit*, *Workers KV Storage: Edit*
   og *Workers R2 Storage: Edit* (Account-niveau).
2. Læg secrets i GitHub: repoet → Settings → Secrets and variables → Actions:
   - `CLOUDFLARE_API_TOKEN` (påkrævet) — tokenet fra trin 1
   - `PLATFORM_SECRET` (påkrævet) — selvvalgt, fx `openssl rand -hex 24`; bruges til at oprette butikker og som master-admin
   - `GEMINI_API_KEY` (fra [Google AI Studio](https://aistudio.google.com)) — aktiverer AI; udelades = demo-mode
   - `RESEND_API_KEY` + `MAIL_FROM` (valgfri) — forespørgsels-mails
3. Push til `main` (eller kør workflowet under Actions → "Test og deploy" →
   Run workflow). Færdig.

Scriptet kan også køres lokalt, samme effekt:

```bash
npm run build
CLOUDFLARE_API_TOKEN=... PLATFORM_SECRET=... bash scripts/setup-cloudflare.sh
```

## Onboarding af en ny butik

Butikker oprettes i v1 af platformen (selvbetjent signup er Fase 4 i PRD'en):

```bash
curl -X POST https://furniture-viz.pages.dev/api/platform/tenants \
  -H "Authorization: Bearer $PLATFORM_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug":"reg","name":"Regs Møbler","notifyEmail":"reg@example.dk"}'
# → svaret indeholder engangs-adgangskoden til /admin
```

Butikken logger ind på `/admin`, lægger produkter op og deler
`https://<domæne>/t/<slug>` (eller en QR-kode) med sine kunder.
