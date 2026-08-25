/**
 * Mixerne — og hvad der sker med et produkt uden foto.
 *
 * De kom i kataloget som prisliste-punkter uden andet indhold. Frederik
 * fortalte hvad de faktisk er: den store er en Yamaha med effekter, den lille
 * en simpel 4-kanals. Fotos mangler stadig.
 *
 * Det farlige er ikke det manglende foto, men fallbacken: CategoryProductGrid
 * faldt tilbage på lys-pakkens billede, så en mixer blev vist som en
 * lyseffekt. Et forkert billede er værre end intet.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { addons } from "@/lib/products";

const mixere = addons.filter((a) => a.id.startsWith("mixer_"));

describe("Mixerne", () => {
  it("findes i begge størrelser til 295 og 395 kr", () => {
    expect(mixere.map((m) => m.id).sort()).toEqual(["mixer_lille", "mixer_stor"]);
    expect(addons.find((a) => a.id === "mixer_lille")!.price).toBe(295);
    expect(addons.find((a) => a.id === "mixer_stor")!.price).toBe(395);
  });

  it("beskriver hvad de er — ikke bare at de er mixere", () => {
    const lille = addons.find((a) => a.id === "mixer_lille")!;
    const stor = addons.find((a) => a.id === "mixer_stor")!;
    expect(lille.da.desc).toMatch(/4-kanals/);
    expect(stor.da.desc).toMatch(/Yamaha/);
    // Effekterne er grunden til at vælge den store — de skal stå der
    expect(stor.da.desc).toMatch(/effekt/i);
    for (const m of mixere) expect(m.contents?.length).toBeGreaterThan(0);
  });

  it("har en side at pege på", () => {
    for (const m of mixere) expect(m.page).toBe("/mixer");
  });

  it("står uden billede frem for med et lånt", () => {
    for (const m of mixere) expect(m.image).toBeNull();
  });
});

describe("Produkt uden foto", () => {
  const src = readFileSync(join(process.cwd(), "src/components/CategoryProductGrid.tsx"), "utf8");

  it("låner ikke et andet produkts billede", () => {
    // Den gamle fallback. Kommer den igen, viser mixeren en lyseffekt.
    expect(src).not.toContain('ad.image ?? "/images/product-lys.webp"');
    expect(src).not.toMatch(/image:\s*\w+\.image\s*\?\?\s*"/);
  });

  it("viser navnet i stedet, når der ikke er noget billede", () => {
    expect(src).toMatch(/p\.image \?[\s\S]{0,600}\{p\.name\}/);
  });
});
