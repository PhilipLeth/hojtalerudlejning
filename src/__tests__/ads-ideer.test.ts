/**
 * Idésøgningen skal komme hele kataloget igennem — og kun vise sider, vi
 * rent faktisk må sende trafik til.
 */
import { describe, it, expect } from "vitest";
import { annonceerbare, udsnit } from "../../functions/api/ads-ideas";
import { PAUSEDE_SIDER } from "@/lib/products";
import type { CatalogProduct } from "../../functions/api/_lib/catalog";

const p = (id: string, page: string | null, hidden = false): CatalogProduct =>
  ({ id, name: id, price: 100, page, hidden });

describe("udsnit", () => {
  const alle = ["a", "b", "c", "d", "e", "f", "g"];

  it("tager de første i runde 0", () => {
    expect(udsnit(alle, 0, 3)).toEqual(["a", "b", "c"]);
  });

  it("går videre i næste runde", () => {
    expect(udsnit(alle, 1, 3)).toEqual(["d", "e", "f"]);
  });

  it("ruller rundt frem for at løbe tør", () => {
    // Syv sider, tre ad gangen: tredje runde tager den sidste og starter forfra
    expect(udsnit(alle, 2, 3)).toEqual(["g", "a", "b"]);
  });

  it("kommer hele kataloget igennem", () => {
    const set = new Set<string>();
    for (let r = 0; r < 3; r++) for (const x of udsnit(alle, r, 3)) set.add(x);
    expect(set.size).toBe(alle.length);
  });

  it("tåler et tomt katalog og et udsnit større end det", () => {
    expect(udsnit([], 5, 3)).toEqual([]);
    expect(udsnit(["a"], 4, 3)).toEqual(["a"]);
  });
});

describe("annonceerbare", () => {
  it("kræver en produktside", () => {
    expect(annonceerbare([p("taske", null), p("sb4", "/soundboks-4")]).map((x) => x.id)).toEqual(["sb4"]);
  });

  it("springer skjulte produkter over", () => {
    expect(annonceerbare([p("skjult", "/skjult", true)])).toEqual([]);
  });

  it("springer sider vi har taget af sortimentet over", () => {
    const pauset = PAUSEDE_SIDER[0];
    expect(pauset, "der skal findes mindst én pauset side").toBeTruthy();
    expect(annonceerbare([p("x", pauset)])).toEqual([]);
  });
});
