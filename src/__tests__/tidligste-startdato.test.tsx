/**
 * Tidligste startdato: luk for nye lejeperioder frem til en dato.
 *
 * Frederik 31. august 2026: der må ikke kunne bookes til den kommende weekend.
 * En spærret dato pr. produkt (/admin/lager) svarer ikke på det — den handler om
 * ét produkt ad gangen, og kunden kunne stadig starte en leje midt i perioden.
 * Her lukkes hele butikken for nye STARTdatoer frem til en dato, som Frederik
 * selv sætter i /admin/indstillinger og kan rydde igen uden deploy.
 *
 * Igangværende lejeperioder rører den ikke: kun afhentningsdagen tjekkes, og
 * returdatoen ligger altid efter den.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { renderAdmin } from "./adminTestUtils";
import BookingFlow from "@/components/BookingFlow";
import IndstillingerPage from "@/app/admin/indstillinger/page";
import {
  DEFAULT_OPENING_HOURS,
  isBeforeEarliestPickup,
  normalizeOpeningHours,
  validateOpeningHours,
} from "@/lib/openingHours";
import { DEFAULT_PICKUP_ADDRESS } from "@/lib/pickup";
import { DEFAULT_COMPANY } from "@/lib/siteInfo";
import { clearSiteSettingsCache } from "@/lib/useSiteSettings";
import { t } from "@/lib/i18n";
import { onRequestPost as bookPost } from "../../functions/api/book";

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** En dato langt nok ude at kalenderen kan nå den, og aldrig den 1. eller 2. */
function spærredato(): Date {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + 10);
  while (d.getDate() < 3) d.setDate(d.getDate() + 1);
  return d;
}

function medSpærre(dato: string) {
  return normalizeOpeningHours({ ...DEFAULT_OPENING_HOURS, earliestPickup: dato });
}

/* ───── indstillingen ───── */

describe("Indstillingen", () => {
  it("er tom som standard — ingen spærre før nogen sætter en", () => {
    expect(DEFAULT_OPENING_HOURS.earliestPickup).toBe("");
    expect(normalizeOpeningHours(DEFAULT_OPENING_HOURS).earliestPickup).toBe("");
  });

  it("gemmes som den blev sat", () => {
    expect(medSpærre("2026-09-05").earliestPickup).toBe("2026-09-05");
  });

  it("lukker ikke butikken på en tastefejl", () => {
    // En ulæselig værdi i KV skal betyde "ingen spærre", ikke "alt spærret"
    expect(normalizeOpeningHours({ ...DEFAULT_OPENING_HOURS, earliestPickup: "på fredag" }).earliestPickup).toBe("");
    expect(normalizeOpeningHours({ ...DEFAULT_OPENING_HOURS, earliestPickup: 20260905 }).earliestPickup).toBe("");
  });

  it("siger fra i admin i stedet for stiltiende at kaste datoen væk", () => {
    const god = validateOpeningHours({ ...DEFAULT_OPENING_HOURS, earliestPickup: "2026-09-05" });
    expect(god.ok).toBe(true);
    if (god.ok) expect(god.hours.earliestPickup).toBe("2026-09-05");

    const skidt = validateOpeningHours({ ...DEFAULT_OPENING_HOURS, earliestPickup: "5. september" });
    expect(skidt.ok).toBe(false);

    const tom = validateOpeningHours({ ...DEFAULT_OPENING_HOURS, earliestPickup: "" });
    expect(tom.ok).toBe(true);
  });

  it("spærrer dagene før datoen — men ikke datoen selv", () => {
    const hours = medSpærre("2026-09-05");
    expect(isBeforeEarliestPickup(hours, "2026-09-04")).toBe(true);
    expect(isBeforeEarliestPickup(hours, "2026-08-31")).toBe(true);
    expect(isBeforeEarliestPickup(hours, "2026-09-05")).toBe(false);
    expect(isBeforeEarliestPickup(hours, "2026-09-06")).toBe(false);
    // Uden spærre er ingen dato for tidlig
    expect(isBeforeEarliestPickup(DEFAULT_OPENING_HOURS, "2020-01-01")).toBe(false);
  });
});

/* ───── kalenderen i checkout ───── */

