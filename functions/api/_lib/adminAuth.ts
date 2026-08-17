/**
 * Admin-auth: navngivne brugere + session-tokens i KV.
 *
 * Erstatter én fælles ADMIN_SECRET. Legacy secret virker stadig som nødadgang
 * (user id "legacy") indtil alle er migreret til personlig login.
 */

export const KV_ADMIN_USERS = "admin_users";
const SESSION_PREFIX = "admin_session_";
const SESSION_TTL_SEC = 60 * 60 * 24 * 30; // 30 dage

export interface AdminUserRecord {
  id: string;
  name: string;
  salt: string;
  hash: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminSession {
  userId: string;
  name: string;
  createdAt: string;
}

export interface AdminIdentity {
  id: string;
  name: string;
  legacy?: boolean;
}

interface AdminEnv {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET?: string;
}

const enc = () => new TextEncoder();

/** PBKDF2-SHA256 — tilgængelig i Workers og Vitest (Node 18+). */
export async function hashPassword(password: string, salt: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc().encode(password), "PBKDF2", false, ["deriveBits"]);
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

export function sessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function loadAdminUsers(kv: KVNamespace): Promise<AdminUserRecord[]> {
  const raw = await kv.get(KV_ADMIN_USERS);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw) as AdminUserRecord[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

/** Opret Frederik + Philip første gang KV er tom — startkode = ADMIN_SECRET. */
export async function ensureDefaultUsers(kv: KVNamespace, adminSecret?: string): Promise<AdminUserRecord[]> {
  const existing = await loadAdminUsers(kv);
  if (existing.length) return existing;
  if (!adminSecret) return [];

  const now = new Date().toISOString();
  const bootstrap = [
    { id: "frederik", name: "Frederik" },
    { id: "philip", name: "Philip" },
  ];
  const users: AdminUserRecord[] = [];
  for (const u of bootstrap) {
    const salt = randomSalt();
    const hash = await hashPassword(adminSecret, salt);
    users.push({ id: u.id, name: u.name, salt, hash, active: true, createdAt: now });
  }
  await kv.put(KV_ADMIN_USERS, JSON.stringify(users));
  console.log("[adminAuth] bootstrap", users.length, "brugere oprettet — skift adgangskoder i /admin/brugere");
  return users;
}

export async function saveAdminUsers(kv: KVNamespace, users: AdminUserRecord[]): Promise<void> {
  await kv.put(KV_ADMIN_USERS, JSON.stringify(users));
}

export async function verifyPassword(user: AdminUserRecord, password: string): Promise<boolean> {
  const hash = await hashPassword(password, user.salt);
  return hash === user.hash;
}

export async function createSession(kv: KVNamespace, user: AdminUserRecord): Promise<string> {
  const token = sessionToken();
  const session: AdminSession = { userId: user.id, name: user.name, createdAt: new Date().toISOString() };
  await kv.put(`${SESSION_PREFIX}${token}`, JSON.stringify(session), { expirationTtl: SESSION_TTL_SEC });
  return token;
}

export async function loadSession(kv: KVNamespace, token: string): Promise<AdminSession | null> {
  const raw = await kv.get(`${SESSION_PREFIX}${token}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

export async function deleteSession(kv: KVNamespace, token: string): Promise<void> {
  await kv.delete(`${SESSION_PREFIX}${token}`);
}

/** Hent token fra query ?secret=, Authorization: Bearer, eller X-Admin-Token. */
export function extractAdminToken(request: Request): string | null {
  const url = new URL(request.url);
  const q = url.searchParams.get("secret");
  if (q) return q;
  const auth = request.headers.get("Authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim() || null;
  const hdr = request.headers.get("X-Admin-Token");
  if (hdr) return hdr.trim();
  return null;
}

/**
 * Valider admin-adgang. Returnerer AdminIdentity eller null.
 * Legacy: token === ADMIN_SECRET → { id: 'legacy', name: 'Legacy' }
 */
export async function resolveAdmin(env: AdminEnv, request: Request): Promise<AdminIdentity | null> {
  const token = extractAdminToken(request);
  if (!token) return null;

  if (env.ADMIN_SECRET && token === env.ADMIN_SECRET) {
    return { id: "legacy", name: "Legacy", legacy: true };
  }

  const session = await loadSession(env.BOOKINGS, token);
  if (!session) return null;

  const users = await loadAdminUsers(env.BOOKINGS);
  const user = users.find((u) => u.id === session.userId && u.active);
  if (!user) return null;

  return { id: user.id, name: user.name };
}

/** Til Pages Functions — returnerer Response ved 401. */
export async function requireAdmin(
  context: { request: Request; env: AdminEnv },
  corsHeaders: Record<string, string> = { "Content-Type": "application/json" },
): Promise<AdminIdentity | Response> {
  const admin = await resolveAdmin(context.env, context.request);
  if (!admin) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }
  return admin;
}

export function publicUserList(users: AdminUserRecord[]): Array<{ id: string; name: string }> {
  return users.filter((u) => u.active).map((u) => ({ id: u.id, name: u.name }));
}
