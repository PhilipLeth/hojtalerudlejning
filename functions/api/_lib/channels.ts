/** Shared feed + channel helpers for Pages Functions */

export const SITE = "https://lejhojtaler.dk";
export const CATALOG_KEY = "products_catalog";
export const INVENTORY_KEY = "inventory";
export const CHANNELS_KEY = "marketing_channels";

export type ChannelStatus = "not_started" | "ready" | "connected" | "live" | "paused" | "skipped";

export interface ChannelDef {
  id: string;
  name: string;
  type: "auto_feed" | "semi" | "manual" | "skip" | "info";
  description: string;
  setupUrl?: string;
  contactEmail?: string;
}

export const CHANNEL_DEFS: ChannelDef[] = [
  {
    id: "dba",
    name: "DBA Boost Connect",
    type: "auto_feed",
    description: "XML-feed → automatiske virksomhedsannoncer på DBA",
    setupUrl: "https://boost.dba.dk/automatiske-annoncer",
    contactEmail: "boost@dba.dk",
  },
  {
    id: "guloggratis",
    name: "GulogGratis",
    type: "auto_feed",
    description: "Samme eget XML-feed via GulogGratis erhvervskonto (ingen Koongo/Avecdo)",
    setupUrl: "https://www.guloggratis.dk/",
  },
  {
    id: "meta_catalog",
    name: "Meta Product Catalog",
    type: "auto_feed",
    description: "CSV/XML katalog til Meta Ads og retargeting",
    setupUrl: "https://business.facebook.com/",
  },
  {
    id: "facebook_marketplace",
    name: "Facebook Marketplace",
    type: "semi",
    description: "Bulk CSV → manuel upload + billeder",
  },
  {
    id: "hygglo",
    name: "Hygglo",
    type: "semi",
    description: "Paste-pakke / browser — ingen officiel API",
    setupUrl: "https://www.hygglo.dk/",
  },
  {
    id: "google_ads",
    name: "Google Ads",
    type: "info",
    description: "Allerede live — Search Ads (ikke Shopping)",
  },
  {
    id: "google_shopping",
    name: "Google Shopping",
    type: "skip",
    description: "Bevidst skippet — Merchant Center passer ikke til udlejning",
  },
];

export interface FeedItem {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string;
  link: string;
  availability: "in stock" | "out of stock";
  category: string;
  brand: string;
}

interface CatalogRaw {
  speakers?: Array<Record<string, unknown>>;
  addons?: Array<Record<string, unknown>>;
  rentalProducts?: Array<Record<string, unknown>>;
}

