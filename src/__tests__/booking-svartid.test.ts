/**
 * Kunden venter aldrig på VORES notifikationer.
 *
 * 24. august 2026 kl. 21.22 landede en booking i KV, begge bekræftelsesmails
 * var sendt — og så hang /api/book. Et push-kald til Apples push-tjeneste
 * svarede hverken eller lukkede forbindelsen, og fordi push og
 * overbookingtjekket lå INDE i kundens svar, blev anmodningen holdt åben,
 * indtil Cloudflare kl. 21.24 sendte kunden sin 524-side. Kunden så "Booking
 * gik galt", nåede aldrig betalingen, og ordren stod ubetalt i admin.
 *
 * Testen genskaber præcis det: et push-endepunkt der aldrig svarer. Svaret til
 * kunden skal komme alligevel.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { bytesToB64url } from "@/lib/webpush";
import { onRequestPost } from "../../functions/api/book";

const læs = (p: string) => readFileSync(join(process.cwd(), p), "utf8");

/** En abonnent med ægte nøgler — ellers fejler krypteringen, og der sendes intet */
async function abonnent(endpoint: string) {
  const pair = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits",
  ])) as CryptoKeyPair;
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  const auth = crypto.getRandomValues(new Uint8Array(16));
  return { endpoint, keys: { p256dh: bytesToB64url(raw), auth: bytesToB64url(auth) } };
}

async function vapid() {
  const pair = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ])) as CryptoKeyPair;
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  return { VAPID_PUBLIC_KEY: bytesToB64url(raw), VAPID_PRIVATE_KEY: jwk.d as string };
}

/** KV nok til at bookingen kan gemmes og notifikationerne kan slå op */
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
  speaker: "Discokugle",
  speakerId: "discokugle",
  speakerSize: "—",
  period: "Tor 17. sep → Man 21. sep (4 dage)",
  pickup: "2026-09-16T22:00:00.000Z",
  returnDate: "2026-09-20T22:00:00.000Z",
  pickupDay: "2026-09-17",
  returnDay: "2026-09-21",
  days: 4,
  addons: [],
  addonIds: [],
  cartItems: [],
  total: 595,
  paymentChoice: "online",
  name: "Malthe",
  email: "malthe@example.com",
  phone: "+4528147677",
  comment: "",
};

describe("/api/book svarer kunden, selv om push hænger", () => {
  let hængende: number;
  let baggrund: Promise<unknown>[];

  beforeEach(() => {
    hængende = 0;
    baggrund = [];
    // caches findes ikke i Node — nulstilBookingIndex rører den
    vi.stubGlobal("caches", { default: { match: async () => undefined, put: async () => {}, delete: async () => {} } });
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url.includes("api.resend.com")) return new Response("{}", { status: 200 });
      if (url.includes("push.apple.com")) {
        // Præcis fejlen: forbindelsen bliver stående åben for evigt
        hængende++;
        return new Promise<Response>(() => {});
      }
      return new Response("{}", { status: 200 });
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  async function kald() {
    const nøgler = await vapid();
    const subs = [await abonnent("https://web.push.apple.com/A"), await abonnent("https://web.push.apple.com/B")];
    const kv = fakeKv({ push_subs: JSON.stringify(subs) });
    const ctx = {
      env: {
        RESEND_API_KEY: "re_test",
        NOTIFY_EMAIL: "info@lejhojtaler.dk",
        BOOKINGS: kv,
        ...nøgler,
      },
      request: new Request("https://lejhojtaler.dk/api/book", {
        method: "POST",
        body: JSON.stringify(ORDRE),
      }),
      // Cloudflares waitUntil: arbejdet kører videre, men holder ikke svaret
      waitUntil: (p: Promise<unknown>) => { baggrund.push(p); },
    } as unknown as Parameters<typeof onRequestPost>[0];
    return { svar: await onRequestPost(ctx), kv };
  }

  it("svarer 200 med ordrenummer, mens push stadig hænger", async () => {
    const { svar, kv } = await Promise.race([
      kald(),
      new Promise<never>((_, afvis) => setTimeout(() => afvis(new Error("svaret kom aldrig — det var 524-fejlen")), 5000)),
    ]);

    expect(svar.status).toBe(200);
    const body = (await svar.json()) as { ok: boolean; bookingId: string };
    expect(body.ok).toBe(true);
    expect(body.bookingId).toMatch(/^booking_\d+_/);

    // Ordren ligger i KV — det gjorde den også dengang, det var svaret der manglede
    const gemt = JSON.parse(kv.data.get(body.bookingId)!);
    expect(gemt.name).toBe("Malthe");
    expect(gemt.status).toBe("ny");

    // Spærren mod dobbelttryk skal være sat, FØR vi svarer
    expect([...kv.data.keys()].some((k) => k.startsWith("booking_dublet_"))).toBe(true);

    // Notifikationerne kører videre i baggrunden — de blev IKKE sprunget over,
    // de blev bare flyttet ud af kundens svar
    // (den første er cache-nulstillingen, som altid har kørt i waitUntil)
    expect(baggrund.length).toBe(2);
    await new Promise((r) => setTimeout(r, 50));
    expect(hængende, "push blev aldrig forsøgt — så beviser testen ingenting").toBeGreaterThan(0);

    // Og det hængende kald hænger stadig. Før lå kunden og ventede på netop det.
    const stadigIGang = await Promise.race([
      baggrund[baggrund.length - 1].then(() => "færdig"),
      new Promise((r) => setTimeout(() => r("hænger"), 50)),
    ]);
    expect(stadigIGang).toBe("hænger");
  }, 15000);
});

describe("Ingen udgående kald uden timeout", () => {
  it("mails, SMS og push har alle en snor i", () => {
    for (const f of [
      "functions/api/book.ts",
      "functions/api/contact.ts",
      "functions/api/invoice.ts",
      "functions/api/bookings-update.ts",
      "functions/api/_lib/confirmMail.ts",
      "functions/api/_lib/ownerMail.ts",
    ]) {
      expect(læs(f), f).toContain("signal: timeoutSignal(TIMEOUT_MAIL_MS)");
    }
    // De tre SMS-udbydere plus saldoopslaget
    expect(læs("src/lib/sms.ts").match(/signal: timeoutSignal\(TIMEOUT_SMS_MS\)/g)?.length).toBe(5);
    expect(læs("src/lib/webpush.ts")).toContain("signal: timeoutSignal(TIMEOUT_PUSH_MS)");
  });

  it("push og overbooking ligger efter svaret, ikke foran det", () => {
    const src = læs("functions/api/book.ts");
    expect(src).toContain("context.waitUntil(efterbehandling)");
    // notifyPhones må ikke længere afventes direkte i selve forløbet
    expect(src).not.toMatch(/^ {2}try \{\n {4}await notifyPhones/m);
  });
});
