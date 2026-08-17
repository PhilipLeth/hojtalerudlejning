import { requireAdmin } from "./_lib/adminAuth";
import { INVENTORY_KEY, effectiveInventory, validateStockPatch } from "./_lib/inventory";

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
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;

  try {
    const raw = await context.env.BOOKINGS.get(INVENTORY_KEY);

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

    return new Response(JSON.stringify({ inventory: effectiveInventory(raw), blocked }), {
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
  inventory: Record<string, number | null>;
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
      const valid = validateStockPatch(body.inventory);
      if (!valid.ok) {
        return new Response(JSON.stringify({ error: valid.error }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      // Flet felt for felt: admin sender kun de produkter der blev rettet, så to
      // faner (eller produktsiden og lagersiden) ikke overskriver hinanden.
      let existing: Record<string, number> = {};
      try {
        const raw = await context.env.BOOKINGS.get(INVENTORY_KEY);
        if (raw) existing = JSON.parse(raw);
      } catch { /* ignore */ }
      const merged: Record<string, number> = { ...existing };
      for (const [id, value] of Object.entries(valid.patch)) {
        // null rydder tallet — produktet er dermed uden lagerstyring igen
        if (value === null) delete merged[id];
        else merged[id] = value;
      }
      console.log("[inventory] gemmer", Object.keys(valid.patch).length, "rettelser →", Object.keys(merged).length, "produkter");
      await context.env.BOOKINGS.put(INVENTORY_KEY, JSON.stringify(merged));
      return new Response(JSON.stringify({ ok: true, inventory: effectiveInventory(JSON.stringify(merged)) }), {
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
