/**
 * Frederik 24. august 2026: "Når jeg trykker på et produkt" endte han på
 * https://lejhojtaler.dk/festlys.txt — rå flight-data i Chrome.
 *
 * Årsagen ligger i Next: med output: "export" hentes sidens data fra
 * <sti>.txt, og fejler eller afbrydes den fetch, navigerer Next browseren hen
 * til .txt-filen i stedet for til siden. Afbrydelsen kommer af én delt
 * AbortController, som Next afbryder på pagehide — fryser Chrome fanen, rammer
 * hvert eneste klik derefter .txt'en.
 *
 * Middlewaren fanger det: et rigtigt sideskift til en .txt sendes videre til
 * siden, mens Next' egen datahentning skal gå uberørt igennem. Går den med, er
 * hele klientnavigationen død.
 */
import { describe, it, expect, vi } from "vitest";
import { onRequest } from "../../functions/_middleware";

const NÆSTE = "__next__";

/** Kald middlewaren som Cloudflare ville gøre det */
async function kald(url: string, headers: Record<string, string>, method = "GET") {
  const next = vi.fn(async () => new Response(NÆSTE, { status: 200 }));
  const res = (await onRequest({
    request: new Request(url, { method, headers }),
    next,
  } as unknown as Parameters<typeof onRequest>[0])) as Response;
  return { res, next };
}

/** Sådan ser et klik i browseren ud */
const SIDESKIFT = { "sec-fetch-dest": "document", accept: "text/html,*/*" };
/** Sådan ser Next' egen RSC-hentning ud */
const RSC_HENTNING = { "sec-fetch-dest": "empty", accept: "*/*", RSC: "1" };

describe("En browser der lander på RSC-nyttelasten", () => {
  it("sendes videre til selve siden", async () => {
    const { res, next } = await kald("https://lejhojtaler.dk/festlys.txt", SIDESKIFT);
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/festlys");
    expect(next).not.toHaveBeenCalled();
  });

  it("gemmer ikke nødredirecten", async () => {
    const { res } = await kald("https://lejhojtaler.dk/festlys.txt", SIDESKIFT);
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("finder forsiden bag /index.txt", async () => {
    const { res } = await kald("https://lejhojtaler.dk/index.txt", SIDESKIFT);
    expect(res.headers.get("Location")).toBe("/");
  });

  it("tager kundens eget produktvalg med, men ikke Next' cache-nøgle", async () => {
    const { res } = await kald(
      "https://lejhojtaler.dk/index.txt?product=thumpgo&_rsc=1abcd",
      SIDESKIFT,
    );
    expect(res.headers.get("Location")).toBe("/?product=thumpgo");
  });

  it("virker også på undersider", async () => {
    const { res } = await kald("https://lejhojtaler.dk/blog/lyd-til-fest.txt", SIDESKIFT);
    expect(res.headers.get("Location")).toBe("/blog/lyd-til-fest");
  });

  it("kender en navigation uden Sec-Fetch-Dest på at den beder om HTML", async () => {
    const { res } = await kald("https://lejhojtaler.dk/festlys.txt", {
      accept: "text/html,application/xhtml+xml",
    });
    expect(res.status).toBe(302);
  });
});

describe("Next' egen datahentning", () => {
  it("går uberørt igennem — ellers er klientnavigationen død", async () => {
    const { res, next } = await kald(
      "https://lejhojtaler.dk/festlys.txt?_rsc=1abcd",
      RSC_HENTNING,
    );
    expect(next).toHaveBeenCalled();
    expect(await res.text()).toBe(NÆSTE);
  });
});

describe("Tekstfiler der er deres egen side", () => {
  it("serveres som de er", async () => {
    for (const sti of ["/robots.txt", "/llms.txt"]) {
      const { next } = await kald(`https://lejhojtaler.dk${sti}`, SIDESKIFT);
      expect(next).toHaveBeenCalled();
    }
  });
});

describe("Resten af middlewaren", () => {
  it("holder stadig pages.dev væk fra det rigtige domæne", async () => {
    const { res } = await kald("https://speaker-rental.pages.dev/festlys", SIDESKIFT);
    expect(res.status).toBe(301);
    expect(res.headers.get("Location")).toBe("https://lejhojtaler.dk/festlys");
  });

  it("rører ikke almindelige sider", async () => {
    const { next } = await kald("https://lejhojtaler.dk/festlys", SIDESKIFT);
    expect(next).toHaveBeenCalled();
  });

  it("rører ikke API-kald", async () => {
    const { next } = await kald("https://lejhojtaler.dk/api/book", { accept: "*/*" }, "POST");
    expect(next).toHaveBeenCalled();
  });
});
