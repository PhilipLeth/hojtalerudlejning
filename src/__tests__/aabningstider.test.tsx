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
  formatDateLine,
  formatDayLine,
  formatOneLine,
  formatRange,
  formatSentence,
  formatTime,
  hoursForDate,
  isOpenOn,
  normalizeOpeningHours,
  openDays,
  openingHoursSpecification,
  upcomingExceptions,
  validateOpeningHours,
  weekdayOf,
  type OpeningHours,
} from "@/lib/openingHours";
import BookingFlow from "@/components/BookingFlow";
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
  it("er åbent mandag og fredag", () => {
    const dage = openDays(DEFAULT_OPENING_HOURS);
    expect(dage.map((d) => d.day)).toEqual(["mon", "fri"]);
    expect(DEFAULT_OPENING_HOURS.days.fri).toMatchObject({ open: "14:00", close: "18:00" });
    expect(DEFAULT_OPENING_HOURS.days.mon).toMatchObject({ open: "15:00", close: "17:00" });
  });

  it("skelner ikke mellem afhentning og aflevering", () => {
    // Man kan både hente og aflevere begge dage — så skal der ikke stå noget
    for (const d of openDays(DEFAULT_OPENING_HOURS)) {
      expect(d.purpose).toBe("");
    }
    expect(formatOneLine(DEFAULT_OPENING_HOURS)).not.toMatch(/afhentning|aflevering/);
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

  it("skriver dag og tid — uden formål når der ikke er sat et", () => {
    expect(formatDayLine({ day: "fri", closed: false, open: "14:00", close: "18:00", purpose: "" }))
      .toBe("Fredag 14–18");
    expect(formatDayLine({ day: "fri", closed: false, open: "14:00", close: "18:00", purpose: "" }, "en"))
      .toBe("Friday 2–6 PM");
  });

  it("tager formålet med, hvis en dag undtagelsesvis kun er til det ene", () => {
    expect(formatDayLine({ day: "mon", closed: false, open: "15:00", close: "17:00", purpose: "aflevering" }))
      .toBe("Mandag 15–17 (aflevering)");
    expect(formatDayLine({ day: "mon", closed: false, open: "15:00", close: "17:00", purpose: "aflevering" }, "en"))
      .toBe("Monday 3–5 PM (return)");
  });

  it("laver footerlinjen af alle åbne dage, mandag først", () => {
    expect(formatOneLine(DEFAULT_OPENING_HOURS)).toBe("Mandag 15–17 · Fredag 14–18");
  });

  it("laver en sætning til brødtekst", () => {
    expect(formatSentence(DEFAULT_OPENING_HOURS)).toBe("Åbent mandag 15–17 og fredag 14–18.");
    expect(formatSentence(DEFAULT_OPENING_HOURS, "en")).toBe("Open Monday 3–5 PM and Friday 2–6 PM.");
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

describe("Særlige datoer", () => {
  /** 30. december 2026 er en onsdag — normalt lukket */
  const nytår: OpeningHours = normalizeOpeningHours({
    ...DEFAULT_OPENING_HOURS,
    exceptions: [
      { date: "2026-12-30", closed: false, open: "14:00", close: "18:00", purpose: "afhentning", note: "Nytår — hent 30. dec" },
      { date: "2026-12-25", closed: true, open: "14:00", close: "18:00", purpose: "", note: "Juledag" },
    ],
  });

  it("kender ugedagen for en dato uanset tidszone", () => {
    expect(weekdayOf("2026-12-30")).toBe("wed");
    expect(weekdayOf("2026-08-21")).toBe("fri");
    expect(weekdayOf("2026-08-23")).toBe("sun");
  });

  it("åbner en dag der ellers var lukket", () => {
    // Onsdag er lukket i ugeplanen — undtagelsen vinder
    expect(isOpenOn(DEFAULT_OPENING_HOURS, "2026-12-30")).toBe(false);
    expect(isOpenOn(nytår, "2026-12-30")).toBe(true);
    expect(hoursForDate(nytår, "2026-12-30")).toMatchObject({
      open: "14:00", close: "18:00", purpose: "afhentning", closed: false,
    });
  });

  it("kan også lukke en dag der ellers var åben", () => {
    // 25. december 2026 er en fredag — normalt afhentningsdag
    expect(weekdayOf("2026-12-25")).toBe("fri");
    expect(isOpenOn(DEFAULT_OPENING_HOURS, "2026-12-25")).toBe(true);
    expect(isOpenOn(nytår, "2026-12-25")).toBe(false);
  });

  it("nævnes ved dato, ikke ved ugedag", () => {
    expect(formatDateLine(nytår, "2026-12-30")).toBe("30. dec 14–18 (afhentning)");
    expect(formatDateLine(nytår, "2026-12-25")).toBe("25. dec: lukket");
    // En almindelig dag nævnes stadig ved sin ugedag — og uden formål
    expect(formatDateLine(nytår, "2026-08-21")).toBe("Fredag 14–18");
  });

  it("bærer en note til kunden", () => {
    expect(hoursForDate(nytår, "2026-12-30").exception?.note).toBe("Nytår — hent 30. dec");
  });

  it("viser kun de kommende", () => {
    expect(upcomingExceptions(nytår, "2026-12-01").map((e) => e.date)).toEqual(["2026-12-25", "2026-12-30"]);
    expect(upcomingExceptions(nytår, "2026-12-26").map((e) => e.date)).toEqual(["2026-12-30"]);
    expect(upcomingExceptions(nytår, "2027-01-05")).toEqual([]);
    // Uden for vinduet
    expect(upcomingExceptions(nytår, "2026-08-01", 30)).toEqual([]);
  });

  it("sorteres og kan ikke stå to gange for samme dato", () => {
    const h = normalizeOpeningHours({
      ...DEFAULT_OPENING_HOURS,
      exceptions: [
        { date: "2026-12-30", closed: false, open: "10:00", close: "12:00", purpose: "", note: "først" },
        { date: "2026-12-30", closed: true, open: "14:00", close: "18:00", purpose: "", note: "dublet" },
        { date: "2026-12-01", closed: false, open: "14:00", close: "18:00", purpose: "", note: "" },
      ],
    });
    expect(h.exceptions.map((e) => e.date)).toEqual(["2026-12-01", "2026-12-30"]);
    expect(h.exceptions.find((e) => e.date === "2026-12-30")?.note).toBe("først");
  });

  it("kasseres hvis datoen ikke er en dato", () => {
    const h = normalizeOpeningHours({ ...DEFAULT_OPENING_HOURS, exceptions: [{ date: "30. december" }] });
    expect(h.exceptions).toEqual([]);
  });

  it("afvises ved gemning med en tydelig fejl", () => {
    const base = { days: DEFAULT_OPENING_HOURS.days, other: "" };
    const dato = (e: unknown) => validateOpeningHours({ ...base, exceptions: [e] });

    expect(dato({ date: "i morgen", closed: false, open: "14:00", close: "18:00", purpose: "" }).ok).toBe(false);
    const forkertTid = dato({ date: "2026-12-30", closed: false, open: "14:00", close: "13:00", purpose: "" });
    expect(forkertTid.ok).toBe(false);
    if (!forkertTid.ok) expect(forkertTid.error).toContain("30. dec");

    const dublet = validateOpeningHours({
      ...base,
      exceptions: [
        { date: "2026-12-30", closed: false, open: "14:00", close: "18:00", purpose: "" },
        { date: "2026-12-30", closed: false, open: "14:00", close: "18:00", purpose: "" },
      ],
    });
    expect(dublet.ok).toBe(false);
  });

  it("gemmes med note og formål", () => {
    const res = validateOpeningHours({
      days: DEFAULT_OPENING_HOURS.days,
      other: "",
      exceptions: [{ date: "2026-12-30", closed: false, open: "14:00", close: "18:00", purpose: "afhentning", note: "Nytår" }],
      onlyOpenDays: true,
    });
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.hours.exceptions[0]).toEqual({
        date: "2026-12-30", closed: false, open: "14:00", close: "18:00", purpose: "afhentning", note: "Nytår",
      });
      expect(res.hours.onlyOpenDays).toBe(true);
    }
  });

  it("holder JSON-LD fri af enkeltdatoer — de er undtagelser, ikke åbningstider", () => {
    expect(openingHoursSpecification(nytår)).toHaveLength(2);
  });
});

describe("Den tekniske indstilling", () => {
  it("er slået fra som standard, så alle datoer stadig kan vælges", () => {
    expect(DEFAULT_OPENING_HOURS.onlyOpenDays).toBe(false);
  });

  it("gemmes som den blev sat", () => {
    expect(normalizeOpeningHours({ ...DEFAULT_OPENING_HOURS, onlyOpenDays: true }).onlyOpenDays).toBe(true);
    expect(normalizeOpeningHours({ ...DEFAULT_OPENING_HOURS, onlyOpenDays: "ja" }).onlyOpenDays).toBe(false);
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
    mockSettings(hoursWith({ fri: { open: "15:00", close: "19:00" } }));
    render(<Footer />);
    await waitFor(() => expect(screen.getByText(/Fredag 15–19/)).toBeInTheDocument());
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
    await waitFor(() => expect(screen.getByText(/Friday 2–6 PM/)).toBeInTheDocument());
    expect(screen.getByText("Opening hours:")).toBeInTheDocument();
  });

  it("skriver ingen åbningstider når alt er lukket", async () => {
    mockSettings(hoursWith({}));
    render(<Footer />);
    await waitFor(() => expect(screen.getByText(/CVR 40994904/)).toBeInTheDocument());
    expect(screen.queryByText("Åbningstider:")).not.toBeInTheDocument();
  });
});

describe("Checkout", () => {
  /** En særlig åbning på en onsdag, langt nok ude at kalenderen kan nå den */
  function medSærligDato(onlyOpenDays = false) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 14);
    // Ryk til næste onsdag, som ellers er lukket
    while (d.getUTCDay() !== 3) d.setUTCDate(d.getUTCDate() + 1);
    const dato = d.toISOString().slice(0, 10);
    return {
      dato,
      hours: normalizeOpeningHours({
        ...DEFAULT_OPENING_HOURS,
        onlyOpenDays,
        exceptions: [
          { date: dato, closed: false, open: "14:00", close: "18:00", purpose: "afhentning", note: "Nytår — hent her" },
        ],
      }),
    };
  }

  it("viser åbningstider og særlige datoer ved afhentningsinfoen", async () => {
    const { dato, hours } = medSærligDato();
    mockSettings(hours);
    render(<BookingFlow />);

    await waitFor(() => expect(screen.getByText(/Åbningstider:/)).toBeInTheDocument());
    expect(screen.getByText(/Fredag 14–18/)).toBeInTheDocument();
    // Den særlige dato står med sin note, så kunden ved at datoen kan vælges
    const kort = new Date(`${dato}T12:00:00Z`).toLocaleDateString("da-DK", { day: "numeric", month: "short", timeZone: "UTC" }).replace(/\.$/, "");
    expect(screen.getByText(new RegExp(`${kort} 14–18 \\(afhentning\\) · Nytår`))).toBeInTheDocument();
  });

  it("markerer den særlige dato i kalenderen, så den kan vælges", async () => {
    const { dato, hours } = medSærligDato();
    mockSettings(hours);
    render(<BookingFlow />);

    fireEvent.click(screen.getByText("Lille højtalerpakke").closest("button")!);
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());

    // Datoen kan ligge i næste måned — bladr frem indtil den er synlig
    const find = () =>
      screen.getAllByRole("button").find((b) => b.getAttribute("title")?.includes("Nytår"));
    for (let i = 0; i < 3 && !find(); i++) {
      fireEvent.click(screen.getByLabelText("Næste måned"));
    }
    const knap = find()!;
    expect(knap).toBeTruthy();
    expect(knap.textContent?.trim()).toBe(String(Number(dato.slice(8, 10))));
    expect(knap).not.toBeDisabled();
    expect(knap.getAttribute("title")).toMatch(/14–18 \(afhentning\) — Nytår/);
  });

  it("spærrer lukkede dage når admin har slået 'kun åbne dage' til", async () => {
    const { hours } = medSærligDato(true);
    mockSettings(hours);
    render(<BookingFlow />);

    fireEvent.click(screen.getByText("Lille højtalerpakke").closest("button")!);
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());

    // En tirsdag i næste måned er lukket → spærret
    const lukkede = screen.getAllByRole("button").filter((b) => b.getAttribute("title")?.includes("lukket"));
    expect(lukkede.length).toBeGreaterThan(0);
    for (const b of lukkede) expect(b).toBeDisabled();
  });

  it("lader alle datoer vælge når indstillingen er slået fra", async () => {
    const { hours } = medSærligDato(false);
    mockSettings(hours);
    render(<BookingFlow />);

    fireEvent.click(screen.getByText("Lille højtalerpakke").closest("button")!);
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());

    const lukkede = screen.getAllByRole("button").filter((b) => b.getAttribute("title")?.includes("lukket"));
    expect(lukkede.length).toBeGreaterThan(0);
    // Som hidtil: man kan vælge dagen og aftale tidspunktet i kommentarfeltet
    const fremtidige = lukkede.filter((b) => !b.className.includes("cursor-not-allowed"));
    expect(fremtidige.length).toBeGreaterThan(0);
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
    expect(screen.getByText("Mandag 15–17 · Fredag 14–18")).toBeInTheDocument();
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

  it("kan tilføje en særlig dato med tider, formål og note", async () => {
    mockSettings();
    renderAdmin(<IndstillingerPage />);
    await waitFor(() => expect(screen.getByText("Særlige datoer")).toBeInTheDocument());
    expect(screen.getByText("Ingen særlige datoer")).toBeInTheDocument();

    fireEvent.click(screen.getByText("+ Tilføj særlig dato"));
    // Uden en dato kan der ikke gemmes
    expect(screen.getByText("Gem åbningstider")).toBeDisabled();
    expect(screen.getByText(/Vælg en dato på den særlige åbning/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Dato"), { target: { value: "2026-12-30" } });
    fireEvent.change(screen.getByLabelText("Note 2026-12-30"), { target: { value: "Nytår" } });
    fireEvent.click(screen.getByText("Gem åbningstider"));

    await waitFor(() => {
      const post = (global.fetch as any).mock.calls.find(
        (c: unknown[]) => (c[1] as { method?: string })?.method === "POST",
      );
      const body = JSON.parse((post[1] as { body: string }).body);
      expect(body.hours.exceptions).toHaveLength(1);
      expect(body.hours.exceptions[0]).toMatchObject({ date: "2026-12-30", note: "Nytår", purpose: "", closed: false });
    });
  });

  it("har den tekniske indstilling for kalenderen, slået fra som standard", async () => {
    mockSettings();
    renderAdmin(<IndstillingerPage />);
    await waitFor(() => expect(screen.getByText("Kun åbne dage kan vælges")).toBeInTheDocument());

    const hak = screen.getByText("Kun åbne dage kan vælges").closest("label")!.querySelector("input")!;
    expect(hak.checked).toBe(false);
    fireEvent.click(hak);
    fireEvent.click(screen.getByText("Gem åbningstider"));

    await waitFor(() => {
      const post = (global.fetch as any).mock.calls.find(
        (c: unknown[]) => (c[1] as { method?: string })?.method === "POST",
      );
      expect(JSON.parse((post[1] as { body: string }).body).hours.onlyOpenDays).toBe(true);
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
