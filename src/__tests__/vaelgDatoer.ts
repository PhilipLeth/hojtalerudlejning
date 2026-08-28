import { fireEvent, screen } from "@testing-library/react";

/**
 * Vælg en weekend i bookingkalenderen: næste fredag som afhentning, mandagen
 * efter som aflevering.
 *
 * Kalenderen åbner på indeværende måned, og datoerne er bare knapper med et
 * tal i. Ligger fredagen i næste måned — hvilket den gør hver gang i dag selv
 * er fredag — så rammer et klik på "4" den 4. i DENNE måned. Den er i
 * fortiden, altså slået fra, ingen dato bliver valgt, "Videre" bliver aldrig
 * aktiv, og seks tests fejler af en kalendergrund frem for en bookinggrund.
 * Det skete fredag den 28. august 2026.
 *
 * levering.test.tsx havde fundet ud af det og bladrede selv frem. De øvrige
 * seks havde hver sin kopi uden. Nu er der ét sted, og det er her.
 */
export function vælgDatoer(): boolean {
  const idag = new Date();
  const fredag = new Date(idag);
  fredag.setDate(fredag.getDate() + ((5 - fredag.getDay() + 7) % 7 || 7));
  const mandag = new Date(fredag);
  mandag.setDate(mandag.getDate() + 3);

  const næsteMåned = () => fireEvent.click(screen.getByLabelText("Næste måned"));
  const klik = (dag: number): boolean => {
    const knap = screen
      .getAllByRole("button")
      .find((b) => b.textContent === String(dag) && !(b as HTMLButtonElement).disabled);
    if (knap) fireEvent.click(knap);
    return !!knap;
  };

  if (fredag.getMonth() !== idag.getMonth()) næsteMåned();
  const a = klik(fredag.getDate());
  if (mandag.getMonth() !== fredag.getMonth()) næsteMåned();
  const b = klik(mandag.getDate());
  return a && b;
}
