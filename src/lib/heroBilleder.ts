/**
 * Stemningsbilleder i hero: hvilke sider har et, hvad er standarden, og
 * hvordan bygges prompten.
 *
 * Philip, 28. sept 2026, efter eksemplet på /festpakke-stor: "Skal vi rulle
 * det ud på alle kategorier og produkt-siderne? Sørg for at bygge løsning til
 * at editere dem på backend efterfølgende."
 *
 * Tre lag, det øverste vinder:
 *   1. Godkendt i /admin/stemningsbilleder — ligger i KV (`hero_manifest`),
 *      billedet i R2. Middlewaren skriver det ind i HTML'en, så det står der
 *      fra første billede, uden deploy og uden blink.
 *   2. HERO_STANDARD her i koden — billeder lavet med scripts/product-images/
 *      hero-stemning.mjs og lagt i public/images/hero.
 *   3. HERO_FALLBACK — det fælles stemningsfoto.
 *
 * Nøglen er altid den DANSKE sti. /en/festpakke-stor bruger samme billede.
 */

import scener from "../../gallery/scenes.json";
import { addons, catalogImage, rentalProducts, speakers } from "./products";

export {
  HERO_FALLBACK,
  HERO_STANDARD,
  HERO_MANIFEST_KEY,
  heroSti,
  heroStandard,
  heroSrcSet,
  type HeroEntry,
} from "./heroStandard";

export interface HeroSide {
  sti: string;
  navn: string;
  gruppe: "Kategorier" | "Produkter";
  /** Produkterne, hvis fotos er referencen — grejet i billedet skal være vores */
  productIds: string[];
  /** Stedet fra gallery/scenes.json (fest, bryllup, havefest …). Uden: se stedFor() */
  sted?: string;
}

/**
 * Kategorisiderne med et stemningsbillede, og det grej der skal stå i dem.
 * Produktsiderne kommer af sig selv fra kataloget (alt med en `page`).
 */
const KATEGORIER: Array<Omit<HeroSide, "gruppe">> = [
  { sti: "/lydanlaeg", navn: "Lyd", productIds: ["festival", "subwoofer"] },
  { sti: "/festlys", navn: "Lys & effekter", productIds: ["lys", "discokugle", "rog"] },
  { sti: "/lyd-og-lyspakker", navn: "Lyd- og lyspakker", productIds: ["festival", "lys"] },
  { sti: "/tilbehoer", navn: "Tilbehør", productIds: ["lysstativ", "kabeltromle", "roegvaeske"] },
  { sti: "/lej-hojtaler", navn: "Lej højtaler", productIds: ["festival", "party"] },
  { sti: "/roeg", navn: "Røg og low fog", productIds: ["rog", "low_fog"] },
  { sti: "/lej-mikrofon", navn: "Mikrofoner", productIds: ["mikrofon", "festival"], sted: "firmafest" },
  { sti: "/lysshow", navn: "Lysshow", productIds: ["lys", "discokugle", "rog"] },
  { sti: "/uplights", navn: "Uplights", productIds: ["uplight_4"] },
  { sti: "/lyskaeder", navn: "Lyskæder", productIds: ["lyskaeder"], sted: "havefest" },
  { sti: "/mixer", navn: "Mixer", productIds: ["mixer_stor", "mikrofon"], sted: "firmafest" },
  { sti: "/festlyd", navn: "Festlyd", productIds: ["festival", "lys"] },
  { sti: "/lydudstyr", navn: "Lydudstyr", productIds: ["festival", "subwoofer"] },
  { sti: "/kobenhavn", navn: "København", productIds: ["festival", "lys"] },
  { sti: "/bryllup", navn: "Bryllup", productIds: ["festival", "mikrofon", "lyskaeder"], sted: "bryllup" },
  { sti: "/konfirmation", navn: "Konfirmation", productIds: ["festival", "mikrofon"], sted: "fest" },
  { sti: "/foedselsdag", navn: "Fødselsdag", productIds: ["party", "lys"] },
  { sti: "/havefest", navn: "Havefest", productIds: ["soundboks", "lyskaeder"], sted: "havefest" },
];

/**
 * Produktsider med deres eget hero-design (DJ-siden og sæsonkampagnerne). De
 * viser ikke StemningsBaggrund, så de skal ikke stå i admin-listen.
 * stemningsbilleder.test.ts fanger en side, der mangler her.
 */
const UDEN_STEMNINGSHERO = new Set(["/dj", "/halloween-lys", "/halloween-festpakke", "/halloween-festpakke-stor"]);

/** Alle sider med stemningsbillede, kategorierne først */
export function heroSider(): HeroSide[] {
  const set = new Map<string, HeroSide>();
  for (const k of KATEGORIER) set.set(k.sti, { ...k, gruppe: "Kategorier" });
  const katalog: Array<{ id: string; page?: string; hidden?: boolean; navn: string }> = [
    ...speakers.map((s) => ({ id: s.id, page: s.page, hidden: s.hidden, navn: s.da.name })),
    ...addons.map((a) => ({ id: a.id, page: a.page, hidden: a.hidden, navn: a.da.label })),
    ...rentalProducts.map((r) => ({ id: r.id, page: r.page, hidden: r.hidden, navn: r.name_da })),
  ];
  for (const p of katalog) {
    if (!p.page || p.hidden || p.page.startsWith("/events/") || UDEN_STEMNINGSHERO.has(p.page) || set.has(p.page)) continue;
    const r = rentalProducts.find((x) => x.id === p.id);
    const dele = r?.bundle?.parts?.map((d) => d.productId) ?? [];
    set.set(p.page, { sti: p.page, navn: p.navn, gruppe: "Produkter", productIds: dele.length ? dele : [p.id] });
  }
  return [...set.values()];
}

