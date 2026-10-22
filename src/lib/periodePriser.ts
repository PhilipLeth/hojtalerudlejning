/**
 * Periodepriser: en anden pris på bestemte varer, når LEJEN rammer bestemte
 * datoer.
 *
 * Første brug: Frederik satte røgmaskinen op til 395 kr og low fog til 695 kr
 * for Halloween-weekenden 2026 — "bare halloween næste weekend" (chat 22. okt
 * 2026). Reglen går på lejeperioden, ikke bestillingsdagen: den der i dag
 * booker røg til 14. november betaler normalpris, den der booker til 31.
 * oktober betaler Halloween-prisen, uanset hvornår bestillingen afgives.
 *
 * Pakker (Heksetimen, Monsterfesten …) rører den ikke: pakkeprisen udledes af
 * delene FØR periodeprisen lægges på, så en pakke koster det samme hele
 * sæsonen. Vil Frederik have pakkerne op, er det rabatprocenten der skal
 * rettes — se pakkepris-udledes-af-delene.
 *
 * Samme fil læses af kassen (BookingFlow), Stripe-serveren (pricing.ts) og
 * produktsiderne (PeriodePrisNote), så tallet står ét sted.
 */
export interface PeriodePris {
  id: string;
  /** Første og sidste dag, YYYY-MM-DD, begge inklusiv */
  fra: string;
  til: string;
  /** produkt-id → pris i kr for lejen */
  priser: Record<string, number>;
  label_da: string;
  label_en: string;
}

export const PERIODE_PRISER: PeriodePris[] = [
  {
    id: "halloween-2026",
    fra: "2026-10-30",
    til: "2026-11-01",
    priser: { rog: 395, low_fog: 695 },
    label_da: "Halloween-pris",
    label_en: "Halloween price",
  },
];

const ISO_DAG = /^\d{4}-\d{2}-\d{2}$/;

/** Har varen en periodepris overhovedet (uanset dato)? */
export function harPeriodePris(productId: string): boolean {
  return PERIODE_PRISER.some((p) => productId in p.priser);
}

/**
 * Rammer lejen [pickupDay, returnDay] perioden? Lejen tæller, hvis bare én af
 * dens dage ligger i perioden — så fredag-til-mandag omkring Halloween rammer,
 * og det gør torsdag-til-mandag også. Mangler returdagen, tæller
 * afhentningsdagen alene.
 */
export function lejeRammerPeriode(p: PeriodePris, pickupDay?: string | null, returnDay?: string | null): boolean {
  if (!pickupDay || !ISO_DAG.test(pickupDay)) return false;
  const slut = returnDay && ISO_DAG.test(returnDay) && returnDay >= pickupDay ? returnDay : pickupDay;
  return pickupDay <= p.til && slut >= p.fra;
}

/** Periodeprisen for en vare på en leje, eller null når normalprisen gælder. */
export function periodePris(
  productId: string,
  pickupDay?: string | null,
  returnDay?: string | null,
): { pris: number; periode: PeriodePris } | null {
  for (const p of PERIODE_PRISER) {
    const pris = p.priser[productId];
    if (pris === undefined) continue;
    if (lejeRammerPeriode(p, pickupDay, returnDay)) return { pris, periode: p };
  }
  return null;
}

export function dagsdato(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Periodepriser for en vare, som stadig er aktuelle i dag (til produktsidens note). */
export function kommendePeriodePriser(productId: string, iDag: string = dagsdato()): Array<{ pris: number; periode: PeriodePris }> {
  const ud: Array<{ pris: number; periode: PeriodePris }> = [];
  for (const p of PERIODE_PRISER) {
    const pris = p.priser[productId];
    if (pris !== undefined && iDag <= p.til) ud.push({ pris, periode: p });
  }
  return ud;
}

const MDR_DA = ["jan.", "feb.", "mar.", "apr.", "maj", "juni", "juli", "aug.", "sep.", "okt.", "nov.", "dec."];
const MDR_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "30. okt.–1. nov." / "30 Oct–1 Nov" */
export function periodeTekst(p: PeriodePris, locale: "da" | "en"): string {
  const dag = (iso: string) => {
    const [, m, d] = iso.split("-").map(Number);
    return locale === "en" ? `${d} ${MDR_EN[m - 1]}` : `${d}. ${MDR_DA[m - 1]}`;
  };
  return p.fra === p.til ? dag(p.fra) : `${dag(p.fra)}–${dag(p.til)}`;
}

/** Varens navn med periodens mærke: "Røgmaskine (Halloween-pris)". */
export function periodeNavn(navn: string, p: PeriodePris, locale: "da" | "en"): string {
  return `${navn} (${locale === "en" ? p.label_en : p.label_da})`;
}
