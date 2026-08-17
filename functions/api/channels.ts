import { requireAdmin } from "./_lib/adminAuth";
import {
  CHANNEL_DEFS,
  CHANNELS_KEY,
  buildFeedItems,
  defaultChannelsDoc,
  hyggloPaste,
  loadCatalog,
  loadCatalogFromKvOnly,
  loadChannels,
  loadInventory,
  type ChannelStatus,
  type ChannelsDoc,
  SITE,
} from "./_lib/channels";

interface Env {
  BOOKINGS: KVNamespace;
  ADMIN_SECRET: string;
}

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: cors });

function auth(context: EventContext<Env, string, unknown>): boolean {
  const secret = new URL(context.request.url).searchParams.get("secret") ?? "";
  return !!context.env.ADMIN_SECRET && secret === context.env.ADMIN_SECRET;
}

/** GET: channel overview + feed URLs + product count (admin) */
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, cors);
  if (auth instanceof Response) return auth;

  const origin = SITE;
  const doc = await loadChannels(context.env.BOOKINGS, origin);
  const catalog = await loadCatalog(context.env.BOOKINGS);
  const inventory = await loadInventory(context.env.BOOKINGS);
  const items = buildFeedItems(catalog, inventory, origin);
  const kvOnly = await loadCatalogFromKvOnly(context.env.BOOKINGS);

  return new Response(
    JSON.stringify({
      ...doc,
      defs: CHANNEL_DEFS,
      productCount: items.length,
      products: items.map((i) => ({ id: i.id, title: i.title, price: i.price, availability: i.availability })),
      hasCatalog: !!kvOnly,
      usingFallback: !kvOnly,
    }),
    { status: 200, headers: cors }
  );
};

interface PostBody {
  action: "run_setup" | "update_channel" | "reset";
  channelId?: string;
  status?: ChannelStatus;
  notes?: string;
  externalUrl?: string;
  productIds?: string[];
}

