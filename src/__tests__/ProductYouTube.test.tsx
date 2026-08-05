import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import ProductYouTube from "@/components/ProductYouTube";

const CATALOG = {
  speakers: [
    {
      id: "thumpgo",
      price: 345,
      product: "/images/product-thumpgo.png",
      mood: "/images/mood-party.png",
      power: "batteri",
      sizeClass: "lille",
      weight: "10 kg",
      youtubeUrl: "https://www.youtube.com/watch?v=0M7xZoiqn9U",
      da: { name: "Mackie Thump GO", size: "", capacity: "", desc: "", extra: "" },
      en: { name: "Mackie Thump GO", size: "", capacity: "", desc: "", extra: "" },
    },
  ],
  addons: null,
  rentalProducts: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(CATALOG),
  });
});

describe("ProductYouTube", () => {
  it("viser YouTube-embed når produktet har youtubeUrl", async () => {
    render(<ProductYouTube productId="thumpgo" name="Mackie Thump GO" />);
    await waitFor(() => {
      expect(screen.getByText("Se mere fra producenten")).toBeInTheDocument();
    });
    const iframe = document.querySelector("iframe");
    expect(iframe).toBeTruthy();
    expect(iframe!.getAttribute("src")).toBe("https://www.youtube-nocookie.com/embed/0M7xZoiqn9U");
    expect(iframe!.getAttribute("title")).toBe("YouTube-video om Mackie Thump GO");
  });

  it("renderer intet for produkter uden youtubeUrl", async () => {
    const { container } = render(<ProductYouTube productId="soundboks" name="Soundboks 4" />);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.innerHTML).toBe("");
  });
});
