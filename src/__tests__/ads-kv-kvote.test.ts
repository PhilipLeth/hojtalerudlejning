/**
 * Admin-siderne må ikke dø, når KV's list-kvote er brugt op.
 *
 * /api/availability væltede sådan i august 2026 og blev lagt om til
 * bookingIndex med cache og nødkopi. Admin-siderne blev ikke, og
 * /admin/ads stod derfor blank med "KV list() limit exceeded for the day":
 * ingen produkter, ingen priser, ingen lagertal — alt sammen tal, der slet
 * ikke kommer fra et list-opslag.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const BOOKING = {
  pickup: "2026-09-04",
  returnDate: "2026-09-07",
  status: "bekræftet",
  total: 895,
  cartItems: [{ name: "Soundboks 4", price: 895, productId: "soundboks" }],
};

/** KV der opfører sig som en konto med opbrugt list-kvote. */
function opbrugtKv() {
  return {
    list: vi.fn(async () => {
      throw new Error("KV list() limit exceeded for the day.");
    }),
    get: vi.fn(async () => null),
  } as unknown as KVNamespace;
}

function levendeKv(keys: string[]) {
  return {
    list: vi.fn(async ({ prefix }: { prefix: string }) => ({
      keys: prefix === "booking_" ? keys.map((name) => ({ name })) : [],
    })),
    get: vi.fn(async (k: string) => (k.startsWith("booking_") ? JSON.stringify(BOOKING) : null)),
  } as unknown as KVNamespace;
}

/** Kantens cache, som Node ikke har. Holder på det der skrives. */
function stubCaches() {
  const store = new Map<string, string>();
  vi.stubGlobal("caches", {
    default: {
      match: async (req: Request) => {
        const body = store.get(req.url);
        return body === undefined ? undefined : new Response(body);
      },
      put: async (req: Request, res: Response) => {
        store.set(req.url, await res.text());
      },
      delete: async (req: Request) => store.delete(req.url),
    },
  });
  return store;
}

beforeEach(() => {
  vi.resetModules();
});

describe("loadBookings under opbrugt KV-kvote", () => {
  it("henter kun én gang, uanset hvor mange admin-sider der spørger", async () => {
    stubCaches();
    const kv = levendeKv(["booking_1", "booking_2"]);
    const { loadBookings } = await import("../../functions/api/_lib/bookings");

    await loadBookings(kv);
    await loadBookings(kv);
    await loadBookings(kv);

    // To list-opslag i alt (bookinger + blokerede) — ikke seks
    expect((kv.list as ReturnType<typeof vi.fn>).mock.calls.length).toBe(2);
  });

  it("serverer den sidst kendte kopi i stedet for at kaste, når kvoten er brugt", async () => {
    stubCaches();
    const mod = await import("../../functions/api/_lib/bookings");
    const cacheMod = await import("../../functions/api/_lib/bookingIndex");

    // Først en normal hentning, så nødkopien findes
    await mod.loadBookings(levendeKv(["booking_1"]));
    await cacheMod.nulstilBookingIndex();

    const efter = await mod.loadBookingsWithMeta(opbrugtKv());
    expect(efter.bookings).toHaveLength(1);
    expect(efter.stale).toBe(true);
  });

  it("svarer tomt og mærket, ikke med en fejl, når heller ikke nødkopien findes", async () => {
    stubCaches();
    const { loadBookingsWithMeta } = await import("../../functions/api/_lib/bookings");

    const resultat = await loadBookingsWithMeta(opbrugtKv());
    expect(resultat.bookings).toEqual([]);
    expect(resultat.stale).toBe(true);
  });

  it("melder ikke stale når tallene er friske", async () => {
    stubCaches();
    const { loadBookingsWithMeta } = await import("../../functions/api/_lib/bookings");

    const resultat = await loadBookingsWithMeta(levendeKv(["booking_1"]));
    expect(resultat.stale).toBe(false);
    expect(resultat.bookings[0]).toMatchObject({ id: "booking_1", pickup: "2026-09-04", total: 895 });
  });
});
