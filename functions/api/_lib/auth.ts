/**
 * Tenant-admin-auth: adgangskode → PBKDF2-hash i tenant-record, sessioner i KV.
 * PLATFORM_SECRET fungerer som master-adgang til alle tenants (support).
 * Samme mønster som lejhojtalers adminAuth.
 */

import type { TenantRecord } from "../../../shared/types";

const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 dage
const MAX_TOKEN_LEN = 256;

const enc = () => new TextEncoder();

/** PBKDF2-SHA256 — tilgængelig i Workers og Vitest (Node 18+). */
export async function hashSecret(secret: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc().encode(secret), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: enc().encode(salt), iterations: 100_000, hash: "SHA-256" },
    key,
    256,
  );
  return btoa(String.fromCharCode(...new Uint8Array(bits)));
}

export function randomSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

/** URL-sikkert session-token, ~43 tegn. */
export function sessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Hent token fra Authorization: Bearer eller X-Admin-Token. */
export function extractToken(request: Request): string | null {
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim() || null;
  const hdr = request.headers.get("X-Admin-Token");
  if (hdr) return hdr.trim() || null;
  return null;
}

function plausibeltToken(token: string): boolean {
  return token.length > 0 && token.length <= MAX_TOKEN_LEN && !/[\r\n]/.test(token);
}

export async function verifySecret(tenant: TenantRecord, secret: string): Promise<boolean> {
  const hash = await hashSecret(secret, tenant.adminSalt);
  return hash === tenant.adminHash;
}

export async function createSession(kv: KVNamespace, slug: string): Promise<string> {
  const token = sessionToken();
  await kv.put(`session:${slug}:${token}`, new Date().toISOString(), { expirationTtl: SESSION_TTL_SEC });
  return token;
}

export async function hasSession(kv: KVNamespace, slug: string, token: string): Promise<boolean> {
  if (!plausibeltToken(token)) return false;
  return (await kv.get(`session:${slug}:${token}`)) !== null;
}

interface AuthEnv {
  DATA: KVNamespace;
  PLATFORM_SECRET?: string;
}

/**
 * Kræv gyldig admin-session for en tenant (eller PLATFORM_SECRET som master).
 * Returnerer null når adgang er ok, ellers en 401-Response.
 */
export async function requireTenantAdmin(env: AuthEnv, request: Request, slug: string): Promise<Response | null> {
  const token = extractToken(request);
  if (token && plausibeltToken(token)) {
    if (env.PLATFORM_SECRET && token === env.PLATFORM_SECRET) return null;
    if (await hasSession(env.DATA, slug, token)) return null;
  }
  return new Response(JSON.stringify({ error: "Ikke logget ind" }), {
    status: 401,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

/** Kræv PLATFORM_SECRET (platform-endpoints). */
export function requirePlatform(env: AuthEnv, request: Request): Response | null {
  const token = extractToken(request);
  if (env.PLATFORM_SECRET && token === env.PLATFORM_SECRET) return null;
  return new Response(JSON.stringify({ error: "Kræver platform-adgang" }), {
    status: 401,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}
