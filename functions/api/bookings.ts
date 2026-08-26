import { requireAdmin } from "./_lib/adminAuth";
import { hentBookingIndex } from "./_lib/bookingIndex";

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
    /*
     * Bookingerne kommer fra det delte indeks, ikke fra et list-opslag pr. kald.
     *
     * Admin poller hvert 30. sekund, og hvert kald lavede før ét KV-list. En
     * åben admin-fane brugte 120 list-opslag i timen — hele Cloudflares gratis
     * kvote på 1.000 i døgnet på under otte timer, hvorefter /admin svarede
     * "Failed to list bookings". Det skete 26. august 2026.
     *
     * Indekset blev bygget til /api/availability i august (se bookingIndex.ts)
     * og cacher i fem minutter, men ryddes ved hver ny og rettet booking. Admin
     * ser derfor stadig en ny ordre med det samme.
     */
    const index = await hentBookingIndex(context.env.BOOKINGS, context);
    const bookings = index.bookinger.map((b) => b.data);

    // Nyeste først
    bookings.sort((a, b) => {
      const dateA = new Date(String((a as Record<string, unknown>).createdAt)).getTime();
      const dateB = new Date(String((b as Record<string, unknown>).createdAt)).getTime();
      return dateB - dateA;
    });

    /*
     * `foraeldet` sendes med, når tallene kommer fra nødkopien eller fra et
     * tomt indeks. For kunden er en lidt gammel kalender bedre end en fejl,
     * men for admin er en TOM liste farlig: den ligner "ingen bookinger" og
     * ikke "vi kunne ikke hente dem". Derfor skal UI'et kunne se forskel.
     */
    return new Response(JSON.stringify({ bookings, foraeldet: !!index.forældet, hentet: index.hentet }), {
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
