/**
 * Én menu for hele admin. Før havde hver side sin egen håndplukkede stribe
 * links — Rabatkoder pegede på Ads og Regler, Lejeseddel på Lager og
 * Nyhedsbrev — så man ikke kunne komme fra A til B uden om forsiden.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
      "Økonomi",
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
    // Regnskabet ligger uden for /admin, men hører til i menuen
    expect(hrefs).toContain("/accounting");
  });

  it("navngiver siden ud fra stien", () => {
    expect(adminPageTitle("/admin")).toBe("Bookinger");
    expect(adminPageTitle("/admin/rabatkoder")).toBe("Rabatkoder");
  });
});

describe("AdminNav", () => {
  it("viser én knap pr. gruppe i stedet for fjorten links", () => {
    render(<AdminNav />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    for (const g of ADMIN_MENU) {
      expect(screen.getByRole("button", { name: new RegExp(g.group) })).toBeInTheDocument();
    }
  });

  it("markerer gruppen man står i, og skriver sidens navn på knappen", () => {
    render(<AdminNav />);
    const btn = screen.getByRole("button", { name: /Katalog & priser/ });
    expect(btn).toHaveTextContent("Rabatkoder");
  });

  it("folder gruppens sider ud ved klik og markerer den aktuelle", () => {
    render(<AdminNav />);
    fireEvent.click(screen.getByRole("button", { name: /Katalog & priser/ }));

    const menu = screen.getByRole("menu", { name: "Katalog & priser" });
    expect(menu).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Produkter/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /Rabatkoder/ })).toHaveAttribute("aria-current", "page");
    // Sider fra andre grupper er ikke fremme
    expect(screen.queryByRole("menuitem", { name: /Nyhedsbrev/ })).not.toBeInTheDocument();
  });

  it("lukker igen på Escape og når man klikker udenfor", () => {
    render(<AdminNav />);
    const open = () => fireEvent.click(screen.getByRole("button", { name: /Drift/ }));

    open();
    expect(screen.getByRole("menu", { name: "Drift" })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    open();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("kun én gruppe er åben ad gangen", () => {
    render(<AdminNav />);
    fireEvent.click(screen.getByRole("button", { name: /Drift/ }));
    fireEvent.click(screen.getByRole("button", { name: /Markedsføring/ }));
    expect(screen.getAllByRole("menu")).toHaveLength(1);
    expect(screen.getByRole("menu", { name: "Markedsføring" })).toBeInTheDocument();
  });

  it("folder til én grupperet dropdown på telefon", () => {
    setViewport(true);
    const { container } = render(<AdminNav />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    const select = screen.getByLabelText("Gå til admin-side") as HTMLSelectElement;
    expect(select.value).toBe("/admin/rabatkoder");
    expect([...container.querySelectorAll("optgroup")].map((o) => o.label)).toEqual([
      "Drift", "Katalog & priser", "Markedsføring", "Økonomi", "System",
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
