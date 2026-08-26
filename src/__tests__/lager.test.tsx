/**
 * Lager hører til produktet.
 *
 * Der må kun være ÉN produktlogik: /admin/lager og /admin/produkter skal vise de
 * samme produkter med de samme navne, og serveren skal regne ledighed ud fra de
 * samme tal — uanset om spørgsmålet kommer fra booking-flowet, udsolgt-
 * oversigten, kalenderen eller annoncereglerne.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderAdmin } from "./adminTestUtils";
import LagerPage from "@/app/admin/lager/page";
import ProdukterPage from "@/app/admin/produkter/page";
import {
  derivedStock,
  effectiveStock,
  hasStock,
  missingStock,
  stockItems,
} from "@/lib/stock";
import { speakers, addons, rentalProducts } from "@/lib/products";
import {
  bundlePartsFromCatalog,
  bundleSlots,
  effectiveInventory,
  validateStockPatch,
} from "../../functions/api/_lib/inventory";
import { DEFAULT_INVENTORY } from "../../functions/api/_lib/bookings";
import { BUNDLE_PARTS } from "../../functions/api/_lib/occupancy";

const catalog = { speakers, addons, rentalProducts };

describe("Lagerlisten kommer fra kataloget", () => {
  const items = stockItems(catalog);

  it("dækker alle produkter — ikke kun de ti der stod hardkodet", () => {
    const ids = items.map((i) => i.id);
    // Var med i den gamle liste
    expect(ids).toContain("thumpgo");
    expect(ids).toContain("subwoofer");
    // Var IKKE med — og kunne derfor bookes ubegrænset
    expect(ids).toContain("karaoke");
    expect(ids).toContain("skaerm_55");
    expect(ids).toContain("projektor");
    expect(ids).toContain("uplight");
    expect(items.length).toBeGreaterThan(30);
  });

  it("bruger katalogets navne, så de to sider ikke kan vise forskellige", () => {
    expect(items.find((i) => i.id === "party")?.name).toBe("Lille højtalerpakke");
    expect(items.find((i) => i.id === "rog")?.name).toBe("Røgmaskine");
  });

  it("holder kørsel udenfor — det står ikke på en hylde", () => {
    const ids = items.map((i) => i.id);
    expect(ids).not.toContain("levering_ud");
    expect(ids).not.toContain("afhentning_retur");
    expect(ids).not.toContain("levering_begge");
  });

  it("markerer pakker som sammensat af dele", () => {
    const pakke = items.find((i) => i.id === "pakke_fest_lille")!;
    expect(pakke.parts).toEqual(["party", "lyseffekt"]);
    const enkelt = items.find((i) => i.id === "party")!;
    expect(enkelt.parts).toBeUndefined();
  });
});

describe("Pakkens lager følger delene", () => {
  it("er den snævreste dels antal", () => {
    expect(derivedStock(["party", "lyseffekt"], { party: 2, lyseffekt: 5 })).toBe(2);
    expect(derivedStock(["festival", "lys"], { festival: 2, lys: 2 })).toBe(2);
  });

  it("siger ingenting hvis bare én del mangler tal", () => {
    // Ellers ville vi gætte og kunne afvise en booking vi godt kunne tage
    expect(derivedStock(["party", "lyseffekt"], { party: 2 })).toBeNull();
  });

  it("regnes ikke som manglende lager — pakken har ikke sit eget", () => {
    const items = stockItems(catalog);
    const pakke = items.find((i) => i.id === "pakke_fest_lille")!;
    expect(missingStock([pakke], {})).toEqual([]);
    expect(hasStock(pakke, { party: 1, lyseffekt: 1 })).toBe(true);
    expect(effectiveStock(pakke, { party: 1, lyseffekt: 3 })).toBe(1);
  });

  it("viser hvilke produkter der slet ikke har lagertal", () => {
    const items = stockItems(catalog);
    const missing = missingStock(items, DEFAULT_INVENTORY);
    expect(missing.map((i) => i.id)).toContain("karaoke");
    expect(missing.map((i) => i.id)).not.toContain("party");
  });
});

describe("Serverens lagertal", () => {
  it("lægger admins tal over defaults fra koden", () => {
    const inv = effectiveInventory(JSON.stringify({ party: 5, karaoke: 1 }));
    expect(inv.party).toBe(5);
    expect(inv.karaoke).toBe(1);
    expect(inv.thumpgo).toBe(DEFAULT_INVENTORY.thumpgo);
  });

  it("holder sig til defaults hvis KV er ulæselig", () => {
    expect(effectiveInventory("{ ikke json")).toEqual(effectiveInventory(null));
  });

  it("tager også et allerede parset objekt", () => {
    expect(effectiveInventory({ party: 4 }).party).toBe(4);
  });

  it("fjerner den opfundne combo-SKU", () => {
    expect(effectiveInventory(JSON.stringify({ festival_bas: 3 })).festival_bas).toBeUndefined();
  });

  it("ignorerer vrøvl-værdier frem for at skrive dem videre", () => {
    const inv = effectiveInventory(JSON.stringify({ party: -2, rog: "tre", lys: 3 }));
    expect(inv.party).toBe(DEFAULT_INVENTORY.party);
    expect(inv.rog).toBe(DEFAULT_INVENTORY.rog);
    expect(inv.lys).toBe(3);
  });
});

describe("Pakkedele på serveren", () => {
  it("udledes af kataloget, ikke af en håndholdt tabel", () => {
    // Samme dele som kataloget lover kunden
    expect(BUNDLE_PARTS.pakke_karaoke).toEqual(["karaoke", "skaerm_32", "party"]);
    for (const p of rentalProducts) {
      if (p.bundle?.parts?.length) {
        expect(BUNDLE_PARTS[p.id]).toEqual(p.bundle.parts.map((x) => x.productId));
      }
    }
  });

  it("beholder legacy-comboen fra gamle bookinger", () => {
    expect(BUNDLE_PARTS.festival_bas).toEqual(["festival", "subwoofer"]);
  });

  it("lader et redigeret katalog i KV bestemme delene", () => {
    const parts = bundlePartsFromCatalog(
      JSON.stringify({ rentalProducts: [{ id: "pakke_fest_lille", bundle: { parts: [{ productId: "soundboks" }] } }] }),
    );
    expect(parts.pakke_fest_lille).toEqual(["soundboks"]);
    // De øvrige pakker fra koden er stadig med
    expect(parts.pakke_karaoke).toEqual(["karaoke", "skaerm_32", "party"]);
  });

  it("regner pakkens pladser ud fra den snævreste del", () => {
    const slots = bundleSlots(["festival", "lys"], { festival: 2, lys: 2 }, { festival: 1, lys: 0 });
    expect(slots).toEqual({ total: 2, used: 1 });
  });

  it("lader pakken være ubegrænset hvis en del mangler lagertal", () => {
    expect(bundleSlots(["karaoke", "party"], { party: 2 }, {})).toBeNull();
  });
});

describe("Validering af lagertal", () => {
  it("tager hele tal fra 0 til 999", () => {
    expect(validateStockPatch({ party: 0 })).toEqual({ ok: true, patch: { party: 0 } });
    expect(validateStockPatch({ party: 999 })).toEqual({ ok: true, patch: { party: 999 } });
  });

  it("afviser tastefejl der ville få alt til at se ledigt ud", () => {
    expect(validateStockPatch({ party: 1000000 }).ok).toBe(false);
    expect(validateStockPatch({ party: 2.5 }).ok).toBe(false);
    expect(validateStockPatch({ party: -1 }).ok).toBe(false);
    expect(validateStockPatch({ party: "to" }).ok).toBe(false);
  });

  it("lader null rydde tallet igen", () => {
    expect(validateStockPatch({ party: null })).toEqual({ ok: true, patch: { party: null } });
  });

  it("afviser tom eller ugyldig krop", () => {
    expect(validateStockPatch({}).ok).toBe(false);
    expect(validateStockPatch(null).ok).toBe(false);
    expect(validateStockPatch([1, 2]).ok).toBe(false);
  });
});

/* ───── Siderne ───── */