/**
 * Grej, der skal med i billedet ud over sidens eget. Røgmaskinen alene giver en
 * grå sky; med lysbaren bliver røgen farvet (Philip, 30. sept 2026: "må der godt
 * være mere røg og lys"). Står det ikke her, digter modellen sit eget lys.
 */
const EKSTRA_REFERENCER: Record<string, string[]> = {
  "/roegmaskine": ["lys"],
};

/**
 * Hvad billedet skal vise, når "grejet i brug" ikke er nok. Skrevet efter
 * Philips gennemgang 30. sept 2026 — hvert punkt er et billede, der ikke
 * viste det, siden sælger.
 */
export const HERO_MOTIV: Record<string, string> = {
  "/lys-pakke":
    "The light bar on its tripod stand is the clear subject, standing at the edge of the dance floor, seen from the " +
    "front. It has EXACTLY two round coloured LED lamps hanging under a short horizontal bar and ONE round centre " +
    "effect on top, exactly like the reference photo — not three, not four lamps. The lamps are switched on and throw " +
    "coloured beams and light patterns across the dancing guests, the floor and the walls.",
  "/uplights":
    "Four small uplights stand on the floor against the white walls, each one washing a tall vertical cone of " +
    "saturated coloured light up the wall towards the ceiling. The uplights and their coloured wall washes are the " +
    "subject; the room is otherwise dim.",
  "/discokugle":
    "The mirror ball hangs directly under the ceiling, at least three metres up and high above the heads of the " +
    "guests, carried by its tripod stand with the thin telescopic pole fully extended; the small spotlight on the " +
    "floor is aimed up at it. Hundreds of bright light reflections from the ball sweep across the walls, the ceiling " +
    "and the dancing guests.",
  "/roegmaskine":
    "The fog machine on the floor at the side of the dance floor pumps a thick cloud of fog that fills the lower half " +
    "of the room, lit from behind by the light bar so the fog glows in blue and magenta beams.",
  "/lej-mikrofon":
    "A person standing at the front holds the wireless handheld microphone in their hand, raised to their mouth and " +
    "clearly visible, giving a speech to seated guests; the speakers on stands are behind them. The microphone is the " +
    "subject of the picture.",
};

/** Referencefotos for en side: produktfotoene, højst seks, ingen dubletter */
export function heroReferencer(side: HeroSide): string[] {
  const ud: string[] = [];
  for (const id of [...side.productIds, ...(EKSTRA_REFERENCER[side.sti] ?? [])]) {
    try {
      const src = catalogImage(id);
      if (src && !ud.includes(src)) ud.push(src);
    } catch {
      /* ukendt eller billedløst produkt — spring over */
    }
  }
  return ud.slice(0, 6);
}

/** Batteri- og talegrej hører et andet sted hjemme end en fest i en lagerhal */
const UDENDØRS = ["soundboks", "thumpgo", "batteri"];
const TALE = ["mikrofon", "headset", "mikrofon_kabel", "haandholdt_mikrofon_pro", "mikrofonstativ", "mixer_stor"];

/**
 * Hvor billedet foregår. Philip, 29. sept 2026: "Det skal være et relevant
 * billede pr. side" — /discokugle viste det fælles billede med en højtaler, vi
 * ikke har. Referencerne sørger for grejet; stedet sørger for anledningen.
 */
/** Produktsider, hvor reglen nedenfor rammer ved siden af */
const STED_FOR_SIDE: Record<string, string> = {
  "/julehyggen": "firmafest", // julehygge, ikke en sommerhave — selv om Thump GO er med
};

export function stedFor(side: HeroSide): string {
  if (side.sted) return side.sted;
  if (STED_FOR_SIDE[side.sti]) return STED_FOR_SIDE[side.sti];
  if (side.productIds.some((id) => UDENDØRS.includes(id))) return "havefest";
  if (side.productIds.every((id) => TALE.includes(id) || id === "party" || id === "festival")) {
    if (side.productIds.some((id) => TALE.includes(id))) return "firmafest";
  }
  return "fest";
}

/**
 * Prompten. Samme stil og forbud som produktgalleriet (gallery/scenes.json).
 * Overskriften nævnes ALDRIG: "so headline text can sit on top" fik modellen
 * til at skrive "PARTY UDLEJNING COPENHAGEN" ind i billedet.
 */
export function heroPrompt(side: HeroSide, note?: string): string {
  const stil = (scener as { stil: { faelles: string; forbudt: string } }).stil;
  const steder = (scener as { steder: Record<string, string> }).steder;
  const sted = steder[stedFor(side)] ?? steder.fest;
  const scene =
    `${sted}. The rental equipment in the reference photos is the subject of the picture: set up and in ` +
    `use, clearly visible and in focus, each item reproduced faithfully and appearing exactly once, placed ` +
    `where it would really stand. A few guests in the lower third of the frame, seen from behind or in soft ` +
    `focus, faces turned away. The upper centre of the image is calm, uncluttered and fairly dark. ` +
    `Absolutely no words, letters, titles or captions anywhere in the picture. Wide 16:9 composition.`;
  const motiv = HERO_MOTIV[side.sti] ? ` ${HERO_MOTIV[side.sti]}` : "";
  const ønske = note?.trim() ? ` The person ordering the image adds: "${note.trim()}". Follow it unless it breaks the rules below.` : "";
  return `${scene}${motiv}${ønske} ${stil.faelles} ${stil.forbudt}`;
}
