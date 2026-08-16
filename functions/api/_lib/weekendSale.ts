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

import { bookedCountsByDay, type LoadedBooking, type Weekend } from "./bookings";
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
  note?: string;
}

export const DEFAULT_CAMPAIGN: SaleCampaign = { pct: 20, excluded: [] };

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
): WeekendSale {
  const perDay = bookedCountsByDay(bookings, weekend.days[0], weekend.days[weekend.days.length - 1]);
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
  return {
    pct: Number.isFinite(pct) && pct >= 1 && pct <= 99 ? Math.round(pct) : DEFAULT_CAMPAIGN.pct,
    excluded: Array.isArray(obj.excluded) ? obj.excluded.filter((id): id is string => typeof id === "string") : [],
    ...(typeof obj.note === "string" && obj.note ? { note: obj.note } : {}),
  };
}
