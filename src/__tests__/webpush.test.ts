/**
 * Web Push-krypteringen.
 *
 * Den kan ikke afprøves ved at kigge på den: er den forkert, svarer Apples
 * push-tjeneste stadig "201 modtaget", og telefonen kaster beskeden væk i
 * stilhed. Testen dekrypterer derfor beskeden igen — nøjagtig som telefonen
 * gør det — og tjekker at teksten kommer helt igennem.
 */
import { describe, it, expect, beforeAll } from "vitest";
import {
  b64urlToBytes,
  bytesToB64url,
  encryptPayload,
  vapidAuthHeader,
} from "@/lib/webpush";

type Bytes = Uint8Array<ArrayBuffer>;
const utf8 = (s: string): Bytes => new TextEncoder().encode(s) as Bytes;

function concat(...parts: Bytes[]): Bytes {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

async function hmac(key: Bytes, data: Bytes): Promise<Bytes> {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}

async function hkdf(salt: Bytes, ikm: Bytes, info: Bytes, len: number): Promise<Bytes> {
  const prk = await hmac(salt, ikm);
  return (await hmac(prk, concat(info, new Uint8Array([1])))).slice(0, len);
}

/** En abonnent, som telefonen ville oprette den */
async function makeSubscriber() {
  const pair = (await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
    "deriveBits",
  ])) as CryptoKeyPair;
  const publicRaw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  const auth = crypto.getRandomValues(new Uint8Array(16));
  return {
    pair,
    publicRaw,
    keys: { p256dh: bytesToB64url(publicRaw), auth: bytesToB64url(auth) },
    authBytes: auth,
  };
}

/**
 * Modtagersiden af RFC 8291 — skrevet uafhængigt af afsenderen, så en fejl
 * i den ene ikke skjules af den anden. ECDH regnes fra den modsatte side.
 */
async function decrypt(body: Bytes, sub: Awaited<ReturnType<typeof makeSubscriber>>) {
  const salt = body.slice(0, 16);
  const idlen = body[20];
  const asPublic = body.slice(21, 21 + idlen);
  const ciphertext = body.slice(21 + idlen);

  const asKey = await crypto.subtle.importKey(
    "raw", asPublic, { name: "ECDH", namedCurve: "P-256" }, false, [],
  );
  const shared = new Uint8Array(
    await crypto.subtle.deriveBits({ name: "ECDH", public: asKey }, sub.pair.privateKey, 256),
  );

  const keyInfo = concat(utf8("WebPush: info"), new Uint8Array([0]), sub.publicRaw, asPublic);
  const ikm = await hkdf(sub.authBytes, shared, keyInfo, 32);
  const cek = await hkdf(salt, ikm, concat(utf8("Content-Encoding: aes128gcm"), new Uint8Array([0])), 16);
  const nonce = await hkdf(salt, ikm, concat(utf8("Content-Encoding: nonce"), new Uint8Array([0])), 12);

  const key = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["decrypt"]);
  const plain = new Uint8Array(
    await crypto.subtle.decrypt({ name: "AES-GCM", iv: nonce, tagLength: 128 }, key, ciphertext),
  );
  // Sidste byte er afslutningsbyten (0x02)
  expect(plain[plain.length - 1]).toBe(2);
  return new TextDecoder().decode(plain.slice(0, -1));
}

describe("base64url", () => {
  it("kommer helt rundt", () => {
    const bytes = crypto.getRandomValues(new Uint8Array(65));
    expect(b64urlToBytes(bytesToB64url(bytes))).toEqual(bytes);
  });

  it("bruger ikke tegn der skal escapes i en URL", () => {
    const s = bytesToB64url(new Uint8Array([251, 255, 190, 0]));
    expect(s).not.toMatch(/[+/=]/);
  });
});

