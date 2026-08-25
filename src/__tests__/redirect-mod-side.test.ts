/**
 * En redirect må ikke skygge for en side, der findes.
 *
 * /hojtalerpakke-bas blev redirected til /subwoofer, da produktet
 * festival_bas udgik (ec8fc82). Da Højtaler 100 kom tilbage 25. august 2026,
 * lå redirect'en der stadig: siden blev bygget, deployet og var alligevel
 * utilgængelig — Cloudflare svarer på _redirects, før den leder efter filen.
 *
 * Det er ikke til at se i en diff, og build'et siger ingenting. Derfor denne.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

describe("_redirects", () => {
  const linjer = readFileSync(join(process.cwd(), "public/_redirects"), "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));

  it("omdirigerer ingen sti, der har sin egen side", () => {
    const skygget: string[] = [];
    for (const linje of linjer) {
      const fra = linje.split(/\s+/)[0];
      if (!fra.startsWith("/") || fra.includes("*")) continue;
      const side = join(process.cwd(), "src/app", fra.slice(1), "page.tsx");
      if (existsSync(side)) skygget.push(`${fra} → siden findes i src/app${fra}/page.tsx`);
    }
    expect(skygget, `redirects skygger for ægte sider:\n${skygget.join("\n")}`).toEqual([]);
  });
});
