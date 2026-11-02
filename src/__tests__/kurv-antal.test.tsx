import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import BookingFlow from "@/components/BookingFlow";
import { catalogPrice } from "@/lib/products";
import { vælgDatoer } from "./vaelgDatoer";

beforeEach(() => {
  global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({
    inventory: { soundboks: 4, lys: 3 }, booked: {}, blocked_dates: [],
  }) });
});
afterEach(() => window.history.pushState({}, "", "/"));

async function start(id: string, locale: "da" | "en" = "da") {
  window.history.pushState({}, "", `/book?product=${id}`);
  render(<BookingFlow variant="page" locale={locale} />);
  await screen.findByRole("heading", { name: locale === "en" ? "Choose dates" : "Vælg datoer" });
  return screen.getByRole("group", { name: locale === "en" ? "Your cart" : "Din kurv" });
}

describe("Antal i hele bookingflowet", () => {
  it("viser antal fra første datotrin og samler alle enheder ved checkout", async () => {
    await start("soundboks");
    fireEvent.click(screen.getByLabelText("Én mere"));
    fireEvent.click(screen.getByLabelText("Én mere"));
    expect(within(screen.getByRole("group", { name: "Din kurv" })).getByText(`${3 * catalogPrice("soundboks")} kr`)).toBeInTheDocument();
    expect(vælgDatoer()).toBe(true);
    await waitFor(() => expect(screen.getByRole("button", { name: "Videre" })).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Videre" }));
    expect(await screen.findByText("3 × Soundboks 4")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Videre" }));
    await screen.findByPlaceholderText("Navn");
    expect(screen.getByText("3 × Soundboks 4")).toBeInTheDocument();
    expect(screen.getByText(`${3 * catalogPrice("soundboks")} kr`)).toBeInTheDocument();
  });

  it("kan øge, mindske og fjerne et tilvalg booket alene", async () => {
    await start("lys");
    fireEvent.click(screen.getByLabelText("Én mere"));
    expect(within(screen.getByRole("group", { name: "Din kurv" })).getByText(`${2 * catalogPrice("lys")} kr`)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Én færre"));
    expect(within(screen.getByRole("group", { name: "Din kurv" })).getByText(`${catalogPrice("lys")} kr`)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Fjern"));
    expect(screen.queryByRole("group", { name: "Din kurv" })).not.toBeInTheDocument();
  });

  it("respekterer lagerloftet på tilvalg og åbner plus igen efter minus", async () => {
    await start("lys");
    expect(vælgDatoer()).toBe(true);
    await waitFor(() => expect(screen.getByRole("button", { name: "Videre" })).toBeEnabled());
    fireEvent.click(screen.getByLabelText("Én mere"));
    fireEvent.click(screen.getByLabelText("Én mere"));
    expect(screen.getByLabelText("Én mere")).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Én færre"));
    expect(screen.getByLabelText("Én mere")).toBeEnabled();
  });

  it("viser også antalvalget på engelsk", async () => {
    await start("lys", "en");
    fireEvent.click(screen.getByLabelText("One more"));
    expect(within(screen.getByRole("group", { name: "Your cart" })).getByText(`${2 * catalogPrice("lys")} kr`)).toBeInTheDocument();
    expect(screen.getByText("Use + to rent more than one of the same product")).toBeInTheDocument();
  });
});
