/* ───── Ret en ordre: varelinjer og beløb ─────
 *
 * En booking kommer ind som kunden sammensatte den, men aftalen ændrer sig
 * bagefter: der skal en mikrofon mere med, festen blev aflyst for lyseffekten,
 * eller kunden skrev sin mail forkert. Admin skal kunne rette det uden at
 * slette ordren og lave den forfra.
 *
 * Filen er delt mellem admin og serveren med vilje: modalen viser en
 * forhåndsvisning med samme funktion, som serveren bygger ordren om med ved
 * gem. Så er det beløb, Frederik ser, det samme som havner i KV.
 *
 * Priserne slås ALTID op i kataloget — klienten sender kun produkt-id og
 * antal. Undtagelsen er en manuelt aftalt pris, som admin skriver bevidst.
 */

export type OrderItemKind = "speaker" | "rental" | "addon";

/** Et produkt som det står i kataloget (KV med kode-defaults som fallback) */
export interface CatalogEntry {
  id: string;
  name: string;
  /** Pris i kr */
  price: number;
  kind: OrderItemKind;
  /** Højtalerens størrelse — står i parentes efter navnet på ordren */
  size?: string;
}

/** En varelinje under redigering: hvad og hvor mange */
export interface OrderItem {
  id: string;
  qty: number;
}

/**
 * En linje der ikke kan slås op i kataloget. Bookinger fra før produkt-id'er
 * (og produkter der siden er fjernet) har kun en tekst og måske en pris.
 * De må ikke forsvinde, bare fordi ordren bliver rettet et andet sted.
 */
export interface LegacyLine {
  label: string;
  /** Pris i kr hvis den blev gemt på ordren — ellers tæller linjen 0 */
  price?: number;
  kind: "kurv" | "tilvalg";
}

export interface RebuiltOrder {
  speaker: string;
  speakerId: string;
  speakerSize: string;
  cartItems: Array<{ name: string; price: number; productId?: string }>;
  addons: string[];
  addonIds: string[];
  /** Summen af linjerne, før rabatkode */
  subtotal: number;
  /** Det ordren lyder på — subtotal minus rabatkode, eller den aftalte pris */
  total: number;
}

export const MAX_ORDER_LINES = 40;
export const MAX_ORDER_QTY = 20;
/** Højeste beløb en ordre kan sættes til i hånden */
export const MAX_ORDER_TOTAL = 1000000;

/** Ordre uden højtaler — samme markering som booking-flowet bruger */
export const EFFECTS_ONLY_ID = "effects-only";
const EFFECTS_ONLY_LABEL = "Kun effekter";

/**
 * Læs og valider varelinjer fra et request. Dubletter lægges sammen, så to
 * klik på samme produkt bliver til antal 2 og ikke to ens linjer.
 */
export function parseOrderItems(raw: unknown): { items: OrderItem[] } | { error: string } {
  if (!Array.isArray(raw)) return { error: "Varelinjerne skal sendes som en liste" };
  if (raw.length > MAX_ORDER_LINES) return { error: `Højst ${MAX_ORDER_LINES} varelinjer på en ordre` };

  const items: OrderItem[] = [];
  for (const row of raw) {
    const id = String((row as { id?: unknown } | null)?.id ?? "").trim();
    const qty = Number((row as { qty?: unknown } | null)?.qty ?? 1);
    if (!id || id.length > 60) return { error: "Ugyldigt produkt-id på en varelinje" };
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_ORDER_QTY) {
      return { error: `Antal skal være et helt tal mellem 1 og ${MAX_ORDER_QTY}` };
    }
    const existing = items.find((i) => i.id === id);
    if (existing) existing.qty = Math.min(MAX_ORDER_QTY, existing.qty + qty);
    else items.push({ id, qty });
  }
  return { items };
}

/**
 * Byg ordren op fra varelinjer. Første højtaler/produkt bliver hovedproduktet
 * (det er det felt resten af systemet læser i mails, SMS og på lejesedlen),
 * resten lægger sig som ekstra produkter, og tilvalg bliver til addons.
 *
 * Ukendte id'er kommer retur i `ukendte` — de bliver ikke til linjer, så en
 * tastefejl i frontend kan ikke skrive et produkt uden pris ind på ordren.
 */
