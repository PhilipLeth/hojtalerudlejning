# PRD — Møbler i dit eget billede (arbejdstitel: *furniture-viz*)

> **Dette dokument er projektets hukommelse.** Nye features og trufne
> beslutninger skrives ind her i den relevante sektion, ligesom prd.json
> på lejhojtaler.dk. Opgavelisten i afsnit 9 er den autoritative backlog.

## 1. Vision

En SaaS-platform hvor møbelbutikker lader deres kunder se butikkens møbler
**i kundens eget billede**, før de køber. Kunden åbner en web-app på
telefonen, tager et foto af sin have (eller stue), vælger produkter fra
butikkens katalog, og en AI-billedmodel indsætter møblerne fotorealistisk i
fotoet. Kunden bladrer mellem varianter, finder sin favorit og sender en
tilbudsforespørgsel direkte til butikken.

Analogi: IKEAs køkkenplanlægger — men i stedet for en 3D-tegning bruges
kundens eget foto, og i stedet for køkkener er det (have)møbler. Meget
lavere friktion: intet login, ingen installation, to tryk fra foto til
visualisering.

**Pilotkunde:** Reg *(navn fra diktat — staves muligvis anderledes; afklar)*,
som producerer franske specialfremstillede møbler og vil give sine kunder
mulighed for at se møblerne i deres egen have og bede om et tilbud.

**Forretningsmodel (senere fase):** butikker betaler abonnement + evt.
forbrug (AI-genereringer). V1 afregnes manuelt; selvbetjent signup og
betaling er Fase 4.

## 2. Aktører

| Aktør | Hvem | Hvad de gør |
|---|---|---|
| **Slutkunde** | Regs kunde | Tager foto, vælger møbler, ser varianter, sender forespørgsel. Intet login. |
| **Tenant** (butik) | Reg | Administrerer produktkatalog, indstillinger, modtager og besvarer forespørgsler. |
| **Platform** | Philip | Opretter tenants, drifter platformen, betaler AI-forbrug (viderefaktureres). |

## 3. Brugerrejser

### 3.1 Slutkunde (mobil, PWA)

1. Åbner butikkens link, fx `app.<domæne>.dk/t/reg` (eller QR-kode i butikken).
2. Ser butikkens brand (navn, farve, velkomsttekst) og ét stort valg:
   **„Tag et billede"** — åbner kameraet direkte (eller vælg fra kamerarulle).
3. Billedet nedskaleres på telefonen og uploades.
4. Vælger 1–N produkter fra butikkens katalog (billede, navn, mål, vejl. pris).
5. Trykker **„Vis i mit billede"** → ventesider med statusbeskeder (15–40 sek.)
   → 1–3 varianter genereres med forskellige opstillinger.
6. Bladrer i galleriet over alle genererede varianter i sessionen. Kan:
   - **„Ny variant"** — samme valg, ny opstilling.
   - **„Vælg andre møbler"** — tilbage til kataloget, samme foto.
7. Trykker **„Få et tilbud på denne"** ved favoritten → formular med navn,
   e-mail, telefon og evt. besked (billedet vises som kvittering).
8. Bekræftelse: „Tak — {butik} vender tilbage med et tilbud."

**Bevidst fravalg i v1:** kunden kan *ikke* skrive fritekst-ønsker til
AI'en („jeg vil gerne have noget minimalistisk…"). Produktvalget + de faste
opstillings-varianter er styringen. Fritekst er Fase 5 (kræver moderation
og mere prompt-arbejde).

### 3.2 Tenant (Reg) — `/admin`

1. Logger ind med butiks-slug + adgangskode (udleveret af platformen).
2. **Produkter:** opretter/redigerer produkter — navn, beskrivelse (bruges
   også i AI-prompten!), mål, vejledende pris, produktfoto (upload).
   Gode produktfotos (skarpe, gerne ensartet baggrund) giver bedre indsættelser.
3. **Forespørgsler:** ser indkomne forespørgsler med kundens valgte billede,
   kontaktdata (klikbar tlf./mail) og produktliste. Markerer som besvaret.
   Selve tilbuddet gives uden om systemet (mail/telefon) i v1.
