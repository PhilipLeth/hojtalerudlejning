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

// POST — subscribe
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const body = await context.request.json() as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return new Response(JSON.stringify({ error: "Ugyldig email" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    const key = `newsletter_${email.replace(/[^a-z0-9@._-]/g, "")}`;
    const existing = await context.env.BOOKINGS.get(key);
    if (existing) {
      return new Response(JSON.stringify({ ok: true, already: true }), {
        status: 200,
        headers: corsHeaders,
      });
    }

    await context.env.BOOKINGS.put(
      key,
      JSON.stringify({ email, subscribedAt: new Date().toISOString() })
    );

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};

// GET — list subscribers (admin only)
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const secret = url.searchParams.get("secret");

  if (!context.env.ADMIN_SECRET || secret !== context.env.ADMIN_SECRET) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: corsHeaders,
    });
  }

  try {
    const list = await context.env.BOOKINGS.list({ prefix: "newsletter_" });
    const subscribers = [];

    for (const key of list.keys) {
      const value = await context.env.BOOKINGS.get(key.name);
      if (value) {
        subscribers.push(JSON.parse(value));
      }
    }

    subscribers.sort((a, b) => (b.subscribedAt || "").localeCompare(a.subscribedAt || ""));

    return new Response(JSON.stringify({ subscribers }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to list subscribers" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