function absUrl(path: string, origin: string): string {
  if (!path) return `${origin}/images/product-party.png`;
  if (path.startsWith("http")) return path;
  return `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
}

function escXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function csvCell(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Build feed items from KV catalog + inventory */
export function buildFeedItems(
  catalog: CatalogRaw | null,
  inventory: Record<string, number> | null,
  origin: string
): FeedItem[] {
  const items: FeedItem[] = [];
  const inv = inventory || {};

  const speakers = Array.isArray(catalog?.speakers) ? catalog!.speakers! : [];
  for (const sp of speakers) {
    if (sp.hidden) continue;
    const id = String(sp.id || "");
    if (!id) continue;
    const da = (sp.da || {}) as Record<string, string>;
    const qty = inv[id];
    items.push({
      id,
      title: da.name || id,
      description: `${da.desc || ""} Leje weekend, København. Book online.`.trim(),
      price: Number(sp.price) || 0,
      image: absUrl(String(sp.product || ""), origin),
      link: `${origin}/?product=${encodeURIComponent(id)}#book`,
      availability: qty === undefined || qty > 0 ? "in stock" : "out of stock",
      category: "Lyd & Højtalere",
      brand: "Lejhøjtaler.dk",
    });
  }

  const rentals = Array.isArray(catalog?.rentalProducts) ? catalog!.rentalProducts! : [];
  for (const r of rentals) {
    if (r.hidden) continue;
    const id = String(r.id || "");
    if (!id) continue;
    const cat = String(r.category || "øvrigt");
    const catLabel =
      cat === "lys" ? "Lys & Effekter" : cat === "roeg" ? "Røg" : cat === "av" ? "AV-udstyr" : "Lyd";
    const qty = inv[id];
    items.push({
      id,
      title: String(r.name_da || id),
      description: `${String(r.desc_da || "")} Leje weekend, København. Book online.`.trim(),
      price: Number(r.price) || 0,
      image: absUrl(String(r.image || ""), origin),
      link: `${origin}/?product=${encodeURIComponent(id)}#book`,
      availability: qty === undefined || qty > 0 ? "in stock" : "out of stock",
      category: catLabel,
      brand: "Lejhøjtaler.dk",
    });
  }

  // Standalone addons that are also sold as products (lys, rog) — skip if already as rental
  const rentalIds = new Set(items.map((i) => i.id));
  const addons = Array.isArray(catalog?.addons) ? catalog!.addons! : [];
  for (const a of addons) {
    if (a.hidden) continue;
    const id = String(a.id || "");
    if (!id || rentalIds.has(id)) continue;
    // Only push merch-like addons that make sense as listings (skip levering)
    if (id === "levering" || id === "levering_opsaetning") continue;
    const da = (a.da || {}) as Record<string, string>;
    const qty = inv[id];
    items.push({
      id,
      title: da.label || id,
      description: `${da.desc || ""} Tilvalg / leje weekend, København.`.trim(),
      price: Number(a.price) || 0,
      image: absUrl(String(a.image || "/images/product-party.png"), origin),
      link: `${origin}/?product=${encodeURIComponent(id)}#book`,
      availability: qty === undefined || qty > 0 ? "in stock" : "out of stock",
      category: "Tilvalg",
      brand: "Lejhøjtaler.dk",
    });
  }

  return items;
}

export function toXml(items: FeedItem[]): string {
  const rows = items
    .map(
      (i) => `  <item>
    <g:id>${escXml(i.id)}</g:id>
    <g:title>${escXml(i.title)}</g:title>
    <g:description>${escXml(i.description)}</g:description>
    <g:link>${escXml(i.link)}</g:link>
    <g:image_link>${escXml(i.image)}</g:image_link>
    <g:availability>${i.availability}</g:availability>
    <g:price>${i.price.toFixed(2)} DKK</g:price>
    <g:brand>${escXml(i.brand)}</g:brand>
    <g:condition>used</g:condition>
    <g:product_type>${escXml(i.category)}</g:product_type>
    <g:custom_label_0>rental</g:custom_label_0>
    <g:custom_label_1>weekend</g:custom_label_1>
  </item>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
<channel>
  <title>Lejhøjtaler.dk — Udlejningsprodukter</title>
  <link>${SITE}</link>
  <description>Festudstyr til leje i København. Priser er pr. weekend.</description>
${rows}
</channel>
</rss>
`;
}

export function toCsv(items: FeedItem[]): string {
  const header = [
    "id",
    "title",
    "description",
    "link",
    "image_link",
    "availability",
    "price",
    "brand",
    "condition",
    "product_type",
  ].join(",");
  const lines = items.map((i) =>
    [
      csvCell(i.id),
      csvCell(i.title),
      csvCell(i.description),
      csvCell(i.link),
      csvCell(i.image),
      csvCell(i.availability),
      csvCell(`${i.price} DKK`),
      csvCell(i.brand),
      "used",
      csvCell(i.category),
    ].join(",")
  );
  return [header, ...lines].join("\n");
}

/** Facebook Marketplace-style bulk columns (approximate template) */
export function toFacebookCsv(items: FeedItem[]): string {
  const header = ["Title", "Price", "Category", "Condition", "Description", "Location", "Product link"].join(",");
  const lines = items.map((i) =>
    [
      csvCell(`${i.title} — leje weekend København`),
      csvCell(String(i.price)),
      csvCell("Electronics"),
      csvCell("Used - Good"),
      csvCell(i.description),
      csvCell("København K, Danmark"),
      csvCell(i.link),
    ].join(",")
  );
  return [header, ...lines].join("\n");
}

export function hyggloPaste(item: FeedItem): string {
  return `Titel: ${item.title} til leje i København

Beskrivelse:
${item.description}

Pris forslag: ${item.price} kr / weekend (op til 5 dage samme pris)
Afhentning: Halvtolv 9, 1. th, 1436 København K
Book også direkte: ${item.link}

Billede: ${item.image}`;
}

export interface ChannelState {
  id: string;
  status: ChannelStatus;
  notes?: string;
  lastRunAt?: string;
  externalUrl?: string;
  productIds?: string[]; // empty = all feed products
}

export interface ChannelsDoc {
  updatedAt: string;
  lastSetupRunAt?: string;
  feedXmlUrl: string;
  feedCsvUrl: string;
  channels: ChannelState[];
}

export function defaultChannelsDoc(origin: string): ChannelsDoc {
  return {
    updatedAt: new Date().toISOString(),
    feedXmlUrl: `${origin}/api/feeds/products?format=xml`,
    feedCsvUrl: `${origin}/api/feeds/products?format=csv`,
    channels: CHANNEL_DEFS.map((d) => ({
      id: d.id,
      status: d.type === "skip" ? "skipped" : d.id === "google_ads" ? "live" : "not_started",
      notes: d.type === "skip" ? d.description : undefined,
    })),
  };
}

export async function loadCatalog(kv: KVNamespace): Promise<CatalogRaw | null> {
  const raw = await kv.get(CATALOG_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as CatalogRaw;
      if (parsed.speakers?.length || parsed.rentalProducts?.length) return parsed;
    } catch {
      /* fall through to default */
    }
  }
  return DEFAULT_CATALOG;
}

