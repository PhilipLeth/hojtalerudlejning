/**
 * gallery/hero-sider.json er stemningsbilledernes opgaveliste for scriptet
 * (scripts/product-images/hero-stemning.mjs): sti, prompt og referencefotos,
 * bygget af heroSider() og heroPrompt() i src/lib/heroBilleder.ts. Scriptet er
 * .mjs og kan ikke læse TypeScript, så listen skrives ud her.
 *
 * Er den forældet, fejler testen. Skriv den forfra med:
 *   OPDATER_HERO_SIDER=1 npx vitest run src/__tests__/hero-sider-json.test.ts
 */
import { it, expect } from "vitest";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { heroPrompt, heroReferencer, heroSider, stedFor } from "@/lib/heroBilleder";

const FIL = join(process.cwd(), "gallery", "hero-sider.json");

it("gallery/hero-sider.json følger heroSider()", () => {
  const liste = heroSider().map((s) => ({
    sti: s.sti,
    navn: s.navn,
    sted: stedFor(s),
    referencer: heroReferencer(s),
    prompt: heroPrompt(s),
  }));
  const tekst = JSON.stringify(liste, null, 2) + "\n";
  if (process.env.OPDATER_HERO_SIDER) writeFileSync(FIL, tekst);
  expect(existsSync(FIL), "kør med OPDATER_HERO_SIDER=1").toBe(true);
  expect(readFileSync(FIL, "utf8"), "forældet — kør med OPDATER_HERO_SIDER=1").toBe(tekst);
});
