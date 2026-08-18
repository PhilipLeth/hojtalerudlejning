# furniture-viz — arbejdsregler

## PRD.md er projektets hukommelse

Nye features og trufne beslutninger skrives ind i `PRD.md` i den relevante
sektion (opgaveliste, beslutningslog, åbne spørgsmål). Læs den før større
ændringer.

## Deploy er en del af opgaven

Arbejde er ikke færdigt før det kan ses live. Når Cloudflare Pages-projektet
er koblet på repoet (Git-integration, se README), er flowet:

```bash
npm test                 # skal være grøn
npm run build            # statisk eksport til out/
git add -A && git commit # beskrivende besked på dansk
git push                 # Cloudflares Git-build deployer automatisk
```

Indtil Git-integrationen er sat op kan der deployes manuelt med
`npx wrangler pages deploy out --project-name=furniture-viz --branch=main`
— men kun fra et rent træ. Sig altid eksplicit i svaret om der er deployet
eller ej, og link til deployment-URL'en.

## Om projektet

- **Stack:** Next.js (`output: "export"`) + Cloudflare Pages Functions i
  `functions/`. Strukturdata i KV (`DATA`), billeder i R2 (`MEDIA`).
  Samme mønstre som lejhojtaler.dk.
- **Multi-tenant:** alt data er adskilt pr. tenant-slug i KV-nøgler og
  R2-stier. Slutkunde-URL: `/t/<slug>`. Admin: `/admin`.
- **Serveren stoler aldrig på klienten:** grænser, produktopslag og AI-kald
  håndhæves server-side i `functions/api/`. Klienten sender kun id'er.
- **AI-adapteren** bor i `functions/api/_lib/ai.ts` — det eneste sted
  billedmodellen kendes. Uden `GEMINI_API_KEY` kører alt i demo-mode.
- **Delte typer** bor i `shared/types.ts` og importeres af både `src/` og
  `functions/`.
- **Sproget er dansk** — kode-kommentarer, commit-beskeder og UI-tekst.
  AI-prompter er på engelsk (billedmodeller følger engelsk bedst).
