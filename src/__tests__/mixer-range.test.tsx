import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MixerRange from "../components/MixerRange";

vi.mock("@/lib/useProducts", async () => {
  const { addons } = await import("../lib/products");
  return { useProducts: () => ({ addons: addons.filter((a) => !a.hidden) }) };
});

describe("Tre mixerklasser", () => {
  it("sender kun den bekræftede model til booking", () => {
    render(<MixerRange locale="da" />);
    const book = screen.getAllByRole("link", { name: "Book mixer" });
    expect(book).toHaveLength(1);
    expect(book[0]).toHaveAttribute("href", "/?product=mixer_stor#book");
    const requests = screen.getAllByRole("link", { name: "Forespørg på mixer" });
    expect(requests).toHaveLength(2);
    for (const link of requests) expect(link).toHaveAttribute("href", "/kontakt");
  });
  it("fører engelske kunder til den engelske kontakt- og bookingside", () => {
    render(<MixerRange locale="en" />);
    expect(screen.getByRole("link", { name: "Book mixer" })).toHaveAttribute("href", "/en?product=mixer_stor#book");
    for (const link of screen.getAllByRole("link", { name: "Ask about this mixer" })) {
      expect(link).toHaveAttribute("href", "/en/kontakt");
    }
  });
});
