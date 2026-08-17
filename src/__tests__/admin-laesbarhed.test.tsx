/**
 * Admin skal være læsbar. Sitet kører mørkt tema på body, så en admin-side der
 * ikke selv satte baggrund og tekstfarve fik lys tekst på hvide kort —
 * /admin/rabatkoder var reelt usynlig (16. aug 2026).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import AdminLayout from "@/app/admin/layout";
import RabatkoderPage from "@/app/admin/rabatkoder/page";
import { renderAdmin } from "./adminTestUtils";

const codes = {
  codes: [
    { code: "genkoeb", pct: 10, source: "standard", active: true },
    { code: "sommerfest", pct: 25, source: "egen", active: false },
  ],
  usage: { genkoeb: 3 },
  defaults: { genkoeb: 10 },
};

function mockStorage() {
  const store = new Map<string, string>([["admin_secret", "hemmelig"]]);
  const api = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
  Object.defineProperty(window, "localStorage", { value: api, configurable: true });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockStorage();
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false,
  })) as any;
  (global.fetch as any).mockResolvedValue({ ok: true, json: () => Promise.resolve(codes) });
});

describe("Admin-skallen", () => {
  it("lægger sig som lys skal om alle admin-sider", () => {
    const { container } = render(<AdminLayout><p>indhold</p></AdminLayout>);
    expect(container.querySelector(".admin-shell")).toBeTruthy();
  });

  it("sætter mørk tekst på lys baggrund og læsbare felter i CSS", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    const shell = css.slice(css.indexOf(".admin-shell"));
    expect(shell).toContain("background: #f5f5f5");
    expect(shell).toContain("color: #111");
    // Formularfelter skal også have farve — ellers arver de body's lyse tekst
    expect(shell).toMatch(/\.admin-shell input[\s\S]{0,120}color: #111/);
  });
});

describe("Rabatkoder", () => {
  it("viser koder, procent, type, status og forbrug", async () => {
    renderAdmin(<RabatkoderPage />);
    await waitFor(() => expect(screen.getByText("genkoeb")).toBeInTheDocument());

    expect(screen.getByText("10 %")).toBeInTheDocument();
    expect(screen.getByText("sommerfest")).toBeInTheDocument();
    expect(screen.getByText("AKTIV")).toBeInTheDocument();
    expect(screen.getByText("SLÅET FRA")).toBeInTheDocument();
    expect(screen.getByText("3 bookinger")).toBeInTheDocument();
  });

  it("opsummerer hvor mange koder der er, og hvor mange der virker", async () => {
    renderAdmin(<RabatkoderPage />);
    await waitFor(() => expect(screen.getByText("genkoeb")).toBeInTheDocument());
    // Tallene står i <strong> inde i teksten, så matcheren ser på hele pillen
    const pill = (text: string) =>
      screen.getByText((_c, el) => el?.tagName === "SPAN" && el.textContent?.trim() === text);
    expect(pill("2 koder")).toBeInTheDocument();
    expect(pill("1 aktive")).toBeInTheDocument();
    expect(pill("3 bookinger med rabat")).toBeInTheDocument();
  });

  it("forklarer forskellen på standard- og egne koder", async () => {
    renderAdmin(<RabatkoderPage />);
    await waitFor(() => expect(screen.getByText("genkoeb")).toBeInTheDocument());
    expect(screen.getByText(/kun kan slås fra/)).toBeInTheDocument();
    expect(screen.getByText(/dem kan du slette/)).toBeInTheDocument();
  });

  it("tilbyder de rigtige handlinger pr. kode", async () => {
    renderAdmin(<RabatkoderPage />);
    await waitFor(() => expect(screen.getByText("genkoeb")).toBeInTheDocument());
    // Aktiv standardkode: kan rettes og slås fra, men ikke slettes
    expect(screen.getByText("Slå fra")).toBeInTheDocument();
    // Slået fra egen kode: kan slås til og slettes
    expect(screen.getByText("Slå til")).toBeInTheDocument();
    expect(screen.getByText("Slet")).toBeInTheDocument();
  });
});
