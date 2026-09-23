import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import LivePrice from "@/components/LivePrice";

/**
 * Ét kald til /api/products pr. sideindlæsning, uanset hvor mange komponenter
 * der spørger.
 *
 * 22 komponenter bruger useProducts(). De mounter i samme tick, og fordi
 * hentningen kun havde en `cached`-variabel — sat FØRST når svaret kom — så de
 * alle sammen null og hentede hver for sig. Målt på produktionssitet: ti kald
 * til det samme endpoint på /festlys, fem på /lyskaeder.
 *
 * Det er ikke bare spildt trafik. Priserne på kortene venter på det svar, så
 * på en langsom forbindelse er det ti rundture, før siden står rigtigt — og
 * det er den slags, Googles "landingssideoplevelse" måler.
 */

const KATALOG = { speakers: [], addons: [], rentalProducts: [] };

describe("Kataloget hentes én gang", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("ti samtidige komponenter giver ét kald", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => KATALOG }) as unknown as Response);
    vi.stubGlobal("fetch", fetchMock);

    const { default: Live } = await import("@/components/LivePrice");
    render(
      <>
        {Array.from({ length: 10 }, (_, i) => (
          <Live key={i} productId="soundboks" />
        ))}
      </>,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const katalogKald = fetchMock.mock.calls.filter((c) => String(c[0]).includes("/api/products"));
    expect(
      katalogKald.length,
      `ti komponenter udløste ${katalogKald.length} kald til /api/products`,
    ).toBe(1);
  });

  it("komponenten viser en pris uden at vente på svaret", () => {
    vi.stubGlobal("fetch", vi.fn(() => new Promise(() => {})));
    const { container } = render(<LivePrice productId="soundboks" prefix="" suffix=" kr" />);
    // Katalogprisen står i HTML'en med det samme — ellers ville Google og
    // kunden se en tom plads, indtil hentningen er færdig
    expect(container.textContent).toMatch(/\d/);
  });
});
