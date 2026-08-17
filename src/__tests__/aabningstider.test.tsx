/**
 * Åbningstider: én kilde, som Frederik selv kan rette.
 *
 * Tiderne stod før som tekst i i18n, i tre JSON-LD-blokke og i et par
 * brødtekster — og de var endda uenige (forsiden sagde fredag 14-18, /kobenhavn
 * sagde 15-18). Nu er strukturen i src/lib/openingHours.ts, standarden er koden,
 * og admin kan overskrive den i KV uden deploy.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderAdmin } from "./adminTestUtils";
import Footer from "@/components/Footer";
import IndstillingerPage from "@/app/admin/indstillinger/page";
import {
  DEFAULT_OPENING_HOURS,
  formatDayLine,
  formatOneLine,
  formatRange,
  formatSentence,
  formatTime,
  normalizeOpeningHours,
  openDays,
  openingHoursSpecification,
  validateOpeningHours,
  type OpeningHours,
} from "@/lib/openingHours";
import { clearSiteSettingsCache } from "@/lib/useSiteSettings";

/** Åbningstider med kun de dage man nævner — resten lukket */
function hoursWith(days: Partial<Record<string, { open: string; close: string; purpose?: string }>>): OpeningHours {
  const base = normalizeOpeningHours({
    days: Object.fromEntries(
      Object.entries(DEFAULT_OPENING_HOURS.days).map(([d, v]) => [d, { ...v, closed: true }]),
    ),
    other: DEFAULT_OPENING_HOURS.other,
  });
  for (const [day, v] of Object.entries(days)) {
    if (!v) continue;
    base.days[day as keyof typeof base.days] = {
      closed: false, open: v.open, close: v.close, purpose: (v.purpose ?? "") as never,
    };
  }
  return base;
}

describe("Standardtiderne", () => {
  it("er fredag afhentning og mandag aflevering", () => {
    const dage = openDays(DEFAULT_OPENING_HOURS);
    expect(dage.map((d) => d.day)).toEqual(["mon", "fri"]);
    expect(DEFAULT_OPENING_HOURS.days.fri).toMatchObject({ open: "14:00", close: "18:00", purpose: "afhentning" });
    expect(DEFAULT_OPENING_HOURS.days.mon).toMatchObject({ open: "15:00", close: "17:00", purpose: "aflevering" });
  });
});

describe("Visning", () => {
  it("skriver hele timer kort på dansk", () => {
    expect(formatTime("14:00")).toBe("14");
    expect(formatTime("14:30")).toBe("14.30");
    expect(formatRange({ closed: false, open: "14:00", close: "18:00", purpose: "" })).toBe("14–18");
  });

  it("skriver 12-timers på engelsk", () => {
    expect(formatTime("14:00", "en")).toBe("2 PM");
    expect(formatTime("09:30", "en")).toBe("9:30 AM");
    expect(formatRange({ closed: false, open: "14:00", close: "18:00", purpose: "" }, "en")).toBe("2–6 PM");
  });

  it("sætter dag, tid og formål sammen", () => {
    expect(formatDayLine({ day: "fri", closed: false, open: "14:00", close: "18:00", purpose: "afhentning" }))
      .toBe("Fredag 14–18 (afhentning)");
    expect(formatDayLine({ day: "fri", closed: false, open: "14:00", close: "18:00", purpose: "afhentning" }, "en"))
      .toBe("Friday 2–6 PM (pickup)");
  });

  it("laver footerlinjen af alle åbne dage, mandag først", () => {
    expect(formatOneLine(DEFAULT_OPENING_HOURS))
      .toBe("Mandag 15–17 (aflevering) · Fredag 14–18 (afhentning)");
  });

  it("laver en sætning til brødtekst", () => {
    expect(formatSentence(DEFAULT_OPENING_HOURS))
      .toBe("Aflevering mandag 15–17, afhentning fredag 14–18.");
  });

  it("siger ingenting når alt er lukket", () => {
    const lukket = hoursWith({});
    expect(openDays(lukket)).toEqual([]);
    expect(formatOneLine(lukket)).toBe("");
    expect(formatSentence(lukket)).toBe("");
  });
});

