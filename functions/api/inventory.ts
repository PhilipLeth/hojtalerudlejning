import { requireAdmin } from "./_lib/adminAuth";
import {
  INVENTORY_KEY,
  OVERBOOK_KEY,
  loadInventoryPair,
  validateStockPatch,
} from "./_lib/inventory";
import { overbookingAhead } from "./_lib/overbooking";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

/**
 * Lagertallene som resten af systemet regner med — det gemte lagt over
 * defaults fra koden. Admin redigerer præcis de tal, ledighed beregnes ud fra,
 * så der ikke kan stå ét antal i admin og gælde et andet i booking-flowet.
 *
 * Svaret bærer også overbooking pr. produkt og "skal skaffes"-listen: de
 * bookinger vi allerede har taget imod ud over det vi ejer.
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  try {
    const today = new Date().toISOString().slice(0, 10);
    const [{ owned, overbook }, overbooked] = await Promise.all([
      loadInventoryPair(context.env.BOOKINGS),
      overbookingAhead(context.env.BOOKINGS, today),
    ]);

    // Spærrede datoer hører til samme side — de er også "hvad kan lejes hvornår"
    const blocked: Array<{ date: string; reason: string; products: string[] }> = [];
    const list = await context.env.BOOKINGS.list({ prefix: "blocked_" });
    for (const key of list.keys) {
      const date = key.name.replace("blocked_", "");
      const val = await context.env.BOOKINGS.get(key.name);
      let parsed: { reason?: string; products?: string[] } = {};
      if (val) {
        try {
          parsed = JSON.parse(val);
        } catch {
          // en ulæselig blokering er stadig en blokering
        }
      }
      blocked.push({ date, reason: parsed.reason || "", products: parsed.products || [] });
    }
    blocked.sort((a, b) => a.date.localeCompare(b.date));

    return new Response(JSON.stringify({ inventory: owned, overbook, blocked, overbooked }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("Inventory GET error:", e);
    return new Response(JSON.stringify({ error: "Kunne ikke hente lagertal" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

interface SetInventoryBody {
  action: "set_inventory";
  /** productId → antal, eller null for at rydde tallet igen */
  inventory?: Record<string, number | null>;
  /** productId → hvor mange vi derudover tager imod (JIT), null rydder */
  overbook?: Record<string, number | null>;
}

interface BlockDateBody {
  action: "block_date";
  date: string;
  reason: string;
  products: string[];
}

interface UnblockDateBody {
  action: "unblock_date";
  date: string;
}

type RequestBody = SetInventoryBody | BlockDateBody | UnblockDateBody;

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;


  try {
    const body: RequestBody = await context.request.json();

    if (body.action === "set_inventory") {
      if (!body.inventory && !body.overbook) {
        return new Response(JSON.stringify({ error: "Ingen lagertal at gemme" }), { status: 400, headers: corsHeaders });
      }

      // Flet felt for felt: admin sender kun de produkter der blev rettet, så to
      // faner (eller produktsiden og lagersiden) ikke overskriver hinanden.
      const gem = async (key: string, patch: Record<string, number | null>) => {
        let existing: Record<string, number> = {};
        try {
          const raw = await context.env.BOOKINGS.get(key);
          if (raw) existing = JSON.parse(raw);
        } catch { /* ignore */ }
        const merged: Record<string, number> = { ...existing };
        for (const [id, value] of Object.entries(patch)) {
          // null (og 0 overbooking) rydder tallet — produktet er tilbage til udgangspunktet
          if (value === null) delete merged[id];
          else merged[id] = value;
        }
        console.log("[inventory]", key, Object.keys(patch).length, "rettelser →", Object.keys(merged).length, "produkter");
        await context.env.BOOKINGS.put(key, JSON.stringify(merged));
      };

      for (const [key, patch] of [
        [INVENTORY_KEY, body.inventory],
        [OVERBOOK_KEY, body.overbook],
      ] as const) {
        if (!patch) continue;
        const valid = validateStockPatch(patch);
        if (!valid.ok) {
          return new Response(JSON.stringify({ error: valid.error }), { status: 400, headers: corsHeaders });
        }
        // Overbooking 0 er det samme som ingen overbooking
        const cleaned = Object.fromEntries(
          Object.entries(valid.patch).map(([id, v]) => [id, key === OVERBOOK_KEY && v === 0 ? null : v]),
        );
        await gem(key, cleaned);
      }

      const pair = await loadInventoryPair(context.env.BOOKINGS);
      return new Response(JSON.stringify({ ok: true, inventory: pair.owned, overbook: pair.overbook }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (body.action === "block_date") {
      const { date, reason, products } = body;
      if (!date || !date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return new Response(JSON.stringify({ error: "Invalid date format (YYYY-MM-DD)" }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      const key = `blocked_${date}`;
      await context.env.BOOKINGS.put(key, JSON.stringify({ reason: reason || "", products: products || [] }));
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (body.action === "unblock_date") {
      const { date } = body;
      if (!date) {
        return new Response(JSON.stringify({ error: "Missing date" }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      const key = `blocked_${date}`;
      await context.env.BOOKINGS.delete(key);
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("Inventory error:", e);
    return new Response(JSON.stringify({ error: "Failed to process request" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