/** Seed catalog when KV er tom — spejler src/lib/products.ts */
const DEFAULT_CATALOG: CatalogRaw = {
  speakers: [
    { id: "thumpgo", price: 345, product: "/images/product-thumpgo.png", da: { name: "Mackie Thump GO", desc: "Batteridrevet 8\" højtaler med Bluetooth." } },
    { id: "party", price: 395, product: "/images/product-party.png", da: { name: "Lille højtalerpakke", desc: "2× 10\" Alto — passer i bæretaske." } },
    { id: "soundboks", price: 595, product: "/images/product-soundboks.png", da: { name: "Soundboks 4", desc: "Batteridrevet Soundboks 4 med kraftig bas." } },
    { id: "festival", price: 695, product: "/images/product-festival.png", da: { name: "Stor højtalerpakke", desc: "2× 12\" EV — klar til større events." } },
  ],
  rentalProducts: [
    { id: "pakke_fest_lille", category: "lyd", price: 500, image: "/images/product-party.png", name_da: "Lille festpakke", desc_da: "Lille højtalerpakke + lys-pakke — spar 100 kr." },
    { id: "pakke_fest_stor", category: "lyd", price: 1000, image: "/images/product-festival.png", name_da: "Stor festpakke", desc_da: "Stor højtalerpakke + lys-pakke til 100 pers. — spar 100 kr." },
    { id: "discokugle", category: "lys", price: 245, image: "/images/product-discokugle.png", name_da: "Discokugle", desc_da: "Roterende discokugle med LED." },
    { id: "lyskaeder", category: "lys", price: 195, image: "/images/product-lyskaeder.png", name_da: "Lyskæde varm hvid", desc_da: "10m lyskæde med varmt hvidt lys." },
    { id: "lyskaeder_farvet", category: "lys", price: 195, image: "/images/product-lyskaeder-farvet.png", name_da: "Lyskæde farvet", desc_da: "10m lyskæde med farvede pærer." },
    { id: "traadloes_mikrofon_pro", category: "av", price: 495, image: "/images/product-mikrofon-pro.png", name_da: "Trådløs mikrofon PRO", desc_da: "Shure BLX trådløs mikrofon — scenekvalitet." },
    { id: "haandholdt_mikrofon_pro", category: "av", price: 195, image: "/images/product-mikrofon-kabel-pro.png", name_da: "Håndholdt mikrofon PRO (kabel)", desc_da: "Shure Beta 58A med kabel." },
    { id: "projektor", category: "av", price: 495, image: "/images/product-projektor.png", name_da: "Projektor", desc_da: "Full HD projektor." },
    { id: "skaerm_55", category: "av", price: 595, image: "/images/product-skaerm.png", name_da: '55" Storskærm', desc_da: "55\" LED-skærm." },
    { id: "traadloes_mikrofon", category: "av", price: 295, image: "/images/product-mikrofon.png", name_da: "Trådløs mikrofon", desc_da: "Håndholdt trådløs mikrofon." },
    { id: "headset", category: "av", price: 345, image: "/images/product-headset.png", name_da: "Trådløst headset", desc_da: "Headset-mikrofon." },
    { id: "headset_pro", category: "av", price: 495, image: "/images/product-headset.png", name_da: "Trådløst headset PRO", desc_da: "Professionelt headset i broadcast-kvalitet." },
    { id: "haandholdt_mikrofon", category: "av", price: 95, image: "/images/product-mikrofon.png", name_da: "Håndholdt mikrofon (kabel)", desc_da: "Almindelig håndholdt mikrofon med kabel." },
    { id: "laerred_160", category: "av", price: 195, image: "/images/product-laerred.png", name_da: "Lærred 160 cm", desc_da: "160 cm lærred på stativ." },
    { id: "projektor_pro", category: "av", price: 795, image: "/images/product-projektor.png", name_da: "Projektor Pro (5000 lumen)", desc_da: "Kraftig 5000 lumen projektor — skarp i dagslys." },
    { id: "pakke_praesentation", category: "av", price: 695, image: "/images/product-projektor.png", name_da: "Præsentationspakken", desc_da: "Projektor + lærred 160 cm + håndholdt mikrofon — spar 90 kr." },
    { id: "pakke_konference", category: "av", price: 1195, image: "/images/product-skaerm.png", name_da: "Konferencepakken", desc_da: "55\" storskærm + trådløst headset + lille højtalerpakke — spar 140 kr." },
    { id: "pakke_tale_musik", category: "av", price: 895, image: "/images/product-festival.png", name_da: "Tale & musik-pakken", desc_da: "Stor højtalerpakke + trådløs mikrofon — spar 95 kr." },
    { id: "low_fog", category: "roeg", price: 295, hidden: true, image: "/images/product-lowfog.png", name_da: "Low fog-maskine", desc_da: "Røggulv med is." },
  ],
  addons: [
    { id: "lyseffekt", price: 195, image: "/images/product-lys.png", da: { label: "Enkelt lyseffekt", desc: "1 LED-festlys — plug and play." } },
    { id: "lys", price: 495, image: "/images/product-lys.png", da: { label: "Lys-pakke", desc: "2 farvede lamper + centereffekt." } },
    { id: "rog", price: 245, image: "/images/product-rog.png", da: { label: "Røgmaskine", desc: "Kompakt røgmaskine inkl. væske." } },
  ],
};