function mockSettings(hours: unknown) {
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
          hours,
          pickupAddress: DEFAULT_PICKUP_ADDRESS,
          company: DEFAULT_COMPANY,
          updatedAt: "2026-08-31T10:00:00.000Z",
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

/** Dagknappen for en dato — bladrer frem til måneden den ligger i */
function findDag(dato: Date): HTMLElement | undefined {
  const måned = t.da.booking.monthNames[dato.getMonth()];
  const forventet = `${dato.getDate()}. ${måned} —`;
  const find = () =>
    screen.getAllByRole("button").find((b) => (b.getAttribute("aria-label") ?? "").startsWith(forventet));
  for (let i = 0; i < 4 && !find(); i++) {
    fireEvent.click(screen.getByLabelText("Næste måned"));
  }
  return find();
}

describe("Kalenderen i checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage();
    clearSiteSettingsCache();
    window.matchMedia = ((q: string) => ({
      matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
      addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false,
    })) as any;
  });

  async function åbnDatovalg(hours: unknown) {
    mockSettings(hours);
    render(<BookingFlow />);
    fireEvent.click(screen.getByText("Lille højtalerpakke").closest("button")!);
    await waitFor(() => expect(screen.getByText("Vælg datoer")).toBeInTheDocument());
  }

  it("spærrer dagene før datoen og lader datoen selv vælge", async () => {
    const første = spærredato();
    await åbnDatovalg(medSpærre(iso(første)));

    const dagen = findDag(første)!;
    expect(dagen).toBeTruthy();
    expect(dagen).not.toBeDisabled();

    const dagenFør = new Date(første);
    dagenFør.setDate(dagenFør.getDate() - 1);
    expect(findDag(dagenFør)).toBeDisabled();
  }, 20000);

  it("siger hvorfor de første dage er grå", async () => {
    const første = spærredato();
    await åbnDatovalg(medSpærre(iso(første)));
    expect(screen.getByText(/Vi tager først imod bookinger med start fra/)).toBeInTheDocument();
  }, 20000);

  it("skriver ingenting når der ikke er nogen spærre", async () => {
    await åbnDatovalg(DEFAULT_OPENING_HOURS);
    expect(screen.queryByText(/Vi tager først imod bookinger/)).not.toBeInTheDocument();
  }, 20000);

  it("lader lejeperioden slutte efter datoen — kun starten er spærret", async () => {
    const første = spærredato();
    await åbnDatovalg(medSpærre(iso(første)));

    fireEvent.click(findDag(første)!);
    const dagenEfter = new Date(første);
    dagenEfter.setDate(dagenEfter.getDate() + 1);
    fireEvent.click(findDag(dagenEfter)!);

    await waitFor(() => expect(screen.getByText("Videre")).not.toBeDisabled());
  }, 20000);
});

/* ───── admin ───── */

describe("/admin/indstillinger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStorage();
    clearSiteSettingsCache();
    window.matchMedia = ((q: string) => ({
      matches: false, media: q, addEventListener: () => {}, removeEventListener: () => {},
      addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false,
    })) as any;
  });

  it("kan sætte og rydde datoen uden deploy", async () => {
    mockSettings(DEFAULT_OPENING_HOURS);
    renderAdmin(<IndstillingerPage />);
    await waitFor(() => expect(screen.getByText("Tidligste startdato")).toBeInTheDocument());

    const felt = () => screen.getByText("Tidligste startdato").parentElement!.querySelector('input[type="date"]') as HTMLInputElement;
    expect(felt().value).toBe("");

    fireEvent.change(felt(), { target: { value: "2026-09-05" } });
    // Den kan tages af igen — ellers står en glemt spærre og lukker for salg
    fireEvent.click(screen.getByText("Ryd"));
    expect(felt().value).toBe("");

    fireEvent.change(felt(), { target: { value: "2026-09-05" } });
    fireEvent.click(screen.getByText("Gem åbningstider"));

    await waitFor(() => {
      const post = (global.fetch as any).mock.calls.find(
        (c: unknown[]) => (c[1] as { method?: string })?.method === "POST",
      );
      expect(JSON.parse((post[1] as { body: string }).body).hours.earliestPickup).toBe("2026-09-05");
    });
  });
});

/* ───── serveren ───── */

function fakeKv(start: Record<string, string> = {}) {
  const data = new Map(Object.entries(start));
  return {
    data,
    get: vi.fn(async (k: string) => data.get(k) ?? null),
    put: vi.fn(async (k: string, v: string) => { data.set(k, v); }),
    delete: vi.fn(async (k: string) => { data.delete(k); }),
    list: vi.fn(async ({ prefix = "" }: { prefix?: string } = {}) => ({
      keys: [...data.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })),
      list_complete: true,
    })),
  };
}

const ORDRE = {
  speaker: "Lille højtalerpakke",
  speakerId: "lille",
  speakerSize: "—",
  period: "—",
  days: 2,
  addons: [],
  addonIds: [],
  cartItems: [],
  total: 995,
  paymentChoice: "online",
  name: "Malthe",
  email: "malthe@example.com",
  phone: "+4528147677",
  comment: "",
};

describe("/api/book", () => {
  beforeEach(() => {
    vi.stubGlobal("caches", { default: { match: async () => undefined, put: async () => {}, delete: async () => {} } });
    vi.stubGlobal("fetch", vi.fn(async () => new Response("{}", { status: 200 })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function book(pickupDay: string, returnDay: string) {
    const kv = fakeKv({
      site_settings: JSON.stringify({ phone: "31132852", hours: medSpærre("2026-09-05") }),
    });
    const ctx = {
      env: { RESEND_API_KEY: "re_test", NOTIFY_EMAIL: "info@lejhojtaler.dk", BOOKINGS: kv },
      request: new Request("https://lejhojtaler.dk/api/book", {
        method: "POST",
        body: JSON.stringify({ ...ORDRE, pickupDay, returnDay }),
      }),
      waitUntil: () => {},
    } as unknown as Parameters<typeof bookPost>[0];
    return { svar: await bookPost(ctx), kv };
  }

  it("afviser en startdato før spærren — kalenderen er ikke den eneste lås", async () => {
    const { svar, kv } = await book("2026-09-04", "2026-09-06");
    expect(svar.status).toBe(400);
    expect((await svar.json() as { error: string }).error).toMatch(/5\. sep/);
    // Ingen ordre, ingen mails
    expect([...kv.data.keys()].some((k) => k.startsWith("booking_"))).toBe(false);
  });

  it("tager imod en booking fra datoen og frem", async () => {
    const { svar } = await book("2026-09-05", "2026-09-07");
    expect(svar.status).toBe(200);
  });
});