4. **Indstillinger:** butiksnavn, brandfarve, velkomsttekst, modtager-e-mail
   for forespørgsler, antal varianter pr. generering, månedlig
   genererings-grænse, skift adgangskode.
5. Får desuden hver forespørgsel på e-mail (Resend) med reply-to sat til
   kunden, så hun kan svare direkte fra indbakken.

### 3.3 Platform (Philip)

1. Opretter tenant via API-kald med `PLATFORM_SECRET`
   (`POST /api/platform/tenants`) — får engangs-adgangskode retur til at
   udlevere til butikken.
2. `PLATFORM_SECRET` virker som master-adgangskode til alle tenants' admin
   (support/fejlsøgning).
3. Overvåger forbrug via månedstællere i KV. Selvbetjening er Fase 4.

## 4. Arkitektur

Samme velkendte stack som lejhojtaler.dk — minimal drift, ingen servere:

| Lag | Valg |
|---|---|
| Frontend | Next.js 15, App Router, `output: "export"` (statisk), Tailwind CSS, PWA-manifest |
| API | Cloudflare Pages Functions i `functions/` (TypeScript) |
| Data | Cloudflare KV, binding **`DATA`** (tenants, produkter, forespørgsler, tællere, sessioner) |
| Medier | Cloudflare R2, binding **`MEDIA`** (kundefotos, genererede billeder, produktfotos) — serveres via `/media/*`-proxy-function |
| AI | Google **Gemini image-model** via REST (se afsnit 5) |
| E-mail | Resend (samme som lejhojtaler-bookingmails) |
| Hosting | Cloudflare Pages-projekt `furniture-viz`; produktion på eget domæne senere (fx `app.<navn>.dk`) |

### 4.1 Multi-tenant-model

- Én deployment, alle tenants adskilt pr. **slug** i KV-nøgler og R2-stier.
- Slutkunde-URL: `/t/<slug>` (en Pages Function serverer app-skallen; klienten
  læser slug fra stien). `/app?t=<slug>` virker også.
- Custom domæne pr. tenant (fx `visualiser.regsbutik.dk` via Cloudflare for
  SaaS) er Fase 4.

### 4.2 Datamodel (KV)

| Nøgle | Indhold |
|---|---|
| `tenant:<slug>` | TenantRecord: navn, brandfarve, velkomsttekst, notifyEmail, varianter pr. generering, grænser, PBKDF2-salt/hash for admin-adgangskode |
| `products:<slug>` | `Product[]` — hele kataloget som ét JSON-blob (samme mønster som `products_catalog` på lejhojtaler) |
| `req:<slug>:<ISO-tid>_<id>` | QuoteRequest — list med prefix giver kronologisk rækkefølge |
| `session:<slug>:<token>` | Admin-session, TTL 30 dage |
| `usage:<slug>:<YYYYMM>` | Månedstæller for genereringer |
| `rl:<ip-hash>:<YYYYMMDDHH>` | Rate-limit-tæller, TTL 2 timer |
| `tenants_index` | Liste af slugs |