export async function loadCatalogFromKvOnly(kv: KVNamespace): Promise<CatalogRaw | null> {
  const raw = await kv.get(CATALOG_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CatalogRaw;
  } catch {
    return null;
  }
}

export async function loadInventory(kv: KVNamespace): Promise<Record<string, number> | null> {
  const raw = await kv.get(INVENTORY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Record<string, number>;
  } catch {
    return null;
  }
}

export async function loadChannels(kv: KVNamespace, origin: string): Promise<ChannelsDoc> {
  const raw = await kv.get(CHANNELS_KEY);
  if (!raw) return defaultChannelsDoc(origin);
  try {
    const doc = JSON.parse(raw) as ChannelsDoc;
    // Merge new channel defs
    const byId = new Map(doc.channels.map((c) => [c.id, c]));
    for (const d of CHANNEL_DEFS) {
      if (!byId.has(d.id)) {
        byId.set(d.id, {
          id: d.id,
          status: d.type === "skip" ? "skipped" : "not_started",
        });
      }
    }
    return {
      ...doc,
      feedXmlUrl: `${origin}/api/feeds/products?format=xml`,
      feedCsvUrl: `${origin}/api/feeds/products?format=csv`,
      channels: CHANNEL_DEFS.map((d) => byId.get(d.id)!),
    };
  } catch {
    return defaultChannelsDoc(origin);
  }
}
