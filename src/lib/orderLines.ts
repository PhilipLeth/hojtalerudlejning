/**
 * Hvad er der egentlig bestilt på en ordre.
 *
 * En booking består af tre ting der før blev vist hver for sig (og kurv-varerne
 * slet ikke): hovedproduktet, kurv-varer og tilvalg. Admin, lejesedlen og
 * udleveringssiden skal alle vise præcis den samme liste — derfor ligger den
 * her ét sted.
 *
 * Kørsel (levering/afhentning) er en ydelse, ikke udstyr, og holdes ude af
 * udstyrslisten. Den vises for sig med adresse og retning.
 */
import { deliveryDirections, isDeliveryAddon } from "@/lib/products";

export interface OrderBooking {
  speaker?: string;
  speakerId?: string;
  speakerSize?: string;
  addons?: string[];
  addonIds?: string[];
  cartItems?: Array<{ name: string; price?: number; productId?: string }>;
  deliveryAddress?: string;
  total?: number;
}

export interface OrderLine {
  label: string;
  qty: number;
  /** Pris i kr hvis den kendes for den enkelte linje */
  price?: number;
  /** Katalog-id, så prisen kan slås op i admin (kun kurv-varer bærer pris selv) */
  productId?: string;
  kind: "produkt" | "kurv" | "tilvalg";
}

const EFFECTS_ONLY_LABELS = ["kun effekter", "effects only"];

function isEffectsOnly(b: OrderBooking): boolean {
  if (b.speakerId === "effects-only") return true;
  const s = (b.speaker || "").toLowerCase();
  return EFFECTS_ONLY_LABELS.includes(s);
}

/**
 * Ordrens linjer i den rækkefølge de blev valgt: hovedprodukt, kurv, tilvalg.
 * Kørsels-tilvalg er ikke med — se deliveryInfo().
 *
 * Samme vare to gange bliver til én linje med antal. En kunde kan sagtens leje
 * to lyskæder (produktet vælges som hovedprodukt og lægges i kurven igen), og
 * to ens linjer under hinanden kunne ikke skelnes fra en dublet.
 */
export function orderLines(b: OrderBooking): OrderLine[] {
  const lines: OrderLine[] = [];

  if (b.speaker && !isEffectsOnly(b)) {
    const size = b.speakerSize && b.speakerSize !== "—" ? ` (${b.speakerSize})` : "";
    lines.push({ label: `${b.speaker}${size}`, qty: 1, productId: b.speakerId, kind: "produkt" });
  }

  for (const item of b.cartItems || []) {
    if (!item?.name) continue;
    lines.push({ label: item.name, qty: 1, price: item.price, productId: item.productId, kind: "kurv" });
  }

  const ids = b.addonIds || [];
  (b.addons || []).forEach((label, i) => {
    if (!label) return;
    const id = ids[i];
    // Kørsel er ikke udstyr — og gamle bookinger uden addonIds kendes på teksten
    if (id ? isDeliveryAddon(id) : /levering|afhentning efter/i.test(label)) return;
    lines.push({ label, qty: 1, productId: id, kind: "tilvalg" });
  });

  return mergeDuplicates(lines);
}

/** Slår ens varer sammen til én linje med antal — prisen er pr. stk. */
function mergeDuplicates(lines: OrderLine[]): OrderLine[] {
  const merged: OrderLine[] = [];
  for (const line of lines) {
    const key = line.productId || line.label;
    const existing = merged.find((m) => (m.productId || m.label) === key);
    if (existing) {
      existing.qty += line.qty;
      // Kurv-varer bærer selv prisen; hovedproduktet gør ikke — behold den vi har
      if (existing.price === undefined) existing.price = line.price;
    } else {
      merged.push({ ...line });
    }
  }
  return merged;
}

export interface DeliveryInfo {
  /** Katalog-id på kørslen — bruges til prisopslag i admin */
  id: string | null;
  /** Vi kører ud med udstyret */
  out: boolean;
  /** Vi henter udstyret igen */
  back: boolean;
  label: string;
  address: string;
}

/** Kørslen på ordren — null når kunden selv henter og afleverer */
export function deliveryInfo(b: OrderBooking): DeliveryInfo | null {
  const ids = b.addonIds || [];
  const labels = b.addons || [];

  let dir: { out: boolean; back: boolean } | null = null;
  let label = "";
  let foundId: string | null = null;

  for (let i = 0; i < labels.length; i++) {
    const id = ids[i];
    if (id && isDeliveryAddon(id)) {
      dir = deliveryDirections(id);
      label = labels[i];
      foundId = id;
      break;
    }
    // Ældre bookinger (før kørslen fik id'er) kendes kun på teksten
    if (!id && /levering|afhentning efter/i.test(labels[i])) {
      dir = { out: true, back: true };
      label = labels[i];
      break;
    }
  }

  if (!dir) {
    // Allersidste udvej: en adresse uden tilvalg betyder at der blev aftalt kørsel
    if (b.deliveryAddress) return { id: null, out: true, back: true, label: "Levering", address: b.deliveryAddress };
    return null;
  }

  return { id: foundId, ...dir, label, address: b.deliveryAddress || "" };
}

/** Kort tekst til admin-listen: "Levering + afhentning" / "Kunden henter selv" */
export function deliverySummary(b: OrderBooking): string {
  const d = deliveryInfo(b);
  if (!d) return "Kunden henter og afleverer selv";
  if (d.out && d.back) return "Vi leverer og henter";
  if (d.out) return "Vi leverer — kunden afleverer selv";
  return "Kunden henter — vi henter igen";
}
