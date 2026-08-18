import { describe, expect, it } from "vitest";
import type { Product } from "../shared/types";
import { ARRANGEMENT_HINTS, buildPrompt, generateOne } from "../functions/api/_lib/ai";
import { fraB64, tilB64 } from "../functions/api/_lib/id";

const PRODUKTER: Product[] = [
  {
    id: "baenk-marais",
    name: "Bænk Marais",
    description: "Parkbænk i sortgrønt smedejern",
    dimensions: "150×60×85 cm",
    images: ["/demo/baenk.svg"],
    active: true,
  },
  {
    id: "parasol-riviera",
    name: "Parasol Riviera",
    description: "Cremefarvet canvas-parasol",
    images: ["/demo/parasol.svg"],
    active: true,
  },
];

describe("buildPrompt", () => {
  it("indeholder produktnavne, mål, beskrivelser og opstillings-hintet", () => {
    const prompt = buildPrompt(PRODUKTER, 1, 2);
    expect(prompt).toContain("Bænk Marais");
    expect(prompt).toContain("150×60×85 cm");
    expect(prompt).toContain("Cremefarvet canvas-parasol");
    expect(prompt).toContain(ARRANGEMENT_HINTS[1]);
    expect(prompt).toContain("2 following attached image(s)");
  });
  it("beder om tekst-styring når der ingen referencebilleder er", () => {
    const prompt = buildPrompt(PRODUKTER, 0, 0);
    expect(prompt).toContain("No reference photos are attached");
  });
  it("falder tilbage til første hint ved ugyldigt index", () => {
    expect(buildPrompt(PRODUKTER, 99, 0)).toContain(ARRANGEMENT_HINTS[0]);
  });
});

describe("generateOne", () => {
  it("kører demo-mode uden apiKey — intet netværkskald", async () => {
    const resultat = await generateOne({
      sceneBytes: new ArrayBuffer(8),
      sceneMime: "image/jpeg",
      productRefs: [],
      products: PRODUKTER,
      hintIndex: 0,
      model: "gemini-2.5-flash-image",
      apiKey: undefined,
    });
    expect(resultat).toEqual({ ok: true, demo: true });
  });
});

describe("base64-helpers", () => {
  it("runder store buffers rundt uden tab (chunket)", () => {
    const bytes = new Uint8Array(70_000);
    for (let i = 0; i < bytes.length; i++) bytes[i] = i % 251;
    const tilbage = new Uint8Array(fraB64(tilB64(bytes.buffer)));
    expect(tilbage.length).toBe(bytes.length);
    expect(tilbage[0]).toBe(bytes[0]);
    expect(tilbage[69_999]).toBe(bytes[69_999]);
    expect([...tilbage.slice(1000, 1010)]).toEqual([...bytes.slice(1000, 1010)]);
  });
});
