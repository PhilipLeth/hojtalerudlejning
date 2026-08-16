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
- **Sproget er dansk** — kode-kommentarer, commit-beskeder og UI-tekst.
