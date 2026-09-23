import { requireAdmin } from "./_lib/adminAuth";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const KV_KEY = "products_catalog_v2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

/**
 * Kataloget må gerne ligge et minut i browserens cache.
 *
 * Svaret blev sendt med no-store, så hver eneste sidevisning hentede det
 * forfra — og kortenes priser venter på det. En kunde, der klikker rundt
 * mellem fem sider, betalte fem rundture for et svar, der næsten altid er
 * det samme.
 *
 * Et minut er valgt, så en adminrettelse stadig slår igennem med det samme,
 * kunden oplever det: stale-while-revalidate lader den næste besøgende få det
 * gamle svar med det samme og henter det nye i baggrunden.
 *
 * Priserne er ikke i fare ved et forældet svar: serveren regner ALTID beløbet
 * ud af kataloget ved checkout, aldrig af det klienten sender.
 */
const CACHE = "public, max-age=60, stale-while-revalidate=300";

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

/** Public: returns the admin-saved catalog, or nulls when none is saved
 * (the frontend then falls back to the hardcoded defaults in src/lib/products.ts). */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const raw = await context.env.BOOKINGS.get(KV_KEY);
    if (!raw) {
      return new Response(JSON.stringify({ speakers: null, addons: null, rentalProducts: null }), {
        status: 200,
        headers: { ...corsHeaders, "Cache-Control": CACHE },
      });
    }
    return new Response(raw, { status: 200, headers: { ...corsHeaders, "Cache-Control": CACHE } });
  } catch (e) {
    console.error("Products GET error:", e);
    return new Response(JSON.stringify({ error: "Failed to load products" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

interface ProductLike {
  id?: unknown;
  price?: unknown;
}

interface SaveBody {
  action?: "reset";
  speakers?: ProductLike[];
  addons?: ProductLike[];
  rentalProducts?: ProductLike[];
}

function isValidList(list: unknown): boolean {
  return (
    Array.isArray(list) &&
    list.length > 0 &&
    list.every(
      (p: ProductLike) =>
        p &&
        typeof p.id === "string" &&
        p.id.length > 0 &&
        typeof p.price === "number" &&
        Number.isFinite(p.price) &&
        p.price >= 0
    )
  );
}

/** Admin: save full catalog to KV, or reset to the hardcoded defaults. */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;


  try {
    const body: SaveBody = await context.request.json();

    if (body.action === "reset") {
      await context.env.BOOKINGS.delete(KV_KEY);
      return new Response(JSON.stringify({ ok: true, reset: true }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    if (!isValidList(body.speakers) || !isValidList(body.addons)) {
      return new Response(
        JSON.stringify({ error: "speakers and addons must be non-empty arrays with id (string) and price (number)" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const rentalProducts = Array.isArray(body.rentalProducts) ? body.rentalProducts : [];
    if (rentalProducts.length && !isValidList(rentalProducts)) {
      return new Response(
        JSON.stringify({ error: "rentalProducts must have id (string) and price (number) per item" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const catalog = JSON.stringify({
      speakers: body.speakers,
      addons: body.addons,
      rentalProducts: rentalProducts.length ? rentalProducts : undefined,
    });
    await context.env.BOOKINGS.put(KV_KEY, catalog);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("Products POST error:", e);
    return new Response(JSON.stringify({ error: "Failed to save products" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