export function rebuildOrder(
  items: OrderItem[],
  lookup: (id: string) => CatalogEntry | undefined,
  opts: { discountPct?: number; legacy?: LegacyLine[]; manualTotal?: number | null } = {},
): { order: RebuiltOrder; ukendte: string[] } {
  const ukendte: string[] = [];
  const produkter: Array<{ entry: CatalogEntry; qty: number }> = [];
  const tilvalg: Array<{ entry: CatalogEntry; qty: number }> = [];

  for (const item of items) {
    const entry = lookup(item.id);
    if (!entry) {
      ukendte.push(item.id);
      continue;
    }
    (entry.kind === "addon" ? tilvalg : produkter).push({ entry, qty: item.qty });
  }

  const cartItems: RebuiltOrder["cartItems"] = [];
  let speaker = EFFECTS_ONLY_LABEL;
  let speakerId = EFFECTS_ONLY_ID;
  let speakerSize = "—";
  let subtotal = 0;

  produkter.forEach(({ entry, qty }, index) => {
    subtotal += entry.price * qty;
    // Første linje bærer ordrens hovedprodukt; dens resterende antal og alle
    // andre produkter ligger som kurv-varer, præcis som en kundebooking
    const startAt = index === 0 ? 1 : 0;
    if (index === 0) {
      speaker = entry.name;
      speakerId = entry.id;
      speakerSize = entry.size || "—";
    }
    for (let n = startAt; n < qty; n++) {
      cartItems.push({ name: entry.name, price: entry.price, productId: entry.id });
    }
  });

  const addons: string[] = [];
  const addonIds: string[] = [];
  for (const { entry, qty } of tilvalg) {
    subtotal += entry.price * qty;
    for (let n = 0; n < qty; n++) {
      addons.push(entry.name);
      addonIds.push(entry.id);
    }
  }

  // Linjer uden katalogopslag beholdes som de står — med den pris ordren
  // allerede bar, aldrig en pris fra klienten
  for (const line of opts.legacy || []) {
    if (line.kind === "kurv") {
      const price = Number.isFinite(line.price) ? Math.round(Number(line.price)) : 0;
      cartItems.push({ name: line.label, price });
      subtotal += price;
    } else {
      addons.push(line.label);
      addonIds.push("");
    }
  }

  const pct = Number(opts.discountPct);
  const rabatteret = Number.isFinite(pct) && pct > 0 && pct <= 100
    ? Math.round(subtotal * (1 - pct / 100))
    : subtotal;

  const manuel = opts.manualTotal;
  const total = typeof manuel === "number" && Number.isFinite(manuel) && manuel >= 0
    ? Math.round(manuel)
    : rabatteret;

  return {
    order: { speaker, speakerId, speakerSize, cartItems, addons, addonIds, subtotal, total },
    ukendte,
  };
}

/** Ordren som den ligger nu, klar til at blive redigeret */
export function orderItemsFromBooking(
  b: {
    speaker?: string;
    speakerId?: string;
    speakerSize?: string;
    cartItems?: Array<{ name?: string; price?: number; productId?: string }>;
    addons?: string[];
    addonIds?: string[];
  },
  lookup: (id: string) => CatalogEntry | undefined,
): { items: OrderItem[]; legacy: LegacyLine[] } {
  const items: OrderItem[] = [];
  const legacy: LegacyLine[] = [];

  const tilfoej = (id: string | undefined, fallback: LegacyLine) => {
    const entry = id ? lookup(id) : undefined;
    if (!entry) {
      if (fallback.label) legacy.push(fallback);
      return;
    }
    const existing = items.find((i) => i.id === entry.id);
    if (existing) existing.qty = Math.min(MAX_ORDER_QTY, existing.qty + 1);
    else items.push({ id: entry.id, qty: 1 });
  };

  if (b.speakerId !== EFFECTS_ONLY_ID && (b.speakerId || b.speaker)) {
    const size = b.speakerSize && b.speakerSize !== "—" ? ` (${b.speakerSize})` : "";
    tilfoej(b.speakerId, { label: `${b.speaker ?? ""}${size}`.trim(), kind: "kurv" });
  }

  for (const item of b.cartItems || []) {
    if (!item?.name && !item?.productId) continue;
    tilfoej(item.productId, {
      label: String(item.name ?? ""),
      price: Number.isFinite(item.price) ? Number(item.price) : undefined,
      kind: "kurv",
    });
  }

  const ids = b.addonIds || [];
  (b.addons || []).forEach((label, i) => {
    if (!label && !ids[i]) return;
    tilfoej(ids[i], { label: String(label ?? ""), kind: "tilvalg" });
  });

  return { items, legacy };
}

/**
 * De linjer på en eksisterende ordre, der ikke kan slås op i kataloget.
 * Serveren bruger den til at genkende de linjer, admin har valgt at beholde —
 * teksten kommer fra klienten, men prisen læses her fra ordren selv.
 */
export function legacyLinesOf(
  b: Parameters<typeof orderItemsFromBooking>[0],
  lookup: (id: string) => CatalogEntry | undefined,
): LegacyLine[] {
  return orderItemsFromBooking(b, lookup).legacy;
}
