/**
 * Ét svar på "vises billedet for kunderne?" — delt mellem API'et, kundesiden
 * og admin, så de tre ikke kan være uenige om det.
 *
 * Et billede i galleriet er enten aktivt eller inaktivt, og det er en
 * beslutning nogen har taget: intet vises, før det er slået til. De 77 fra
 * bulk-kørslen ligger som filer i repoet, men de er kun kandidater, indtil de
 * har en aktiv post i manifestet.
 *
 * `fjernet` er den gamle gravsten fra før toggle'n — den læses som inaktiv,
 * så et manifest fra dengang stadig betyder det samme.
 */
export interface GalleryStatusFelter {
  aktiv?: boolean;
  fjernet?: boolean;
}

export function erAktiv(b: GalleryStatusFelter): boolean {
  if (typeof b.aktiv === "boolean") return b.aktiv;
  return !b.fjernet;
}
