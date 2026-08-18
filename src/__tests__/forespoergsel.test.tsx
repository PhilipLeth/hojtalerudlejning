/**
 * Forespørgsel på et arrangement: at de fem oplysninger vi altid mangler
 * rent faktisk kommer med i mailen, og at vejen fra "det her er for stort til
 * en bookingknap" til formularen ikke ender blindt.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EventInquiryForm, { emnelinje, sammensaetBesked } from "@/components/EventInquiryForm";
import { LADDER_FEST, LADDER_TALE } from "@/lib/products";

const receptionen = {
  dato: "2026-09-10",
  gaester: "80",
  sted: "Rådhuspladsen 1, indendørs",
  type: "Reception",
  behov: ["Lyd og højtalere", "Mikrofoner til taler", "Lys"],
  firma: "",
  besked: "",
};

describe("sammensaetBesked", () => {
  it("får alle fem oplysninger med i mailen", () => {
    const t = sammensaetBesked(receptionen);
    expect(t).toContain("Dato: 2026-09-10");
    expect(t).toContain("Antal gæster: 80");
    expect(t).toContain("Sted: Rådhuspladsen 1, indendørs");
    expect(t).toContain("Type: Reception");
    expect(t).toContain("Skal vi sørge for: Lyd og højtalere, Mikrofoner til taler, Lys");
  });

  it("skriver 'ikke oplyst' frem for at efterlade et tomt felt", () => {
    const t = sammensaetBesked({ ...receptionen, sted: "", behov: [] });
    expect(t).toContain("Sted: ikke oplyst");
    expect(t).toContain("Skal vi sørge for: ikke valgt");
  });

  it("tager firma og fritekst med når de er udfyldt", () => {
    const t = sammensaetBesked({ ...receptionen, firma: "Acme A/S · EAN 5790000000000", besked: "Tre taler" });
    expect(t).toContain("Firma / EAN: Acme A/S · EAN 5790000000000");
    expect(t).toContain("Tre taler");
  });
});

describe("emnelinje", () => {
  it("sætter gæstetallet i emnefeltet, så indbakken kan se størrelsen", () => {
    expect(emnelinje({ gaester: "80", type: "Reception" })).toBe("Forespørgsel · 80 gæster · Reception");
  });

  it("holder sig under serverens 40 tegn", () => {
    expect(emnelinje({ gaester: "1000", type: "Firmafest / julefrokost" }).length).toBeLessThanOrEqual(40);
  });
});

describe("EventInquiryForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sender arrangementet til /api/contact og kvitterer", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<EventInquiryForm />);

    await user.type(screen.getByLabelText(/Hvornår/), "2026-09-10");
    await user.type(screen.getByLabelText(/Hvor mange gæster/), "80");
    await user.type(screen.getByLabelText(/Hvor foregår det/), "Rådhuspladsen 1");
    await user.selectOptions(screen.getByLabelText(/Hvad er det for et arrangement/), "Reception");
    await user.click(screen.getByRole("button", { name: "Mikrofoner til taler" }));
    await user.type(screen.getByLabelText(/^Navn/), "Mette Hansen");
    await user.type(screen.getByLabelText(/^Email/), "mette@firma.dk");
    await user.click(screen.getByRole("button", { name: /Send forespørgsel/ }));

    await waitFor(() => expect(screen.getByTestId("forespoergsel-sendt")).toBeInTheDocument());

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/contact");
    expect(body.name).toBe("Mette Hansen");
    expect(body.email).toBe("mette@firma.dk");
    expect(body.topic).toContain("80 gæster");
    expect(body.message).toContain("Antal gæster: 80");
    expect(body.message).toContain("Mikrofoner til taler");
  });

  it("viser fejlen fra serveren i stedet for at kvittere", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Ugyldig emailadresse" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );
    const user = userEvent.setup();
    render(<EventInquiryForm />);
    await user.type(screen.getByLabelText(/Hvornår/), "2026-09-10");
    await user.type(screen.getByLabelText(/Hvor mange gæster/), "80");
    await user.type(screen.getByLabelText(/Hvor foregår det/), "Rådhuspladsen 1");
    await user.selectOptions(screen.getByLabelText(/Hvad er det for et arrangement/), "Reception");
    await user.type(screen.getByLabelText(/^Navn/), "Mette");
    await user.type(screen.getByLabelText(/^Email/), "mette@firma.dk");
    await user.click(screen.getByRole("button", { name: /Send forespørgsel/ }));

    await waitFor(() => expect(screen.getByText("Ugyldig emailadresse")).toBeInTheDocument());
    expect(screen.queryByTestId("forespoergsel-sendt")).toBeNull();
  });
});

describe("Vejen til forespørgslen", () => {
  it("stigens tilbudstrin peger på formularen, ikke bare på siden", () => {
    for (const trin of [...LADDER_FEST, ...LADDER_TALE].filter((t) => t.productId === null)) {
      expect(trin.href, `${trin.navn} sender folk til en side uden formular`).toBe("/erhverv#tilbud");
    }
  });

  it("/erhverv har formularen med det id de peger på", () => {
    const kilde = fs.readFileSync("src/app/erhverv/page.tsx", "utf8");
    expect(kilde).toContain('id="tilbud"');
    expect(kilde).toContain("<EventInquiryForm />");
  });

  it("ingen af pakkesiderne sender tilbud til den gamle blinde vej", () => {
    for (const side of ["festpakke-250", "konferencepakke-150"]) {
      const kilde = fs.readFileSync(`src/app/${side}/page.tsx`, "utf8");
      expect(kilde, `${side} peger på /erhverv uden anker`).not.toMatch(/href="\/erhverv"/);
    }
  });
});
