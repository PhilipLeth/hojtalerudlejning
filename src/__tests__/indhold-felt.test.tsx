/**
 * Indhold-feltet i /admin/produkter skal kunne skrives i.
 *
 * Frederik kunne hverken sætte et mellemrum i enden af en linje eller lave et
 * linjeskift: feltet normaliserede værdien ved HVERT tastetryk og sendte den
 * rensede tekst retur, så mellemrummet og den tomme linje forsvandt igen,
 * mens man skrev.
 *
 * Testen prøver komponenten af, ikke hvordan den er skrevet — den forrige
 * udgave af denne fil læste kildeteksten og sprang den rigtige prøve over,
 * hvis komponenten ikke kunne importeres. En test, der består ved ikke at
 * gøre noget, er værre end ingen test.
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { useState } from "react";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import LinjeFelt, { INDHOLD_LABEL, rensLinjer } from "@/components/admin/LinjeFelt";

afterEach(cleanup);

/** Vært der opfører sig som produktkortet: gemmer det rensede og sender det retur. */
function Vært({ start, onGem }: { start: string[]; onGem: (v: string[]) => void }) {
  const [v, setV] = useState<string[]>(start);
  return (
    <LinjeFelt
      label={INDHOLD_LABEL}
      value={v}
      onChange={(n) => {
        setV(n);
        onGem(n);
      }}
    />
  );
}

describe("Indhold-feltet", () => {
  it("lader et mellemrum i enden blive stående, mens man skriver", () => {
    render(<Vært start={["Højtaler"]} onGem={() => {}} />);
    const ta = screen.getByLabelText(INDHOLD_LABEL) as HTMLTextAreaElement;

    fireEvent.change(ta, { target: { value: "Højtaler " } });
    expect(ta.value).toBe("Højtaler ");
  });

  it("lader et linjeskift blive stående, så man kan skrive næste linje", () => {
    render(<Vært start={["Højtaler"]} onGem={() => {}} />);
    const ta = screen.getByLabelText(INDHOLD_LABEL) as HTMLTextAreaElement;

    fireEvent.change(ta, { target: { value: "Højtaler\n" } });
    expect(ta.value).toBe("Højtaler\n");

    fireEvent.change(ta, { target: { value: "Højtaler\nKabel" } });
    expect(ta.value).toBe("Højtaler\nKabel");
  });

  it("sender den rensede liste videre undervejs, så Gem virker uden at klikke ud", () => {
    const gemt: string[][] = [];
    render(<Vært start={["Højtaler"]} onGem={(v) => gemt.push(v)} />);
    const ta = screen.getByLabelText(INDHOLD_LABEL) as HTMLTextAreaElement;

    fireEvent.change(ta, { target: { value: "Højtaler \n\nKabel  \n" } });
    expect(gemt[gemt.length - 1]).toEqual(["Højtaler", "Kabel"]);
  });

  it("viser det, der faktisk er gemt, når feltet forlades", () => {
    render(<Vært start={["Højtaler"]} onGem={() => {}} />);
    const ta = screen.getByLabelText(INDHOLD_LABEL) as HTMLTextAreaElement;

    fireEvent.change(ta, { target: { value: "Højtaler \n\nKabel  \n" } });
    fireEvent.blur(ta);
    expect(ta.value).toBe("Højtaler\nKabel");
  });

  it("vokser med indholdet frem for at stå på to linjer", () => {
    render(<Vært start={["a", "b", "c", "d", "e", "f"]} onGem={() => {}} />);
    const ta = screen.getByLabelText(INDHOLD_LABEL) as HTMLTextAreaElement;
    expect(Number(ta.rows)).toBeGreaterThanOrEqual(6);
  });

  it("siger hvorfor teksten ændrer sig, når man klikker ud", () => {
    render(<Vært start={["Højtaler"]} onGem={() => {}} />);
    expect(screen.getByText(/ryddes væk, når du klikker ud af feltet/)).toBeInTheDocument();
  });
});

describe("rensLinjer", () => {
  it("fjerner mellemrum i enderne og tomme linjer", () => {
    expect(rensLinjer("  Højtaler \n\n  Kabel\n \n")).toEqual(["Højtaler", "Kabel"]);
    expect(rensLinjer("")).toEqual([]);
  });
});

describe("Siderne bruger feltet", () => {
  const kilde = readFileSync(join(process.cwd(), "src/app/admin/produkter/page.tsx"), "utf8");
  const ads = readFileSync(join(process.cwd(), "src/app/admin/ads/opret/page.tsx"), "utf8");

  it("alle tre steder — højtalere, pakker og tilvalg", () => {
    expect((kilde.match(/<LinjeFelt/g) ?? []).length).toBe(3);
  });

  it("normaliserer ikke længere selv ved hvert tastetryk", () => {
    expect(kilde).not.toMatch(/contents \?\? \[\]\)\.join\("\\n"\)/);
    expect(kilde).not.toMatch(/contents: v\s*\n\s*\.split/);
  });

  it("også annoncebyggeren, som havde præcis samme fejl i to felter", () => {
    expect((ads.match(/<LinjeFelt/g) ?? []).length).toBe(2);
    expect(ads).not.toMatch(/headlines\.join\("\\n"\)/);
    expect(ads).not.toMatch(/descriptions\.join\("\\n"\)/);
  });
});
