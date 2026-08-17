/**
 * GET /api/occupancy?from=YYYY-MM-DD&to=YYYY-MM-DD&secret=
 * Admin-belægningsdata til /admin/kalender.
 */
import { addDays, bookedProductIds } from "./_lib/bookings";
import { INVENTORY_KEY, bundlePartsFromCatalog, effectiveInventory } from "./_lib/inventory";
import {
  buildOccupancy,
  PRODUCT_LABELS,
  type RawOccupancyBooking,
  type BlockedDay,
} from "./_lib/occupancy";

import { requireAdmin } from "./_lib/adminAuth";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

function isIsoDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, cors);
  if (auth instanceof Response) return auth;

  const url = new URL(context.request.url);
  const today = new Date().toISOString().slice(0, 10);
  let from = url.searchParams.get("from") || today;
  let to = url.searchParams.get("to") || addDays(today, 29);

  if (!isIsoDate(from) || !isIsoDate(to)) {
    return json({ error: "from/to skal være YYYY-MM-DD" }, 400);
  }
  if (to < from) {
    return json({ error: "to skal være >= from" }, 400);
  }
  // Max 90 dage — undgår enorme payloads
  const maxTo = addDays(from, 89);
  if (to > maxTo) to = maxTo;

  try {
    const inventory = effectiveInventory(await context.env.BOOKINGS.get(INVENTORY_KEY));

    // Labels: defaults + evt. katalog-navne
    const labels = { ...PRODUCT_LABELS };
    const catalogRaw = await context.env.BOOKINGS.get("products_catalog");
    if (catalogRaw) {
      try {
        const cat = JSON.parse(catalogRaw) as {
          speakers?: Array<{ id?: string; da?: { name?: string } }>;
          addons?: Array<{ id?: string; da?: { label?: string } }>;
          rentalProducts?: Array<{ id?: string; name_da?: string }>;
        };
        for (const s of cat.speakers || []) {
          if (s.id && s.da?.name) labels[s.id] = s.da.name;
        }
        for (const a of cat.addons || []) {
          if (a.id && a.da?.label) labels[a.id] = a.da.label;
        }
        for (const r of cat.rentalProducts || []) {
          if (r.id && r.name_da) labels[r.id] = r.name_da;
        }
      } catch {
        /* ignore */
      }
    }

    const rawBookings: RawOccupancyBooking[] = [];
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
      const returnDate = String(booking.returnDate || "").slice(0, 10);
      if (!isIsoDate(pickup) || !isIsoDate(returnDate)) continue;

      rawBookings.push({
        id: key.name,
        name: String(booking.name || ""),
        phone: booking.phone ? String(booking.phone) : undefined,
        status: booking.status ? String(booking.status) : undefined,
        pickup,
        returnDate,
        productIds: bookedProductIds(booking),
      });
    }

    console.log(
      "[occupancy]",
      from,
      "→",
      to,
      "bookings=",
      rawBookings.length,
      "products=",
      Object.keys(inventory).length,
    );

    // Pakkernes dele kommer fra kataloget, så kalenderen fordeler en pakke på
    // præcis de produkter kunden faktisk får med
    const products = buildOccupancy(
      rawBookings, inventory, from, to, labels, bundlePartsFromCatalog(catalogRaw),
    );

    const blocked: BlockedDay[] = [];
    const blockedList = await context.env.BOOKINGS.list({ prefix: "blocked_" });
    for (const key of blockedList.keys) {
      const date = key.name.replace("blocked_", "");
      if (date < from || date > to) continue;
      const val = await context.env.BOOKINGS.get(key.name);
      if (!val) continue;
      try {
        const parsed = JSON.parse(val) as { reason?: string; products?: string[] };
        blocked.push({
          date,
          reason: parsed.reason || "",
          products: parsed.products || [],
        });
      } catch {
        blocked.push({ date, reason: "", products: [] });
      }
    }
    blocked.sort((a, b) => a.date.localeCompare(b.date));

    // Dage i vinduet til UI
    const days: string[] = [];
    for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);

    return json({ from, to, days, products, blocked });
  } catch (e) {
    console.error("[occupancy] error:", e);
    return json({ error: "Kunne ikke hente belægning" }, 500);
  }
};