function mockStorage() {
  const store = new Map<string, string>([["admin_token", "hemmelig"]]);
  const api = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
  Object.defineProperty(window, "localStorage", { value: api, configurable: true });
  Object.defineProperty(window, "sessionStorage", { value: { ...api }, configurable: true });
}

/** Kataloget som gemt i KV + lagertallene, som siderne henter dem */
function mockApi(
  stock: Record<string, number>,
  extra: { overbook?: Record<string, number>; overbooked?: unknown[] } = {},
) {
  (global.fetch as any).mockImplementation((url: string) => {
    const u = String(url);
    if (u.startsWith("/api/inventory")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          inventory: stock,
          overbook: extra.overbook ?? {},
          overbooked: extra.overbooked ?? [],
          blocked: [],
        }),
      });
    }
    if (u.startsWith("/api/products")) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ speakers: null, addons: null, rentalProducts: null }) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ users: [] }) });
  });
}

/** Kroppen af sidste POST til /api/inventory */
function sidsteLagerkald() {
  const kald = (global.fetch as any).mock.calls.filter(
    (c: unknown[]) => String(c[0]).startsWith("/api/inventory") && (c[1] as { method?: string })?.method === "POST",
  );
  return JSON.parse((kald[kald.length - 1][1] as { body: string }).body);
}

