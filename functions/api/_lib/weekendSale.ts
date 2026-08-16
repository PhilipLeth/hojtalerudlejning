/* ───── Fredagsudsalg til weekenden ─────
 *
 * Hvad står der tilbage på hylden til den kommende weekend, og hvad ville det
 * koste at give rabat på det?
 *
 * Regner KUN. Intet her er kundevendt: rabatten gives ikke automatisk, og
 * hverken /api/discount eller booking-flowet kender kampagnen endnu. Samme
 * fremgangsmåde som ads-reglerne — se logikken opføre sig rigtigt et par
 * weekender, før den får lov at røre priserne.
 */

import { addDays, bookedCountsByDay, type LoadedBooking, type Weekend } from "./bookings";
import type { CatalogProduct } from "./catalog";

export const KV_SALE_CAMPAIGN = "weekend_sale";

export interface SaleCampaign {
  /** Rabat i procent. 1-99. */
  pct: number;
  /**
   * Produkter der aldrig skal på udsalg — typisk dem der bliver udlejet til
   * fuld pris alligevel. Uden dem giver man rabat på den sidste Soundboks.
   */
  excluded: string[];
  /** Koden kunden skriver i booking-flowet. */
  code: string;
  /** Slået fra betyder at koden afvises som enhver anden ukendt kode. */
  active: boolean;
  note?: string;
}

export const DEFAULT_CAMPAIGN: SaleCampaign = { pct: 20, excluded: [], code: "weekend", active: false };

export interface SaleOffer {
  productId: string;
  name: string;
  /** Listepris pr. udlejning */
  price: number;
  /** Pris med kampagnens rabat, afrundet til hele kroner */
  salePrice: number;
  /** Samlet lagerbeholdning */
  stock: number;
  /** Ledige enheder pr. weekenddag, i rækkefølgen fre/lør/søn */
  freePerDay: number[];
  /**
   * Ledige enheder hele weekenden igennem. Det er dette tal der kan sælges:
   * er noget ledigt fredag men booket lørdag, kan kunden ikke leje det til
   * weekenden, og så skal det ikke annonceres.
   */
  freeAllWeekend: number;
  onSale: boolean;
  /** Hvorfor produktet ikke er med — tom når det er på udsalg */
  because: string;
}

export interface WeekendSale {
  weekend: Weekend;
  offers: SaleOffer[];
  /** Enheder der kan sælges med rabat */
  unitsOnSale: number;
  /** Listeværdi af det ledige udstyr */
  valueAtListPrice: number;
  /** Hvad rabatten koster, hvis alt det ledige bliver lejet */
  discountCost: number;
}

const DAY_NAMES = ["fre", "lør", "søn"];

/**
 * Ledigt udstyr i én weekend, produkt for produkt.
 *
 * `inventory` er lagerbeholdningen, ikke katalogets rækkefølge — produkter
 * uden lagertal springes over, for uden et loft kan man ikke sige om noget
 * er ledigt.
 */
export function weekendSale(
  bookings: LoadedBooking[],
  inventory: Record<string, number>,
  catalog: CatalogProduct[],
  campaign: SaleCampaign,
  weekend: Weekend,
  /**
   * Ordre der ikke skal tælle med. Når kunden er nået til betaling, ligger
   * bookingen allerede i KV — uden dette ville ordren gøre sit eget udstyr
   * "udsolgt" og afvise den rabat, kunden lige fik godkendt.
   */
  excludeBookingId?: string,
): WeekendSale {
  const counted = excludeBookingId ? bookings.filter((b) => b.id !== excludeBookingId) : bookings;
  const perDay = bookedCountsByDay(counted, weekend.days[0], weekend.days[weekend.days.length - 1]);
  const byId = new Map(catalog.map((p) => [p.id, p]));
  const excluded = new Set(campaign.excluded);

  const offers: SaleOffer[] = [];
  for (const [productId, stock] of Object.entries(inventory)) {
    if (typeof stock !== "number") continue;
    const product = byId.get(productId);
    const price = product?.price ?? 0;

    const freePerDay = weekend.days.map((day) => Math.max(0, stock - (perDay[day]?.[productId] ?? 0)));
    const freeAllWeekend = Math.min(...freePerDay);

    let because = "";
    if (stock <= 0) because = "Ikke på lager";
    else if (excluded.has(productId)) because = "Undtaget fra udsalg";
    else if (freeAllWeekend <= 0) {
      const udsolgte = freePerDay
        .map((free, i) => (free <= 0 ? (DAY_NAMES[i] ?? weekend.days[i]) : null))
        .filter((d): d is string => d !== null);
      because = `Udsolgt ${udsolgte.join(", ")}`;
    } else if (price <= 0) because = "Ingen pris i kataloget";

    const onSale = because === "";
    offers.push({
      productId,
      name: product?.name ?? productId,
      price,
      salePrice: Math.round(price * (1 - campaign.pct / 100)),
      stock,
      freePerDay,
      freeAllWeekend,
      onSale,
      because,
    });
  }

  // Mest værdi først — det er dér udsalget flytter noget
  offers.sort((a, b) => {
    if (a.onSale !== b.onSale) return a.onSale ? -1 : 1;
    return b.price * b.freeAllWeekend - a.price * a.freeAllWeekend;
  });

  const live = offers.filter((o) => o.onSale);
  const unitsOnSale = live.reduce((sum, o) => sum + o.freeAllWeekend, 0);
  const valueAtListPrice = live.reduce((sum, o) => sum + o.price * o.freeAllWeekend, 0);

  return {
    weekend,
    offers,
    unitsOnSale,
    valueAtListPrice,
    discountCost: Math.round((valueAtListPrice * campaign.pct) / 100),
  };
}

