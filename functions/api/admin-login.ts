/**
 * Admin-login: vælg bruger + adgangskode → session-token, eller et login-link
 * på mail for dem der har glemt koden.
 *
 * GET  — brugerliste til login-dropdown (id, navn, om der kan sendes link)
 * POST — { userId, password }            → { token, user }
 *        { action: "magic", userId }     → sender link, { ok, sentTo }
 *        { magicToken }                  → { token, user }  (indløser linket)
 * DELETE — invalider session (?secret=token)
 */
import {
  consumeMagicLink,
  createMagicLink,
  createSession,
  deleteSession,
  ensureDefaultUsers,
  extractAdminToken,
  maskEmail,
  publicUserList,
  verifyPassword,
} from "./_lib/adminAuth";
import { sendMagicLinkMail } from "./_lib/magicMail";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET?: string;
  RESEND_API_KEY?: string;
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
  let body: { userId?: string; password?: string; action?: string; magicToken?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const userId = String(body.userId || "").trim().toLowerCase();
  const password = String(body.password || "");
  const magicToken = String(body.magicToken || "");

  // Indløs et login-link fra mailen
  if (magicToken) {
    try {
      const user = await consumeMagicLink(context.env.BOOKINGS, magicToken);
      if (!user) return json({ error: "Linket er udløbet eller allerede brugt. Bed om et nyt." }, 401);
      const token = await createSession(context.env.BOOKINGS, user);
      console.log("[admin-login] login via link:", user.name);
      return json({ token, user: { id: user.id, name: user.name } });
    } catch (e) {
      console.error("[admin-login] magic POST error:", e);
      return json({ error: "Login fejlede" }, 500);
    }
  }

  // Send et login-link
  if (body.action === "magic") {
    if (!userId) return json({ error: "Vælg hvem du er først" }, 400);
    try {
      const users = await ensureDefaultUsers(context.env.BOOKINGS, context.env.ADMIN_SECRET);
      const user = users.find((u) => u.id === userId && u.active);
      if (!user) return json({ error: "Ukendt bruger" }, 404);
      if (!user.email) return json({ error: "Der er ingen e-mail på brugeren. En anden admin kan sætte den under Brugere." }, 400);
      if (!context.env.RESEND_API_KEY) return json({ error: "Mail er ikke sat op på serveren" }, 503);

      const token = await createMagicLink(context.env.BOOKINGS, user);
      if (!token) return json({ error: "Der er lige sendt et link. Tjek din indbakke, og prøv igen om et minut." }, 429);

      const link = `${new URL(context.request.url).origin}/admin?magic=${encodeURIComponent(token)}`;
      const sent = await sendMagicLinkMail(context.env, user.email, user.name, link);
      if (!sent) return json({ error: "Mailen kunne ikke sendes. Prøv igen om lidt." }, 502);
      console.log("[admin-login] login-link sendt til", user.id);
      return json({ ok: true, sentTo: maskEmail(user.email) });
    } catch (e) {
      console.error("[admin-login] magic send error:", e);
      return json({ error: "Kunne ikke sende link" }, 500);
    }
  }

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