describe("encryptPayload", () => {
  it("kan dekrypteres af modtageren", async () => {
    const sub = await makeSubscriber();
    const besked = JSON.stringify({ title: "Ny booking", body: "Agnes · 1.190 kr" });
    const body = await encryptPayload(besked, sub.keys);
    expect(await decrypt(body, sub)).toBe(besked);
  });

  it("tåler æøå og lange beskeder", async () => {
    const sub = await makeSubscriber();
    const besked = "Stor højtalerpakke — fre 21. aug → man 24. aug. ".repeat(20);
    const body = await encryptPayload(besked, sub.keys);
    expect(await decrypt(body, sub)).toBe(besked);
  });

  it("har den header push-tjenesten forventer", async () => {
    const sub = await makeSubscriber();
    const body = await encryptPayload("hej", sub.keys);
    // salt(16) | record size(4) | nøglelængde(1) | nøgle(65) | ciphertext
    expect(body.length).toBeGreaterThan(86);
    expect(new DataView(body.buffer, body.byteOffset).getUint32(16)).toBe(4096);
    expect(body[20]).toBe(65);
    expect(body[21]).toBe(0x04); // uncompressed punkt
  });

  it("giver forskellig ciphertext hver gang, selv med samme tekst", async () => {
    const sub = await makeSubscriber();
    const a = await encryptPayload("samme", sub.keys);
    const b = await encryptPayload("samme", sub.keys);
    expect(bytesToB64url(a)).not.toBe(bytesToB64url(b));
  });

  it("kan ikke læses af en anden abonnent", async () => {
    const mig = await makeSubscriber();
    const enAnden = await makeSubscriber();
    const body = await encryptPayload("hemmeligt", mig.keys);
    await expect(decrypt(body, enAnden)).rejects.toBeTruthy();
  });
});

/** Ægte VAPID-nøglepar, i samme format som Cloudflare-hemmelighederne */
async function makeVapidKeys() {
  const pair = (await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, [
    "sign",
    "verify",
  ])) as CryptoKeyPair;
  const raw = new Uint8Array(await crypto.subtle.exportKey("raw", pair.publicKey));
  const jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  return { publicKey: bytesToB64url(raw), privateKey: jwk.d as string, pair };
}

describe("vapidAuthHeader", () => {
  let keys: Awaited<ReturnType<typeof makeVapidKeys>>;
  beforeAll(async () => { keys = await makeVapidKeys(); });

  it("bygger en JWT med de tre dele og VAPID-nøglen", async () => {
    const header = await vapidAuthHeader("https://web.push.apple.com/abc", keys, "mailto:info@lejhojtaler.dk", 1_800_000_000);
    expect(header).toMatch(/^vapid t=[\w-]+\.[\w-]+\.[\w-]+, k=/);
    expect(header).toContain(`k=${keys.publicKey}`);
  });

  it("adresserer den push-tjeneste beskeden skal til", async () => {
    const header = await vapidAuthHeader("https://web.push.apple.com/abc/def", keys, "mailto:a@b.dk", 1_800_000_000);
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(header.split(".")[1])));
    expect(payload.aud).toBe("https://web.push.apple.com");
    expect(payload.sub).toBe("mailto:a@b.dk");
  });

  it("laver en signatur der kan verificeres med den offentlige nøgle", async () => {
    const header = await vapidAuthHeader("https://web.push.apple.com/x", keys, "mailto:a@b.dk", 1_800_000_000);
    const jwt = header.slice("vapid t=".length).split(", k=")[0];
    const [h, p, sig] = jwt.split(".");
    const ok = await crypto.subtle.verify(
      { name: "ECDSA", hash: "SHA-256" },
      keys.pair.publicKey,
      b64urlToBytes(sig),
      new TextEncoder().encode(`${h}.${p}`),
    );
    expect(ok).toBe(true);
  });

  it("udløber om 12 timer — ikke om et år", async () => {
    const now = 1_800_000_000;
    const header = await vapidAuthHeader("https://web.push.apple.com/x", keys, "mailto:a@b.dk", now);
    const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(header.split(".")[1])));
    expect(payload.exp - now).toBe(12 * 60 * 60);
  });
});
