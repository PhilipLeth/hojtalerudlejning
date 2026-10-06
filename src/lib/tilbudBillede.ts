/**
 * AI-billeder til et tilbud: tilbuddets eget grej, sat op det sted, kunden
 * holder festen.
 *
 * Philip, 6. okt 2026: "Sørg så for at vi kan prompte så billedet kan justeres
 * efter hvad vi har brug for." Derfor er der to lag: ØNSKET er dansk tekst,
 * kollegaen skriver og retter frit (lokale, stemning, tidspunkt, hvor grejet
 * står). REGLERNE er de faste fra produktgalleriet (gallery/scenes.json) — de
 * sørger for, at modellen viser vores udstyr og ikke digter noget til.
 *
 * Et billede kan laves ud fra et andet: kundens eget foto af lokalet, eller et
 * tidligere AI-billede, der skal rettes ("flyt højtalerne ud til siderne").
 */

import scener from "../../gallery/scenes.json";

export type BilledFormat = "16:9" | "4:3" | "3:4";
export type BilledBasis = "lokale" | "rettelse";

export const BILLED_FORMATER: Array<{ id: BilledFormat; navn: string }> = [
  { id: "16:9", navn: "Bredt (inspiration)" },
  { id: "4:3", navn: "Klassisk 4:3" },
  { id: "3:4", navn: "Stående (forside)" },
];

/** Højst så mange produktfotos går med som reference — modellens grænse er seks */
export const MAX_PRODUKT_REFERENCER = 6;

/** Loft pr. måned på tilbudsbilleder (0,134 $ pr. stk.) */
export const TILBUD_BILLED_LOFT = 150;

/**
 * Forslaget til ønsket, ud fra det kollegaen allerede har skrevet på tilbuddet.
 * Det er et udkast — feltet er hans at rette i.
 */
export function standardOenske(t: { titel?: string; sted?: string; gaester?: number; fra?: string }, varer: string[]): string {
  const dele: string[] = [];
  dele.push(t.titel?.trim() ? `${t.titel.trim()}.` : "En fest om aftenen.");
  if (t.sted?.trim()) dele.push(`Stedet er ${t.sted.trim()}.`);
  if (t.gaester) dele.push(`Ca. ${t.gaester} gæster.`);
  const md = t.fra ? Number(t.fra.slice(5, 7)) : 0;
  if (md === 12 || md === 1 || md === 2) dele.push("Vinteraften, mørkt udenfor, varmt lys indenfor.");
  else if (md >= 5 && md <= 8) dele.push("Lys sommeraften.");
  if (varer.length) dele.push(`Udstyret står klar og er i brug: ${varer.join(", ")}.`);
  return dele.join(" ");
}

/** Hele prompten til modellen. Ønsket citeres ordret; reglerne står efter. */
export function tilbudBilledPrompt(opts: { oenske: string; varer: string[]; format: BilledFormat; basis?: BilledBasis }): string {
  const stil = (scener as { stil: { faelles: string; forbudt: string; kamera_hoejde: string } }).stil;
  const oenske = opts.oenske.trim().slice(0, 1500);
  const grej = opts.varer.length ? ` The equipment, all shown in the reference photos: ${opts.varer.join(", ")}.` : "";
  const form = opts.format === "3:4" ? "Tall 3:4 portrait composition." : opts.format === "4:3" ? "4:3 composition." : "Wide 16:9 composition.";

  let start: string;
  if (opts.basis === "lokale") {
    start =
      "The FIRST image is a photo of the customer's actual venue. Keep the room exactly as it is — walls, windows, " +
      "floor, ceiling, furniture, light and camera angle — and set the rental equipment from the other reference " +
      "photos up in it, where it would really stand, switched on and in use.";
  } else if (opts.basis === "rettelse") {
    start =
      "The FIRST image is an earlier version of this picture. Keep everything in it that the request below does not " +
      "ask to change: same room, same equipment, same camera angle. Apply only the requested changes.";
  } else {
    start =
      "A real photograph of an event set up with rental equipment. The rental equipment in the reference photos is " +
      "the subject: set up and in use, clearly visible and in focus, each item reproduced faithfully and appearing as " +
      "many times as described, placed where it would really stand.";
  }
  return [
    start,
    grej,
    oenske ? ` The person ordering the image describes what it must show (in Danish): "${oenske}". Follow it unless it breaks the rules below.` : "",
    " A few guests seen from behind or in soft focus. Absolutely no words, letters, titles or captions anywhere in the picture. ",
    form,
    ` ${stil.kamera_hoejde} ${stil.faelles} ${stil.forbudt}`,
  ].join("");
}
