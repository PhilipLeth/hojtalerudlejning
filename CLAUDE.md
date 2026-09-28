# Lejhøjtaler.dk — arbejdsregler

## Deploy er en del af opgaven

**Arbejde er ikke færdigt før det er deployet.** Frederik ser resultatet på
lejhojtaler.dk, ikke i en diff — ændringer der kun ligger lokalt findes ikke.

Når en opgave er løst og testene kører:

```bash
npm test                 # skal være grøn
npm run build            # statisk eksport til out/
git add -A && git commit # beskrivende besked på dansk
npx wrangler pages deploy out --project-name=speaker-rental --branch=main
git push                 # hold GitHub i sync med det der er live
```

**Deploy kun et rent træ.** `wrangler pages deploy out` uploader det du lige
har bygget — inklusive uncommittede filer fra en anden session, der arbejder i
samme mappe. Ligger der fremmed arbejde i `git status`, så commit dit eget,
push, og lad Cloudflares Git-build tage commit'en i produktion i stedet.

Sig altid eksplicit i svaret om der er deployet eller ej, og link til
deployment-URL'en. Er der en grund til ikke at deploye (fx halvfærdigt arbejde
eller noget der kræver en beslutning), så sig det tydeligt frem for at lade
det ligge stille.

## Engelsk er ikke en ekstraopgave

**Sitet er tosproget, og begge sprog skal følges ad.** Bygger du en side, retter
du en pris eller skriver du en tekst, hører den engelske udgave med i samme
opgave — ikke i en senere. Ellers driver /en fra resten, som den gjorde da den
stod med fem sider mod 78 danske, en dansk `<title>` på /en/blog, og "read
more"-knapper der sendte engelske kunder ind i dansk tekst.

Konkret:

- **Ny eller ændret side?** Lav den engelske udgave i `src/app/en/<samme-slug>`
  og skriv stien ind i `EN_PAGES` (`src/lib/enPages.ts`). `en-sider.test.ts`
  fejler, hvis listen og mapperne ikke passer sammen.
- **Sæt hreflang begge veje.** Både den danske og den engelske side skal have
  `alternates: { canonical, languages: localeAlternates("/dansk-sti") }`. En
  side, der kun sætter `canonical`, taber root-layoutets `languages`.
- **Link sprogrigtigt.** Brug `localizedHref(sti, locale)` fra
  `src/lib/enPages.ts` i stedet for `product.page` direkte — katalogets `page`
  er altid den danske sti.
- **Oversæt, oversæt ikke maskinelt.** Titler og beskrivelser skal skrives på
  engelsk med engelske søgeord ("speaker rental copenhagen"), ikke oversættes
  ord for ord fra dansk. Katalogets `en`-tekster og `name_en`/`desc_en` er
  kilden til produktnavne.
- **Komponenter tager `locale`.** Er en komponent hårdkodet på dansk, så giv den
  et `locale`-prop frem for at kopiere filen — se `ProductLanding`, `BundleGrid`
  og `SpeakerCompare`.

Er der dansk indhold uden engelsk modstykke, er det gæld, ikke en beslutning.
Nævn det i svaret, så det ikke bliver glemt.

## Produkterne står i prisarket

**Er du i tvivl om et produkt, så kig i arket.** Frederiks prisark er sandheden
om sortimentet: hvad vi udlejer, hvilken model det er, hvad det koster, og hvad
der er i en pakke. Står en ting ikke i arket, udlejer vi den ikke.

- **Filen:** "LejHøjtaler Katalog.xlsx" i Drive, id
  `1cwSg1SEc5n-IiMKoi43cv43ATHG4esOW`, fanen **Basis**. Det er en xlsx, ikke et
  Google Sheet: hent den med Drive-connectorens `download_file_content`
  (base64) og læs den med `openpyxl`.
- **Kolonnerne:** A kategori, B produktnavn, C-H delene i en pakke, I
  indkøbsnavn (den præcise model), J link til produktet hos leverandøren,
  K relevante tilvalg, P den gældende pris.
- **Produktbilleder laves ud fra kolonne J.** Et foto genereret ud fra en
  beskrivelse bliver en opdigtet ting. Hent leverandørens billede fra linket og
  giv det som reference (`refUrl` i `scripts/product-images/fra-beskrivelse.mjs`).
  Husstilen og forbuddet mod logoer står i prompten.
- **Strukturen** (afsnittene og hvilket produkt der hører hvor) er skrevet ind i
  `src/lib/katalogStruktur.ts`, og priserne i `src/lib/products.ts`. Retter du
  en af dem, så tjek arket først.

## Om projektet

- **Stack:** Next.js (`output: "export"`) + Cloudflare Pages Functions i
  `functions/api/`. Data ligger i KV (`BOOKINGS`), billeder/video i R2 (`MEDIA`).
- **Pages-projekt:** `speaker-rental` → lejhojtaler.dk
- **Produktkatalog:** `src/lib/products.ts` er defaults; admin kan overskrive
  det i KV (`products_catalog`). Klienten læser altid via `useProducts()`.
  Serverens priser slås op i `functions/api/_lib/pricing.ts` — beløb beregnes
  ALDRIG ud fra det klienten sender.
- **prd.json** er projektets hukommelse. Nye features og trufne beslutninger
  skrives ind der, i den relevante sektion.
- **Arbejdssproget er dansk** — kode-kommentarer, commit-beskeder og dansk
  UI-tekst. Det er ikke i modstrid med afsnittet om engelsk ovenfor: sitet
  har en engelsk udgave for kunderne, men vi arbejder på dansk.