/**
 * POST actions:
 * - run_setup: verify feed, init channels, mark feed-based as ready, return checklist
 * - update_channel: set status/notes for one channel
 * - reset: clear channel state
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context, cors);
  if (auth instanceof Response) return auth;

  const origin = SITE;
  let body: PostBody;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: cors });
  }

  try {
    if (body.action === "reset") {
      await context.env.BOOKINGS.delete(CHANNELS_KEY);
      return new Response(JSON.stringify({ ok: true, doc: defaultChannelsDoc(origin) }), {
        status: 200,
        headers: cors,
      });
    }

    if (body.action === "update_channel") {
      if (!body.channelId || !body.status) {
        return new Response(JSON.stringify({ error: "channelId and status required" }), {
          status: 400,
          headers: cors,
        });
      }
      const doc = await loadChannels(context.env.BOOKINGS, origin);
      const ch = doc.channels.find((c) => c.id === body.channelId);
      if (!ch) {
        return new Response(JSON.stringify({ error: "Unknown channel" }), { status: 404, headers: cors });
      }
      ch.status = body.status;
      if (body.notes !== undefined) ch.notes = body.notes;
      if (body.externalUrl !== undefined) ch.externalUrl = body.externalUrl;
      if (body.productIds !== undefined) ch.productIds = body.productIds;
      doc.updatedAt = new Date().toISOString();
      await context.env.BOOKINGS.put(CHANNELS_KEY, JSON.stringify(doc));
      console.log("[channels] Updated", body.channelId, "→", body.status);
      return new Response(JSON.stringify({ ok: true, doc }), { status: 200, headers: cors });
    }

    if (body.action === "run_setup") {
      const catalog = await loadCatalog(context.env.BOOKINGS);
      const inventory = await loadInventory(context.env.BOOKINGS);
      const items = buildFeedItems(catalog, inventory, origin);

      if (!items.length) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "Ingen produkter i feed.",
          }),
          { status: 400, headers: cors }
        );
      }

      const now = new Date().toISOString();
      const doc: ChannelsDoc = await loadChannels(context.env.BOOKINGS, origin);
      doc.lastSetupRunAt = now;
      doc.updatedAt = now;
      doc.feedXmlUrl = `${origin}/api/feeds/products?format=xml`;
      doc.feedCsvUrl = `${origin}/api/feeds/products?format=csv`;

      const steps: Array<{ channelId: string; title: string; done: boolean; action: string }> = [];

      for (const def of CHANNEL_DEFS) {
        let ch = doc.channels.find((c) => c.id === def.id);
        if (!ch) {
          ch = { id: def.id, status: "not_started" };
          doc.channels.push(ch);
        }

        if (def.type === "skip") {
          ch.status = "skipped";
          ch.notes = def.description;
          steps.push({
            channelId: def.id,
            title: def.name,
            done: true,
            action: "Skippet (Shopping ikke relevant for udlejning)",
          });
          continue;
        }

        if (def.id === "google_ads") {
          ch.status = "live";
          ch.notes = "Search Ads allerede live";
          steps.push({
            channelId: def.id,
            title: def.name,
            done: true,
            action: "Allerede live — ingen feed-setup",
          });
          continue;
        }

        if (def.type === "auto_feed") {
          // Feed is live → mark ready for partner connect
          if (ch.status === "not_started" || ch.status === "ready") {
            ch.status = "ready";
            ch.lastRunAt = now;
            ch.notes = `Feed klar (${items.length} produkter). Tilslut ${def.name} med XML/CSV-URL.`;
          }
          steps.push({
            channelId: def.id,
            title: def.name,
            done: ch.status === "live" || ch.status === "connected",
              action:
              ch.status === "live"
                ? "Produkter synlige på kanalen"
                : `Log ind → indsæt feed-URL → produkter oprettes automatisk`,
          });
          continue;
        }

        // semi
        if (ch.status === "not_started") {
          ch.status = "ready";
          ch.lastRunAt = now;
          ch.notes = "Paste-pakke / CSV klar i admin";
        }
        steps.push({
          channelId: def.id,
          title: def.name,
          done: ch.status === "live",
          action:
            def.id === "hygglo"
              ? "Kopiér paste-tekst pr. produkt → opret opslag på Hygglo → marker Live"
              : "Download Facebook CSV → upload i Marketplace → marker Live",
        });
      }

      await context.env.BOOKINGS.put(CHANNELS_KEY, JSON.stringify(doc));
      console.log("[channels] run_setup complete,", items.length, "products");

      // Hygglo paste pack for top products
      const pastePack = items.slice(0, 12).map((i) => ({
        id: i.id,
        title: i.title,
        paste: hyggloPaste(i),
      }));

      return new Response(
        JSON.stringify({
          ok: true,
          doc,
          defs: CHANNEL_DEFS,
          productCount: items.length,
          feedXmlUrl: doc.feedXmlUrl,
          feedCsvUrl: doc.feedCsvUrl,
          facebookCsvUrl: `${origin}/api/feeds/products?format=facebook`,
          steps,
          pastePack,
          nextExternal: [
            {
              channel: "dba",
              message: `DBA Boost Connect (selvbetjening):\n1) Log ind / opret på https://boost.dba.dk med info@lejhojtaler.dk\n2) Vælg Boost Connect / automatiske annoncer\n3) Indsæt feed-URL:\n${doc.feedXmlUrl}\n4) Synk — produkterne oprettes automatisk som annoncer (${items.length} stk)`,
            },
            {
              channel: "guloggratis",
              message: `GulogGratis erhverv:\n1) Log ind med info@lejhojtaler.dk\n2) Tilslut produktfeed / import\n3) Feed-URL:\n${doc.feedXmlUrl}\n4) Produkter synkes fra feedet`,
            },
            {
              channel: "meta_catalog",
              message: `Meta Commerce / Catalog:\n1) business.facebook.com med info@lejhojtaler.dk\n2) Opret katalog → Data sources → Feed\n3) CSV-URL:\n${doc.feedCsvUrl}\n4) Produkter oprettes i kataloget (til ads)`,
            },
          ],
          // Copy-paste mails — kun hvor selvbetjening ikke rækker
          emailDrafts: [
            {
              channel: "dba",
              to: "boost@dba.dk",
              subject: "Boost Connect — produktfeed til Lejhøjtaler.dk",
              body: `Hej DBA Boost,

Vi driver Lejhøjtaler.dk (udlejning af Soundboks, festlys m.m. i København) og ønsker at tilslutte Boost Connect / automatiske virksomhedsannoncer.

Firma: Scharling Studio
CVR: 40994904
Web: https://lejhojtaler.dk
Kontakt: info@lejhojtaler.dk

Vi har et live XML-produktfeed (${items.length} produkter):
${doc.feedXmlUrl}

Kan I aktivere Boost Connect på vores konto og pege på feedet ovenfor? Vi sender gerne ekstra info hvis I mangler noget.

Venlig hilsen
Frederik Scharling
Lejhøjtaler.dk
Halvtolv 9, 1. th, 1436 København K`,
            },
            {
              channel: "guloggratis",
              to: "support@guloggratis.dk",
              subject: "Erhvervsaftale + produktfeed — Lejhøjtaler.dk",
              body: `Hej Gul&Gratis,

Vi vil gerne have en erhvervsaftale og synke vores produkter via eget produktfeed (uden Koongo/Avecdo).

Firma: Scharling Studio / Lejhøjtaler.dk
CVR: 40994904
Web: https://lejhojtaler.dk
Kontakt: info@lejhojtaler.dk
Branche: Udlejning af festudstyr (højtalere, lys, AV)

XML-feed:
${doc.feedXmlUrl}

CSV-feed (hvis I foretrækker det):
${doc.feedCsvUrl}

Kan I bekræfte, hvordan vi tilslutter feedet direkte, og sende tilbud på erhvervsannoncering?

Venlig hilsen
Frederik Scharling
Lejhøjtaler.dk
Halvtolv 9, 1. th, 1436 København K
Tlf. kan oplyses ved behov`,
            },
            {
              channel: "hygglo",
              to: "hej@hygglo.dk",
              subject: "Udlejningsannoncer — Lejhøjtaler.dk",
              body: `Hej Hygglo,

Vi udlejer Soundboks, festlys og AV i København via Lejhøjtaler.dk og vil gerne oprette/optimere udlejningsopslag hos jer.

Firma: Scharling Studio
CVR: 40994904
Web: https://lejhojtaler.dk
Kontakt: info@lejhojtaler.dk

Har I mulighed for bulk-import eller partner-setup? Ellers opretter vi manuelt. Produktfeed til reference:
${doc.feedXmlUrl}

Venlig hilsen
Frederik Scharling
Lejhøjtaler.dk`,
            },
          ],
        }),
        { status: 200, headers: cors }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), { status: 400, headers: cors });
  } catch (e) {
    console.error("[channels] POST error:", e);
    return new Response(JSON.stringify({ error: "Failed" }), { status: 500, headers: cors });
  }
};
