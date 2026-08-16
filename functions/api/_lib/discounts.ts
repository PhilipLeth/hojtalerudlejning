/** Rabatkoder. Server-side sandhed — klienten får kun procenten at vise.
 *
 * Koderne ligger hardcodet her og kan overskrives/udvides via KV-nøglen
 * "discount_codes" ({ "kode": pct }), så nye koder ikke kræver deploy.
 */

import { DEFAULT_INVENTORY, loadBookings } from "./bookings";
import { productCatalog } from "./catalog";
import { KV_SALE_CAMPAIGN, campaignApplies, parseCampaign, type SaleContext } from "./weekendSale";

export const DEFAULT_CODES: Record<string, number> = {
  genkoeb: 10, // genkøbere
  venner: 20, // venner
  tatven: 30, // tæt ven
};

export const DISCOUNT_CODES_KEY = "discount_codes";

/** Små bogstaver, trim, æ/ø/å → ae/oe/aa så "genkøb" rammer "genkoeb". */
export function normalizeCode(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa");
}

export interface Discount {
  code: string;
  pct: number;
  /** Sat når rabatten kom fra weekendkampagnen og ikke fra en fast kode */
  campaign?: boolean;
}

/** Slå en kode op. null når koden er ukendt eller procenten er ugyldig. */
export async function resolveDiscount(
  kv: KVNamespace,
  rawCode: unknown,
): Promise<Discount | null> {
  const code = normalizeCode(rawCode);
  if (!code) return null;

  let codes = DEFAULT_CODES;
  try {
    const raw = await kv.get(DISCOUNT_CODES_KEY);
    if (raw) codes = { ...DEFAULT_CODES, ...(JSON.parse(raw) as Record<string, number>) };
  } catch {
    // defaults gælder
  }

  const pct = codes[code];
  // 0 i KV betyder "kode slået fra". Alt uden for 1-99 afvises.
  if (typeof pct !== "number" || !Number.isFinite(pct) || pct < 1 || pct > 99) return null;
  return { code, pct: Math.round(pct) };
}

/**
 * Slå en kode op, hvor weekendkampagnen tæller med.
 *
 * Kampagnekoden kan ikke bare stå i kode-mappet: den gælder kun for bestemte
 * datoer og kun for udstyr, der faktisk står tilbage. Derfor skal ordren med
 * i opslaget, og derfor afvises koden, når ordren mangler — der er ikke noget
 * at validere imod.
 *
 * Kampagnen har forrang: hedder en fast kode det samme, vinder udsalget.
 */
export async function resolveDiscountFor(
  kv: KVNamespace,
  rawCode: unknown,
  ctx: SaleContext | null,
  excludeBookingId?: string,
): Promise<Discount | null> {
  const code = normalizeCode(rawCode);
  if (!code) return null;

  const campaign = parseCampaign(await readJson(kv, KV_SALE_CAMPAIGN));
  if (campaign.active && code === campaign.code) {
    if (!ctx) return null;
    try {
      const [catalogRaw, inventoryRaw, bookings] = await Promise.all([
        readJson(kv, "products_catalog"),
        readJson(kv, "inventory"),
        loadBookings(kv),
      ]);
      const inventory = { ...DEFAULT_INVENTORY, ...((inventoryRaw as Record<string, number>) ?? {}) };
      const verdict = campaignApplies(
        campaign, ctx, bookings, inventory, productCatalog(catalogRaw), excludeBookingId,
      );
      return verdict.ok ? { code: campaign.code, pct: campaign.pct, campaign: true } : null;
    } catch (e) {
      // Manglende katalog eller andet uheld må aldrig vælte en booking —
      // kan rabatten ikke bekræftes, gives den ikke.
      console.error("[udsalg] kunne ikke validere kampagnekode:", e);
      return null;
    }
  }

  return resolveDiscount(kv, code);
}

async function readJson(kv: KVNamespace, key: string): Promise<unknown> {
  const raw = await kv.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Rabat i øre af et beløb i øre. Afrundes — samme regel som frontend. */
export function discountOre(totalOre: number, pct: number): number {
  return Math.round((totalOre * pct) / 100);
}

export interface CodeInfo {
  code: string;
  pct: number;
  /** standard = hardcodet i koden; egen = oprettet i admin (KV) */
  source: "standard" | "egen";
  /** false når en standardkode er slået fra med 0 i KV */
  active: boolean;
}

/** Læs det rå KV-map ({kode: pct}). Tomt objekt ved manglende/ugyldig data. */
export async function loadCustomCodes(kv: KVNamespace): Promise<Record<string, number>> {
  try {
    const raw = await kv.get(DISCOUNT_CODES_KEY);
    if (raw) return JSON.parse(raw) as Record<string, number>;
  } catch {
    // ugyldig JSON — behandl som tom, resolveDiscount gør det samme
  }
  return {};
}

/** Alle koder til admin-visning: standardkoder + egne, med status. */
export async function listCodes(kv: KVNamespace): Promise<CodeInfo[]> {
  const custom = await loadCustomCodes(kv);
  const out: CodeInfo[] = [];

  for (const [code, defaultPct] of Object.entries(DEFAULT_CODES)) {
    const override = custom[code];
    const pct = typeof override === "number" ? override : defaultPct;
    out.push({
      code,
      pct: pct >= 1 && pct <= 99 ? Math.round(pct) : defaultPct,
      source: "standard",
      active: !(typeof override === "number" && (override < 1 || override > 99)),
    });
  }
  for (const [code, pct] of Object.entries(custom)) {
    if (code in DEFAULT_CODES) continue; // override, allerede vist ovenfor
    if (typeof pct !== "number" || !Number.isFinite(pct)) continue;
    out.push({
      code,
      pct: Math.round(pct),
      source: "egen",
      active: pct >= 1 && pct <= 99,
    });
  }
  return out.sort((a, b) => a.code.localeCompare(b.code, "da"));
}
