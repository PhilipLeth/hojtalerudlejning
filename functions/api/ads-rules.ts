/* ───── Regler for automatisk slukning (admin) ─────
 *
 * Regler gemmes og evalueres, men eksekveres IKKE. GET viser hvad hver regel
 * ville gøre lige nu, så man kan se logikken opføre sig rigtigt i et par uger
 * før man giver den lov til at røre kontoen.
 *
 * Når den dag kommer, er det eneste der mangler et kald til
 * setAdGroupStatus() for hver evaluation med shouldPause=true — plus en
 * beslutning om hvem der kalder det (cron).
 */

import { addDays, loadBookings, soldOutDaysByProduct } from "./_lib/bookings";
import { effectiveInventory } from "./_lib/inventory";
import { upcomingWeekend } from "./ads";

import { requireAdmin } from "./_lib/adminAuth";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const KV_RULES = "ads_rules";
const KV_MAPPING = "ads_mapping";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: corsHeaders });

export type Trigger = "udsolgt_weekend" | "udsolgt_naeste_dage" | "lager_nul";

export interface Rule {
  id: string;
  productId: string;
  trigger: Trigger;
  /** Kun for "udsolgt_naeste_dage": hvor mange dage frem der kigges. */
  windowDays?: number;
  /** Genaktivér automatisk når produktet er ledigt igen. */
  autoResume: boolean;
  note?: string;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

/** Første dag fra og med `from` hvor produktet ikke er udsolgt. */
function firstFreeDay(soldOutDays: string[], from: string, horizon: string): string | null {
  const set = new Set(soldOutDays);
  for (let d = from; d <= horizon; d = addDays(d, 1)) {
    if (!set.has(d)) return d;
  }
  return null;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  const kv = context.env.BOOKINGS;
  const today = new Date().toISOString().slice(0, 10);
  const horizon = addDays(today, 60);

  try {
    const [rulesRaw, mappingRaw, inventoryRaw, bookings] = await Promise.all([
      kv.get(KV_RULES),
      kv.get(KV_MAPPING),
      kv.get("inventory"),
      loadBookings(kv),
    ]);

    const rules: Rule[] = rulesRaw ? JSON.parse(rulesRaw) : [];
    const mapping: Record<string, string[]> = mappingRaw ? JSON.parse(mappingRaw) : {};
    const inventory = effectiveInventory(inventoryRaw);
    const soldOut = soldOutDaysByProduct(bookings, inventory, today, horizon);
    const weekend = upcomingWeekend(today);

    const evaluations = rules.map((rule) => {
      const days = soldOut[rule.productId] ?? [];
      let shouldPause = false;
      let because = "";
      let until: string | null = null;

      if (rule.trigger === "udsolgt_weekend") {
        const hit = weekend.days.filter((d) => days.includes(d));
        shouldPause = hit.length > 0;
        because = shouldPause
          ? `Udsolgt ${hit.length} af ${weekend.days.length} weekenddage (${hit.join(", ")})`
          : "Ledig i den kommende weekend";
        if (shouldPause) until = firstFreeDay(days, weekend.from, horizon);
      } else if (rule.trigger === "udsolgt_naeste_dage") {
        const win = rule.windowDays ?? 7;
        const end = addDays(today, win);
        const hit = days.filter((d) => d >= today && d <= end);
        shouldPause = hit.length > 0;
        because = shouldPause
          ? `Udsolgt ${hit.length} dag(e) inden for ${win} dage`
          : `Ledig de næste ${win} dage`;
        if (shouldPause) until = firstFreeDay(days, today, horizon);
      } else if (rule.trigger === "lager_nul") {
        const total = inventory[rule.productId];
        shouldPause = total === 0;
        because = shouldPause ? "Lagerbeholdning er 0" : `Lagerbeholdning er ${total ?? "ukendt"}`;
      }

      return {
        ruleId: rule.id,
        productId: rule.productId,
        shouldPause,
        because,
        /** Hvornår produktet er ledigt igen — grundlaget for "slukket indtil …". */
        availableAgain: until,
        adGroupIds: mapping[rule.productId] ?? [],
        /** Altid false: ingen regel har lov at røre kontoen endnu. */
        applied: false,
      };
    });

    return json({
      today,
      weekend,
      rules,
      evaluations,
      engineActive: false,
      note: "Regler evalueres men eksekveres ikke. Ingen annoncegruppe ændres automatisk.",
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Ukendt fejl" }, 500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  try {
    const body = (await context.request.json()) as { rules?: Rule[] };
    if (!Array.isArray(body.rules)) return json({ error: "rules skal være en liste" }, 400);

    const valid: Trigger[] = ["udsolgt_weekend", "udsolgt_naeste_dage", "lager_nul"];
    for (const r of body.rules) {
      if (!r.id || !r.productId) return json({ error: "hver regel skal have id og productId" }, 400);
      if (!valid.includes(r.trigger)) return json({ error: `ukendt trigger: ${r.trigger}` }, 400);
    }

    await context.env.BOOKINGS.put(KV_RULES, JSON.stringify(body.rules));
    return json({ ok: true, count: body.rules.length });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Ukendt fejl" }, 500);
  }
};
