import {
  buildFeedItems,
  loadCatalog,
  loadInventory,
  toCsv,
  toFacebookCsv,
  toXml,
  dbaSelection,
  SITE,
} from "../_lib/channels";

interface Env {
  BOOKINGS: KVNamespace;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

/**
 * Public product feed for DBA / GulogGratis / Meta.
 * GET /api/feeds/products?format=xml|csv|facebook|json
 */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const format = (url.searchParams.get("format") || "xml").toLowerCase();
  const origin = SITE;

  try {
    const catalog = await loadCatalog(context.env.BOOKINGS);
    const inventory = await loadInventory(context.env.BOOKINGS);
    const items = buildFeedItems(catalog, inventory, origin);
    console.log("[feeds] Serving", items.length, "items as", format);

    if (format === "json") {
      return new Response(JSON.stringify({ count: items.length, items }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
      });
    }

    if (format === "csv") {
      return new Response(toCsv(items), {
        status: 200,
        headers: {
          ...cors,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="lejhojtaler-products.csv"',
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    if (format === "facebook") {
      return new Response(toFacebookCsv(items), {
        status: 200,
        headers: {
          ...cors,
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="facebook-marketplace.csv"',
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    // Default xml — det er den URL DBA Boost Connect står med. Den er
    // skåret ned til DBA_FEED_IDS; CSV og Facebook beholder hele kataloget.
    return new Response(toXml(dbaSelection(items)), {
      status: 200,
      headers: {
        ...cors,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    console.error("[feeds] error:", e);
    return new Response(JSON.stringify({ error: "Feed failed" }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }
};
