import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ProductVideo from "@/components/ProductVideo";

// useProducts henter /api/products — mock kataloget med en video på projektor.
// (Modulet cacher svaret, men hver testfil har sit eget modul-registry i vitest.)
const CATALOG = {
  speakers: null,
  addons: null,
  rentalProducts: [
    {
      id: "projektor",
      category: "av",
      price: 495,
      image: "/images/product-projektor.png",
      name_da: "Projektor",
      name_en: "Projector",
      video: "/api/video/vid_test123",
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  (global.fetch as any).mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(CATALOG),
  });
});

describe("ProductVideo", () => {
  it("viser play-knap når produktet har video i kataloget", async () => {
    render(<ProductVideo productId="projektor" name="Projektor" />);
    await waitFor(() => {
      expect(screen.getByLabelText("Se video af Projektor")).toBeInTheDocument();
    });
    expect(screen.getByText("Se video")).toBeInTheDocument();
  });

  it("åbner modal med videoafspiller ved klik og lukker igen", async () => {
    render(<ProductVideo productId="projektor" name="Projektor" />);
    const playBtn = await screen.findByLabelText("Se video af Projektor");
    fireEvent.click(playBtn);

    const video = document.querySelector("video");
    expect(video).toBeTruthy();
    expect(video!.getAttribute("src")).toBe("/api/video/vid_test123");
    expect(video!.hasAttribute("controls")).toBe(true);

    fireEvent.click(screen.getByLabelText("Luk video"));
    expect(document.querySelector("video")).toBeNull();
  });

  it("renderer intet for produkter uden video", async () => {
    const { container } = render(<ProductVideo productId="soundboks" name="Soundboks 4" />);
    // Giv katalog-hentningen tid til at lande (useProducts cacher på modulniveau,
    // så fetch kaldes ikke nødvendigvis igen i denne test)
    await new Promise((r) => setTimeout(r, 50));
    expect(container.innerHTML).toBe("");
    expect(screen.queryByText("Se video")).not.toBeInTheDocument();
  });
});
