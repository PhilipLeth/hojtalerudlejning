interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

interface SetInventoryBody {
  action: "set_inventory";
  inventory: Record<string, number>;
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
  const url = new URL(context.request.url);
  const secret = url.searchParams.get("secret");

  if (!context.env.ADMIN_SECRET || secret !== context.env.ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const body: RequestBody = await context.request.json();

    if (body.action === "set_inventory") {
      const inv = body.inventory;
      if (!inv || typeof inv !== "object") {
        return new Response(JSON.stringify({ error: "Invalid inventory object" }), {
          status: 400,
          headers: corsHeaders,
        });
      }
      await context.env.BOOKINGS.put("inventory", JSON.stringify(inv));
      return new Response(JSON.stringify({ ok: true, inventory: inv }), {
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
