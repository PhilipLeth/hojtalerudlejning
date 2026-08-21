/* ───── Bookingerne, uden at spørge KV hver gang ─────
 *
 * /api/availability listede KV ved HVERT besøg: ét list-opslag for bookinger,
 * ét for blokerede datoer, plus et get pr. booking. Cloudflares gratis KV
 * tillader 1.000 list-operationer i døgnet, så omkring 500 besøg brugte hele
 * dagens kvote — og derefter svarede ledigheden 500 til alle. Det skete
 * 19.-21. august 2026.
 *
 * Nu hentes bookingerne én gang og lægges i kantens cache. Alle besøg i de
 * næste fem minutter deler den kopi, uanset hvilke datoer de spørger om, fordi
 * kopien indeholder alle bookinger og filtreres i hukommelsen bagefter.
 *
 * Går KV alligevel i stå, serveres den sidst kendte kopi frem for en fejl: en
 * kalender med fem minutter gamle tal er uendeligt meget bedre end ingen.
 */

/** Fem minutter: ~576 list-opslag i døgnet i værste fald, mod 1.000 tilladte */
const FRISK_SEK = 300;
/** Nødkopien lever et døgn og bruges kun, når KV svigter */
const NOEDKOPI_SEK = 86400;

const FRISK_URL = "https://kv-cache.lejhojtaler.dk/bookinger";
const NOEDKOPI_URL = "https://kv-cache.lejhojtaler.dk/bookinger-sidst-kendte";

export interface IndexBooking {
  id: string;
  pickup: string;
  returnDate: string;
  status: string;
  /** Rå booking — availability skal selv kunne regne produkter ud af den */
  data: Record<string, unknown>;
}

export interface BlokeretDag {
  date: string;
  reason: string;
  products: string[];
}

export interface BookingIndex {
  bookinger: IndexBooking[];
  blokerede: BlokeretDag[];
  hentet: string;
  /** Sat når tallene kommer fra nødkopien, fordi KV ikke svarede */
  forældet?: boolean;
}

async function læsCache(url: string): Promise<BookingIndex | null> {
  try {
    const svar = await caches.default.match(new Request(url));
    if (!svar) return null;
    return (await svar.json()) as BookingIndex;
  } catch {
    return null;
  }
}

async function skrivCache(url: string, data: BookingIndex, sek: number, ctx?: ExecutionContext): Promise<void> {
  const svar = new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "Cache-Control": `public, max-age=${sek}` },
  });
  const put = caches.default.put(new Request(url), svar);
  // waitUntil, så skrivningen ikke forsinker kundens svar
  if (ctx?.waitUntil) ctx.waitUntil(put);
  else await put;
}

/** Alle bookinger og blokerede datoer, læst direkte i KV — det dyre opslag */
async function hentFraKv(kv: KVNamespace): Promise<BookingIndex> {
  const bookinger: IndexBooking[] = [];
  const liste = await kv.list({ prefix: "booking_" });
  for (const nøgle of liste.keys) {
    const værdi = await kv.get(nøgle.name);
    if (!værdi) continue;
    try {
      const b = JSON.parse(værdi) as Record<string, unknown>;
      bookinger.push({
        id: nøgle.name,
        pickup: String(b.pickup ?? "").slice(0, 10),
        returnDate: String(b.returnDate ?? "").slice(0, 10),
        status: String(b.status ?? ""),
        data: b,
      });
    } catch {
      /* ulæselig booking springes over */
    }
  }

  const blokeret = await kv.list({ prefix: "blocked_" });
  const blokerede: BlokeretDag[] = [];
  for (const nøgle of blokeret.keys) {
    const date = nøgle.name.replace("blocked_", "");
    const værdi = await kv.get(nøgle.name);
    if (!værdi) continue;
    try {
      const p = JSON.parse(værdi) as { reason?: string; products?: string[] };
      blokerede.push({ date, reason: p.reason || "", products: p.products || [] });
    } catch {
      blokerede.push({ date, reason: "", products: [] });
    }
  }

  return { bookinger, blokerede, hentet: new Date().toISOString() };
}

/**
 * Bookingerne til ledighedsberegningen.
 *
 * Rækkefølgen er med vilje: frisk kopi → KV → nødkopi. Det sidste led er det
 * vigtige — uden det bliver en opbrugt KV-kvote til en kalender, ingen kunde
 * kan bruge.
 */
export async function hentBookingIndex(kv: KVNamespace, ctx?: ExecutionContext): Promise<BookingIndex> {
  const frisk = await læsCache(FRISK_URL);
  if (frisk) return frisk;

  try {
    const data = await hentFraKv(kv);
    await skrivCache(FRISK_URL, data, FRISK_SEK, ctx);
    await skrivCache(NOEDKOPI_URL, data, NOEDKOPI_SEK, ctx);
    return data;
  } catch (e) {
    console.error("[bookingIndex] KV svarede ikke:", e);
    const nød = await læsCache(NOEDKOPI_URL);
    if (nød) {
      console.warn("[bookingIndex] serverer sidst kendte tal fra", nød.hentet);
      return { ...nød, forældet: true };
    }
    /*
     * Ingen kopi at falde tilbage på — fx første kald efter en deploy, mens
     * KV-kvoten er brugt op. Vi svarer med et tomt indeks frem for en fejl:
     *
     * Lagertallene kommer fra get-opslag og virker stadig, så kunden får en
     * kalender med rigtige antal, men uden viden om hvad der er optaget. Det
     * kan i værste fald sende en dobbeltbooking ind, som vi opdager i admin.
     * Alternativet er en kalender, ingen kan bruge, og kunder der forsøger
     * igen og igen — hvilket er præcis det, vi er ved at rette.
     */
    console.error("[bookingIndex] hverken KV eller nødkopi — svarer uden bookinger");
    return { bookinger: [], blokerede: [], hentet: new Date().toISOString(), forældet: true };
  }
}

/** Ryd cachen, så en ny booking slår igennem med det samme */
export async function nulstilBookingIndex(ctx?: ExecutionContext): Promise<void> {
  const ryd = caches.default.delete(new Request(FRISK_URL));
  if (ctx?.waitUntil) ctx.waitUntil(ryd);
  else await ryd;
}
