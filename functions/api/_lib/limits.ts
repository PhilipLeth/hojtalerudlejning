/**
 * Rate limiting og månedsforbrug — simple KV-tællere.
 * KV er ikke atomisk (best effort), men rigeligt som kø-dæmper i MVP.
 * Skiftes til Durable Objects/Turnstile hvis misbrug ses (PRD 3.8).
 */

/** "YYYYMMDDHH" i UTC — nøgle for time-vinduet. */
export function hourKey(now: Date): string {
  return now.toISOString().slice(0, 13).replace(/[-T]/g, "");
}

/** "YYYYMM" i UTC — nøgle for månedstælleren. */
export function monthKey(now: Date): string {
  return now.toISOString().slice(0, 7).replace("-", "");
}

/** Kort hash af IP så rå adresser ikke ligger i KV. */
export async function ipHash(ip: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return [...new Uint8Array(digest).slice(0, 8)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Læs tæller (0 hvis tom/ulæselig). */
export function parseCount(raw: string | null): number {
  const n = raw === null ? 0 : parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

/**
 * Tæl `amount` op på nøglen hvis grænsen ikke er nået.
 * Returnerer true når handlingen er tilladt.
 */
export async function checkAndCount(
  kv: KVNamespace,
  key: string,
  limit: number,
  amount = 1,
  ttlSec?: number,
): Promise<boolean> {
  const brugt = parseCount(await kv.get(key));
  if (brugt + amount > limit) return false;
  await kv.put(key, String(brugt + amount), ttlSec ? { expirationTtl: ttlSec } : undefined);
  return true;
}

/** IP fra Cloudflare-headeren (fallback: "ukendt" — deler så én kvote). */
export function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? "ukendt";
}
