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

const DEFAULT_INVENTORY: Record<string, number> = { thumpgo: 1, party: 2, soundboks: 2, festival: 2, festival_bas: 1, lys: 2, rog: 2, stativer: 2, taske: 1, subwoofer: 1 };

const SPEAKER_IDS = ["thumpgo", "party", "soundboks", "festival", "festival_bas"];

// Map booking speaker names back to product IDs (fallback for old bookings without speakerId)
function speakerNameToId(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower === "party" || lower.includes("lille højtalerpakke") || lower.includes("small speaker")) return "party";
  // "+ bas" skal matches FØR "stor højtalerpakke" — navnet indeholder begge
  if (lower.includes("+ bas") || lower.includes("+ bass") || lower.includes("med bas")) return "festival_bas";
  if (lower === "festival" || lower.includes("stor højtalerpakke") || lower.includes("large speaker")) return "festival";
  if (lower.includes("thump")) return "thumpgo";
  if (lower.includes("soundboks")) return "soundboks";
  if (lower === "kun lys") return "lys-only";
  return null;
}

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  if (!from || !to) {
    return new Response(JSON.stringify({ error: "Missing from/to query params" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  try {
    // Read inventory — merge stored counts over defaults so newly added
    // products (not yet saved from /admin/lager) get their default count
    // instead of appearing sold out
    let inventory: Record<string, number> = { ...DEFAULT_INVENTORY };
    const inventoryRaw = await context.env.BOOKINGS.get("inventory");
    if (inventoryRaw) {
      try {
        inventory = { ...DEFAULT_INVENTORY, ...JSON.parse(inventoryRaw) };
      } catch {
        // use defaults
      }
    }

    // Count overlapping bookings per product
    const booked: Record<string, number> = { thumpgo: 0, party: 0, soundboks: 0, festival: 0, festival_bas: 0, lys: 0, rog: 0, stativer: 0, taske: 0, subwoofer: 0 };

    // Map addon display names to product IDs
    const addonNameToId: Record<string, string> = {
      lys: "lys", lysshow: "lys", "lys show": "lys",
      rog: "rog", "røg": "rog", roegmaskine: "rog", "røgmaskine": "rog", "smoke": "rog",
      stativer: "stativer", stativ: "stativer",
      taske: "taske", baeretaske: "taske", "bæretaske": "taske",
      subwoofer: "subwoofer", sub: "subwoofer",
    };

    const list = await context.env.BOOKINGS.list({ prefix: "booking_" });
    for (const key of list.keys) {
      const value = await context.env.BOOKINGS.get(key.name);
      if (!value) continue;

      const booking = JSON.parse(value);

      // Only count active bookings — returned equipment is back, and a
      // cancelled booking must release its dates immediately
      if (booking.status === "afleveret" || String(booking.status || "").startsWith("annulleret")) continue;

      // Check date overlap: booking.pickup < query.to AND booking.returnDate > query.from
      const bookingPickup = booking.pickup;
      const bookingReturn = booking.returnDate;
      if (!bookingPickup || !bookingReturn) continue;

      const bPickup = bookingPickup.slice(0, 10);
      const bReturn = bookingReturn.slice(0, 10);
      const qFrom = from.slice(0, 10);
      const qTo = to.slice(0, 10);

      if (bPickup < qTo && bReturn > qFrom) {
        // Overlaps — figure out which products are booked.
        // New bookings carry speakerId/addonIds directly; old ones need name matching.
        const speakerId: string | null =
          typeof booking.speakerId === "string" && booking.speakerId
            ? booking.speakerId
            : speakerNameToId(booking.speaker || "");

        if (speakerId === "lys-only") {
          booked.lys = (booked.lys || 0) + 1;
        } else if (speakerId && speakerId !== "effects-only" && SPEAKER_IDS.includes(speakerId)) {
          booked[speakerId] = (booked[speakerId] || 0) + 1;
        }

        // Count all addons (lys, rog, stativer, taske)
        if (Array.isArray(booking.addonIds) && booking.addonIds.length) {
          for (const pid of booking.addonIds) {
            if (typeof pid === "string" && pid in booked) {
              booked[pid] = (booked[pid] || 0) + 1;
            }
          }
        } else {
          const addonLabels: string[] = booking.addons || [];
          for (const label of addonLabels) {
            const lower = label.toLowerCase().replace(/[^a-zæøå]/g, "");
            const pid = addonNameToId[lower];
            if (pid && pid in booked) {
              booked[pid] = (booked[pid] || 0) + 1;
            }
          }
        }
      }
    }

    // Read blocked dates within range
    const blockedDates: Array<{ date: string; reason: string; products: string[] }> = [];
    const blockedList = await context.env.BOOKINGS.list({ prefix: "blocked_" });
    for (const key of blockedList.keys) {
      // key.name = "blocked_YYYY-MM-DD"
      const date = key.name.replace("blocked_", "");
      const qFrom = from.slice(0, 10);
      const qTo = to.slice(0, 10);

      if (date >= qFrom && date <= qTo) {
        const val = await context.env.BOOKINGS.get(key.name);
        if (val) {
          try {
            const parsed = JSON.parse(val);
            blockedDates.push({ date, reason: parsed.reason || "", products: parsed.products || [] });
          } catch {
            blockedDates.push({ date, reason: "", products: [] });
          }
        }
      }
    }

    return new Response(JSON.stringify({ inventory, booked, blocked_dates: blockedDates }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("Availability error:", e);
    return new Response(JSON.stringify({ error: "Failed to check availability" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