beforeEach(() => {
  vi.clearAllMocks();
  mockStorage();
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false,
  })) as any;
});

describe("/admin/lager", () => {
  // Samme grund som i /admin/produkter nedenfor: siden render­er hele
  // kataloget, og første render i jsdom skalerer med det. Denne blev overset,
  // da de tre andre fik mere luft, og faldt derfor sporadisk under fuld
  // parallel kørsel — den render­er lige så meget som dem.
  it("lister produkter fra kataloget — også dem der manglede før", async () => {
    mockApi({ party: 2 });
    renderAdmin(<LagerPage />);
    await waitFor(() => expect(screen.getByText("Lagerbeholdning")).toBeInTheDocument());

    const liste = within(screen.getByLabelText("Lagerliste"));
    expect(liste.getByText("Lille højtalerpakke")).toBeInTheDocument();
    expect(liste.getByText("Karaokemaskine")).toBeInTheDocument();
    expect(liste.getByText('55" Storskærm')).toBeInTheDocument();
  }, 30000);

  it("siger tydeligt hvilke produkter der kan overbookes", async () => {
    mockApi({ party: 2 });
    renderAdmin(<LagerPage />);
    await waitFor(() => expect(screen.getByText(/har ikke noget lagertal/)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: /Sæt \d+ produkter til 1/ })).toBeInTheDocument();
  });

  it("viser pakkens lager som delenes mindste, uden felt at rette i", async () => {
    mockApi({ party: 2, lyseffekt: 1 });
    renderAdmin(<LagerPage />);
    await waitFor(() => expect(screen.getByLabelText("Lagerliste")).toBeInTheDocument());

    const række = rækkeFor("Lille festpakke");
    expect(række.textContent).toMatch(/følger delene: party \+ lyseffekt/);
    expect(række.textContent).toMatch(/1 stk\./);
    expect(række.querySelector('input[type="number"]')).toBeNull();
  });

  it("gemmer kun det produkt man rettede", async () => {
    mockApi({ party: 2, festival: 2 });
    renderAdmin(<LagerPage />);
    await waitFor(() => expect(screen.getByLabelText("Lagerliste")).toBeInTheDocument());

    const felt = feltFor("Lille højtalerpakke");
    fireEvent.change(felt, { target: { value: "4" } });
    fireEvent.blur(felt);

    await waitFor(() => {
      const body = sidsteLagerkald();
      expect(body.action).toBe("set_inventory");
      expect(body.inventory).toEqual({ party: 4 });
    });
  });

  it("har et overbooking-felt pr. produkt ved siden af lageret", async () => {
    mockApi({ rog: 2 }, { overbook: { rog: 2 } });
    renderAdmin(<LagerPage />);
    await waitFor(() => expect(screen.getByLabelText("Lagerliste")).toBeInTheDocument());

    const række = rækkeFor("Røgmaskine");
    const felter = række.querySelectorAll('input[type="number"]');
    expect(felter).toHaveLength(2);
    expect((felter[0] as HTMLInputElement).value).toBe("2");
    expect((felter[1] as HTMLInputElement).value).toBe("2");
    // 2 på lager + 2 der kan skaffes
    expect(række.textContent).toMatch(/tager imod 4/);
  });

  it("gemmer overbooking for sig, så lagertallet ikke røres", async () => {
    mockApi({ rog: 2 });
    renderAdmin(<LagerPage />);
    await waitFor(() => expect(screen.getByLabelText("Lagerliste")).toBeInTheDocument());

    const overbookFelt = rækkeFor("Røgmaskine").querySelectorAll('input[type="number"]')[1];
    fireEvent.change(overbookFelt, { target: { value: "3" } });
    fireEvent.blur(overbookFelt);

    await waitFor(() => {
      const body = sidsteLagerkald();
      expect(body.overbook).toEqual({ rog: 3 });
      expect(body.inventory).toBeUndefined();
    });
  });

  it("viser hvad der skal skaffes, så beskeden ikke kun lever i en push", async () => {
    mockApi({ karaoke: 1 }, {
      overbook: { karaoke: 1 },
      overbooked: [{ id: "karaoke", name: "Karaokemaskine", day: "2026-08-21", booked: 2, owned: 1, missing: 1 }],
    });
    renderAdmin(<LagerPage />);
    await waitFor(() => expect(screen.getByText(/Skal skaffes \(1\)/)).toBeInTheDocument());

    const boks = screen.getByText(/Skal skaffes \(1\)/).closest("div")!;
    expect(boks.textContent).toMatch(/Karaokemaskine/);
    expect(boks.textContent).toMatch(/skaf 1/);
    expect(boks.textContent).toMatch(/2 booket, vi har 1/);
  });

  it("rydder tallet når feltet tømmes — produktet er ubegrænset igen", async () => {
    mockApi({ party: 2 });
    renderAdmin(<LagerPage />);
    await waitFor(() => expect(screen.getByLabelText("Lagerliste")).toBeInTheDocument());

    const felt = feltFor("Lille højtalerpakke");
    fireEvent.change(felt, { target: { value: "" } });
    fireEvent.blur(felt);

    await waitFor(() => expect(sidsteLagerkald().inventory).toEqual({ party: null }));
  });
});

