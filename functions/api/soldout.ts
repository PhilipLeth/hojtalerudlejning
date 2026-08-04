/* ───── Udsolgt-oversigt (admin) ─────
 *
 * Beregner per dag hvilke produkter der er/var udsolgt — både bagud og
 * frem i tid — ud fra bookinger vs. lagerbeholdning i KV.
 * I modsætning til /api/availability tælles ALLE bookinger med (også
 * "afleveret"), så historikken viser hvad der reelt var udsolgt.
 */

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

// Skal matche DEFAULT_INVENTORY i availability.ts
const DEFAULT_INVENTORY: Record<string, number> = { thumpgo: 1, party: 2, soundboks: 2, festival: 2, lys: 2, rog: 2, stativer: 2, taske: 1, subwoofer: 1 };

const SPEAKER_IDS = ["thumpgo", "party", "soundboks", "festival"];

function speakerNameToId(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower === "party" || lower.includes("lille højtalerpakke") || lower.includes("small speaker")) return "party";
  if (lower === "festival" || lower.includes("stor højtalerpakke") || lower.includes("large speaker")) return "festival";
  if (lower.includes("thump")) return "thumpgo";
  if (lower.includes("soundboks")) return "soundboks";
  if (lower === "kun lys") return "lys-only";
  return null;
}

const ADDON_NAME_TO_ID: Record<string, string> = {
  lys: "lys", lysshow: "lys", "lys show": "lys",
  rog: "rog", "røg": "rog", roegmaskine: "rog", "røgmaskine": "rog", "smoke": "rog",
  stativer: "stativer", stativ: "stativer",
  taske: "taske", baeretaske: "taske", "bæretaske": "taske",
  subwoofer: "subwoofer", sub: "subwoofer",
};

function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Produkt-ids en booking optager (speaker + tilvalg + kurv-varer) */
function bookedProductIds(booking: Record<string, unknown>): string[] {
  const ids: string[] = [];

  const speakerId: string | null =
    typeof booking.speakerId === "string" && booking.speakerId
      ? booking.speakerId
      : speakerNameToId(String(booking.speaker || ""));

  if (speakerId === "lys-only") ids.push("lys");
  else if (speakerId && speakerId !== "effects-only" && SPEAKER_IDS.includes(speakerId)) ids.push(speakerId);

  if (Array.isArray(booking.addonIds) && booking.addonIds.length) {
    for (const pid of booking.addonIds) {
      if (typeof pid === "string") ids.push(pid);
    }
  } else {
    for (const label of (booking.addons as string[]) || []) {
      const lower = String(label).toLowerCase().replace(/[^a-zæøå]/g, "");
      const pid = ADDON_NAME_TO_ID[lower];
      if (pid) ids.push(pid);
    }
  }

  for (const item of (booking.cartItems as Array<{ productId?: string }>) || []) {
    if (item?.productId) ids.push(item.productId);
  }

  return ids;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const secret = url.searchParams.get("secret");

  if (!context.env.ADMIN_SECRET || secret !== context.env.ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const from = url.searchParams.get("from") || addDays(today, -60);
  const to = url.searchParams.get("to") || addDays(today, 90);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) {
    return new Response(JSON.stringify({ error: "Invalid from/to (YYYY-MM-DD)" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    let inventory: Record<string, number> = { ...DEFAULT_INVENTORY };
    const inventoryRaw = await context.env.BOOKINGS.get("inventory");
    if (inventoryRaw) {
      try {
        inventory = { ...DEFAULT_INVENTORY, ...JSON.parse(inventoryRaw) };
      } catch {
        // use defaults
      }
    }

    // Optaget pr. dag pr. produkt: dag D er optaget når pickup <= D < return
    const perDay: Record<string, Record<string, number>> = {};

    const list = await context.env.BOOKINGS.list({ prefix: "booking_" });
    for (const key of list.keys) {
      const value = await context.env.BOOKINGS.get(key.name);
      if (!value) continue;

      let booking: Record<string, unknown>;
      try {
        booking = JSON.parse(value);
      } catch {
        continue;
      }

      const pickup = String(booking.pickup || "").slice(0, 10);
      const ret = String(booking.returnDate || "").slice(0, 10);
      if (!pickup || !ret) continue;

      // Uden for det forespurgte vindue
      if (ret <= from || pickup > to) continue;

      const ids = bookedProductIds(booking);
      if (!ids.length) continue;

      for (let day = pickup < from ? from : pickup; day < ret && day <= to; day = addDays(day, 1)) {
        const dayMap = (perDay[day] ??= {});
        for (const pid of ids) {
          dayMap[pid] = (dayMap[pid] || 0) + 1;
        }
      }
    }

    // Blokerede datoer i vinduet tæller som udsolgt (produkter=[] blokerer alt)
    const blocked: Record<string, string[]> = {};
    const blockedList = await context.env.BOOKINGS.list({ prefix: "blocked_" });
    for (const key of blockedList.keys) {
      const date = key.name.replace("blocked_", "");
      if (date < from || date > to) continue;
      const val = await context.env.BOOKINGS.get(key.name);
      let products: string[] = [];
      if (val) {
        try {
          products = JSON.parse(val).products || [];
        } catch {
          // alle produkter
        }
      }
      blocked[date] = products;
    }

    // Saml kun dage hvor noget er udsolgt/blokeret
    const days: Array<{
      date: string;
      soldOut: Array<{ id: string; booked: number; total: number }>;
      blocked?: string[];
    }> = [];

    const allDates = new Set<string>([...Object.keys(perDay), ...Object.keys(blocked)]);
    for (const date of [...allDates].sort()) {
      const soldOut: Array<{ id: string; booked: number; total: number }> = [];
      const dayMap = perDay[date] || {};
      for (const [pid, count] of Object.entries(dayMap)) {
        const total = inventory[pid];
        // Kun produkter med kendt lager kan være udsolgt
        if (total !== undefined && count >= total) {
          soldOut.push({ id: pid, booked: count, total });
        }
      }
      soldOut.sort((a, b) => a.id.localeCompare(b.id));
      if (soldOut.length || date in blocked) {
        days.push({ date, soldOut, ...(date in blocked ? { blocked: blocked[date] } : {}) });
      }
    }

    return new Response(JSON.stringify({ from, to, today, inventory, days }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("Soldout error:", e);
    return new Response(JSON.stringify({ error: "Failed to compute sold out overview" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
