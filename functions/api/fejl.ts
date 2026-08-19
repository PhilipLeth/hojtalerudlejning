/* ───── Fejl hos kunderne ─────
 *
 * POST → offentligt. En browser melder en fejl ind. Ingen login, fordi fejlen
 *        sker hos en kunde. Derfor: hårde grænser på indhold og antal.
 * GET  → admin. Alle rapporter, plus en opsummering grupperet efter fejl.
 * DELETE → admin. Ryd listen, når en fejl er rettet.
 *
 * Mislykkede bookinger og betalinger sender en push til telefonen med det
 * samme: det er en kunde, der stod med pengene fremme og ikke kom igennem.
 */

import { requireAdmin } from "./_lib/adminAuth";
import {
  FEJL_PREFIX,
  FEJL_TTL_SEK,
  MAX_PR_TIME,
  børVække,
  fejlNøgle,
  opsummer,
  parseFejlrapport,
  type Fejlrapport,
} from "./_lib/klientfejl";
import { sendPush } from "../../src/lib/webpush";
import { KV_PUSH_SUBS, loadSubscriptions } from "./push";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET?: string;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Admin-Token",
  "Content-Type": "application/json",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: cors });

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

/**
 * Loft pr. IP i timen. IP'en gemmes ikke — den bruges kun som nøgle til en
 * tæller, der selv udløber. Uden loftet kunne én ødelagt side eller én
 * ondsindet besøgende fylde KV.
 */
async function overGrænsen(kv: KVNamespace, ip: string, time: string): Promise<boolean> {
  const key = `fejl_kvote_${time}_${ip}`;
  const nu = Number((await kv.get(key)) || 0) + 1;
  await kv.put(key, String(nu), { expirationTtl: 3600 });
  return nu > MAX_PR_TIME;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "Ugyldig JSON" }, 400);
  }

  const tid = new Date().toISOString();
  const land = context.request.headers.get("CF-IPCountry") || undefined;
  const rapport = parseFejlrapport(body, tid, land ?? undefined);
  // En ugyldig rapport svarer 204: klienten skal ikke prøve igen, og en fejl
  // i fejlrapporteringen må ikke give kunden endnu en fejl at se på
  if (!rapport) return new Response(null, { status: 204, headers: cors });

  const ip = context.request.headers.get("CF-Connecting-IP") || "ukendt";
  try {
    if (await overGrænsen(context.env.BOOKINGS, ip, tid.slice(0, 13))) {
      return new Response(null, { status: 204, headers: cors });
    }
    const nøgle = fejlNøgle(tid, Math.random().toString(36).slice(2, 8));
    await context.env.BOOKINGS.put(nøgle, JSON.stringify(rapport), { expirationTtl: FEJL_TTL_SEK });
    console.log(`[fejl] ${rapport.type}: ${rapport.besked} · ${rapport.enhed} · ${rapport.side}`);
  } catch (e) {
    console.error("[fejl] kunne ikke gemmes:", e);
    return new Response(null, { status: 204, headers: cors });
  }

  // En tabt booking skal give et bip på telefonen, ikke vente på at nogen kigger
  if (børVække(rapport.type)) {
    try {
      await varsl(context.env, rapport);
    } catch (e) {
      console.error("[fejl] push fejlede:", e);
    }
  }

  return new Response(null, { status: 204, headers: cors });
};

async function varsl(env: Env, r: Fejlrapport): Promise<void> {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT, BOOKINGS } = env;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  // Højst én besked i kvarteret — en fejl der rammer alle må ikke ringe 50 gange
  const spærre = "fejl_push_spaerre";
  if (await BOOKINGS.get(spærre)) return;
  await BOOKINGS.put(spærre, "1", { expirationTtl: 900 });

  const subs = await loadSubscriptions(BOOKINGS);
  if (!subs.length) return;

  const payload = JSON.stringify({
    title: r.type === "betaling_fejlede" ? "En betaling gik galt" : "En booking gik galt",
    body: `${r.besked}\n${r.enhed}${r.produkt ? ` · ${r.produkt}` : ""}`,
    url: "/admin/indstillinger",
    tag: "kundefejl",
  });
  const results = await Promise.all(
    subs.map((s) =>
      sendPush(s, payload, { publicKey: VAPID_PUBLIC_KEY, privateKey: VAPID_PRIVATE_KEY },
        VAPID_SUBJECT || "mailto:info@lejhojtaler.dk"),
    ),
  );
  const væk = new Set(results.filter((x) => x.gone).map((x) => x.endpoint));
  if (væk.size) await BOOKINGS.put(KV_PUSH_SUBS, JSON.stringify(subs.filter((s) => !væk.has(s.endpoint))));
}

async function hentAlle(kv: KVNamespace): Promise<Fejlrapport[]> {
  const ud: Fejlrapport[] = [];
  let cursor: string | undefined;
  do {
    const side = await kv.list({ prefix: FEJL_PREFIX, cursor });
    for (const k of side.keys) {
      // Kvote-tællerne deler præfiks, men er ikke rapporter
      if (k.name.startsWith("fejl_kvote_") || k.name.startsWith("fejl_push_")) continue;
      const raw = await kv.get(k.name);
      if (!raw) continue;
      try {
        ud.push(JSON.parse(raw) as Fejlrapport);
      } catch {
        /* ulæselig rapport springes over */
      }
    }
    cursor = side.list_complete ? undefined : side.cursor;
  } while (cursor);
  return ud.sort((a, b) => b.tid.localeCompare(a.tid));
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, cors);
  if (auth instanceof Response) return auth;

  const alle = await hentAlle(context.env.BOOKINGS);
  return json({
    antal: alle.length,
    opsummering: opsummer(alle),
    // De nyeste med alle detaljer — nok til at kunne genskabe en fejl
    seneste: alle.slice(0, 50),
  });
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, cors);
  if (auth instanceof Response) return auth;

  let slettet = 0;
  let cursor: string | undefined;
  do {
    const side = await context.env.BOOKINGS.list({ prefix: FEJL_PREFIX, cursor });
    for (const k of side.keys) {
      if (k.name.startsWith("fejl_kvote_")) continue;
      await context.env.BOOKINGS.delete(k.name);
      slettet++;
    }
    cursor = side.list_complete ? undefined : side.cursor;
  } while (cursor);

  console.log(`[fejl] ${slettet} rapporter ryddet af ${auth.name}`);
  return json({ ok: true, slettet });
};
