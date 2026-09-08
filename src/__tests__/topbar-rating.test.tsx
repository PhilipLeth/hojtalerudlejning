/**
 * Google-ratingen i topbåndet.
 *
 * Fem stjerner øverst på siden er et løfte, og det må kun stå der, når Google
 * rent faktisk har givet os tallet. Båndet ligger i root-layoutet og rammer
 * derfor hver eneste side — også admin, som ikke skal hente anmeldelser.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import TopBar from "@/components/TopBar";
import { __nulstilAnmeldelsesCache } from "@/lib/useGoogleReviews";

let pathname = "/";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

const SVAR = {
  rating: 5,
  total: 4,
  url: "https://maps.google.com/?cid=1",
  fetchedAt: "2026-09-08T08:00:00Z",
  reviews: [
    { author: "Anne Bjørn", rating: 5, text: "Nemt at booke.", relative: "for én uge siden", publishTime: "2026-09-01T10:00:00Z" },
  ],
};

function mockSvar(json: unknown) {
  global.fetch = vi.fn(async () => ({ ok: true, json: async () => json })) as any;
}

beforeEach(() => {
  pathname = "/";
  __nulstilAnmeldelsesCache();
});

afterEach(() => cleanup());

describe("Topbåndet", () => {
  it("viser ratingen med link til profilen", async () => {
    mockSvar(SVAR);
    render(<TopBar />);

    const link = (await screen.findAllByText("5,0 på Google"))[0].closest("a");
    expect(link).toHaveAttribute("href", "https://maps.google.com/?cid=1");
    // Google skal åbne i ny fane — kunden må ikke miste sin booking
    expect(link).toHaveAttribute("target", "_blank");
    expect(link?.getAttribute("rel")).toContain("noopener");
  });

  it("skriver ikke stjerner vi ikke har fået", async () => {
    mockSvar({ rating: null, total: 0, url: null, reviews: [], fetchedAt: "" });
    render(<TopBar />);

    await waitFor(() => expect(screen.getAllByText(/Sikker onlinebetaling/)[0]).toBeInTheDocument());
    expect(screen.queryByText(/på Google/)).not.toBeInTheDocument();
  });

  it("skriver tallet på engelsk med punktum på /en", async () => {
    pathname = "/en";
    mockSvar(SVAR);
    render(<TopBar />);

    expect((await screen.findAllByText("5.0 on Google"))[0]).toBeInTheDocument();
  });

  it("henter ikke anmeldelser i admin", async () => {
    pathname = "/admin/bookinger";
    mockSvar(SVAR);
    const { container } = render(<TopBar />);

    expect(container).toBeEmptyDOMElement();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
