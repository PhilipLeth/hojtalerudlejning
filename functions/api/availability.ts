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

const DEFAULT_INVENTORY: Record<string, number> = { party: 1, festival: 1, lys: 2, rog: 1, stativer: 2 };

// Map booking speaker names back to product IDs
function speakerNameToId(name: string): string | null {
  const lower = name.toLowerCase();
  if (lower === "party") return "party";
  if (lower === "festival") return "festival";
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
    // Read inventory (or use defaults)
    let inventory: Record<string, number> = { ...DEFAULT_INVENTORY };
    const inventoryRaw = await context.env.BOOKINGS.get("inventory");
    if (inventoryRaw) {
      try {
        inventory = JSON.parse(inventoryRaw);
      } catch {
        // use defaults
      }
    }

    // Count overlapping bookings per product
    const booked: Record<string, number> = { party: 0, festival: 0, lys: 0, rog: 0, stativer: 0 };

    // Map addon display names to product IDs
    const addonNameToId: Record<string, string> = {
      lys: "lys", lysshow: "lys", "lys show": "lys",
      rog: "rog", "røg": "rog", roegmaskine: "rog", "røgmaskine": "rog", "smoke": "rog",
      stativer: "stativer", stativ: "stativer",
    };

    const list = await context.env.BOOKINGS.list({ prefix: "booking_" });
    for (const key of list.keys) {
      const value = await context.env.BOOKINGS.get(key.name);
      if (!value) continue;

      const booking = JSON.parse(value);

      // Only count active bookings (not returned)
      if (booking.status === "afleveret") continue;

      // Check date overlap: booking.pickup < query.to AND booking.returnDate > query.from
      const bookingPickup = booking.pickup;
      const bookingReturn = booking.returnDate;
      if (!bookingPickup || !bookingReturn) continue;

      const bPickup = bookingPickup.slice(0, 10);
      const bReturn = bookingReturn.slice(0, 10);
      const qFrom = from.slice(0, 10);
      const qTo = to.slice(0, 10);

      if (bPickup < qTo && bReturn > qFrom) {
        // Overlaps — figure out which products are booked
        const speakerId = speakerNameToId(booking.speaker);

        if (speakerId === "lys-only") {
          booked.lys = (booked.lys || 0) + 1;
        } else if (speakerId === "party" || speakerId === "festival") {
          booked[speakerId] = (booked[speakerId] || 0) + 1;
        }

        // Count all addons (lys, rog, stativer)
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
