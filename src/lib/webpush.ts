/* ───── Web Push: VAPID og kryptering ─────
 *
 * Push til en iPhone går gennem Apples push-tjeneste, men indholdet må Apple
 * ikke kunne læse. Beskeden krypteres derfor til abonnentets egen nøgle
 * (RFC 8291, aes128gcm), og afsenderen legitimerer sig med VAPID (RFC 8292).
 *
 * Skrevet mod WebCrypto, så den kører både i Cloudflare Workers og i Node.
 * Ingen afhængigheder — web-push-pakken er bygget til Node og virker ikke i
 * Workers.
 */

/**
 * ArrayBuffer-bagget bytes. WebCrypto tager ikke imod SharedArrayBuffer, og
 * uden den skelnen bliver hvert eneste kald til subtle en typefejl.
 */
type Bytes = Uint8Array<ArrayBuffer>;

// ------------------------------------------------------------------ base64url

export function b64urlToBytes(s: string): Bytes {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function bytesToB64url(bytes: Bytes): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function concat(...parts: Bytes[]): Bytes {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

const utf8 = (s: string): Bytes => new TextEncoder().encode(s) as Bytes;

// ----------------------------------------------------------------------- HKDF

async function hmac(key: Bytes, data: Bytes): Promise<Bytes> {
  const k = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", k, data));
}

/** HKDF med én runde — alt vi skal bruge er højst 32 bytes */
async function hkdf(salt: Bytes, ikm: Bytes, info: Bytes, length: number): Promise<Bytes> {
  const prk = await hmac(salt, ikm);
  const okm = await hmac(prk, concat(info, new Uint8Array([1])));
  return okm.slice(0, length);
}

// ------------------------------------------------------------------- nøgler

/** Uncompressed P-256-punkt (65 bytes) → JWK-koordinater */
function pointToXY(point: Bytes): { x: string; y: string } {
  if (point.length !== 65 || point[0] !== 0x04) throw new Error("Ugyldigt P-256-punkt");
  return { x: bytesToB64url(point.slice(1, 33)), y: bytesToB64url(point.slice(33, 65)) };
}

async function importPublicKey(point: Bytes): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", ...pointToXY(point), ext: true },
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );
}

export interface VapidKeys {
  /** 65 bytes uncompressed, base64url */
  publicKey: string;
  /** 32 bytes privat skalar, base64url */
  privateKey: string;
}

async function importVapidSigningKey(keys: VapidKeys): Promise<CryptoKey> {
  const pub = b64urlToBytes(keys.publicKey);
  return crypto.subtle.importKey(
    "jwk",
    { kty: "EC", crv: "P-256", ...pointToXY(pub), d: keys.privateKey, ext: true },
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

/**
 * VAPID-header. Beviser over for push-tjenesten, at det er os der sender,
 * uden at vi skal have en konto hos dem.
 */
export async function vapidAuthHeader(
  endpoint: string,
  keys: VapidKeys,
  subject: string,
  nowSeconds: number,
): Promise<string> {
  const aud = new URL(endpoint).origin;
  const header = bytesToB64url(utf8(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  // 12 timer — push-tjenester afviser tokens der gælder for længe
  const payload = bytesToB64url(
    utf8(JSON.stringify({ aud, exp: nowSeconds + 12 * 60 * 60, sub: subject })),
  );
  const signingInput = utf8(`${header}.${payload}`);
  const key = await importVapidSigningKey(keys);
  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, key, signingInput),
  );
  const jwt = `${header}.${payload}.${bytesToB64url(sig)}`;
  return `vapid t=${jwt}, k=${keys.publicKey}`;
}

// -------------------------------------------------------------- kryptering

export interface PushSubscriptionKeys {
  /** Abonnentens offentlige nøgle, base64url (65 bytes) */
  p256dh: string;
  /** Abonnentens hemmelighed, base64url (16 bytes) */
  auth: string;
}

/**
 * Krypter en besked til én abonnent (RFC 8291).
 *
 * salt og afsenderens flygtige nøglepar kan gives med, så testen kan køre
 * mod faste værdier — i drift genereres begge friske pr. besked.
 */
export async function encryptPayload(
  payload: string,
  sub: PushSubscriptionKeys,
  opts: { salt?: Bytes; senderKeys?: CryptoKeyPair } = {},
): Promise<Bytes> {
  const uaPublicBytes = b64urlToBytes(sub.p256dh);
  const authSecret = b64urlToBytes(sub.auth);

  const senderKeys =
    opts.senderKeys ??
    ((await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, [
      "deriveBits",
    ])) as CryptoKeyPair);

  const asPublicBytes = new Uint8Array(await crypto.subtle.exportKey("raw", senderKeys.publicKey));

  const shared = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: "ECDH", public: await importPublicKey(uaPublicBytes) },
      senderKeys.privateKey,
      256,
    ),
  );

  // Nøglematerialet bindes til BEGGE parters offentlige nøgler, så en besked
  // ikke kan genbruges mod en anden abonnent
  const keyInfo = concat(utf8("WebPush: info"), new Uint8Array([0]), uaPublicBytes, asPublicBytes);
  const ikm = await hkdf(authSecret, shared, keyInfo, 32);

  const salt = opts.salt ?? crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, concat(utf8("Content-Encoding: aes128gcm"), new Uint8Array([0])), 16);
  const nonce = await hkdf(salt, ikm, concat(utf8("Content-Encoding: nonce"), new Uint8Array([0])), 12);

  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  // 0x02 er afslutningsbyten for sidste (og eneste) record
  const plaintext = concat(utf8(payload), new Uint8Array([2]));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce, tagLength: 128 }, aesKey, plaintext),
  );

  // Header: salt(16) | record size(4) | nøglelængde(1) | afsenderens nøgle(65)
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, 4096);
  return concat(salt, rs, new Uint8Array([asPublicBytes.length]), asPublicBytes, ciphertext);
}

// ---------------------------------------------------------------------- send

export interface StoredSubscription {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export interface SendResult {
  endpoint: string;
  status: number;
  ok: boolean;
  /** 404/410 betyder at abonnementet er dødt og skal slettes */
  gone: boolean;
}

/**
 * Send én besked til én abonnent. Kaster ikke — en død telefon må ikke kunne
 * vælte den booking, der udløste beskeden.
 */
export async function sendPush(
  sub: StoredSubscription,
  payload: string,
  vapid: VapidKeys,
  subject: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): Promise<SendResult> {
  try {
    const body = await encryptPayload(payload, sub.keys);
    const auth = await vapidAuthHeader(sub.endpoint, vapid, subject, nowSeconds);
    const res = await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        TTL: "86400",
        Urgency: "high",
      },
      body,
    });
    return {
      endpoint: sub.endpoint,
      status: res.status,
      ok: res.ok,
      gone: res.status === 404 || res.status === 410,
    };
  } catch (e) {
    console.error("[push] send fejlede:", e);
    return { endpoint: sub.endpoint, status: 0, ok: false, gone: false };
  }
}
