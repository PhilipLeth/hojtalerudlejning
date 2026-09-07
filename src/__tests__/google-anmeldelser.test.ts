// @vitest-environment node
/**
 * /api/anmeldelser — de rigtige Google-anmeldelser sitet viser.
 *
 * Tre ting må ikke skride:
 * 1. Vi kalder ikke Google ved hver sidevisning. Places koster penge pr. kald,
 *    og sektionen står på 16 sider.
 * 2. Et dårligt svar fra Google (nede, kvote opbrugt, tomt) må aldrig tømme
 *    sektionen — den gamle kopi er bedre end ingenting.
 * 3. Vi viser de NYESTE fire. Google sorterer selv efter relevans.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { onRequestGet, FRESH_MS, kvNoegle } from "../../functions/api/anmeldelser";
import { parsePlace } from "@/lib/googleReviews";

function fakeKv(seed: Record<string, string> = {}) {
  const store = new Map(Object.entries(seed));
  return {
    store,
    get: vi.fn(async (k: string) => store.get(k) ?? null),
    put: vi.fn(async (k: string, v: string) => {
      store.set(k, v);
    }),
  };
}

function anmeldelse(navn: string, tid: string, rating = 5, tekst = "Kanon lyd og nem afhentning.") {
  return {
    rating,
    text: { text: tekst, languageCode: "da" },
    relativePublishTimeDescription: "for 2 uger siden",
    publishTime: tid,
    googleMapsUri: `https://www.google.com/maps/reviews/${navn}`,
    authorAttribution: {
      displayName: navn,
      photoUri: "https://lh3.googleusercontent.com/a/foto",
      uri: "https://www.google.com/maps/contrib/1",
    },
  };
}

const PLACE_SVAR = {
  rating: 4.9,
  userRatingCount: 27,
  googleMapsUri: "https://maps.google.com/?cid=1",
  reviews: [
    anmeldelse("Anne", "2026-06-01T10:00:00Z"),
    anmeldelse("Bo", "2026-09-01T10:00:00Z"),
    anmeldelse("Carla", "2026-08-01T10:00:00Z"),
    anmeldelse("Dan", "2026-07-01T10:00:00Z"),
    anmeldelse("Eva", "2026-05-01T10:00:00Z"),
  ],
};

function kald(
  url: string,
  env: Record<string, unknown>,
): Promise<Response> {
  return (onRequestGet as any)({ request: new Request(url), env });
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  fetchMock = vi.fn(async () => new Response(JSON.stringify(PLACE_SVAR), { status: 200 }));
  global.fetch = fetchMock as any;
});

describe("parsePlace", () => {
  it("tager de fire nyeste, ikke de fire første", async () => {
    const data = parsePlace(PLACE_SVAR);
    expect(data.reviews.map((r) => r.author)).toEqual(["Bo", "Carla", "Dan", "Anne"]);
    expect(data.rating).toBe(4.9);
    expect(data.total).toBe(27);
  });

  it("kasserer anmeldelser uden navn, tekst eller stjerner", () => {
    const data = parsePlace({
      reviews: [
        { text: { text: "Uden navn" }, rating: 5 },
        { authorAttribution: { displayName: "Kun navn" }, rating: 5 },
        anmeldelse("Fin", "2026-09-01T10:00:00Z"),
      ],
    });
    expect(data.reviews.map((r) => r.author)).toEqual(["Fin"]);
  });

  it("falder tilbage til originalteksten når Google ikke har oversat", () => {
    const raw = anmeldelse("Sara", "2026-09-01T10:00:00Z");
    const data = parsePlace({ reviews: [{ ...raw, text: undefined, originalText: { text: "Great sound" } }] });
    expect(data.reviews[0].text).toBe("Great sound");
  });

  it("giver tom liste af noget der slet ikke ligner et svar", () => {
    expect(parsePlace(null).reviews).toEqual([]);
    expect(parsePlace({ reviews: "ups" }).reviews).toEqual([]);
  });
});

describe("GET /api/anmeldelser", () => {
  it("henter fra Google og gemmer i KV", async () => {
    const kv = fakeKv();
    const res = await kald("https://lejhojtaler.dk/api/anmeldelser", {
      BOOKINGS: kv,
      GOOGLE_PLACES_API_KEY: "test-key",
    });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.reviews).toHaveLength(4);
    expect(data.rating).toBe(4.9);
    expect(data.total).toBe(27);
    expect(kv.store.get(kvNoegle("da"))).toContain("Bo");

    // Nøglen må aldrig ligge i URL'en — Google logger URL'er, og den skal
    // sendes som header
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain("test-key");
    expect((init.headers as Record<string, string>)["X-Goog-Api-Key"]).toBe("test-key");
  });

  it("svarer fra cachen uden at kalde Google igen", async () => {
    const frisk = JSON.stringify({
      rating: 5,
      total: 3,
      url: null,
      reviews: [{ author: "Cache", rating: 5, text: "Fra KV", relative: "", publishTime: "" }],
      fetchedAt: new Date().toISOString(),
    });
    const kv = fakeKv({ [kvNoegle("da")]: frisk });

    const data = await (
      await kald("https://lejhojtaler.dk/api/anmeldelser", {
        BOOKINGS: kv,
        GOOGLE_PLACES_API_KEY: "test-key",
      })
    ).json();

    expect(fetchMock).not.toHaveBeenCalled();
    expect(data.reviews[0].author).toBe("Cache");
  });

  it("henter igen når kopien er ældre end friskhedsvinduet", async () => {
    const gammel = JSON.stringify({
      rating: 5,
      total: 3,
      url: null,
      reviews: [{ author: "Gammel", rating: 5, text: "Fra KV", relative: "", publishTime: "" }],
      fetchedAt: new Date(Date.now() - FRESH_MS - 1000).toISOString(),
    });
    const kv = fakeKv({ [kvNoegle("da")]: gammel });

    const data = await (
      await kald("https://lejhojtaler.dk/api/anmeldelser", {
        BOOKINGS: kv,
        GOOGLE_PLACES_API_KEY: "test-key",
      })
    ).json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(data.reviews[0].author).toBe("Bo");
  });

  it("beholder den gamle kopi når Google svarer med fejl", async () => {
    fetchMock.mockResolvedValue(new Response("kvote opbrugt", { status: 429 }));
    const gammel = JSON.stringify({
      rating: 4.8,
      total: 12,
      url: null,
      reviews: [{ author: "Gammel", rating: 5, text: "Fra KV", relative: "", publishTime: "" }],
      fetchedAt: new Date(Date.now() - FRESH_MS - 1000).toISOString(),
    });
    const kv = fakeKv({ [kvNoegle("da")]: gammel });

    const data = await (
      await kald("https://lejhojtaler.dk/api/anmeldelser", {
        BOOKINGS: kv,
        GOOGLE_PLACES_API_KEY: "test-key",
      })
    ).json();

    expect(data.reviews[0].author).toBe("Gammel");
  });

  it("overskriver ikke eksisterende anmeldelser med et tomt svar", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ rating: 4.9, reviews: [] }), { status: 200 }));
    const gammel = JSON.stringify({
      rating: 4.9,
      total: 12,
      url: null,
      reviews: [{ author: "Gammel", rating: 5, text: "Fra KV", relative: "", publishTime: "" }],
      fetchedAt: new Date(Date.now() - FRESH_MS - 1000).toISOString(),
    });
    const kv = fakeKv({ [kvNoegle("da")]: gammel });

    const data = await (
      await kald("https://lejhojtaler.dk/api/anmeldelser", {
        BOOKINGS: kv,
        GOOGLE_PLACES_API_KEY: "test-key",
      })
    ).json();

    expect(data.reviews[0].author).toBe("Gammel");
  });

  it("svarer tomt — ikke med fejl — når nøglen ikke er sat", async () => {
    const kv = fakeKv();
    const res = await kald("https://lejhojtaler.dk/api/anmeldelser", { BOOKINGS: kv });
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.reviews).toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("beder Google om engelsk og cacher sprogene hver for sig", async () => {
    const kv = fakeKv();
    await kald("https://lejhojtaler.dk/api/anmeldelser?sprog=en", {
      BOOKINGS: kv,
      GOOGLE_PLACES_API_KEY: "test-key",
    });
    expect(fetchMock.mock.calls[0][0]).toContain("languageCode=en");
    expect(kv.store.has(kvNoegle("en"))).toBe(true);
    expect(kv.store.has(kvNoegle("da"))).toBe(false);
  });

  it("lader ikke fremmede tvinge et Google-kald med ?refresh=1", async () => {
    const frisk = JSON.stringify({
      rating: 5,
      total: 3,
      url: null,
      reviews: [{ author: "Cache", rating: 5, text: "Fra KV", relative: "", publishTime: "" }],
      fetchedAt: new Date().toISOString(),
    });
    const kv = fakeKv({ [kvNoegle("da")]: frisk });

    const res = await kald("https://lejhojtaler.dk/api/anmeldelser?refresh=1", {
      BOOKINGS: kv,
      ADMIN_SECRET: "hemmelig",
      GOOGLE_PLACES_API_KEY: "test-key",
    });

    expect(res.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lader admin tvinge en ny hentning", async () => {
    const frisk = JSON.stringify({
      rating: 5,
      total: 3,
      url: null,
      reviews: [{ author: "Cache", rating: 5, text: "Fra KV", relative: "", publishTime: "" }],
      fetchedAt: new Date().toISOString(),
    });
    const kv = fakeKv({ [kvNoegle("da")]: frisk });

    const data = await (
      await kald("https://lejhojtaler.dk/api/anmeldelser?refresh=1&secret=hemmelig", {
        BOOKINGS: kv,
        ADMIN_SECRET: "hemmelig",
        GOOGLE_PLACES_API_KEY: "test-key",
      })
    ).json();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(data.reviews[0].author).toBe("Bo");
  });
});
