/**
 * Én menu for hele admin. Før havde hver side sin egen håndplukkede stribe
 * links — Rabatkoder pegede på Ads og Regler, Lejeseddel på Lager og
 * Nyhedsbrev — så man ikke kunne komme fra A til B uden om forsiden.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import AdminNav, { ADMIN_MENU, adminPageTitle } from "@/components/AdminNav";

let pathname = "/admin/rabatkoder";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

function setViewport(mobile: boolean) {
  window.matchMedia = ((q: string) => ({
    matches: mobile, media: q, addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false,
  })) as any;
}

beforeEach(() => {
  pathname = "/admin/rabatkoder";
  setViewport(false);
});

describe("Menustrukturen", () => {
  it("er grupperet efter hvad man er i gang med", () => {
    expect(ADMIN_MENU.map((g) => g.group)).toEqual([
      "Drift",
      "Katalog & priser",
      "Markedsføring",
      "System",
    ]);
  });

  it("har hver admin-side med præcis én gang", () => {
    const hrefs = ADMIN_MENU.flatMap((g) => g.items.map((i) => i.href));
    expect(new Set(hrefs).size).toBe(hrefs.length);

    const pages = readdirSync(join(process.cwd(), "src/app/admin"), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => `/admin/${d.name}`);
    for (const page of pages) {
      expect(hrefs, `${page} mangler i menuen`).toContain(page);
    }
    expect(hrefs).toContain("/admin");
  });

  it("navngiver siden ud fra stien", () => {
    expect(adminPageTitle("/admin")).toBe("Bookinger");
    expect(adminPageTitle("/admin/rabatkoder")).toBe("Rabatkoder");
  });
});

describe("AdminNav", () => {
  it("viser alle sider som links på skærm og markerer den aktuelle", () => {
    render(<AdminNav />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(ADMIN_MENU.flatMap((g) => g.items).length);
    expect(screen.getByRole("link", { name: "Rabatkoder" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Bookinger" })).not.toHaveAttribute("aria-current");
  });

  it("folder til én grupperet dropdown på telefon", () => {
    setViewport(true);
    const { container } = render(<AdminNav />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    const select = screen.getByLabelText("Gå til admin-side") as HTMLSelectElement;
    expect(select.value).toBe("/admin/rabatkoder");
    expect([...container.querySelectorAll("optgroup")].map((o) => o.label)).toEqual([
      "Drift", "Katalog & priser", "Markedsføring", "System",
    ]);
  });

  it("tager sidens eget navn når intet er angivet", () => {
    const { container } = render(<AdminNav />);
    expect(container.querySelector("strong")).toHaveTextContent("Rabatkoder");
  });
});

describe("Alle admin-sider bruger den fælles menu", () => {
  const dir = join(process.cwd(), "src/app/admin");
  const pages = [
    "page.tsx",
    ...readdirSync(dir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => `${d.name}/page.tsx`),
  ];

  for (const page of pages) {
    it(`${page} har AdminNav og ingen egen linkstribe`, () => {
      const src = readFileSync(join(dir, page), "utf8");
      expect(src).toContain("AdminNav");
      // Egne navigations-chips i en header er præcis det der gjorde menuen
      // forskellig fra side til side. Links inde i brødtekst er fine.
      const navChips = src
        .split("\n")
        .filter((l) => /<a\s+href="\/admin/.test(l))
        .filter((l) => /style=\{(navLink|\{ padding)/.test(l));
      expect(navChips, `${page} har sin egen linkstribe:\n${navChips.join("\n")}`).toHaveLength(0);
    });
  }
});
