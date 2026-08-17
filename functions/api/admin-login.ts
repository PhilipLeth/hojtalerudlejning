/**
 * Admin-login: vælg bruger + adgangskode → session-token.
 *
 * GET  — brugerliste til login-dropdown (kun id + navn)
 * POST — { userId, password } → { token, user }
 * DELETE — invalider session (?secret=token)
 */
import {
  createSession,
  deleteSession,
  ensureDefaultUsers,
  extractAdminToken,
  loadAdminUsers,
  publicUserList,
  verifyPassword,
} from "./_lib/adminAuth";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET?: string;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const users = await ensureDefaultUsers(context.env.BOOKINGS, context.env.ADMIN_SECRET);
    return json({ users: publicUserList(users) });
  } catch (e) {
    console.error("[admin-login] GET error:", e);
    return json({ error: "Kunne ikke hente brugere" }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let body: { userId?: string; password?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const userId = String(body.userId || "").trim().toLowerCase();
  const password = String(body.password || "");
  if (!userId || !password) {
    return json({ error: "userId og password påkrævet" }, 400);
  }

  try {
    const users = await ensureDefaultUsers(context.env.BOOKINGS, context.env.ADMIN_SECRET);
    const user = users.find((u) => u.id === userId && u.active);
    if (!user || !(await verifyPassword(user, password))) {
      console.log("[admin-login] fejlet login for", userId);
      return json({ error: "Forkert bruger eller adgangskode" }, 401);
    }

    const token = await createSession(context.env.BOOKINGS, user);
    console.log("[admin-login] login ok:", user.name);
    return json({ token, user: { id: user.id, name: user.name } });
  } catch (e) {
    console.error("[admin-login] POST error:", e);
    return json({ error: "Login fejlede" }, 500);
  }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const token = extractAdminToken(context.request);
  if (!token) return json({ error: "Mangler token" }, 400);
  try {
    await deleteSession(context.env.BOOKINGS, token);
    return json({ ok: true });
  } catch (e) {
    console.error("[admin-login] DELETE error:", e);
    return json({ error: "Kunne ikke logge ud" }, 500);
  }
};