/** Lagerrækken for et produktnavn — afgrænset til lagerlisten */
function rækkeFor(name: string): HTMLElement {
  const liste = screen.getByLabelText("Lagerliste");
  const navn = within(liste).getByText(name);
  // Navn → produktkolonne → hele rækken
  return navn.closest("div")!.parentElement!.parentElement as HTMLElement;
}

/** Lagerfeltet der hører til et produktnavn */
function feltFor(name: string): HTMLInputElement {
  return rækkeFor(name).querySelector('input[type="number"]') as HTMLInputElement;
}

describe("/admin/produkter", () => {
  // Siden render­er hele kataloget, og det bliver ved med at vokse: pakke-
  // stigen, lejlighedspakkerne og senest mixere, lysshow-pakker og
  // højtalertrinnet til 50-100 — 57 produkter mod 40 i august. Første render
  // i jsdom skalerer med det, og 15 sekunder rakte ikke længere under fuld
  // parallel kørsel.
  //
  // Grænsen er hævet frem for at skrumpe mockApi til et lille katalog: de 36
  // tests i filen deler den mock, og et katalog uden fx pakker ville gøre de
  // andre tests svagere for at gøre disse tre hurtigere.
  it("har lagertallet på produktet", async () => {
    mockApi({ party: 2 });
    renderAdmin(<ProdukterPage />);
    await waitFor(() => expect(screen.getAllByText("Lager (antal)").length).toBeGreaterThan(0));
    expect(screen.getAllByText(/lager ikke sat/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/2 stk\./).length).toBeGreaterThan(0);
  }, 30000);

  it("har overbooking ved siden af lageret", async () => {
    mockApi({ party: 2 }, { overbook: { party: 1 } });
    renderAdmin(<ProdukterPage />);
    await waitFor(() => expect(screen.getAllByText("Overbooking (kan skaffes)").length).toBeGreaterThan(0));
    expect(screen.getAllByText(/tager imod 3/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\+1 JIT/).length).toBeGreaterThan(0);
  }, 30000);

  it("gemmer lagertallet med det samme, uden at publicere hele kataloget", async () => {
    mockApi({ thumpgo: 1 });
    renderAdmin(<ProdukterPage />);
    await waitFor(() => expect(screen.getAllByText("Lager (antal)").length).toBeGreaterThan(0));

    const felt = screen.getAllByLabelText("Antal på lager")[0] as HTMLInputElement;
    fireEvent.change(felt, { target: { value: "3" } });
    fireEvent.blur(felt);

    await waitFor(() => {
      const body = sidsteLagerkald();
      expect(body.action).toBe("set_inventory");
      expect(Object.keys(body.inventory)).toHaveLength(1);
    });
    // Kataloget må IKKE være skrevet — det venter på "Gem ændringer"
    const katalogPosts = (global.fetch as any).mock.calls.filter(
      (c: unknown[]) => String(c[0]).startsWith("/api/products") && (c[1] as { method?: string })?.method === "POST",
    );
    expect(katalogPosts).toHaveLength(0);
  }, 30000);
});