describe("Læsning af gemte tider", () => {
  it("falder tilbage på standarden ved skrald i KV", () => {
    expect(normalizeOpeningHours(null)).toEqual(DEFAULT_OPENING_HOURS);
    expect(normalizeOpeningHours("noget")).toEqual(DEFAULT_OPENING_HOURS);
    expect(normalizeOpeningHours({ days: { fri: { open: "kl. 14" } } }).days.fri.open).toBe("14:00");
  });

  it("nægter en lukketid før åbningstiden", () => {
    // Ellers ville dagen være tom, og sitet ville vise "14–9"
    expect(normalizeOpeningHours({ days: { fri: { open: "14:00", close: "09:00" } } }).days.fri.close).toBe("18:00");
  });

  it("beholder tiderne på en lukket dag, så man kan åbne igen", () => {
    const h = normalizeOpeningHours({ days: { fri: { closed: true, open: "12:00", close: "16:00" } } });
    expect(h.days.fri).toMatchObject({ closed: true, open: "12:00", close: "16:00" });
  });
});

describe("Validering ved gemning", () => {
  const gyldig = {
    days: Object.fromEntries(
      Object.entries(DEFAULT_OPENING_HOURS.days).map(([d, v]) => [d, { ...v }]),
    ),
    other: "Andre tidspunkter efter aftale",
  };

  it("tager imod gyldige tider", () => {
    const res = validateOpeningHours(gyldig);
    expect(res.ok).toBe(true);
  });

  it("siger fra ved tastefejl i stedet for stiltiende at gemme standarden", () => {
    // Det vigtige: admin må ikke tro han rettede noget, der ikke blev rettet
    const dårlig = { ...gyldig, days: { ...gyldig.days, fri: { closed: false, open: "1400", close: "18:00", purpose: "" } } };
    const res = validateOpeningHours(dårlig);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toContain("Fredag");
  });

  it("siger fra når lukketid ikke er efter åbningstid", () => {
    const dårlig = { ...gyldig, days: { ...gyldig.days, fri: { closed: false, open: "18:00", close: "14:00", purpose: "" } } };
    const res = validateOpeningHours(dårlig);
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/efter åbningstid/);
  });

  it("afviser et ukendt formål", () => {
    const dårlig = { ...gyldig, days: { ...gyldig.days, fri: { closed: false, open: "14:00", close: "18:00", purpose: "kaffe" } } };
    expect(validateOpeningHours(dårlig).ok).toBe(false);
  });

  it("accepterer en lukket dag med tider der ellers var ugyldige som interval", () => {
    const h = { ...gyldig, days: { ...gyldig.days, sun: { closed: true, open: "10:00", close: "10:00", purpose: "" } } };
    expect(validateOpeningHours(h).ok).toBe(true);
  });
});

describe("Strukturerede data til Google", () => {
  it("tager kun de åbne dage med", () => {
    const spec = openingHoursSpecification(DEFAULT_OPENING_HOURS);
    expect(spec).toEqual([
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Monday", opens: "15:00", closes: "17:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Friday", opens: "14:00", closes: "18:00" },
    ]);
  });

  it("bygges af samme kilde på alle tre sider — de var uenige før", () => {
    const read = (p: string) => readFileSync(join(process.cwd(), p), "utf8");
    for (const f of ["src/app/page.tsx", "src/app/en/page.tsx", "src/app/kobenhavn/page.tsx"]) {
      const src = read(f);
      expect(src, f).toContain("openingHoursSpecification()");
      expect(src, f).not.toMatch(/opens: "1[45]:00"/);
    }
  });
});

/* ───── sitet og admin ───── */

function mockSettings(hours?: unknown) {
  (global.fetch as any).mockImplementation((url: string) => {
    if (String(url).startsWith("/api/site-settings")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          phone: "31132852",
          digits: "31132852",
          display: "31 13 28 52",
          e164: "+4531132852",
          href: "tel:+4531132852",
          hours: hours ?? DEFAULT_OPENING_HOURS,
          updatedAt: "2026-08-17T10:00:00.000Z",
        }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({ users: [] }) });
  });
}

function mockStorage() {
  const store = new Map<string, string>([["admin_token", "hemmelig"]]);
  const api = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() { return store.size; },
  };
  Object.defineProperty(window, "localStorage", { value: api, configurable: true });
  Object.defineProperty(window, "sessionStorage", { value: { ...api }, configurable: true });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockStorage();
  clearSiteSettingsCache();
  // AdminNav bruger useIsMobile
  window.matchMedia = ((q: string) => ({
    matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false,
  })) as any;
});