R2-stier: `t/<slug>/scenes/<id>.jpg` (kundefotos), `t/<slug>/gen/<id>.png`
(genererede), `t/<slug>/products/<id>.jpg` (produktfotos). Alle id'er er
kryptografisk tilfældige (ugættelige URL'er); signerede URL'er er Fase 5.

### 4.3 API-endpoints

| Endpoint | Metode | Auth | Funktion |
|---|---|---|---|
| `/api/tenant/<slug>/config` | GET | — | Offentlig tenant-config + aktive produkter |
| `/api/tenant/<slug>/scene` | POST (rå bytes) | — | Upload kundefoto → R2, returnér sceneId |
| `/api/tenant/<slug>/generate` | POST | — (rate-limited) | Kør AI, gem varianter i R2, returnér URL'er |
| `/api/tenant/<slug>/request` | POST | — (rate-limited) | Gem forespørgsel + send mail til tenant |
| `/api/tenant/<slug>/admin/login` | POST | adgangskode | Udsted session-token |
| `/api/tenant/<slug>/admin/products` | GET/PUT | session | Læs/skriv hele kataloget |
| `/api/tenant/<slug>/admin/product-image` | POST | session | Upload produktfoto → R2 |
| `/api/tenant/<slug>/admin/settings` | GET/PUT | session | Indstillinger + skift adgangskode + månedsforbrug |
| `/api/tenant/<slug>/admin/requests` | GET/PUT | session | Forespørgselsliste / opdatér status |
| `/api/platform/tenants` | GET/POST | `PLATFORM_SECRET` | Opret/list tenants |
| `/media/<r2-sti>` | GET | — | Servér billeder fra R2 (immutable cache) |
| `/t/<slug>` | GET | — | Servér slutkunde-app-skallen |

**Principper (arvet fra lejhojtaler):** serveren stoler aldrig på klienten —
grænser, priser og AI-kald håndhæves server-side. Klienten sender kun id'er.

### 4.4 Sikkerhed & misbrug

- AI-generering koster penge pr. klik → **rate limit pr. IP** (12/time,
  KV-tæller) og **månedsgrænse pr. tenant** (default 300, konfigurerbar).
- Upload-grænse 8 MB, kun `image/jpeg|png|webp`; klienten nedskalerer til
  maks. 1600 px før upload (sparer båndbredde og model-tokens).
- Admin-adgangskoder hashes med PBKDF2-SHA256 (100k iterationer), sessioner
  i KV med TTL — samme mønster som lejhojtalers adminAuth.
- Demo-tenantens adgangskode er umulig (tilfældig hash) — kun
  `PLATFORM_SECRET` kan logge ind på den.
- Cloudflare Turnstile på generate/request er planlagt (Fase 3) hvis der
  ses misbrug.

### 4.5 GDPR & billedopbevaring

Kundefotos er persondata (folks haver/hjem) og kontaktdata følger med
forespørgsler.

- Kundefotos (`scenes/`) og genererede billeder uden tilknyttet forespørgsel
  skal auto-slettes efter 30 dage → **R2 lifecycle-regel** (Fase 3, opsættes
  i Cloudflare-dashboardet eller via API).
- Privatlivspolitik-side + samtykketekst ved upload (Fase 3, før go-live).
- Forespørgsler slettes på anmodning; admin-sletning er Fase 5.

## 5. AI-modelvalg

**Default: Google `gemini-2.5-flash-image`** („Nano Banana") via
`generativelanguage.googleapis.com` REST.

Begrundelse:

- Klassens bedste til **redigering af eksisterende foto** — bevarer scenen og
  indsætter objekter med korrekt perspektiv, lys og skygge.
- Tager **flere input-billeder** i ét kald: kundens foto + produktreferencer,
  så møblerne ligner de faktiske produkter.
- Billig og hurtig: ~0,04 USD pr. billede, typisk < 15 sek.
- Opgraderingssti: `gemini-3-pro-image-preview` („Nano Banana Pro") — bedre
  produkt-troskab og op til 14 referencebilleder, ~0,13–0,24 USD pr. billede.
  Kan slås til pr. tenant (`aiModel`-felt) eller globalt (`GEMINI_MODEL`).

Alternativer, fravalgt som default: OpenAI `gpt-image-1` (dyrere,
langsommere, restyler mere af scenen), FLUX.1 Kontext via fal/Replicate
(godt, men ekstra leverandør), Cloudflare Workers AI (ikke i denne klasse
endnu). Adapteren i `functions/api/_lib/ai.ts` er det eneste sted modellen
kendes — den kan skiftes uden at røre resten.

**Prompt-strategi:** prompten skrives på engelsk (billedmodeller følger
engelsk bedst): indsæt de vedhæftede produkter i scenen, korrekt skala ud
fra scenens holdepunkter, bevar alt andet urørt, produkterne må ikke
redesignes. Produkternes navn/beskrivelse/mål medsendes som tekst; hver
variant får et forskelligt opstillings-hint (naturlig gruppering / luftig
minimal / fuldt udnyttet). SVG-produktbilleder springes over som reference
(kun tekst), rasterbilleder vedhæftes.

**Demo-mode:** uden `GEMINI_API_KEY` returnerer generate kundens eget foto
med `demo: true`, og UI'et viser en tydelig „DEMO"-mærkat. Hele flowet kan
dermed testes uden nøgle og uden omkostninger.

**Én fælles platform-nøgle** (ikke nøgle pr. tenant) — forbruget styres af
tenant-grænserne og afregnes via abonnementet.

## 6. Ikke i v1 (bevidste fravalg)

- Fritekst-ønsker fra slutkunden til AI'en (Fase 5).
- Selvbetjent tenant-signup og betaling (Fase 4).
- Custom domæner pr. tenant (Fase 4).
- Køb/checkout — v1 slutter ved tilbudsforespørgsel; Reg lukker handlen manuelt.
- Flersprog — alt er på dansk (i18n er Fase 4).
- Native apps / AR — PWA er nok; AR er en fjern Fase 5-idé.

## 7. Succeskriterier for piloten

- Reg kan selv vedligeholde sit katalog uden hjælp.
- En slutkunde kommer fra link til afsendt forespørgsel på < 3 minutter.
- ≥ 8 af 10 genererede billeder er „troværdige nok til at sende" (manuel
  eval, se opgave 3.6).
- Reg modtager forespørgsler på mail og kan svare direkte (reply-to).

## 8. Miljøvariabler & bindings

| Navn | Type | Påkrævet | Funktion |
|---|---|---|---|
| `DATA` | KV-binding | ja | Al strukturdata |
| `MEDIA` | R2-binding | ja | Alle billeder |
| `PLATFORM_SECRET` | secret | ja | Opret tenants + master-admin |
| `GEMINI_API_KEY` | secret | nej (demo-mode uden) | AI-generering |
| `GEMINI_MODEL` | var | nej | Overstyr default-model |
| `RESEND_API_KEY` | secret | nej | Forespørgsels-mails |
| `MAIL_FROM` | var | nej | Afsender, fx `Furniture Viz <noreply@…>` |
| `RATE_LIMIT_HOUR` | var | nej | Genereringer pr. IP pr. time (default 12) |

## 9. Opgaveliste

Status: `[x]` = leveret i første build, `[ ]` = udestår.

### Fase 0 — Fundament
- [x] 0.1 Repo, Next.js 15 static export + Tailwind + TypeScript + vitest (samme stack som lejhojtaler)
- [x] 0.2 `wrangler.toml` med `DATA`- (KV) og `MEDIA`-bindings (R2)
- [x] 0.3 PRD (dette dokument), CLAUDE.md-arbejdsregler, README med opsætningsguide
- [ ] 0.4 Flyt koden til eget GitHub-repo `philipleth/furniture-viz` (denne sessions GitHub-adgang måtte ikke oprette repos — kommandoer står i README)

### Fase 1 — Slutkunde-MVP
- [x] 1.1 App-skal `/app` + pretty URL `/t/<slug>` med tenant-opløsning (sti → query → localStorage)
- [x] 1.2 Fotoflow: kamera/galleri-input, klient-nedskalering (maks 1600 px, EXIF-rotation håndteret), upload til R2
- [x] 1.3 Produktvælger fra tenant-katalog med maks-grænse
- [x] 1.4 Generate-endpoint: rate limit, månedsgrænse, produktreferencer fra R2/statics, 1–3 varianter parallelt, lagring i R2
- [x] 1.5 AI-adapter med Gemini REST + demo-mode + arrangements-hints
- [x] 1.6 Variant-galleri med sessionshistorik, „Ny variant", „Vælg andre møbler"
- [x] 1.7 Tilbudsformular + `request`-endpoint (validering, KV-lagring, Resend-mail m. reply-to)
- [x] 1.8 PWA: manifest + service worker + installérbarhed
- [x] 1.9 Demo-tenant der bootstrapper sig selv med 6 franske havemøbler (SVG-pladsholderbilleder)

### Fase 2 — Tenant-admin
- [x] 2.1 Login med slug + adgangskode → KV-session (PBKDF2), `PLATFORM_SECRET` som master
- [x] 2.2 Produkt-CRUD inkl. billedupload til R2
- [x] 2.3 Forespørgselsliste med billede, kontaktlinks og status (ny/besvaret)
- [x] 2.4 Indstillinger: brand, notifikations-mail, varianter, grænser, skift adgangskode, månedsforbrug
- [x] 2.5 Platform-endpoint: opret/list tenants med engangs-adgangskode

### Fase 3 — Drift & go-live med Reg
- [ ] 3.1 Cloudflare-opsætning: KV-namespace, R2-bucket, Pages-projekt m. Git-integration, secrets (README trin 1–4)
- [ ] 3.2 `GEMINI_API_KEY` oprettes (Google AI Studio) og sættes som secret — sluk demo-mode
- [ ] 3.3 Resend: domæne verificeres, `RESEND_API_KEY` + `MAIL_FROM` sættes
- [ ] 3.4 Produktnavn + domæne besluttes (fx `app.<navn>.dk`) og kobles på Pages-projektet
- [ ] 3.5 Regs rigtige katalog: produktfotos (gerne fritlagte/ensartede), beskrivelser, mål, priser
- [ ] 3.6 Prompt-eval: 10 typiske havefotos × 3 produktsæt; scorekort (skala/lys/troskab); justér prompt og evt. model til `gemini-3-pro-image-preview`
- [ ] 3.7 GDPR: privatlivspolitik-side, samtykketekst ved upload, R2 lifecycle-regel (30 dages auto-slet af `scenes/`)
- [ ] 3.8 Turnstile på generate/request hvis misbrug ses
- [ ] 3.9 Pilot med Reg: QR-kode til butikken, feedback-runde

### Fase 4 — SaaS-selvbetjening
- [ ] 4.1 Signup-flow for nye tenants (e-mailverifikation)
- [ ] 4.2 Stripe-abonnement + forbrugsafregning pr. generering
- [ ] 4.3 Custom domæner pr. tenant (Cloudflare for SaaS)
- [ ] 4.4 Platform-dashboard: tenants, forbrug, omsætning
- [ ] 4.5 i18n (engelsk først)

### Fase 5 — Produktforbedringer
- [ ] 5.1 Tenant-definerede „pakker" (fx Minimal / Klassisk / Komplet) som ét-kliks-valg for slutkunden
- [ ] 5.2 „Flere møbler"/„Færre møbler"-knapper på resultatet (justerer produktsættet deterministisk — AI'en må ikke opfinde produkter)
- [ ] 5.3 Fritekst-ønsker fra slutkunden (kræver moderation)
- [ ] 5.4 Katalog-import fra webshop-feeds (Shopify/WooCommerce)
- [ ] 5.5 Signerede media-URL'er + admin-sletning af forespørgsler
- [ ] 5.6 Før/efter-slider og delbare resultat-links

## 10. Beslutningslog

- **2026-08-18** — Projekt startet efter møde med Reg. Stack genbruges 1:1
  fra lejhojtaler.dk (Next static export + Pages Functions + KV + R2) for
  minimal drift og genkendelighed.
- **2026-08-18** — AI-model: Gemini 2.5 Flash Image som default, adapter så
  modellen kan skiftes; demo-mode uden nøgle. Én fælles platform-nøgle.
- **2026-08-18** — V1 slutter ved tilbudsforespørgsel (ingen checkout);
  ingen fritekst til AI'en i v1.
- **2026-08-18** — Varianter = samme produkter i forskellige opstillinger
  (1–3 pr. generering, konfigurerbar pr. tenant); „flere/færre møbler" som
  senere forbedring skal ske ved at ændre produktsættet, ikke ved at lade
  modellen digte.
- **2026-08-18** — Koden ligger midlertidigt som orphan-branch
  `claude/furniture-viz-saas-1q8jkz` i hojtalerudlejning-repoet, fordi
  sessionens GitHub-adgang ikke må oprette nye repos. Flyttes til
  `philipleth/furniture-viz` (opgave 0.4).

## 11. Åbne spørgsmål

1. **Navn + domæne** — produktnavn og `app.<navn>.dk` skal besluttes (opgave 3.4).
2. **Pilotkundens navn** — „Reg" er fra diktat; få den rigtige stavemåde til
   tenant-opsætning og mails.
3. **Prismodel** — fx fast månedspris + inkluderede genereringer, derefter
   pr. styk? Besluttes før Fase 4.
4. **Regs katalogdata** — hvor mange produkter, findes der gode fotos, og
   skal varianter (stof/farve) modelleres som separate produkter i v1?
5. **Indendørs møbler** — flowet er generisk (foto er foto), men
   velkomsttekst/eksempler er havevinklede. Justeres pr. tenant.