/** Læs og saniter kampagnen fra KV. Ugyldige værdier falder tilbage på standarden. */
export function parseCampaign(raw: unknown): SaleCampaign {
  const obj = (raw ?? {}) as Partial<SaleCampaign>;
  const pct = Number(obj.pct);
  const code = normalizeSaleCode(obj.code);
  return {
    pct: Number.isFinite(pct) && pct >= 1 && pct <= 99 ? Math.round(pct) : DEFAULT_CAMPAIGN.pct,
    excluded: Array.isArray(obj.excluded) ? obj.excluded.filter((id): id is string => typeof id === "string") : [],
    code: code || DEFAULT_CAMPAIGN.code,
    // Uden kode kan udsalget ikke være tændt — så ville koden "" ramme alt
    active: obj.active === true && !!code,
    ...(typeof obj.note === "string" && obj.note ? { note: obj.note } : {}),
  };
}

/** Samme normalisering som rabatkoder, så "Weekend" og "weekend" er samme kode. */
export function normalizeSaleCode(raw: unknown): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa");
}

/**
 * Weekenden en afhentningsdato hører til, eller null hvis datoen ikke er
 * fre/lør/søn. Lejer man fra en onsdag, er det ikke en weekendleje.
 */
export function weekendForPickup(pickup: string): Weekend | null {
  const dow = new Date(`${pickup}T00:00:00Z`).getUTCDay(); // 0=søn, 5=fre, 6=lør
  const backToFriday = dow === 5 ? 0 : dow === 6 ? 1 : dow === 0 ? 2 : null;
  if (backToFriday === null) return null;
  const from = addDays(pickup, -backToFriday);
  return { from, to: addDays(from, 3), days: [from, addDays(from, 1), addDays(from, 2)] };
}

/** Ordren som kampagnen skal vurderes imod */
export interface SaleContext {
  /** YYYY-MM-DD */
  pickup: string;
  returnDate: string;
  /** Produkt-ids i ordren */
  productIds: string[];
}

export type SaleVerdict = { ok: true; weekend: Weekend } | { ok: false; reason: string };

/**
 * Gælder kampagnen for denne konkrete ordre?
 *
 * Tre krav, og alle tre skal holde på serveren — klienten har ingen stemme:
 *   1. Udsalget er tændt
 *   2. Hele lejeperioden ligger inden for én weekend (fre→man)
 *   3. Hvert produkt i ordren står på udsalg netop den weekend
 *
 * Krav 3 genberegnes mod lageret her og nu. Der kan gå timer fra en kunde ser
 * tilbuddet til ordren lander, og i mellemtiden kan udstyret være væk.
 */
export function campaignApplies(
  campaign: SaleCampaign,
  ctx: SaleContext,
  bookings: LoadedBooking[],
  inventory: Record<string, number>,
  catalog: CatalogProduct[],
  excludeBookingId?: string,
): SaleVerdict {
  if (!campaign.active) return { ok: false, reason: "Udsalget er ikke aktivt" };

  const weekend = weekendForPickup(ctx.pickup);
  if (!weekend) return { ok: false, reason: "Afhentning er ikke fredag, lørdag eller søndag" };
  if (ctx.returnDate > weekend.to) return { ok: false, reason: "Lejeperioden rækker ud over weekenden" };
  if (ctx.returnDate <= ctx.pickup) return { ok: false, reason: "Ugyldig lejeperiode" };

  const sale = weekendSale(bookings, inventory, catalog, campaign, weekend, excludeBookingId);
  const onSale = new Set(sale.offers.filter((o) => o.onSale).map((o) => o.productId));

  const ids = [...new Set(ctx.productIds)];
  if (ids.length === 0) return { ok: false, reason: "Ingen produkter i ordren" };

  const outside = ids.filter((id) => !onSale.has(id));
  if (outside.length > 0) {
    const names = outside.map((id) => sale.offers.find((o) => o.productId === id)?.name ?? id);
    return { ok: false, reason: `Ikke på udsalg denne weekend: ${names.join(", ")}` };
  }

  return { ok: true, weekend };
}
