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

export const onRequest: PagesFunction = async (context) => {
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

  return context.next();
};
