/**
 * Admin-brugerstyring — kun for indloggede admins.
 *
 * GET  — liste (uden hashes)
 * POST — create | set_password | rename | deactivate | activate
 */
import {
  hashPassword,
  loadAdminUsers,
  randomSalt,
  requireAdmin,
  saveAdminUsers,
  type AdminUserRecord,
} from "./_lib/adminAuth";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET?: string;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Token",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

function sanitize(users: AdminUserRecord[]) {
  return users.map(({ id, name, active, createdAt, updatedAt }) => ({
    id,
    name,
    active,
    createdAt,
    updatedAt,
  }));
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, cors);
  if (auth instanceof Response) return auth;

  const users = await loadAdminUsers(context.env.BOOKINGS);
  return json({ users: sanitize(users) });
};

type Body = {
  action?: string;
  id?: string;
  name?: string;
  password?: string;
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, cors);
  if (auth instanceof Response) return auth;

  let body: Body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const action = String(body.action || "");
  const users = await loadAdminUsers(context.env.BOOKINGS);
  const now = new Date().toISOString();

  if (action === "create") {
    const id = String(body.id || "").trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    const name = String(body.name || "").trim();
    const password = String(body.password || "");
    if (!id || id.length < 2) return json({ error: "id skal være mindst 2 tegn (a-z, 0-9)" }, 400);
    if (!name) return json({ error: "Navn påkrævet" }, 400);
    if (password.length < 4) return json({ error: "Adgangskode skal være mindst 4 tegn" }, 400);
    if (users.some((u) => u.id === id)) return json({ error: "Bruger findes allerede" }, 409);

    const salt = randomSalt();
    const hash = await hashPassword(password, salt);
    users.push({ id, name, salt, hash, active: true, createdAt: now });
    await saveAdminUsers(context.env.BOOKINGS, users);
    console.log("[admin-users] oprettet", id, "af", auth.name);
    return json({ ok: true, users: sanitize(users) });
  }

  if (action === "set_password") {
    const id = String(body.id || "").trim();
    const password = String(body.password || "");
    if (!id) return json({ error: "id påkrævet" }, 400);
    if (password.length < 4) return json({ error: "Adgangskode skal være mindst 4 tegn" }, 400);
    const user = users.find((u) => u.id === id);
    if (!user) return json({ error: "Bruger ikke fundet" }, 404);

    user.salt = randomSalt();
    user.hash = await hashPassword(password, user.salt);
    user.updatedAt = now;
    await saveAdminUsers(context.env.BOOKINGS, users);
    console.log("[admin-users] adgangskode skiftet for", id, "af", auth.name);
    return json({ ok: true, users: sanitize(users) });
  }

  if (action === "rename") {
    const id = String(body.id || "").trim();
    const name = String(body.name || "").trim();
    if (!id || !name) return json({ error: "id og name påkrævet" }, 400);
    const user = users.find((u) => u.id === id);
    if (!user) return json({ error: "Bruger ikke fundet" }, 404);
    user.name = name;
    user.updatedAt = now;
    await saveAdminUsers(context.env.BOOKINGS, users);
    return json({ ok: true, users: sanitize(users) });
  }

  if (action === "deactivate" || action === "activate") {
    const id = String(body.id || "").trim();
    const user = users.find((u) => u.id === id);
    if (!user) return json({ error: "Bruger ikke fundet" }, 404);
    if (id === auth.id) return json({ error: "Du kan ikke deaktivere dig selv" }, 400);
    const activeCount = users.filter((u) => u.active && u.id !== id).length;
    if (action === "deactivate" && activeCount < 1) {
      return json({ error: "Mindst én aktiv bruger skal blive" }, 400);
    }
    user.active = action === "activate";
    user.updatedAt = now;
    await saveAdminUsers(context.env.BOOKINGS, users);
    return json({ ok: true, users: sanitize(users) });
  }

  return json({ error: "Ukendt action" }, 400);
};