describe("Footeren", () => {
  it("viser åbningstiderne fra indstillingerne", async () => {
    mockSettings(hoursWith({ fri: { open: "15:00", close: "19:00", purpose: "afhentning" } }));
    render(<Footer />);
    await waitFor(() =>
      expect(screen.getByText(/Fredag 15–19 \(afhentning\)/)).toBeInTheDocument(),
    );
    expect(screen.getByText("Åbningstider:")).toBeInTheDocument();
  });

  it("viser linjen under tiderne", async () => {
    mockSettings();
    render(<Footer />);
    await waitFor(() => expect(screen.getByText(/Andre tidspunkter efter aftale/)).toBeInTheDocument());
  });

  it("viser engelske dagnavne på den engelske side", async () => {
    mockSettings();
    render(<Footer locale="en" />);
    await waitFor(() => expect(screen.getByText(/Friday 2–6 PM \(pickup\)/)).toBeInTheDocument());
    expect(screen.getByText("Opening hours:")).toBeInTheDocument();
  });

  it("skriver ingen åbningstider når alt er lukket", async () => {
    mockSettings(hoursWith({}));
    render(<Footer />);
    await waitFor(() => expect(screen.getByText(/CVR 40994904/)).toBeInTheDocument());
    expect(screen.queryByText("Åbningstider:")).not.toBeInTheDocument();
  });
});

describe("/admin/indstillinger", () => {
  it("har en linje pr. ugedag med tider og formål", async () => {
    mockSettings();
    renderAdmin(<IndstillingerPage />);
    await waitFor(() => expect(screen.getByText("Åbningstider")).toBeInTheDocument());

    for (const dag of ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag", "Søndag"]) {
      expect(screen.getByText(dag)).toBeInTheDocument();
    }
    // Kun de to åbne dage har tidsfelter
    expect(screen.getByLabelText("Fredag åbner")).toHaveValue("14:00");
    expect(screen.getByLabelText("Mandag lukker")).toHaveValue("17:00");
    expect(screen.queryByLabelText("Tirsdag åbner")).not.toBeInTheDocument();
  });

  it("viser hvordan det kommer til at stå i footeren", async () => {
    mockSettings();
    renderAdmin(<IndstillingerPage />);
    await waitFor(() => expect(screen.getByText("Sådan står det i footeren")).toBeInTheDocument());
    expect(screen.getByText("Mandag 15–17 (aflevering) · Fredag 14–18 (afhentning)")).toBeInTheDocument();
  });

  it("gemmer kun åbningstiderne, ikke telefonnummeret", async () => {
    mockSettings();
    renderAdmin(<IndstillingerPage />);
    await waitFor(() => expect(screen.getByLabelText("Fredag åbner")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Fredag åbner"), { target: { value: "15:00" } });
    fireEvent.click(screen.getByText("Gem åbningstider"));

    await waitFor(() => {
      const post = (global.fetch as any).mock.calls.find(
        (c: unknown[]) => (c[1] as { method?: string })?.method === "POST",
      );
      const body = JSON.parse((post[1] as { body: string }).body);
      expect(body.hours.days.fri.open).toBe("15:00");
      expect(body.phone).toBeUndefined();
    });
  });

  it("kan lukke en dag helt", async () => {
    mockSettings();
    renderAdmin(<IndstillingerPage />);
    await waitFor(() => expect(screen.getByLabelText("Fredag åbner")).toBeInTheDocument());

    fireEvent.click(screen.getByLabelText("Åben fredag"));
    expect(screen.queryByLabelText("Fredag åbner")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Gem åbningstider"));
    await waitFor(() => {
      const post = (global.fetch as any).mock.calls.find(
        (c: unknown[]) => (c[1] as { method?: string })?.method === "POST",
      );
      expect(JSON.parse((post[1] as { body: string }).body).hours.days.fri.closed).toBe(true);
    });
  });

  it("siger tydeligt at Google-tiderne ikke følger med", async () => {
    mockSettings();
    renderAdmin(<IndstillingerPage />);
    await waitFor(() => expect(screen.getByText(/To steder skal rettes særskilt/)).toBeInTheDocument());
  });
});

describe("API'et bag åbningstiderne", () => {
  const src = readFileSync(join(process.cwd(), "functions/api/site-settings.ts"), "utf8");

  it("validerer med samme regler som klienten viser", () => {
    expect(src).toContain("validateOpeningHours");
    expect(src).toContain("normalizeOpeningHours");
  });

  it("kan gemme telefon og tider hver for sig", () => {
    // Ellers ville en gemning af tiderne kunne nulstille nummeret
    expect(src).toMatch(/body\.phone !== undefined/);
    expect(src).toMatch(/body\.hours !== undefined/);
  });
});
