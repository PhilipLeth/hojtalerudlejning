/**
 * "Findes ikke"-fejl må ikke kunne nå produktion.
 *
 * next.config.ts har ignoreBuildErrors, så byggeriet siger god for kode, som
 * TypeScript allerede har afvist. Det kostede os en ReferenceError på
 * kvitteringsskærmen: bookingen blev gemt, mailen sendt, og kunden så et brud
 * og bestilte igen. TS2304 havde peget direkte på linjen hele tiden.
 *
 * Denne test er smal med vilje. Den låser IKKE hele typetjekket (der ligger en
 * håndfuld gamle strenghedsfejl i testfiler og tredjeparts-typer), men fanger
 * den ene kategori, der ALTID er en ægte fejl: en variabel der ikke findes.
 */
import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";

/**
 * Navne der mangler, fordi typerne ikke er i scope — ikke fordi koden er gal.
 *
 * Cloudflares egne typer (KVNamespace, R2Bucket …) findes kun i Workers-
 * runtimet; de bruges i tests af serverkoden. Skal de tjekkes rigtigt, skal
 * @cloudflare/workers-types installeres og med i tsconfig — det er en oprydning
 * for sig, og den ville samtidig gøre hele functions/ typetjekket.
 */
const AMBIENTE_TYPER = ["KVNamespace", "R2Bucket", "PagesFunction", "ExecutionContext", "vi"];

describe("TypeScript-fejl der altid er ægte", () => {
  it("ingen 'Cannot find name' i klientkoden", () => {
    let output = "";
    try {
      execFileSync("npx", ["tsc", "--noEmit"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    } catch (e) {
      output = String((e as { stdout?: string }).stdout ?? "");
    }

    const fejl = output
      .split("\n")
      .filter((l) => l.includes("TS2304"))
      // functions/ mangler Cloudflares egne typer (KVNamespace, PagesFunction …)
      .filter((l) => !l.startsWith("functions/"))
      .filter((l) => !AMBIENTE_TYPER.some((navn) => l.includes(`Cannot find name '${navn}'`)));

    expect(fejl, `Ukendte navne i koden:\n${fejl.join("\n")}`).toEqual([]);
  }, 120000);
});
