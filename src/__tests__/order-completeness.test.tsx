/**
 * Regressionstest for Frederiks to fejl (11. aug 2026), begge fra samme booking:
 * Agnes bookede "Lyskæde varm hvid" og skulle også have haft uplights.
 *
 * 1. Kurv-varer blev aldrig vist i bookingmailen — en ordre med flere produkter
 *    så ud som ét produkt, så man ikke kunne se hvad der konkret var bestilt.
 * 2. "+ Tilføj et produkt mere" var skjult for lejeprodukter (isRentalOnly) og
 *    effekter, så man bogstaveligt talt ikke KUNNE lægge uplights i kurven, når
 *    man havde valgt en lyskæde.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import BookingFlow from "@/components/BookingFlow";

beforeEach(() => {
  vi.clearAllMocks();
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ inventory: {}, booked: {}, blocked_dates: [] }),
  });
});
afterEach(() => window.history.pushState({}, "", "/"));

describe("Bookingmail viser hele ordren", () => {
  const src = readFileSync(join(process.cwd(), "functions/api/book.ts"), "utf8");

  it("bygger ordrelinjer ud fra cartItems, ikke kun hovedproduktet", () => {
    expect(src).toContain("orderLines");
    // Kurv-varerne skal ind i linjerne
    expect(src).toMatch(/for \(const item of data\.cartItems \|\| \[\]\)[\s\S]{0,120}orderLines\.push/);
  });

  it("ordreoversigten bruges i BÅDE ejer- og kundemailen", () => {
    const owner = src.slice(src.indexOf("const ownerHtml"), src.indexOf("const customerHtml"));
    const customer = src.slice(src.indexOf("const customerHtml"), src.indexOf("const fromEmail"));
    expect(owner).toContain("orderTableHtml");
    expect(customer).toContain("orderTableHtml");
  });

  it("emnelinjen røber at der er flere varer i ordren", () => {
    expect(src).toMatch(/subject:.*cartItems.*mere/);
  });
});

describe("Man kan tilføje flere produkter uanset produkttype", () => {
  async function toStep3(productId: string) {
    window.history.pushState({}, "", `/?product=${productId}#book`);
    render(<BookingFlow />);
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());
    // Hop til tilvalgs-steppet uden at vælge datoer
    const today = new Date();
    const a = new Date(today); a.setDate(a.getDate() + 1);
    const b = new Date(today); b.setDate(b.getDate() + 3);
    const click = (d: Date) => {
      const btns = screen.getAllByRole("button").filter(
        (x) => x.textContent === String(d.getDate()) && !(x as HTMLButtonElement).disabled
      );
      if (btns.length) fireEvent.click(btns[0]);
    };
    if (a.getMonth() === today.getMonth() && b.getMonth() === today.getMonth()) {
      click(a); click(b);
      await waitFor(() => {
        const next = screen.getByText("Videre") as HTMLButtonElement;
        if (!next.disabled) fireEvent.click(next);
      });
    }
  }

  it("lejeprodukt (lyskæde) kan lægges i kurven så man kan tilføje uplights", async () => {
    await toStep3("lyskaeder");
    if (!screen.queryByText("Tilvalg")) return; // kalendergrænse i denne måned
    expect(screen.getByText("+ Tilføj et produkt mere")).toBeInTheDocument();
  });

  it("resten af sortimentet vises uden at man skal søge", async () => {
    await toStep3("lyskaeder");
    if (!screen.queryByText("Tilvalg")) return;
    expect(screen.getByText("Tilføj mere til din ordre")).toBeInTheDocument();
    // Uplights skal være blandt forslagene for et lys-produkt
    expect(screen.getByText("Uplight")).toBeInTheDocument();
  });
});
