/* ───── Byggerens dømmekraft: hvad anbefales, og hvad afvises ─────
 *
 * Målt live 31. august 2026: byggeren ville anbefale "leje af lyskæder fyn",
 * "soundboks leje odense" og "lej soundboks aalborg" — fem grupper for
 * steder vi ikke kører til, fordi et klik talte som bevis uanset hvor
 * kunden søgte fra. Uden-for-området-filteret sad kun i /ideer.
 */
import { describe, it, expect } from "vitest";
import { mergeKeywords, prepareGroup } from "../../functions/api/ads-build";
import { buildAdCopy, DEFAULT_DELIVERY_PRICE } from "@/lib/adsCopy";
import { clusterKeywords } from "@/lib/adsIntent";

const ingen = new Map();

describe("mergeKeywords og uden for området", () => {
  it("anbefaler ikke en frase for et sted vi ikke kører til — heller ikke med klik", () => {
    const rows = mergeKeywords(
      [],
      [
        { text: "soundboks leje odense", clicks: 2, impressions: 40 },
        { text: "lej soundboks aalborg", clicks: 1, impressions: 12 },
        { text: "lej en soundboks", clicks: 27, impressions: 300 },
      ],
      ingen,
      [],
      ["soundboks", "soundbox"],
    );
    const ved = Object.fromEntries(rows.map((r) => [r.text, r]));
    expect(ved["soundboks leje odense"].outsideArea).toBe("odense");
    expect(ved["soundboks leje odense"].recommended).toBe(false);
    expect(ved["lej soundboks aalborg"].recommended).toBe(false);
    // Klik inden for området er stadig bevis nok
    expect(ved["lej en soundboks"].outsideArea).toBeNull();
    expect(ved["lej en soundboks"].recommended).toBe(true);
  });

  it("giver egne søgetermer volumen når opslaget leverer den", () => {
    const rows = mergeKeywords(
      [{ text: "lej soundboks", volume: 170, competition: null }],
      [{ text: "lej soundboks", clicks: 27, impressions: 300 }],
      ingen,
      [],
      ["soundboks"],
    );
    expect(rows[0].volume).toBe(170);
    expect(rows[0].clicks).toBe(27);
    expect(rows[0].sources).toEqual(["google", "egen"]);
  });
});

describe("prepareGroup og uden for området", () => {
  const produkt = { name: "Soundboks 4", price: 695, page: "/soundboks-4" };
  const pages = { known: ["/soundboks-4"], paused: [] as string[] };

  function gruppe(keyword: string) {
    const cluster = clusterKeywords([keyword])[0];
    const copy = buildAdCopy(produkt, cluster, { deliveryPrice: DEFAULT_DELIVERY_PRICE });
    return {
      name: `Soundboks 4 — test: ${keyword}`,
      primary: keyword,
      keywords: [{ text: keyword }],
      headlines: copy.headlines,
      descriptions: copy.descriptions,
      finalUrl: copy.finalUrl,
    };
  }

  it("afviser en gruppe med et keyword uden for leveringsområdet", () => {
    const res = prepareGroup(gruppe("soundboks udlejning fyn"), pages, ["soundboks"], new Set());
    expect(res).toHaveProperty("errors");
    const fejl = (res as { errors: string[] }).errors.join(" ");
    expect(fejl).toContain("fyn");
    expect(fejl).toContain("negativt keyword");
  });

  it("godtager den samme gruppe inden for området", () => {
    const res = prepareGroup(gruppe("soundboks udlejning"), pages, ["soundboks"], new Set());
    expect(res).toHaveProperty("group");
  });
});

describe("spørgefraser klynger med produktet", () => {
  it("lægger 'hvad koster det at leje en soundboks' i soundboks-gruppen, ikke sin egen", () => {
    const clusters = clusterKeywords([
      { text: "leje soundboks", volume: 20 },
      { text: "hvad koster det at leje en soundboks", volume: 0 },
    ]);
    expect(clusters).toHaveLength(1);
    expect(clusters[0].head).toBe("soundboks");
    expect(clusters[0].keywords).toContain("hvad koster det at leje en soundboks");
  });
});