describe("Ingen anden produktliste tilbage", () => {
  const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

  it("lagersiden har ingen hardkodet produktliste eller navnetabel", () => {
    const src = read("src/app/admin/lager/page.tsx");
    expect(src).not.toMatch(/PRODUCT_IDS/);
    expect(src).not.toMatch(/PRODUCT_LABELS/);
    expect(src).not.toMatch(/thumpgo/);
    expect(src).toContain("stockItems");
  });

  it("ledighed til kunden regnes med den delte logik", () => {
    const src = read("functions/api/availability.ts");
    expect(src).toContain("bookedProductIds");
    expect(src).toContain("expandProductIds");
    // Lagertal hentes gennem den delte lib, ikke læst direkte fra KV
    expect(src).toContain("loadInventoryPair");
    // Ingen egen kopi af lager, produktnavne eller tilvalgs-mapning
    expect(src).not.toMatch(/const DEFAULT_INVENTORY/);
    expect(src).not.toMatch(/addonNameToId/);
    expect(src).not.toMatch(/speakerNameToId/);
  });

  it("alle endpoints læser lager gennem den delte lib", () => {
    for (const f of [
      "functions/api/soldout.ts",
      "functions/api/occupancy.ts",
      "functions/api/ads.ts",
      "functions/api/ads-rules.ts",
      "functions/api/udsalg.ts",
      "functions/api/udsalg-aktiv.ts",
      "functions/api/_lib/discounts.ts",
      "functions/api/_lib/channels.ts",
    ]) {
      const src = read(f);
      expect(src, f).toMatch(/effectiveInventory|loadInventoryPair/);
      expect(src, f).not.toMatch(/\{ \.\.\.DEFAULT_INVENTORY/);
    }
  });
});
