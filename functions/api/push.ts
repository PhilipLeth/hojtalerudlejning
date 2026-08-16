/* ───── Push-abonnementer (admin) ─────
 *
 * GET  → er push sat op, og hvilke telefoner er tilmeldt
 * POST → subscribe / unsubscribe / test
 *
 * Abonnementerne ligger samlet i én KV-nøgle. Det er en håndfuld telefoner,
 * ikke en abonnentliste — en nøgle pr. telefon ville koste et list-kald ved
 * hver booking uden at give noget.
 */

import { sendPush, type StoredSubscription } from "../../src/lib/webpush";

export const KV_PUSH_SUBS = "push_subs";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
  /** base64url, 65 bytes — offentlig, ligger i klienten */
  VAPID_PUBLIC_KEY?: string;
  /** base64url, 32 bytes — hemmelig */
  VAPID_PRIVATE_KEY?: string;
  /** mailto: som push-tjenesten kan kontakte ved problemer */
  VAPID_SUBJECT?: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: corsHeaders });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

function unauthorized(context: { request: Request; env: Env }): Response | null {
  const secret = new URL(context.request.url).searchParams.get("secret");
  if (!context.env.ADMIN_SECRET || secret !== context.env.ADMIN_SECRET) {
    return json({ error: "Unauthorized" }, 401);
  }
  return null;
}

export async function loadSubscriptions(kv: KVNamespace): Promise<StoredSubscription[]> {
  try {
    const raw = await kv.get(KV_PUSH_SUBS);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter((s) => s?.endpoint && s?.keys?.p256dh && s?.keys?.auth) : [];
  } catch {
    return [];
  }
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const denied = unauthorized(context);
  if (denied) return denied;

  const subs = await loadSubscriptions(context.env.BOOKINGS);
  const configured = !!(context.env.VAPID_PUBLIC_KEY && context.env.VAPID_PRIVATE_KEY);

  return json({
    configured,
    publicKey: context.env.VAPID_PUBLIC_KEY ?? null,
    /** Kun endepunktets vært — resten er nøgler, der ikke skal vises */
    devices: subs.map((s) => ({
      host: (() => { try { return new URL(s.endpoint).host; } catch { return "ukendt"; } })(),
      endpoint: s.endpoint,
    })),
  });
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const denied = unauthorized(context);
  if (denied) return denied;

  let body: { action?: string; subscription?: StoredSubscription; endpoint?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const kv = context.env.BOOKINGS;
  const subs = await loadSubscriptions(kv);

  if (body.action === "subscribe") {
    const s = body.subscription;
    if (!s?.endpoint || !s.keys?.p256dh || !s.keys?.auth) {
      return json({ error: "Ufuldstændigt abonnement" }, 400);
    }
    if (!/^https:\/\//.test(s.endpoint)) return json({ error: "Ugyldigt endpoint" }, 400);

    // Samme telefon der tilmelder sig igen skal ikke give to beskeder
    const next = [...subs.filter((x) => x.endpoint !== s.endpoint), { endpoint: s.endpoint, keys: s.keys }];
    await kv.put(KV_PUSH_SUBS, JSON.stringify(next));
    return json({ ok: true, count: next.length });
  }

  if (body.action === "unsubscribe") {
    const next = subs.filter((x) => x.endpoint !== body.endpoint);
    await kv.put(KV_PUSH_SUBS, JSON.stringify(next));
    return json({ ok: true, count: next.length });
  }

  if (body.action === "test") {
    const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } = context.env;
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return json({ error: "VAPID-nøglerne mangler i Cloudflare" }, 503);
    }
    if (subs.length === 0) return json({ error: "Ingen telefoner er tilmeldt" }, 400);

    const payload = JSON.stringify({
      title: "Testbesked",
      body: "Sådan ser en ny booking ud. Push virker.",
      url: "/admin",
      tag: "test",
    });
    const results = await Promise.all(
      subs.map((s) =>
        sendPush(s, payload, { publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY },
          VAPID_SUBJECT || "mailto:info@lejhojtaler.dk"),
      ),
    );

    // Døde abonnementer ryddes op med det samme
    const gone = new Set(results.filter((r) => r.gone).map((r) => r.endpoint));
    if (gone.size) await kv.put(KV_PUSH_SUBS, JSON.stringify(subs.filter((s) => !gone.has(s.endpoint))));

    return json({ ok: results.some((r) => r.ok), results, removed: gone.size });
  }

  return json({ error: "Ukendt action" }, 400);
};
