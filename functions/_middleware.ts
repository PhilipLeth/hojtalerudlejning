/**
 * Rå RSC-nyttelast må aldrig ende i adresselinjen.
 *
 * Med `output: "export"` henter Next sidens data fra `<sti>.txt`, når man
 * klikker på et link — /festlys bliver til et fetch af /festlys.txt. Fejler
 * eller AFBRYDES den fetch, falder Next tilbage til "browser navigation", og
 * her er fejlen: fallbacken peger på .txt-filen i stedet for på siden. Kunden
 * står med rå flight-data i vinduet.
 *
 * Afbrydelsen er det almindelige tilfælde, ikke et uheld: Next deler ÉN
 * AbortController mellem alle RSC-fetches og afbryder den på `pagehide`.
 * Fryser Chrome en fane i baggrunden, er signalet afbrudt, og så rammer HVERT
 * eneste klik .txt-filen, indtil siden hentes forfra. Derfor så Frederik det på
 * alle produkter, mens en frisk fane ikke kunne genskabe det.
 *
 * Vi kan ikke rette Next herfra, men vi kan sørge for at browseren lander det
 * rigtige sted. Selve RSC-fetchen er ikke en navigation (Sec-Fetch-Dest: empty)
 * og går uberørt igennem — kun et rigtigt sideskift bliver sendt videre.
 */

/** Tekstfiler der ER deres egen side og skal serveres som de er */
const ÆGTE_TEKSTFILER = new Set(["/robots.txt", "/llms.txt"]);

/** "/festlys.txt" → "/festlys", "/index.txt" → "/" */
function sideStiFor(pathname: string): string {
  const sti = pathname.endsWith("/index.txt")
    ? pathname.slice(0, -"/index.txt".length)
    : pathname.slice(0, -".txt".length);
  return sti || "/";
}

/**
 * Er det et rigtigt sideskift — og ikke Next der henter data?
 *
 * Sec-Fetch-Dest sendes af alle nye browsere: "document" ved navigation,
 * "empty" ved fetch(). Mangler headeren (ældre Safari), kender vi navigationen
 * på at browseren beder om HTML; Next' fetch beder om noget som helst.
 */
function erSideskift(request: Request): boolean {
  const dest = request.headers.get("sec-fetch-dest");
  if (dest) return dest === "document";
  return (request.headers.get("accept") || "").includes("text/html");
}

/* ── Stemningsbilleder i hero ──────────────────────────────────────────────
 *
 * Et billede godkendt i /admin/stemningsbilleder ligger i KV. Sitet er en
 * statisk eksport, så siden kender det ikke — men alle sider går gennem her
 * (_routes.json), og så kan vi skrive det ind i HTML'en på vej ud:
 *   - <img data-hero-sti="/sti"> får det godkendte billede som src
 *   - <head> får window.__HERO__, så et klik videre til en anden side (som
 *     Next tegner i browseren uden ny HTML) også viser det rigtige billede
 * Fejler KV, går siden ud med kodens standardbillede — aldrig en fejlside.
 * Nøglen er den samme som HERO_MANIFEST_KEY i src/lib/heroBilleder.ts.
 */
interface MiddlewareEnv {
  BOOKINGS?: KVNamespace;
}

let heroCache: { tid: number; data: Record<string, string> } | null = null;

async function heroManifest(env: MiddlewareEnv): Promise<Record<string, string>> {
  if (heroCache && Date.now() - heroCache.tid < 60_000) return heroCache.data;
  const ud: Record<string, string> = {};
  try {
    const m = (await env.BOOKINGS?.get("hero_manifest", { type: "json", cacheTtl: 60 })) as Record<string, { src?: string }> | null;
    for (const [sti, e] of Object.entries(m ?? {})) if (e?.src) ud[sti] = e.src;
  } catch {
    /* KV nede — kodens standard gælder */
  }
  heroCache = { tid: Date.now(), data: ud };
  return ud;
}

function medHero(res: Response, manifest: Record<string, string>): Response {
  const json = JSON.stringify(manifest).replace(/</g, "\\u003c");
  return new HTMLRewriter()
    .on("head", {
      element(el) {
        el.append(`<script>window.__HERO__=${json}</script>`, { html: true });
      },
    })
    .on("img[data-hero-sti]", {
      element(el) {
        const src = manifest[el.getAttribute("data-hero-sti") ?? ""];
        if (!src) return;
        el.setAttribute("src", src);
        el.removeAttribute("srcset");
      },
    })
    .transform(res);
}

export const onRequest: PagesFunction<MiddlewareEnv> = async (context) => {
  const url = new URL(context.request.url);
  if (url.hostname === "speaker-rental.pages.dev") {
    return Response.redirect(`https://lejhojtaler.dk${url.pathname}${url.search}`, 301);
  }

  if (
    context.request.method === "GET" &&
    url.pathname.endsWith(".txt") &&
    !ÆGTE_TEKSTFILER.has(url.pathname) &&
    erSideskift(context.request)
  ) {
    // Next' cache-nøgle hører til datahentningen, ikke til siden
    const søg = new URLSearchParams(url.search);
    søg.delete("_rsc");
    const query = søg.toString();
    return new Response(null, {
      status: 302,
      headers: {
        Location: `${sideStiFor(url.pathname)}${query ? `?${query}` : ""}`,
        // Aldrig gemme en nødredirect — den hører til det ene forkerte klik
        "Cache-Control": "no-store",
      },
    });
  }

  const res = await context.next();
  const type = res.headers.get("Content-Type") || "";
  if (
    context.request.method !== "GET" ||
    !type.includes("text/html") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/api/")
  ) {
    return res;
  }
  return medHero(res, await heroManifest(context.env));
};
