/** Priserne er inklusive 25 % moms. Indbetalinger og depositum er ikke momsgrundlag. */
export function includedVat(total: number): number {
  const totalOere = Math.round(total * 100);
  return Math.round(totalOere / 5) / 100;
}

/** Bevar ørebeløb; moms vises altid med to decimaler. */
export function formatDkk(amount: number, minimumFractionDigits = 0): string {
  return `${new Intl.NumberFormat("da-DK", {
    minimumFractionDigits,
    maximumFractionDigits: 2,
  }).format(amount)} kr`;
}
