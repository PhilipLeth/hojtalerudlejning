// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  SAMMENLAGTE_IDER,
  addons,
  nuvaerendeId,
  rentalProducts,
  speakers,
} from "@/lib/products";
import { loadPriceTable, buildLineItems } from "../../functions/api/_lib/pricing";
import { expandProductIds } from "../../functions/api/_lib/occupancy";

/**
 * Én linje pr. fysisk ting, som i prisarket.
 *
 * Kataloget havde to poster for den samme mikrofon: tilvalget `mikrofon` (445)
 * og udlejningsvaren `traadloes_mikrofon` (445), begge med produktsiden
 * /traadloes-mikrofon. Det samme for den kablede til 95 kr. Konsekvensen var
 * ikke kosmetisk: to lagerrækker for én mikrofon, to priser der kunne drive fra
 * hinanden, og to id'er en pakke kunne pege på — så to bookinger af samme
 * mikrofon så ud som to forskellige ting i kalenderen.
 *
 * Testen holder tre ting: ingen nye dubletter, de gamle id'er virker stadig,
 * og de sammenlagte varer er faktisk væk.
 */

const alle = [
  ...speakers.map((p) => ({ id: p.id, pris: p.price, side: p.page, navn: p.da.name, skjult: !!p.hidden })),
  ...addons.map((p) => ({ id: p.id, pris: p.price, side: p.page, navn: p.da.label, skjult: !!p.hidden })),
  ...rentalProducts.map((p) => ({ id: p.id, pris: p.price, side: p.page, navn: p.name_da, skjult: !!p.hidden })),
];

describe("Kataloget har én post pr. ting", () => {
  it("intet id findes to gange", () => {
    const set = new Map<string, number>();
    for (const p of alle) set.set(p.id, (set.get(p.id) ?? 0) + 1);
    const dubletter = [...set].filter(([, n]) => n > 1).map(([id]) => id);
    expect(dubletter, `id'er der står flere gange:\n${dubletter.join("\n")}`).toEqual([]);
  });

  /**
   * To poster med samme produktside OG samme pris er den samme ting skrevet
   * to gange. Det var præcis signaturen på mikrofon-dubletterne.
   */
  /**
   * Ægte varianter, der deler side og pris med vilje.
   *
   * Arket har lyskæde hvid og lyskæde farvet som to linjer til 195 kr, og de
   * bor på samme side. Listen er kort med vilje: dukker et nyt par op, skal
   * nogen tage stilling til, om det er to ting eller én skrevet to gange.
   */
  const VARIANTER = new Set(["/lyskaeder@195"]);

  it("to poster deler ikke både side og pris", () => {
    const set = new Map<string, string[]>();
    for (const p of alle) {
      if (!p.side || p.skjult) continue;
      const nøgle = `${p.side}@${p.pris}`;
      set.set(nøgle, [...(set.get(nøgle) ?? []), `${p.id} (${p.navn})`]);
    }
    const dubletter = [...set]
      .filter(([k, v]) => v.length > 1 && !VARIANTER.has(k))
      .map(([k, v]) => `${k}: ${v.join(" + ")}`);
    expect(
      dubletter,
      `samme side og samme pris — er det den samme ting to gange?\n${dubletter.join("\n")}`,
    ).toEqual([]);
  });

  it("de sammenlagte id'er er væk af kataloget", () => {
    const kendte = new Set(alle.map((p) => p.id));
    for (const gammelt of Object.keys(SAMMENLAGTE_IDER)) {
      expect(kendte.has(gammelt), `${gammelt} findes stadig — så er den ikke lagt sammen`).toBe(false);
    }
  });

  it("hvert sammenlagt id peger på en vare der findes", () => {
    const kendte = new Set(alle.map((p) => p.id));
    for (const [gammelt, nyt] of Object.entries(SAMMENLAGTE_IDER)) {
      expect(kendte.has(nyt), `${gammelt} peger på ${nyt}, som ikke findes`).toBe(true);
      expect(nuvaerendeId(gammelt)).toBe(nyt);
    }
    // Et id der ikke er lagt sammen, går uændret igennem
    expect(nuvaerendeId("soundboks")).toBe("soundboks");
  });
});

describe("Gamle id'er virker stadig", () => {
  it("en gammel ordre kan prissættes, og til den nye vares pris", async () => {
    const table = await loadPriceTable({ get: async () => null } as never);
    for (const [gammelt, nyt] of Object.entries(SAMMENLAGTE_IDER)) {
      const gl = buildLineItems(table, [{ id: gammelt }]).totalOre;
      const ny = buildLineItems(table, [{ id: nyt }]).totalOre;
      expect(gl, `${gammelt} kan ikke prissættes`).toBeGreaterThan(0);
      expect(gl, `${gammelt} koster noget andet end ${nyt}`).toBe(ny);
    }
  });

  it("en gammel ordre tæller på den nye vares hylde", () => {
    for (const [gammelt, nyt] of Object.entries(SAMMENLAGTE_IDER)) {
      expect(expandProductIds([gammelt])).toEqual([nyt]);
    }
  });
});
