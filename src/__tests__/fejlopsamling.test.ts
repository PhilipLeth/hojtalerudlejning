/**
 * Fejlopsamlingen skal kunne stole på — den er offentlig, og den er det eneste
 * spor vi har af en kunde, der gav op undervejs.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { enhedsbeskrivelse, rapporterFejl, skalIgnoreres } from "@/lib/errorReport";
import { børVække, opsummer, parseFejlrapport, type Fejlrapport } from "../../functions/api/_lib/klientfejl";

describe("hvad der er værd at melde", () => {
  it("ignorerer støj fra browserudvidelser og afbrudte kald", () => {
    expect(skalIgnoreres("ResizeObserver loop completed with undelivered notifications")).toBe(true);
    expect(skalIgnoreres("Script error.")).toBe(true);
    expect(skalIgnoreres("Error in chrome-extension://abc/inject.js")).toBe(true);
    // Det her er en ægte fejl
    expect(skalIgnoreres("Cannot read properties of undefined (reading 'price')")).toBe(false);
  });

  it("kalder en mislykket booking og betaling værd at vække nogen for", () => {
    expect(børVække("booking_fejlede")).toBe(true);
    expect(børVække("betaling_fejlede")).toBe(true);
    // De her skal samles op i oversigten, ikke ringe på telefonen
    expect(børVække("javascript")).toBe(false);
    expect(børVække("udsolgt")).toBe(false);
  });
});

describe("enheden fejlen skete på", () => {
  it("kan se forskel på telefon og computer — det var Philips første spørgsmål", () => {
    const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1";
    expect(enhedsbeskrivelse(iphone, 390)).toBe("Safari · iOS · telefon");
    const mac = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
    expect(enhedsbeskrivelse(mac, 1440)).toBe("Chrome · Mac · computer");
  });

  it("afslører app-browsere, som ofte blokerer Stripes scripts", () => {
    const ig = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 275.0";
    expect(enhedsbeskrivelse(ig, 390)).toContain("Instagram-app");
    const fb = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 [FBAN/FBIOS;FBAV/450.0]";
    expect(enhedsbeskrivelse(fb, 390)).toContain("Facebook-app");
  });
});

describe("serveren tager kun imod det den kan bruge", () => {
  const tid = "2026-08-19T10:00:00.000Z";

  it("afviser ukendte typer og tomme beskeder", () => {
    expect(parseFejlrapport({ type: "noget_andet", besked: "hej" }, tid)).toBeNull();
    expect(parseFejlrapport({ type: "javascript", besked: "   " }, tid)).toBeNull();
    expect(parseFejlrapport(null, tid)).toBeNull();
  });

  it("klipper alt for langt indhold af — endepunktet er offentligt", () => {
    const r = parseFejlrapport({ type: "javascript", besked: "x".repeat(5000), ua: "u".repeat(5000) }, tid)!;
    expect(r.besked.length).toBe(300);
    expect(r.ua.length).toBe(200);
  });

  it("gemmer datoerne, så vi kan se om fejlen hænger på en bestemt periode", () => {
    const r = parseFejlrapport(
      { type: "udsolgt", besked: "soundboks er optaget", produkt: "soundboks", fra: "2026-09-04", til: "2026-09-07", trin: 1 },
      tid,
      "DK",
    )!;
    expect(r).toMatchObject({ produkt: "soundboks", fra: "2026-09-04", til: "2026-09-07", trin: 1, land: "DK" });
    expect(r.tid).toBe(tid);
  });

  it("lader ikke klienten sætte tidspunktet selv", () => {
    const r = parseFejlrapport({ type: "javascript", besked: "fejl", tid: "1999-01-01T00:00:00.000Z" }, tid)!;
    expect(r.tid).toBe(tid);
  });
});

describe("oversigten", () => {
  const lav = (o: Partial<Fejlrapport>): Fejlrapport => ({
    type: "javascript", besked: "fejl", enhed: "Safari · iOS · telefon", ua: "", bredde: 390, side: "/", tid: "2026-08-19T10:00:00.000Z", ...o,
  });

  it("samler samme fejl og viser hvor mange gange og på hvilke enheder", () => {
    const r = opsummer([
      lav({ tid: "2026-08-19T10:00:00.000Z" }),
      lav({ tid: "2026-08-19T12:00:00.000Z", enhed: "Chrome · Android · telefon" }),
      lav({ besked: "noget andet", tid: "2026-08-19T11:00:00.000Z" }),
    ]);
    expect(r).toHaveLength(2);
    // Nyeste øverst
    expect(r[0].antal).toBe(2);
    expect(r[0].senest).toBe("2026-08-19T12:00:00.000Z");
    expect(r[0].enheder).toEqual(["Safari · iOS · telefon", "Chrome · Android · telefon"]);
  });
});

describe("klienten sender ikke løs", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response(null, { status: 204 }))));
  });
  afterEach(() => vi.unstubAllGlobals());

  it("sender samme fejl én gang, ikke ved hvert klik", () => {
    rapporterFejl("javascript", "den samme fejl igen og igen");
    rapporterFejl("javascript", "den samme fejl igen og igen");
    rapporterFejl("javascript", "den samme fejl igen og igen");
    expect((globalThis.fetch as any).mock.calls.length).toBe(1);
  });
});
