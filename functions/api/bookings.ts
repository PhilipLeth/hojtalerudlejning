import { requireAdmin } from "./_lib/adminAuth";

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

export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: corsHeaders });
};

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, corsHeaders);
  if (auth instanceof Response) return auth;


  try {
    const list = await context.env.BOOKINGS.list({ prefix: "booking_" });
    const values = await Promise.all(list.keys.map((key) => context.env.BOOKINGS.get(key.name)));
    const bookings = [];

    for (let i = 0; i < list.keys.length; i++) {
      const value = values[i];
      if (!value) continue;
      try {
        bookings.push(JSON.parse(value));
      } catch (e) {
        console.error("[bookings] skip korrupt:", list.keys[i].name, e);
      }
    }

    // Sort newest first by createdAt
    bookings.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return new Response(JSON.stringify({ bookings }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (e) {
    console.error("KV list error:", e);
    return new Response(JSON.stringify({ error: "Failed to list bookings" }), {
      status: 500,
      headers: corsHeaders,
    });
  }
};
