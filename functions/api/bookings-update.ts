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

interface UpdateBody {
  id: string;
  status: string;
}

const VALID_STATUSES = ["ny", "bekraeftet", "afhentet", "afleveret"];

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
    const body: UpdateBody = await context.request.json();

    if (!body.id || !body.status) {
      return new Response(JSON.stringify({ error: "Missing id or status" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!VALID_STATUSES.includes(body.status)) {
      return new Response(
        JSON.stringify({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }),
        { status: 400, headers: corsHeaders }
      );
    }

    const existing = await context.env.BOOKINGS.get(body.id);
    if (!existing) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: corsHeaders,
      });
    }

    const booking = JSON.parse(existing);
    booking.status = body.status;
    booking.updatedAt = new Date().toISOString();

    await context.env.BOOKINGS.put(body.id, JSON.stringify(booking));

    return new Response(JSON.stringify({ ok: true, booking }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("Update error:", e);
    return new Response(JSON.stringify({ error: "Failed to update booking" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
