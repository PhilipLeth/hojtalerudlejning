import {djGearProducts} from "./djGearProducts";
import { eventSituations } from "./eventSituations";
import { situationPackages } from "./situationPackages";
import { anledningPakker, ANLEDNING_PAKKE_IDS } from "./anledningPakker";
import { mixerModels } from "./mixerModels";
import { microphonePackages } from "./microphonePackages";

/* ───── Single source of truth for all product data (v2, cache-rotation 4/8) ─────
 *
 * These arrays are the DEFAULT catalog (fallback/seed).
 * The live catalog can be overridden from /admin/produkter and is stored in
 * Cloudflare KV under "products_catalog_v2", served by GET /api/products.
 * Client components should read products via the useProducts() hook so
 * admin edits apply everywhere without a deploy.
 */

export type ProductCategory = "lyd" | "lys" | "roeg" | "av";
export type PowerType = "batteri" | "kabel";
export type SizeClass = "lille" | "stor";

export interface SpeakerText {
  name: string;
  size: string;
  capacity: string;
  desc: string;
  extra: string;
}

export interface Speaker {
  id: string;
  /** Produktside (Info-knap) */
  page?: string;
  price: number;
  product: string;
  mood: string;
  power: PowerType;
  sizeClass: SizeClass;
  weight: string;
  hidden?: boolean;
  /** Produktvideo (instruktion/demo), vist med play-knap i produkt-hero */
  video?: string;
  /** YouTube-URL fra producenten, vist som ekstra info under produktbeskrivelsen */
  youtubeUrl?: string;
  /** Addon IDs shown to the customer during booking. Undefined = show all. */
  allowedAddons?: string[];
  /** Hvad er med i pakken, vist ved hover på produktkort */
  contents?: string[];
  da: SpeakerText;
  en: SpeakerText;
}

export interface AddonText {
  label: string;
  desc: string;
}

export interface Addon {
  id: string;
  /** Produktside (Info-knap) */
  page?: string;
  price: number;
  image: string | null;
  hidden?: boolean;
  /** Produktvideo (instruktion/demo), vist med play-knap i produkt-hero */
  video?: string;
  /** YouTube-URL fra producenten, vist som ekstra info under produktbeskrivelsen */
  youtubeUrl?: string;
  /** Hvad er med, vist ved hover på produktkort */
  contents?: string[];
  /**
   * Intern vare: kan kun lægges på en ordre fra admin (Ret ordre) og lander
   * dermed på faktura og kvittering, men vises aldrig for kunden i
   * bookingen, i annoncer, i søgning eller på lageret. Prisen står stadig
   * i pristabellen, så beløbet slås op i kataloget som alt andet.
   */
  intern?: boolean;
  /**
   * Ydelse (fx lydmand): kunden kan vælge den i bookingen og finde den i
   * søgningen, men den fylder ikke på lageret, har intet foto og kan
   * tilvælges på ALLE produkter uanset deres allowedAddons-liste.
   */
  ydelse?: boolean;
  /** Prisenhed når den ikke er "pr. weekend", vises i søgning og booking */
  priceUnit?: { da: string; en: string };
  da: AddonText;
  en: AddonText;
}

/** Del af en sammensat pakke (bundle), listes visuelt med + og rabat */
export interface BundlePart {
  productId: string;
  label_da: string;
  label_en: string;
  /** Listepris for denne del (til “spar X”-beregning), for hele antallet */
  price: number;
  /** Antal af produktet i pakken, fx 4 timer lydmand. Udeladt = 1 */
  qty?: number;
}

/** Fold antal ud til fysiske enheder; samme repræsentation i kalender og lager. */
export function bundlePartIds(parts: Array<{ productId?: string; qty?: number }>): string[] {
  return parts.flatMap((part) => {
    if (!part || typeof part.productId !== "string" || !part.productId) return [];
    const qty = Number.isInteger(part.qty) && part.qty! > 0 && part.qty! <= 999 ? part.qty! : 1;
    return Array.from({ length: qty }, () => part.productId!);
  });
}

export interface ProductBundle {
  parts: BundlePart[];
  /**
   * Pakkerabatten, som andel af delenes sum. 0.08 = 8 %, prisarkets standard.
   * Det her er KILDEN til pakkeprisen: retter vi prisen på en enkeltdel,
   * flytter pakken sig med. Udeladt = PAKKE_RABAT.
   */
  rabat?: number;
  /**
   * Rabat i kr vs sum af parts. UDLEDT af rabat og delenes priser, aldrig en
   * kilde — feltet står tilbage fordi pakkekortene skriver "spar X kr".
   */
  discount: number;
  usecase_da: string;
  usecase_en: string;
}

export interface RentalProduct {
  id: string;
  /** Produktside (Info-knap) */
  page?: string;
  category: ProductCategory;
  /**
   * Pris pr. weekend. For en pakke (bundle) er feltet UDLEDT — se
   * bundlePrice() — og skrives ved indlæsning. Ret rabatten, ikke prisen.
   */
  price: number;
  image: string;
  name_da: string;
  name_en: string;
  desc_da?: string;
  desc_en?: string;
  hidden?: boolean;
  /** Produktvideo (instruktion/demo), vist med play-knap i produkt-hero */
  video?: string;
  /** YouTube-URL fra producenten, vist som ekstra info under produktbeskrivelsen */
  youtubeUrl?: string;
  /** Addon IDs shown to the customer during booking. Undefined = show all. */
  allowedAddons?: string[];
  /** Hvad er med i pakken, vist ved hover på produktkort */
  contents?: string[];
  /** Sammensat produkt, vises i BundleGrid, ikke i almindeligt produktgrid */
  bundle?: ProductBundle;
  /**
   * Lader kortbilledet i BundleGrid fylde hele kortets bredde (object-cover)
   * i stedet for at stå som en lille firkant midt i feltet (object-contain).
   * Værdien er en CSS object-position, altså hvor beskæringens midte lander,
   * fx "50% 46%" når motivet ligger lidt over billedets midte.
   * Kun til billeder hvor motivet ligger i et vandret bånd med luft over/under.
   */
  cardImageCrop?: string;
  /** Vis de faktiske dele og antal i pakkekortets billedfelt. */
  showPartImages?: boolean;
}

/**
 * Katalogpost som den står skrevet i koden. En pakke har ingen pris i data —
 * den regnes ud af delene ved indlæsning, se refreshBundlePrices().
 */
export type RawRentalProduct = Omit<RentalProduct, "price" | "bundle"> & {
  price?: number;
  bundle?: Omit<ProductBundle, "discount"> & { discount?: number };
};

export function isBundleProduct(p: RentalProduct): boolean {
  return !!p.bundle?.parts?.length;
}

/* ───── Pakkeprisen regnes ud af delene ─────
 *
 * Før stod en pakkes pris som et tal i kataloget, og rabatten blev udregnet
 * bagefter som forskellen. Retter man så prisen på en lysbar, flyttede
 * *rabatten* sig — pakken kostede det samme, og sammenhængen mellem delene og
 * pakken var kun et tal, nogen havde skrevet af én gang.
 *
 * Nu er det den anden vej rundt: delenes sum og rabatprocenten er kilden,
 * prisen udledes. Prisarket (LejHøjtaler Katalog.xlsx) regner sådan: 8 % på
 * alle sammensatte pakker, afrundet til nærmeste tier.
 */

/** Prisarkets standardrabat på en sammensat pakke. */
export const PAKKE_RABAT = 0.08;

/** Prisarkets afrunding: nærmeste tier, fx 818,80 → 820. */
export function roundPackagePrice(kr: number): number {
  return Math.round(kr / 10) * 10;
}

/** Rabatten på en pakke som andel, med arkets standard som fallback. */
export function bundleRabat(bundle: Pick<ProductBundle, "rabat">): number {
  const r = bundle.rabat;
  return typeof r === "number" && Number.isFinite(r) && r >= 0 && r < 1 ? r : PAKKE_RABAT;
}

/** Delenes sum, altså hvad det koster at leje hver ting for sig. */
export function bundleListPrice(p: RentalProduct): number {
  if (!p.bundle?.parts?.length) return p.price;
  return p.bundle.parts.reduce((sum, part) => sum + part.price, 0);
}

/** Pakkeprisen: delenes sum minus rabatten, afrundet som i arket. */
export function bundlePrice(sumAfDele: number, bundle: Pick<ProductBundle, "rabat">): number {
  return roundPackagePrice(sumAfDele * (1 - bundleRabat(bundle)));
}

/**
 * Regn delpriser, pakkepris og besparelse ud fra det aktuelle katalog.
 *
 * Pakker må godt indeholde pakker (en DJ-pakke rummer en højtalerpakke), så
 * opslaget kører i runder: hver runde afgør de pakker, hvis dele alle er
 * kendte. En pakke der peger på sig selv, eller på en del der ikke findes,
 * falder tilbage på delprisen i data — så et halvt katalog aldrig kan gøre en
 * pakke gratis.
 */
export function refreshBundlePrices(
  rentals: RentalProduct[],
  items: Array<{ id: string; price: number }>,
): RentalProduct[] {
  const prices = new Map<string, number>();
  for (const item of items) if (item && typeof item.price === "number") prices.set(item.id, item.price);
  solveBundlePrices(
    rentals.filter((p) => p.bundle?.parts?.length).map((p) => ({ id: p.id, ...p.bundle! })),
    prices,
  );

  return rentals.map((p) => {
    if (!p.bundle?.parts?.length) return p;
    const parts = p.bundle.parts.map((part) => {
      const qty = partQty(part);
      return { ...part, price: (prices.get(part.productId) ?? part.price / qty) * qty };
    });
    const sum = parts.reduce((n, part) => n + part.price, 0);
    const price = bundlePrice(sum, p.bundle);
    return { ...p, price, bundle: { ...p.bundle, parts, discount: Math.max(0, sum - price) } };
  });
}

/**
 * Skriv den udledte pris for hver pakke ind i `prices`. Ændrer kortet.
 *
 * Delt mellem klientens katalog (refreshBundlePrices) og serverens pristabel
 * (loadPriceTable), så Stripe og siden ALTID er enige om, hvad en pakke koster.
 *
 * Kører i runder, fordi en pakke må indeholde en pakke: hver runde afgør dem,
 * hvis dele alle er kendte.
 */
export function solveBundlePrices(
  bundles: Array<{ id: string; parts: BundlePart[]; rabat?: number }>,
  prices: Map<string, number>,
): Map<string, number> {
  const bundleIds = new Set(bundles.map((b) => b.id));
  // Pakkernes egne priser skal regnes ud, ikke læses — ellers vinder en gammel
  // pris fra KV over delene.
  for (const b of bundles) prices.delete(b.id);

  const afgjort = new Set<string>();
  for (let runde = 0; runde <= bundles.length; runde++) {
    let nye = 0;
    for (const b of bundles) {
      if (afgjort.has(b.id)) continue;
      // Venter på en del, der selv er en pakke og endnu ikke er regnet ud
      if (b.parts.some((d) => d.productId !== b.id && bundleIds.has(d.productId) && !afgjort.has(d.productId))) continue;
      prices.set(b.id, bundlePrice(bundlePartsSum(b.parts, prices), b));
      afgjort.add(b.id);
      nye++;
    }
    if (!nye) break;
  }
  return prices;
}

function partQty(part: { qty?: number }): number {
  return Number.isInteger(part.qty) && part.qty! > 0 ? part.qty! : 1;
}

function bundlePartsSum(dele: BundlePart[], prices: Map<string, number>): number {
  return dele.reduce((n, del) => {
    const qty = partQty(del);
    return n + (prices.get(del.productId) ?? del.price / qty) * qty;
  }, 0);
}

export const speakers: Speaker[] = [
  {
    id: "thumpgo",
    page: "/mackie-thump-go",
    youtubeUrl: "https://www.youtube.com/watch?v=0M7xZoiqn9U",
    // Prisarket 21. sept 2026: arkets "Lille batteri højtaler" koster 445 kr
    price: 445,
    product: "/images/product-thumpgo-v2-white.webp",
    mood: "/images/mood-party.webp",
    power: "batteri",
    sizeClass: "lille",
    weight: "10 kg",
    // Kørsels-id'erne står skrevet ud: DELIVERY_ADDON_IDS er først defineret længere nede i filen.
    allowedAddons: ["lys", "rog", "stativ_enkelt", "mikrofon_kabel", "lyseffekt", "levering_ud", "afhentning_retur", "levering_begge"],
    contents: ["Mackie Thump GO 8\"", "Oplader", "AUX-kabel", "Bluetooth"],
    da: {
      name: "Mackie Thump GO",
      size: '8" batterihøjtaler',
      capacity: "Op til 30 pers.",
      desc: 'Batteridrevet 8" højtaler med Bluetooth og op til 12 timers batteri. Ingen strøm nødvendig, tag den med i parken, på stranden eller i baggården.',
      extra: "Inkl. oplader og AUX-kabel. Batteriet holder hele festen.",
    },
    en: {
      name: "Mackie Thump GO",
      size: '8" battery speaker',
      capacity: "Up to 30 people",
      desc: 'Battery-powered 8" speaker with Bluetooth and up to 12 hours of battery. No power needed, bring it to the park, the beach or the courtyard.',
      extra: "Incl. charger and AUX cable. The battery lasts the whole party.",
    },
  },
  {
    id: "party",
    page: "/hojtalerpakke-lille",
    youtubeUrl: "https://www.youtube.com/watch?v=0VN2Q2bMufA",
    price: 595,
    product: "/images/product-party-v2-white.webp",
    mood: "/images/mood-party.webp",
    power: "kabel",
    sizeClass: "lille",
    weight: "12 kg",
    allowedAddons: ["subwoofer", "lys", "stativer", "mikrofon", "mikrofon_kabel", "lyseffekt", "levering_ud", "afhentning_retur", "levering_begge"],
    contents: ['2× Alto TX 410 10" højtalere', "Bluetooth", "AUX + strømkabler", "USB-C / iPhone-adapter"],
    da: {
      name: "Lille højtalerpakke",
      size: '2× 10" Alto',
      capacity: "0-30 pers.",
      desc: 'To kompakte 10" Alto TX 410 med Bluetooth. Vejer kun 12 kg, klar til cyklen.',
      extra: "Inkl. alle kabler. Stativer og mikrofon kan tilkøbes.",
    },
    en: {
      name: "Small Speaker Package",
      size: '2× 10" Alto',
      capacity: "0-30 people",
      desc: 'Two compact 10" speakers with Bluetooth. Only 12 kg, fits in a carry bag, ready for your bike.',
      extra: "Incl. all cables. Carry bag and stands available as add-ons.",
    },
  },
  {
    id: "soundboks",
    page: "/soundboks-4",
    youtubeUrl: "https://www.youtube.com/watch?v=k7nG3O4I6JI",
    price: 695,
    product: "/images/product-soundboks-v2-white.webp",
    mood: "/images/mood-party.webp",
    power: "batteri",
    sizeClass: "stor",
    weight: "11 kg",
    allowedAddons: ["lys", "rog", "stativ_enkelt", "mikrofon_kabel", "batteri", "lyseffekt", "stroboskop", "levering_ud", "afhentning_retur", "levering_begge"],
    contents: ["Soundboks 4", "Oplader", "AUX-kabel", "Bluetooth"],
    da: {
      name: "Soundboks 4",
      size: "Soundboks 4",
      capacity: "Op til 50 pers.",
      desc: "Den populære Soundboks 4 med kraftig bas og Bluetooth. Batteridrevet, ingen strøm nødvendig. Perfekt til udendørs fester.",
      extra: "Inkl. oplader og AUX-kabel.",
    },
    en: {
      name: "Soundboks 4",
      size: "Soundboks 4",
      capacity: "Up to 50 people",
      desc: "The popular Soundboks 4 with powerful bass and Bluetooth. Battery-powered, no power needed. Perfect for outdoor parties.",
      extra: "Incl. charger and AUX cable.",
    },
  },
  {
    id: "festival",
    page: "/hojtalerpakke-normal",
    youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0",
    price: 795,
    product: "/images/product-festival-v2-white.webp",
    mood: "/images/mood-festival.webp",
    power: "kabel",
    sizeClass: "stor",
    weight: "2× 16 kg",
    allowedAddons: ["subwoofer", "lys", "stativer", "mikrofon", "mikrofon_kabel", "lyseffekt", "stroboskop", "levering_ud", "afhentning_retur", "levering_begge"],
    contents: ['2× EV ZLX 12P G2 12" højtalere', "Bluetooth", "AUX + strømkabler", "USB-C / iPhone-adapter"],
    da: {
      name: "Mellem højtalerpakke",
      size: '2× 12" EV',
      capacity: "30-50 pers.",
      desc: 'To kraftige 12" EV ZLX 12P G2 med Bluetooth. Klar lyd til større rum og udendørs arrangementer.',
      extra: "Inkl. alle kabler. Stativer kan tilkøbes for 95 kr.",
    },
    en: {
      name: "Medium Speaker Package",
      size: '2× 12" EV',
      capacity: "30-50 people",
      desc: 'Two powerful 12" active speakers with Bluetooth. Clear sound for larger rooms and outdoor events.',
      extra: "Incl. all cables. Stands available as add-on for 95 kr.",
    },
  },
  {
    id: "hojtaler_100",
    page: "/hojtalerpakke-bas",
    price: 1295,
    /*
     * Fotoet SKAL vise pakken. product-hojtalerpakke-stor-white.webp gjorde
     * det ikke: den var AI-genereret på grå baggrund med nogle generiske
     * søjlehøjtalere, der ikke ligner en EV ZLX, og uden stativer — mens
     * siden lovede "højtalerstativer inkluderet". Her er de rigtige EV'er og
     * Behringer-subben, i husets hvide stil.
     */
    product: "/images/product-festival-bas-v2-white.webp",
    mood: "/images/mood-party.webp",
    power: "kabel",
    sizeClass: "stor",
    weight: "48 kg",
    allowedAddons: ["subwoofer", "lys", "stativer", "mikrofon", "mikrofon_kabel", "stroboskop", "levering_ud", "afhentning_retur", "levering_begge"],
    contents: ['2× EV ZLX 12P G2 12" højtalere', "Behringer B1200D Pro subwoofer", "Alle kabler"],
    da: {
      name: "Stor højtalerpakke",
      size: '2× 12" + subwoofer',
      capacity: "50-100 pers.",
      desc: 'To aktive 12" EV ZLX 12P G2 med en Behringer 12" subwoofer. Trinnet over Mellem højtalerpakke, når rummet er større end 50 gæster.',
      extra: "Stativer kan tilkøbes. Vil du have lys med, er Festpakke 50-100 samme lyd plus to lysbarer.",
    },
    en: {
      name: "Large speaker package",
      size: '2× 12" + subwoofer',
      capacity: "50-100 people",
      desc: 'Two active 12" EV ZLX 12P G2 with a Behringer 12" subwoofer. The step above the medium speaker package, for rooms with more than 50 guests.',
      extra: "Stands are an add-on. For lights, Party package 50-100 is the same sound plus two light bars.",
    },
  },
];

export const addons: Addon[] = [
  { id: "dj_musikafvikler", page: "/dj", // Følger DJ_HOUR_RATE — prisarket 21. sept 2026: DJ Time 1.495 kr
    price: 1495, image: null, ydelse: true,
    priceUnit: { da: "kr/time", en: "DKK/hour" },
    contents: ["DJ/musikafvikler", "Minimum 3 timer"],
    da: { label: "DJ/musikafvikler", desc: "Minimum 3 timer. Prisen er pr. time, altid. Levering, opsætning og nedtagning er med. Vælg anlæg og evt. lys." },
    en: { label: "DJ/music host", desc: "Minimum 3 hours. The price is per hour, always. Delivery, setup and collection included. Choose a sound system and optional lights." } },
  {
    id: "stroboskop",
    price: 395,
    image: "/images/product-stroboskop-white.webp",
    allowedAddons: ["lys", "rog", "lysstativ", "levering_ud", "afhentning_retur", "levering_begge"],
    contents: ["Botex SP-1500 DMX stroboskop", "Controller", "Strømkabel"],
    da: { label: "Stroboskop med styring", desc: "Kraftigt stroboskop med controller, så hastighed og styrke kan skrues op og ned" },
    en: { label: "Strobe light with controller", desc: "Powerful strobe with a controller for speed and intensity" },
  },
  {
    id: "lyseffekt",
    page: "/enkelt-lyseffekt",
    youtubeUrl: "https://www.youtube.com/watch?v=XhecuXfY0vo",
    price: 195,
    image: "/images/product-lyseffekt-z20-white.webp",
    allowedAddons: ["lys", "rog", "lysstativ", "levering_ud", "afhentning_retur", "levering_begge"],
    contents: ["Eurolite LED Mini Z-20 beam-effekt", "USB-strømkabel", "Automatiske effekter"],
    da: { label: "Enkelt lyseffekt", desc: "Eurolite LED Mini Z-20, lille USB-drevet beam-effekt med roterende farvede stråler, plug and play" },
    en: { label: "Single light effect", desc: "Eurolite LED Mini Z-20, a small USB-powered beam effect with rotating coloured beams, plug and play" },
  },
  {
    id: "lys",
    page: "/lys-pakke",
    youtubeUrl: "https://www.youtube.com/watch?v=FcOqGlPsyYY",
    price: 395,
    image: "/images/product-lys-v4-white.webp",
    allowedAddons: ["rog", "lyseffekt", "stroboskop", "levering_ud", "afhentning_retur", "levering_begge"],
    contents: ["2× Fun Generation PartyPar 12 LED", "ADJ Mini Dekker centereffekt", "Stativ", "Strøm + kabler"],
    da: { label: "Lysbar", desc: "2 farvede lamper + centereffekt på stativ" },
    en: { label: "Light bar", desc: "2 coloured lamps + centre effect on stand" },
  },
  {
    id: "rog",
    page: "/roegmaskine",
    youtubeUrl: "https://www.youtube.com/watch?v=hQXFyo28Ndc",
    price: 245,
    image: "/images/product-rog-v2-white.webp",
    allowedAddons: ["lys", "lyseffekt", "stroboskop", "roegvaeske", "levering_ud", "afhentning_retur", "levering_begge"],
    contents: ["Eliminator VF1300 EP røgmaskine", "Røgvæske", "Fjernbetjening", "Strømkabel"],
    da: { label: "Røgmaskine", desc: "Eliminator VF1300 EP, kompakt røgmaskine inkl. røgvæske, gør lyset 10x federe" },
    en: { label: "Fog machine", desc: "Compact fog machine incl. fluid, makes the lights 10x better" },
  },
  {
    id: "subwoofer",
    page: "/subwoofer",
    youtubeUrl: "https://www.youtube.com/watch?v=C9J1G7KQIHA",
    price: 495,
    image: "/images/product-subwoofer-v2-white.webp",
    contents: ["Behringer B1200D Pro aktiv 12\" subwoofer", "Strømkabel", "Signalkabel til højtalere"],
    da: { label: "Subwoofer 12\"", desc: "Behringer B1200D Pro, aktiv 12\" sub, giver festen den dybe bas" },
    en: { label: "Subwoofer 12\"", desc: "Behringer B1200D Pro, powered 12\" sub, adds the deep bass" },
  },
  {
    id: "stativer",
    page: "/hojtalerstativer",
    price: 95,
    image: "/images/product-stativer-white.webp",
    contents: ["2× højtalerstativ, Millenium BS-2211B", "Bæretaske til stativerne"],
    da: { label: "Højtalerstativer", desc: "2 professionelle stativer (Millenium BS-2211B), løfter lyden op i øjenhøjde" },
    en: { label: "Speaker stands", desc: "2 professional stands (Millenium BS-2211B), lifts the sound to ear level" },
  },
  {
    id: "mikrofon",
    // Samme mikrofon som rental-varen traadloes_mikrofon (295 kr), én side til begge
    page: "/traadloes-mikrofon",
    youtubeUrl: "https://www.youtube.com/watch?v=ED_w3MHXjxk",
    price: 445,
    image: "/images/product-mikrofon-pro-v2-white.webp",
    contents: ["Shure BLX24/SM58 trådløs mikrofon", "Shure modtager", "Kabel til højtaler"],
    da: { label: "Trådløs mikrofon", desc: "Shure BLX24 med SM58, trådløs håndholdt mikrofon til taler og karaoke" },
    en: { label: "Wireless mic", desc: "Shure BLX24 with SM58, wireless handheld mic for speeches and karaoke" },
  },
  {
    id: "batteri",
    page: "/ekstra-batteri",
    price: 395,
    image: "/images/product-soundboks-batteri-white.webp",
    contents: ["Soundboks batteri (USB-C)", "Opladet ved afhentning"],
    da: { label: "Soundboks batteri", desc: "Ekstra batteri til Soundboks 4, dobbelt spilletid uden strøm" },
    en: { label: "Soundboks battery", desc: "Extra battery for the Soundboks 4, twice the playtime without power" },
  },
  {
    id: "taske", hidden: true,
    page: "/baeretaske",
    price: 95,
    image: "/images/product-taske-v2-white.webp",
    da: { label: "Bæretaske", desc: "Polstret sportstaske til sikker transport på cykel eller i bil" },
    en: { label: "Carry bag", desc: "Padded sports bag for safe transport by bike or car" },
  },
  // ── Kørsel: levering (ud) og afhentning (retur) er to selvstændige ture.
  // Én vej koster 495, begge veje 795, derfor er "begge veje" et selvstændigt
  // id med sin egen pris i stedet for to linjer der lægges sammen til 990.
  //
  // Prisarket skiller kørsel og opsætning ad: "Levering/Afhentning 795" og
  // "Levering/Afhentning + Opsætning/Nedtagning 1.395". Teksterne lovede før
  // opsætning med i de 495 og de 795 — det gør de ikke længere, og
  // opsætningen er sit eget valg til 1.395.
  {
    id: "levering_ud",
    price: 495,
    image: null,
    da: {
      label: "Levering",
      desc: "Vi kører ud med udstyret, du afleverer selv bagefter",
    },
    en: {
      label: "Delivery",
      desc: "We drive the gear out to you, you return it yourself",
    },
  },
  {
    id: "afhentning_retur",
    price: 495,
    image: null,
    da: {
      label: "Afhentning efter festen",
      desc: "Du henter selv, vi henter udstyret igen bagefter",
    },
    en: {
      label: "Collection after the party",
      desc: "You pick it up yourself, we collect the gear afterwards",
    },
  },
  {
    id: "levering_begge",
    price: 795,
    image: null,
    da: {
      label: "Levering og afhentning (begge veje)",
      desc: "Vi kører ud med udstyret og henter det igen efter festen, spar 195 kr.",
    },
    en: {
      label: "Delivery and collection (both ways)",
      desc: "We bring the gear out and collect it after the party, save 195 DKK",
    },
  },
  {
    // Prisarkets "Levering/Afhentning + Opsætning/Nedtagning", 1.395 kr.
    // Id'et hedder ikke levering_opsaetning — det navn er brugt af en gammel
    // ordre-id i LEGACY_DELIVERY_IDS og ville forveksles med den.
    id: "levering_begge_opsaetning",
    price: 1395,
    image: null,
    da: {
      label: "Levering og afhentning + opsætning og nedtagning",
      desc: "Vi kører ud, stiller op klar til brug, og pakker sammen og henter igen efter festen",
    },
    en: {
      label: "Delivery and collection + setup and takedown",
      desc: "We drive out, set everything up ready to use, then pack down and collect after the party",
    },
  },
  // ── Produktarket 17. sept 2026: stativer, væsker og den kablede mikrofon som tilvalg.
  // Produktfotos genereret i husstilen (scripts/product-images/generate_product_photo.py).
  {
    id: "mikrofon_kabel",
    // Samme mikrofon som rental-varen haandholdt_mikrofon, én side til begge
    page: "/haandholdt-mikrofon",
    price: 95,
    image: "/images/product-mikrofon-kabel-v2-white.webp",
    contents: ["the t.bone MB 60", "XLR-kabel"],
    da: { label: "Mikrofon med ledning", desc: "the t.bone MB 60, håndholdt mikrofon med kabel, sættes direkte i højtaleren" },
    en: { label: "Wired microphone", desc: "the t.bone MB 60, handheld wired microphone, plugs straight into the speaker" },
  },
  {
    id: "stativ_enkelt",
    page: "/hojtalerstativer",
    price: 75,
    image: "/images/product-stativer-white.webp",
    da: { label: "1 højtalerstativ", desc: "Ét Millenium-stativ, løfter højtaleren op i ørehøjde" },
    en: { label: "1 speaker stand", desc: "A single stand, lifts the speaker to ear level" },
  },
  {
    id: "mikrofonstativ",
    price: 95,
    image: "/images/product-mikrofonstativ-white.webp",
    da: { label: "Mikrofonstativ", desc: "Gulvstativ med galge, til taler og sang. Mikrofon er ikke med, den vælges for sig" },
    en: { label: "Microphone stand", desc: "Floor stand with boom arm, for speeches and vocals. Microphone not included, choose it separately" },
  },
  {
    id: "lysstativ",
    price: 145,
    image: "/images/product-lysstativ-white.webp",
    contents: ["Stativ", "Stairville Mini T-Bar 2"],
    da: { label: "Lysstativ", desc: "Stativ med Stairville Mini T-Bar til lyseffekter. Lampen er ikke med, den vælges for sig" },
    en: { label: "Lighting stand", desc: "Stand with T-bar for light effects. The light is not included, choose it separately" },
  },
  {
    id: "x_stativ",
    price: 95,
    image: "/images/product-x-stativ-white.webp",
    contents: ["Gravity KSX 2 X-stativ"],
    da: { label: "X-stativ", desc: "Gravity KSX 2, sammenklappeligt X-stativ til DJ-pult eller keyboard" },
    en: { label: "X-stand", desc: "Gravity KSX 2, folding X-stand for a DJ controller or keyboard" },
  },
  {
    id: "dj_stativ",
    price: 395, // Prisarket 21. sept 2026: DJ-stativ med klæde koster 395 kr
    image: "/images/product-dj-stativ-white.webp",
    contents: ["Gravity KSX 2 RD Set: X-stativ med sort klæde"],
    da: { label: "DJ-stativ med klæde", desc: "Gravity KSX 2 RD Set: X-stativ med sort klæde foran, skjuler kabler og giver en pæn DJ-front" },
    en: { label: "DJ stand with cloth", desc: "Gravity KSX 2 RD Set: X-stand with a black front cloth, hides cables and gives a tidy DJ booth" },
  },
  /* ───── Strøm, prisarkets afsnit 4 ─────
   *
   * Forlængerledninger og stikdåser stod i arket, men har aldrig været på
   * sitet. De hører til i checkout — det er dem, kunden opdager mangler, når
   * teltet står 20 meter fra stikkontakten.
   *
   * De har ingen fotos, og de får ingen: en stikdåse til 25 kr skal ikke
   * sælges med et produktbillede. De vises derfor ikke i tilvalgsgitteret,
   * men i deres eget afsnit i checkout, hvor de er en afkrydsning og ikke et
   * kort. Se STROEM_ADDON_IDS og "Mangler I strøm?" i BookingFlow.
   */
  {
    id: "kabeltromle",
    price: 45,
    image: null,
    da: { label: "Kabeltromle 10 m", desc: "Kabeltromle med 4 udtag, 10 meter. Til når stikkontakten ikke er der, hvor anlægget skal stå" },
    en: { label: "Cable reel 10 m", desc: "Cable reel with 4 sockets, 10 metres. For when the socket is not where the system goes" },
  },
  {
    id: "kabeltromle_jord",
    price: 95,
    image: null,
    da: { label: "Kabeltromle med jord, 25 m", desc: "Kabeltromle med 4 udtag og jord, 25 meter. Til udendørs og til telt" },
    en: { label: "Earthed cable reel, 25 m", desc: "Cable reel with 4 earthed sockets, 25 metres. For outdoors and marquees" },
  },
  {
    id: "stikdaase",
    price: 25,
    image: null,
    da: { label: "Stikdåse, 4 udtag", desc: "4-stikdåse med 5 meter ledning. Ét udtag bliver hurtigt for lidt til højtaler, lys og røg" },
    en: { label: "Power strip, 4 sockets", desc: "4-socket strip with a 5 metre lead. One socket is quickly too few for speaker, light and fog" },
  },
  {
    id: "stikdaase_jord",
    price: 25,
    image: null,
    da: { label: "Stikdåse med jord, 5 udtag", desc: "5-stikdåse med jord og 5 meter ledning. Til udstyr der kræver jordforbindelse" },
    en: { label: "Earthed power strip, 5 sockets", desc: "5-socket earthed strip with a 5 metre lead. For equipment that needs earthing" },
  },
  {
    id: "omformer_udendors",
    price: 10,
    image: null,
    da: { label: "Omformer til udendørs stik", desc: "Hybridstikprop til dansk jord. Passer vores stik til et udendørsstik i telt eller på terrasse" },
    en: { label: "Adapter for outdoor sockets", desc: "Hybrid plug for Danish earthed sockets. Fits our plugs to an outdoor socket in a marquee or on a terrace" },
  },
  {
    id: "roegvaeske",
    price: 295,
    image: "/images/product-vaeske-5l-white.webp",
    da: { label: "Ekstra røgvæske 5 liter", desc: "Til lange fester, en normal aften klares af væsken der følger med maskinen" },
    en: { label: "Extra fog fluid 5 litres", desc: "For long parties, a normal evening is covered by the fluid that comes with the machine" },
  },
  {
    id: "snevaeske",
    price: 295,
    image: "/images/product-vaeske-5l-white.webp",
    da: { label: "Ekstra snevæske 5 liter", desc: "Ekstra væske til snemaskinen" },
    en: { label: "Extra snow fluid 5 litres", desc: "Extra fluid for the snow machine" },
  },
  {
    id: "boblevaeske",
    price: 295,
    image: "/images/product-vaeske-5l-white.webp",
    da: { label: "Ekstra boblevæske 5 liter", desc: "Ekstra væske til sæbeboblemaskinen" },
    en: { label: "Extra bubble fluid 5 litres", desc: "Extra fluid for the bubble machine" },
  },
  ...mixerModels,
  // ── Lydmand (11. sept 2026): en ydelse kunden selv kan vælge til. Prisen er
  // pr. time inkl. moms. Antallet i bookingen ER timerne (13. sept 2026), før
  // lå der en "4 timer"-udgave ved siden af, og det var én vare for meget.
  {
    id: "lydmand",
    page: "/lydmand",
    // Prisarket 21. sept 2026: arkets "Teknikertime" koster 1.195 kr
    price: 1195,
    image: "/images/product-lydmand-white.webp",
    ydelse: true,
    priceUnit: { da: "kr/time", en: "DKK/hour" },
    contents: ["AV-tekniker på stedet", "Opsætning og lydprøve", "Styrer lyd og mikrofoner under festen"],
    da: {
      label: "Lydmand",
      desc: "AV-tekniker på stedet, sætter op, laver lydprøve og styrer lyden under festen. Prisen er pr. time.",
    },
    en: {
      label: "Sound engineer",
      desc: "AV technician on site, sets up, runs the sound check and controls the sound during your event. DKK 1,000 per hour.",
    },
  },
  // ── Faktureringsgebyr: intern vare, lægges kun på fra admin.
  {
    id: "faktureringsgebyr",
    price: 100,
    image: null,
    intern: true,
    da: {
      label: "Faktureringsgebyr",
      desc: "Gebyr ved betaling på faktura",
    },
    en: {
      label: "Invoicing fee",
      desc: "Fee for payment by invoice",
    },
  },
];

/**
 * Kørsels-tilvalgene. De udelukker hinanden: man kører enten ud, henter hjem,
 * eller begge dele, aldrig to af dem på samme ordre.
 */
/**
 * Billeder der er GENERERET, ikke fotograferet.
 *
 * De fem lysbarer og Bryllupspakken har ikke et studiefoto, grejet er sat
 * op og lyst af en model ud fra fotos af vores eget udstyr. Kunden skal kunne
 * se det, men ikke som en mærkat henover billedet: produktsiden skriver en
 * linje UNDER det. Galleriets billeder har deres egen mærkat og står ikke her.
 *
 * Listen er på STIER, ikke på produkt-id'er, og det er med vilje: uploader
 * nogen et rigtigt foto i admin, peger produktet på en R2-URL i stedet, og så
 * forsvinder oplysningen af sig selv frem for at blive stående og lyve.
 */
export const GENEREREDE_BILLEDER: ReadonlySet<string> = new Set([
  "/images/product-halloween-heksetimen.webp",
  "/images/product-halloween-monsterfesten.webp",
  "/images/product-halloween-midnatsklubben.webp",
  "/images/product-pakke-stemningslys-taendt-v3-white.webp",
  "/images/product-pakke-diskolys-taendt-v2-white.webp",
  "/images/product-pakke-teenagefest-taendt-v2-white.webp",
  "/images/product-pakke-festtelt-taendt-white.webp",
  "/images/product-pakke-bryllupslys-taendt-white.webp",
  "/images/product-pakke-diskotek-taendt-v2-white.webp",
  "/images/product-pakke-bryllup-taendt-white.webp",
  "/images/product-pakke-ungdomsfest-taendt-white.webp",
  "/images/product-pakke-ungdomsfest-stor-taendt-white.webp",
]);

/** Er billedet genereret? Bruges til oplysningen under produktbilledet. */
export function erGenereretBillede(sti: string | null | undefined): boolean {
  return !!sti && (GENEREREDE_BILLEDER.has(sti) || /\/images\/product-[^/]+-white(?:-400)?\.webp(?:\?|$)/.test(sti) || sti === "/images/product-dj.webp");
}

export const DELIVERY_ADDON_IDS = ["levering_ud", "afhentning_retur", "levering_begge", "levering_begge_opsaetning"] as const;
export type DeliveryAddonId = (typeof DELIVERY_ADDON_IDS)[number];

/* ───── Sammenlagte varer ─────
 *
 * Prisarket har én linje pr. fysisk ting. Kataloget havde to: den trådløse
 * mikrofon lå både som tilvalget `mikrofon` (445) og som udlejningsvaren
 * `traadloes_mikrofon` (445), og den kablede som `mikrofon_kabel` (95) og
 * `haandholdt_mikrofon` (95). Samme mikrofon, samme pris, samme produktside —
 * men to lagerrækker, to priser der kunne drive fra hinanden, og to id'er en
 * pakke kunne pege på.
 *
 * Tilvalgene overlevede: det er dem, bookingen kan tilbyde under et produkt,
 * og de ejede i forvejen produktsiden. Udlejningsvarerne er væk.
 *
 * Kortet her er ikke pynt. Gamle ordrer i KV, gemte kataloger, bogmærker og
 * annonce-URL'er bærer stadig de gamle id'er, og både prisopslaget på serveren
 * og lageropgørelsen slår derfor op gennem det.
 */
export const SAMMENLAGTE_IDER: Record<string, string> = {
  traadloes_mikrofon: "mikrofon",
  haandholdt_mikrofon: "mikrofon_kabel",
};

/** Det id en vare hedder i dag — uændret, hvis den ikke er lagt sammen. */
export function nuvaerendeId(id: string): string {
  return SAMMENLAGTE_IDER[id] ?? id;
}

/** Gamle ordrer/kataloger bruger disse ids, de tæller stadig som kørsel */
export const LEGACY_DELIVERY_IDS = ["levering", "levering_opsaetning"];

/**
 * Tilvalg der er udgået af koden, men kan ligge i et gammelt KV-katalog.
 * lydmand_4t (4 timer som én vare, 11.–13. sept 2026) blev til "lydmand" med
 * antal timer, én vare i to udgaver var det, kunden faldt over.
 */
export const RETIRED_ADDON_IDS = ["lydmand_4t"];

/** Interne varer (fx faktureringsgebyr), kun til ordrer fra admin. */
export function isInternalAddon(a: { intern?: boolean }): boolean {
  return a.intern === true;
}

/** Ydelser (fx lydmand), kundevendte, men uden lager og foto. */
export function isServiceAddon(a: { ydelse?: boolean }): boolean {
  return a.ydelse === true;
}

export function isDeliveryAddon(id: string): boolean {
  return (DELIVERY_ADDON_IDS as readonly string[]).includes(id) || LEGACY_DELIVERY_IDS.includes(id);
}

/**
 * Pakker hvor kørslen ER en del af prisen (pakkerne med lydmand): teknikeren
 * kommer sammen med grejet, sætter op og tager det med hjem igen. Bookingen
 * låser derfor leveringen i stedet for at spørge, om kunden henter selv, og
 * serveren holder deliveryOptionId på ordren selv om tilvalget ikke står der.
 */
export function bundleIncludesDelivery(
  p: { bundle?: ProductBundle } | null | undefined,
): DeliveryAddonId | null {
  const part = p?.bundle?.parts?.find((x) => (DELIVERY_ADDON_IDS as readonly string[]).includes(x.productId));
  return part ? (part.productId as DeliveryAddonId) : null;
}

/** Hvilke veje vi kører på en given ordre, bruges i admin og på lejesedlen */
export function deliveryDirections(id: string): { out: boolean; back: boolean } {
  if (id === "levering_ud") return { out: true, back: false };
  if (id === "afhentning_retur") return { out: false, back: true };
  if (id === "levering_begge" || id === "levering_begge_opsaetning" || LEGACY_DELIVERY_IDS.includes(id)) return { out: true, back: true };
  return { out: false, back: false };
}

/** Standalone rental products (lys, av), bookable via /?product=ID */
const rentalProductsRaw: RawRentalProduct[] = [
  ...djGearProducts,
  // ── Produktarket 17. sept 2026: nye pakker (bundter af arkets enkeltprodukter)
  {
    id: "pakke_speaker_lille",
    category: "lyd",
    image: "/images/product-party-v2-white.webp",
    showPartImages: true,
    name_da: "Speakerpakke 0-30",
    name_en: "Speaker package 0-30",
    desc_da: "Lille højtalerpakke + mikrofon med ledning. Lyd og taler til op til 30 gæster.",
    desc_en: "Small speaker package + wired microphone. Sound and speeches for up to 30 guests.",
    contents: ["2× Alto 10\" højtalere", "Mikrofon med ledning", "Bluetooth", "Alle kabler"],
    allowedAddons: ["stativer", "mixer_stor", "mikrofonstativ", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Musik og en tale eller to i det mindre selskab. Mikrofonen går direkte i højtaleren.",
      usecase_en: "Music and a speech or two for the smaller gathering. The microphone plugs straight into the speaker.",
      parts: [
        { productId: "party", label_da: "Lille højtalerpakke", label_en: "Small speaker package", price: 595 },
        { productId: "mikrofon_kabel", label_da: "Mikrofon med ledning", label_en: "Wired microphone", price: 95 },
      ],
    },
  },
  {
    id: "pakke_speaker_traadloes_lille",
    category: "lyd",
    image: "/images/product-party-v2-white.webp",
    showPartImages: true,
    name_da: "Speakerpakke trådløs 0-30",
    name_en: "Wireless speaker package 0-30",
    desc_da: "Lille højtalerpakke + trådløs Shure-mikrofon. Taler og musik til op til 30 gæster.",
    desc_en: "Small speaker package + wireless Shure microphone. Speeches and music for up to 30 guests.",
    contents: ["2× Alto 10\" højtalere", "Trådløs Shure-mikrofon", "Alle kabler"],
    allowedAddons: ["stativer", "mixer_stor", "mikrofonstativ", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Taler uden kabel i det mindre selskab, og musik bagefter.",
      usecase_en: "Speeches without a cable for the smaller gathering, and music afterwards.",
      parts: [
        { productId: "party", label_da: "Lille højtalerpakke", label_en: "Small speaker package", price: 595 },
        { productId: "mikrofon", label_da: "Trådløs mikrofon", label_en: "Wireless mic", price: 445 },
      ],
    },
  },
  {
    id: "pakke_fest_100",
    category: "lyd",
    image: "/images/product-festival-bas-v2-white.webp",
    showPartImages: true,
    name_da: "Festpakke 50-100",
    name_en: "Party package 50-100",
    desc_da: "Stor højtalerpakke + 2 lysbarer. Lyd med bas og lys i begge ender af dansegulvet til 50-100 gæster.",
    desc_en: "Large speaker package + 2 light bars. Sound with bass and lights at both ends of the dancefloor for 50-100 guests.",
    contents: ["2× EV 12\" højtalere", "12\" subwoofer", "2× lysbar (2 lamper + centereffekt)", "Alle kabler"],
    allowedAddons: ["rog", "stativer", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Festen med 50-100 gæster: subwooferen giver tryk, to lysbarer dækker hele dansegulvet.",
      usecase_en: "The party with 50-100 guests: the subwoofer adds punch, two light bars cover the whole dancefloor.",
      parts: [
        { productId: "hojtaler_100", label_da: "Stor højtalerpakke", label_en: "Large speaker package", price: 1295 },
        { productId: "lys", qty: 2, label_da: "2× lysbar", label_en: "2× light bar", price: 790 },
      ],
    },
  },
  {
    id: "pakke_elegant",
    category: "lyd",
    image: "/images/product-festival-v2-white.webp",
    showPartImages: true,
    name_da: "Elegant festpakke",
    name_en: "Elegant party package",
    desc_da: "Mellem højtalerpakke + discokugle 40 cm med stativ og spot. Lyd og klassisk lys til 30-50 gæster.",
    desc_en: "Medium speaker package + 40 cm disco ball with stand and spot. Sound and classic light for 30-50 guests.",
    contents: ["2× EV 12\" højtalere", "Discokugle 40 cm med motor, stativ og spot", "Alle kabler"],
    allowedAddons: ["stativer", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Til festen hvor lyset skal være stilfuldt frem for blinkende: en discokugle i spot og god lyd.",
      usecase_en: "For the party where the light should be stylish rather than flashing: a disco ball in a spotlight and good sound.",
      parts: [
        { productId: "festival", label_da: "Mellem højtalerpakke", label_en: "Medium speaker package", price: 795 },
        { productId: "discokugle", label_da: "Discokugle 40 cm komplet", label_en: "Disco ball 40 cm complete", price: 645 },
      ],
    },
  },
  {
    id: "pakke_soundboks_lille",
    category: "lyd",
    image: "/images/product-thumpgo-v2-white.webp",
    showPartImages: true,
    name_da: "Lille soundboks pakke",
    name_en: "Small Soundboks package",
    desc_da: "Mackie Thump GO + lysbar. Batterihøjtaler og lys til den lille fest.",
    desc_en: "Mackie Thump GO + light bar. Battery speaker and lights for the small party.",
    contents: ["Mackie Thump GO 8\"", "Lysbar (2 lamper + centereffekt)", "Stativ", "Alle kabler"],
    allowedAddons: ["stativer", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Det billige alternativ til Soundboks-pakken: batterihøjtaler til op til 30 gæster og en lysbar. Lysbaren kræver strøm.",
      usecase_en: "The budget alternative to the Soundboks package: a battery speaker for up to 30 guests and a light bar. The light bar needs power.",
      parts: [
        { productId: "thumpgo", label_da: "Mackie Thump GO", label_en: "Mackie Thump GO", price: 495 },
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
      ],
    },
  },
  {
    id: "pakke_festlys_50",
    category: "lys",
    image: "/images/product-lys-v4-white.webp",
    showPartImages: true,
    name_da: "Festlys 0-50",
    name_en: "Party lights 0-50",
    desc_da: "Lysbar + røgmaskine. Lys og røg til dansegulvet for op til 50 gæster.",
    desc_en: "Light bar + fog machine. Lights and fog for the dancefloor for up to 50 guests.",
    contents: ["Lysbar (2 lamper + centereffekt)", "Røgmaskine med væske", "Stativ og kabler"],
    allowedAddons: [...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Røgen gør lyset synligt. Til dig der har lyden, men mangler dansegulvet.",
      usecase_en: "Fog makes the light visible. For when you have the sound but need a dancefloor.",
      parts: [
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
        { productId: "rog", label_da: "Røgmaskine", label_en: "Fog machine", price: 245 },
      ],
    },
  },
  {
    id: "pakke_festlys_100",
    category: "lys",
    image: "/images/product-lys-v4-white.webp",
    showPartImages: true,
    name_da: "Festlys 50-100",
    name_en: "Party lights 50-100",
    desc_da: "2 lysbarer + røgmaskine. Lys i begge ender af dansegulvet og røg til 50-100 gæster.",
    desc_en: "2 light bars + fog machine. Lights at both ends of the dancefloor and fog for 50-100 guests.",
    contents: ["2× lysbar (2 lamper + centereffekt)", "Røgmaskine med væske", "Stativer og kabler"],
    allowedAddons: [...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Det store dansegulv: to lysbarer dækker rummet, røgen gør strålerne synlige.",
      usecase_en: "The big dancefloor: two light bars cover the room, fog makes the beams visible.",
      parts: [
        { productId: "lys", qty: 2, label_da: "2× lysbar", label_en: "2× light bar", price: 790 },
        { productId: "rog", label_da: "Røgmaskine", label_en: "Fog machine", price: 245 },
      ],
    },
  },
  // ── Nye enkeltprodukter fra arket (17. sept 2026), fotos genereret i husstilen.
  { id: "monitor", category: "lyd", price: 495, image: "/images/product-monitor-white.webp", name_da: "Monitor · EV ZLX 12P", name_en: "Monitor · EV ZLX 12P", desc_da: "Én aktiv 12\" EV-højtaler, som monitor til scenen eller ekstra højtaler.", desc_en: "A single active 12\" EV speaker, as a stage monitor or an extra speaker.", contents: ["1× EV ZLX 12P G2 aktiv højtaler", "Strømkabel"] },
  { id: "discokugle_guld", category: "lys", price: 645, image: "/images/product-discokugle-guld-white.webp", name_da: "Discokugle 40 cm guld", name_en: "Disco ball 40 cm gold", desc_da: "Komplet pakke: 40 cm guldfarvet discokugle med motor, spot og stativ.", desc_en: "Complete package: 40 cm gold disco ball with motor, spotlight and stand.", allowedAddons: [...DELIVERY_ADDON_IDS], contents: ["Eurolite Mirror Ball 40 cm gold", "Motor", "LED-spot", "Stativ", "Strømkabel"] },
  { id: "scenelys", category: "lys", price: 695, image: "/images/product-scenelys-white.webp", name_da: "Scenelys (4 LED på stativ)", name_en: "Stage lights (4 LEDs on a stand)", desc_da: "4 LED-lamper på stativ med tværbom og fjernbetjening, lys til scene, taler og band.", desc_en: "4 LED lights on a stand with cross bar and remote, light for a stage, speeches and bands.", allowedAddons: [...DELIVERY_ADDON_IDS], contents: ["4× Fun Generation PartyPar 12 LED", "Stageworx TS-120 tværbom på stativ", "Fjernbetjening", "Strømkabler"] },
  { id: "foelgespot", category: "lys", price: 1995, image: "/images/product-foelgespot-white.webp", name_da: "Følgespot", name_en: "Follow spot", desc_da: "LED-følgespot 120 W på stativ, til at følge taleren eller brudeparret.", desc_en: "120 W LED follow spot on a stand, to follow the speaker or the couple.", allowedAddons: [...DELIVERY_ADDON_IDS], contents: ["Showtec Followspot LED 120 W", "Stativ", "Strømkabel"] },
  { id: "uv_lampe", category: "lys", price: 245, image: "/images/product-uv-lampe-white.webp", name_da: "UV-lampe", name_en: "UV light", desc_da: "UV-lampe der får hvidt og neon til at lyse, til UV- og neonfester.", desc_en: "UV light that makes white and neon glow, for UV and neon parties.", allowedAddons: ["lys", "rog", "lysstativ", "stroboskop", ...DELIVERY_ADDON_IDS], contents: ["Stairville Wild Wash 9×3 W LED UV", "Strømkabel"] },
  { id: "laser", category: "lys", price: 595, image: "/images/product-laser-white.webp", name_da: "RGB-laser", name_en: "RGB laser", desc_da: "Farvet laser med mønstre, bedst sammen med røg.", desc_en: "Colour laser with patterns, best together with fog.", allowedAddons: ["lys", "rog", "lysstativ", "stroboskop", ...DELIVERY_ADDON_IDS], contents: ["Laserworld EL-230RGB MKII", "Strømkabel"] },
  { id: "snemaskine", category: "roeg", price: 445, image: "/images/product-snemaskine-white.webp", name_da: "Snemaskine", name_en: "Snow machine", desc_da: "Snemaskine der laver fin kunstig sne, inkl. snevæske.", desc_en: "Snow machine that makes fine artificial snow, incl. snow fluid.", allowedAddons: ["snevaeske", ...DELIVERY_ADDON_IDS], contents: ["Eliminator VF Flurry EP snemaskine", "Snevæske", "Strømkabel"] },
  { id: "saebeboblemaskine", category: "roeg", price: 995, image: "/images/product-saebeboblemaskine-white.webp", name_da: "Sæbeboblemaskine", name_en: "Bubble machine", desc_da: "Stor sæbeboblemaskine, fylder rummet med bobler, inkl. boblevæske.", desc_en: "Large bubble machine that fills the room with bubbles, incl. bubble fluid.", allowedAddons: ["boblevaeske", ...DELIVERY_ADDON_IDS], contents: ["Eurolite SD201 DMX sæbeboblemaskine", "Boblevæske", "Strømkabel"] },
  ...situationPackages,
  ...microphonePackages,
  // Prisarkets afsnit 5 og 6, alle hidden indtil de har et foto
  ...anledningPakker,
  {
    id: "dj_headphones",
    hidden: true,
    page: "/hovedtelefoner",
    category: "lyd",
    price: 100,
    image: "/images/product-hovedtelefoner.webp",
    name_da: "DJ-hovedtelefoner · Fun Generation HP 5",
    name_en: "DJ headphones · Fun Generation HP 5",
    desc_da: "Lukkede DJ-hovedtelefoner med mini-jack og 6,3 mm-adapter. Følger med DJ-pulten, og kan lejes alene for 100 kr.",
    desc_en: "Closed-back DJ headphones with mini-jack and 6.3 mm adapter. Included with the DJ controller, or hire them on their own for 100 DKK.",
    contents: ["Fun Generation HP 5", "3 m kabel", "6,3 mm jack-adapter"],
  },
  // Halloween: nye kombinationer af eksisterende udstyr. Lager følger delene.
  {
    id: "halloween_lys", page: "/halloween-lys", category: "lyd", image: "/images/product-halloween-heksetimen.webp",
    name_da: "Heksetimen", name_en: "The Witching Hour",
    desc_da: "Halloween-pakke med Mackie Thump GO, LED-lyseffekt og røgmaskine med væske. Kompakt lyd, lys og røg til den lille fest.",
    desc_en: "A compact Halloween party package with a Mackie Thump GO speaker, LED light effect and fog machine with fluid. Sound, lights and fog for a small party.",
    contents: ['Mackie Thump GO 8"', "Oplader", "Bluetooth", "1 LED-lyseffekt uden stativ", "Røgmaskine inkl. væske", "Strømkabler"],
    allowedAddons: ["mikrofon", ...DELIVERY_ADDON_IDS],
    bundle: { usecase_da: "Kompakt lyd, lys og røg", usecase_en: "Compact sound, lights and fog",
      parts: [
        { productId: "thumpgo", label_da: "Mackie Thump GO", label_en: "Mackie Thump GO", price: 495 },
        { productId: "lyseffekt", label_da: "LED-lyseffekt", label_en: "LED light effect", price: 195 },
        { productId: "rog", label_da: "Røgmaskine inkl. væske", label_en: "Fog machine with fluid", price: 245 },
      ],
    },
  },
  {
    id: "halloween_lille", page: "/halloween-festpakke", category: "lyd", image: "/images/product-halloween-monsterfesten.webp",
    name_da: "Monsterfesten", name_en: "Monster Party",
    desc_da: "Halloween-festpakke til op til 30 gæster: to Alto-højtalere, lysbar og røgmaskine med væske. Tilslut din egen playliste via Bluetooth.",
    desc_en: "Halloween party rental for up to 30 guests: two Alto speakers, a light bar and a fog machine with fluid. Connect your playlist via Bluetooth.",
    contents: ['2× Alto 10" højtalere', "Lysbar på stativ", "Røgmaskine inkl. væske", "Bluetooth + alle kabler"],
    allowedAddons: ["stativer", "subwoofer", "mikrofon", ...DELIVERY_ADDON_IDS],
    bundle: { usecase_da: "Lyd, lys og røg · op til 30 gæster", usecase_en: "Sound, lights and fog · up to 30 guests",
      parts: [
        { productId: "party", label_da: "2× Alto-højtalere", label_en: "2× Alto speakers", price: 595 },
        { productId: "lys", label_da: "Lysbar på stativ", label_en: "Light bar on stand", price: 395 },
        { productId: "rog", label_da: "Røgmaskine inkl. væske", label_en: "Fog machine with fluid", price: 245 },
      ],
    },
  },
  {
    id: "halloween_stor", page: "/halloween-festpakke-stor", category: "lyd", image: "/images/product-halloween-midnatsklubben.webp",
    name_da: "Midnatsklubben", name_en: "The Midnight Club",
    desc_da: "Halloween-festpakke til 30–50 gæster: to EV-højtalere på stativer, lysbar og røgmaskine med væske. Klar til dansegulvet.",
    desc_en: "Halloween party equipment for 30–50 guests: two EV speakers on stands, a light bar and a fog machine with fluid. Ready for the dance floor.",
    contents: ['2× EV 12" højtalere', "Højtalerstativer", "Lysbar på stativ", "Røgmaskine inkl. væske", "Bluetooth + alle kabler"],
    allowedAddons: ["subwoofer", "mikrofon", ...DELIVERY_ADDON_IDS],
    bundle: { usecase_da: "Lyd, lys og røg · 30–50 gæster", usecase_en: "Sound, lights and fog · 30–50 guests",
      parts: [
        { productId: "festival", label_da: "2× EV-højtalere", label_en: "2× EV speakers", price: 795 },
        { productId: "stativer", label_da: "Højtalerstativer", label_en: "Speaker stands", price: 95 },
        { productId: "lys", label_da: "Lysbar på stativ", label_en: "Light bar on stand", price: 395 },
        { productId: "rog", label_da: "Røgmaskine inkl. væske", label_en: "Fog machine with fluid", price: 245 },
      ],
    },
  },
  {
    id: "jul_hygge", page: "/julehyggen", category: "lyd", image: "/images/product-jul-hygge.webp",
    name_da: "Julehyggen", name_en: "Christmas Hygge",
    desc_da: "Kompakt julefrokost til kontoret: Mackie Thump GO, varm lyskæde og en LED-lyseffekt. Bluetooth, ingen røg.",
    desc_en: "A compact Christmas lunch for the office: Mackie Thump GO, warm fairy lights and an LED effect. Bluetooth, no fog.",
    contents: ['Mackie Thump GO 8"', "Lyskæde varm hvid", "1 LED-lyseffekt uden stativ", "Oplader", "Bluetooth", "Strømkabler"],
    allowedAddons: ["mikrofon", ...DELIVERY_ADDON_IDS],
    bundle: { usecase_da: "Kontorets julehygge uden dansegulv", usecase_en: "Office Christmas hygge, no dance floor",
      parts: [
        { productId: "thumpgo", label_da: "Mackie Thump GO", label_en: "Mackie Thump GO", price: 495 },
        { productId: "lyskaeder", label_da: "Lyskæde varm hvid", label_en: "Fairy lights warm white", price: 195 },
        { productId: "lyseffekt", label_da: "LED-lyseffekt", label_en: "LED light effect", price: 195 },
      ],
    },
  },
  // ── Pakker med lydmand (11. sept 2026) ──
  // AV-tekniker med på dagen. Levering, opsætning og afhentning er ALTID med:
  // lydmanden kommer sammen med grejet, sætter op og tager det med hjem igen.
  // Delen levering_begge ligger derfor i pakken, og bookingen låser kørslen
  // (bundleIncludesDelivery) i stedet for at spørge om kunden henter selv.
  {
    id: "pakke_lydmand_fest",
    hidden: true,
    page: "/festpakke-lydmand",
    category: "lyd",
    image: "/images/product-pakke-lydmand-fest-v2-white.webp",
    name_da: "Festpakke med lydmand",
    name_en: "Party package with sound engineer",
    desc_da: "Mellem højtalerpakke + lysbar + lydmand i 4 timer. Leveret, sat op og hentet igen.",
    desc_en: "Medium speaker package + light bar + sound engineer for 4 hours. Delivered, set up and collected.",
    contents: ['2× EV 12" højtalere', "Lysbar (2 lamper + centereffekt)", "Lydmand i 4 timer", "Levering, opsætning og afhentning"],
    allowedAddons: ["subwoofer", "rog", "mikrofon", "lydmand"],
    bundle: {
      usecase_da: "Festen hvor I ikke selv skal røre en knap, op til 100 pers. Vi kommer, sætter op, styrer lyden og pakker sammen.",
      usecase_en: "The party where you never touch a knob, up to 100 people. We arrive, set up, run the sound and pack down.",
      parts: [
        { productId: "festival", label_da: "Mellem højtalerpakke", label_en: "Medium speaker package", price: 795 },
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
        { productId: "lydmand", qty: 4, label_da: "Lydmand, 4 timer", label_en: "Sound engineer, 4 hours", price: 4000 },
        { productId: "levering_begge", label_da: "Levering, opsætning + afhentning", label_en: "Delivery, setup + collection", price: 795 },
      ],
    },
  },
  {
    id: "pakke_lydmand_firma",
    hidden: true,
    page: "/firmaevent-lydmand",
    category: "lyd",
    image: "/images/product-pakke-lydmand-firma-v2-white.webp",
    name_da: "Firmaevent med lydmand",
    name_en: "Corporate event with sound engineer",
    desc_da: "Mellem højtalerpakke + mixer + trådløs mikrofon + lydmand i 4 timer. Taler, musik og en tekniker der styrer det hele.",
    desc_en: "Medium speaker package + mixer + wireless mic + sound engineer for 4 hours. Speeches, music and a technician running it all.",
    contents: ['2× EV 12" højtalere', "the t.mix xmix 1202 FXMP USB", "Trådløs mikrofon", "Lydmand i 4 timer", "Levering, opsætning og afhentning"],
    allowedAddons: ["subwoofer", "mikrofon", "lys", "lydmand"],
    bundle: {
      usecase_da: "Firmafest, reception eller jubilæum med taler, op til 100 pers. Mikrofonen virker, når direktøren rejser sig, fordi der står én og passer den.",
      usecase_en: "Company party, reception or anniversary with speeches, up to 100 people. The mic works when the boss stands up, because someone is there to make sure.",
      parts: [
        { productId: "festival", label_da: "Mellem højtalerpakke", label_en: "Medium speaker package", price: 795 },
        { productId: "mixer_stor", label_da: "Mixer mellem · 6 mikrofonindgange", label_en: "Medium mixer · 6 microphone inputs", price: 345 },
        { productId: "mikrofon", label_da: "Trådløs mikrofon", label_en: "Wireless mic", price: 445 },
        { productId: "lydmand", qty: 4, label_da: "Lydmand, 4 timer", label_en: "Sound engineer, 4 hours", price: 4000 },
        { productId: "levering_begge", label_da: "Levering, opsætning + afhentning", label_en: "Delivery, setup + collection", price: 795 },
      ],
    },
  },
  {
    id: "pakke_lydmand_stor",
    hidden: true,
    page: "/stor-fest-lydmand",
    category: "lyd",
    image: "/images/product-pakke-lydmand-stor-v2-white.webp",
    name_da: "Stor fest med lydmand",
    name_en: "Big party with sound engineer",
    desc_da: "Mellem højtalerpakke + subwoofer + stativer + lysbar + røg + lydmand i 4 timer. Fuldt anlæg med tekniker.",
    desc_en: "Medium speaker package + subwoofer + stands + light bar + fog + sound engineer for 4 hours. Full rig with a technician.",
    contents: ['2× EV 12" højtalere', 'Subwoofer 12"', "Højtalerstativer", "Lysbar + røgmaskine", "Lydmand i 4 timer", "Levering, opsætning og afhentning"],
    allowedAddons: ["mikrofon", "mixer_stor", "lydmand"],
    bundle: {
      usecase_da: "Den store fest med bas, lys og røg, op til 150 pers. Lydmanden sætter det hele op og holder dansegulvet kørende.",
      usecase_en: "The big party with bass, lights and fog, up to 150 people. The sound engineer sets it all up and keeps the dancefloor going.",
      parts: [
        { productId: "festival", label_da: "Mellem højtalerpakke", label_en: "Medium speaker package", price: 795 },
        { productId: "subwoofer", label_da: 'Subwoofer 12"', label_en: 'Subwoofer 12"', price: 495 },
        { productId: "stativer", label_da: "Højtalerstativer", label_en: "Speaker stands", price: 95 },
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
        { productId: "rog", label_da: "Røgmaskine", label_en: "Fog machine", price: 245 },
        { productId: "lydmand", qty: 4, label_da: "Lydmand, 4 timer", label_en: "Sound engineer, 4 hours", price: 4000 },
        { productId: "levering_begge", label_da: "Levering, opsætning + afhentning", label_en: "Delivery, setup + collection", price: 795 },
      ],
    },
  },
  // Festpakke-bundles (lyd + lys), ikke almindelige produkter; se BundleGrid.
  // Levering/opsætning er bevidst IKKE med i pakken, det kan tilvælges i booking.
  {
    id: "pakke_fest_lille",
    page: "/festpakke-lille",
    category: "lyd",
    image: "/images/product-pakke-fest-lille-white.webp",
    showPartImages: true,
    youtubeUrl: "https://www.youtube.com/watch?v=0VN2Q2bMufA",
    cardImageCrop: "50% 46%",
    name_da: "Festpakke 0-30",
    name_en: "Party package 0-30",
    desc_da: "Lille højtalerpakke + lysbar. Lyd og lys til op til 30 gæster.",
    desc_en: "Small speaker package + light bar. Sound and lights for up to 30 guests.",
    contents: ["2× Alto 10\" højtalere", "Lysbar (2 lamper + centereffekt)", "Bluetooth + alle kabler"],
    allowedAddons: ["rog", "stativer", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Lyd og lys til den lille fest, op til 30 gæster. Kompakt sæt, klar på 10 minutter.",
      usecase_en: "Sound and lights for the small party, up to 30 guests. Compact set, ready in 10 minutes.",
      parts: [
        { productId: "party", label_da: "Lille højtalerpakke", label_en: "Small speaker package", price: 595 },
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
      ],
    },
  },
  {
    id: "pakke_fest_stor",
    page: "/festpakke-stor",
    category: "lyd",
    image: "/images/product-pakke-fest-stor-white.webp",
    showPartImages: true,
    youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0",
    cardImageCrop: "50% 47%",
    name_da: "Festpakke 30-50",
    name_en: "Party package 30-50",
    desc_da: "Mellem højtalerpakke + lysbar. Lyd og lys til 30-50 gæster.",
    desc_en: "Medium speaker package + light bar. Sound and lights for 30-50 guests.",
    contents: ["2× EV 12\" højtalere", "Lysbar (2 lamper + centereffekt)", "Bluetooth + alle kabler"],
    allowedAddons: ["rog", "stativer", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Lyd og lys til festen med 30-50 gæster, med de store 12\" højtalere.",
      usecase_en: "Sound and lights for the party with 30-50 guests, with the large 12\" speakers.",
      parts: [
        { productId: "festival", label_da: "Mellem højtalerpakke", label_en: "Medium speaker package", price: 795 },
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
      ],
    },
  },
  // ── Pakkestigen 150 og 250: navngivet efter antal gæster, ikke efter grej.
  // Kunden ved hvor mange der kommer; han ved ikke hvad 2× 12" EV betyder.
  // Kørsel er stadig et tilvalg her, se epic_aov i prd.json for hvorfor den
  // skal med i prisen på sigt, og hvad der mangler i flowet før det kan lade sig gøre.
  {
    id: "pakke_fest_150",
    page: "/festpakke-150",
    youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0",
    category: "lyd",
    image: "/images/product-pakke-fest-150-v2-white.webp",
    name_da: "Festpakke 150",
    name_en: "Party package 150",
    desc_da: 'Højtalere, sub, lys og røg til op til 150 gæster.',
    desc_en: "Speakers, sub, lights and fog for up to 150 guests.",
    contents: ['2× EV 12" højtalere', '12" subwoofer', "Stativer", "Lysbar (2 lamper + centereffekt)", "Røgmaskine + væske", "Alle kabler"],
    allowedAddons: ["mikrofon", "subwoofer", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Festen hvor dansegulvet skal fungere: bassen giver tryk, lyset giver rum, røgen gør lyset synligt.",
      usecase_en: "The party where the dancefloor has to work: sub for punch, lights for the room, fog to make the light visible.",
      parts: [
        { productId: "festival", label_da: 'Mellem højtalerpakke (2× 12")', label_en: 'Medium speaker package (2× 12")', price: 795 },
        { productId: "subwoofer", label_da: 'Subwoofer 12"', label_en: 'Subwoofer 12"', price: 495 },
        { productId: "stativer", label_da: "Højtalerstativer", label_en: "Speaker stands", price: 95 },
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
        { productId: "rog", label_da: "Røgmaskine", label_en: "Fog machine", price: 245 },
      ],
    },
  },
  {
    id: "pakke_fest_250",
    page: "/festpakke-250",
    youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0",
    category: "lyd",
    image: "/images/product-pakke-fest-250-v2-white.webp",
    name_da: "Festpakke 250",
    name_en: "Party package 250",
    desc_da: "Dobbelt anlæg med to subs, lys og røg til op til 250 gæster. Leveres og sættes op.",
    desc_en: "Double system with two subs, lights and fog for up to 250 guests.",
    contents: ['4× EV 12" højtalere', '2× 12" subwoofer', "2 sæt stativer", "Lysbar", "Røgmaskine + væske", "Alle kabler + strøm"],
    allowedAddons: ["mikrofon", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Sal, gård eller hal med 150-250 gæster. Fire tops dækker bredden, to subs holder bunden.",
      usecase_en: "Hall or courtyard with 150-250 guests. Four tops cover the width, two subs hold the bottom.",
      parts: [
        { productId: "festival", label_da: 'Mellem højtalerpakke (2× 12")', label_en: 'Medium speaker package (2× 12")', price: 795 },
        { productId: "festival", label_da: 'Mellem højtalerpakke nr. 2', label_en: "Large speakers no. 2", price: 795 },
        { productId: "subwoofer", label_da: 'Subwoofer 12"', label_en: 'Subwoofer 12"', price: 495 },
        { productId: "subwoofer", label_da: 'Subwoofer 12" nr. 2', label_en: 'Subwoofer 12" no. 2', price: 495 },
        { productId: "stativer", label_da: "Højtalerstativer", label_en: "Speaker stands", price: 95 },
        { productId: "stativer", label_da: "Højtalerstativer nr. 2", label_en: "Speaker stands no. 2", price: 95 },
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
        { productId: "rog", label_da: "Røgmaskine", label_en: "Fog machine", price: 245 },
      ],
    },
  },
  // ── Lejlighedspakker: én pakke pr. område kunden faktisk søger på.
  // Anledningssiderne pegede før på et enkeltprodukt eller en generisk
  // festpakke, polterabend anbefalede en højtaler til 345 kr. Her er
  // pakken bygget til det der skal ske: taler, ingen strøm, film, eller lys.
  {
    id: "pakke_bryllup",
    hidden: true,
    page: "/bryllupspakke",
    youtubeUrl: "https://www.youtube.com/watch?v=GM_WsXv1FU4",
    category: "lyd",
    image: "/images/product-pakke-bryllup-taendt-white.webp",
    name_da: "Bryllupspakke",
    name_en: "Wedding package",
    desc_da: "Højtalere, mikrofon til talerne, lys, lyskæder og low fog til første dans.",
    desc_en: "Speakers, a mic for the speeches, lights, fairy lights and low fog for the first dance.",
    contents: ['2× EV 12" højtalere + stativer', "Trådløs mikrofon til talerne", "Lysbar", "10 m lyskæde", "Low fog-maskine"],
    allowedAddons: ["mikrofon", "subwoofer", "rog", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Dagen har to dele: taler alle kan høre, og et dansegulv der holder. Low fog giver 'dansen på skyer' til første dans.",
      usecase_en: "The day has two halves: speeches everyone can hear, and a dancefloor that holds. Low fog gives the 'dancing on clouds' first dance.",
      parts: [
        { productId: "festival", label_da: 'Mellem højtalerpakke (2× 12")', label_en: 'Medium speaker package (2× 12")', price: 795 },
        { productId: "stativer", label_da: "Højtalerstativer", label_en: "Speaker stands", price: 95 },
        { productId: "mikrofon", label_da: "Trådløs mikrofon", label_en: "Wireless mic", price: 445 },
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
        { productId: "lyskaeder", label_da: "Lyskæde varm hvid", label_en: "Fairy lights warm white", price: 195 },
        { productId: "low_fog", label_da: "Low fog-maskine", label_en: "Low fog machine", price: 545 },
      ],
    },
  },
  {
    id: "pakke_firmafest",
    page: "/firmafestpakke",
    youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0",
    category: "lyd",
    image: "/images/product-pakke-fest-stor-white.webp",
    cardImageCrop: "50% 47%",
    name_da: "Firmafestpakke",
    name_en: "Company party package",
    desc_da: "Mikrofon til chefens tale, sub til dansegulvet bagefter, lys og røg.",
    desc_en: "A mic for the speech, a sub for the dancefloor afterwards, lights and fog.",
    contents: ['2× EV 12" højtalere + stativer', "Trådløs mikrofon", '12" subwoofer', "Lysbar", "Røgmaskine"],
    allowedAddons: ["mikrofon", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Julefrokost og firmafest i ét: talen skal høres af alle, og bagefter skal der danses.",
      usecase_en: "Christmas lunch and company party in one: the speech must be heard, and afterwards there is dancing.",
      parts: [
        { productId: "festival", label_da: 'Mellem højtalerpakke (2× 12")', label_en: 'Medium speaker package (2× 12")', price: 795 },
        { productId: "stativer", label_da: "Højtalerstativer", label_en: "Speaker stands", price: 95 },
        { productId: "mikrofon", label_da: "Trådløs mikrofon", label_en: "Wireless mic", price: 445 },
        { productId: "subwoofer", label_da: 'Subwoofer 12"', label_en: 'Subwoofer 12"', price: 495 },
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
        { productId: "rog", label_da: "Røgmaskine", label_en: "Fog machine", price: 245 },
      ],
    },
  },
  {
    id: "pakke_udendors",
    hidden: true,
    page: "/udendorspakke",
    youtubeUrl: "https://www.youtube.com/watch?v=k7nG3O4I6JI",
    category: "lyd",
    image: "/images/product-pakke-udendors-komposition-white.webp",
    name_da: "Udendørspakke",
    name_en: "Outdoor package",
    desc_da: "Soundboks 4, ekstra batteri og lyskæde, hele festen uden en eneste stikkontakt.",
    desc_en: "Soundboks 4, spare battery and fairy lights, a whole party without a single power socket.",
    contents: ["Soundboks 4 (batteri)", "Ekstra batteri", "10 m lyskæde", "Oplader + AUX-kabel"],
    allowedAddons: ["taske", "lyseffekt", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Baggård, strand, park eller polterabend: der er ingen strøm, og festen skal holde til langt ud på aftenen.",
      usecase_en: "Courtyard, beach, park or stag do: there is no power, and the party has to last all evening.",
      parts: [
        { productId: "soundboks", label_da: "Soundboks 4", label_en: "Soundboks 4", price: 695 },
        { productId: "batteri", label_da: "Ekstra batteri", label_en: "Extra battery", price: 395 },
        { productId: "lyskaeder", label_da: "Lyskæde varm hvid", label_en: "Fairy lights warm white", price: 195 },
      ],
    },
  },
  {
    id: "pakke_student",
    hidden: true,
    page: "/studenterpakke",
    youtubeUrl: "https://www.youtube.com/watch?v=k7nG3O4I6JI",
    category: "lyd",
    image: "/images/product-pakke-student-komposition-white.webp",
    name_da: "Studenterpakken",
    name_en: "Graduation package",
    desc_da: "Soundboks 4, ekstra batteri og bæretaske, spiller hele vognturen.",
    desc_en: "Soundboks 4, spare battery and carry bag, plays the whole truck ride.",
    contents: ["Soundboks 4 (batteri)", "Ekstra batteri", "Oplader + AUX-kabel"],
    allowedAddons: ["lyseffekt", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Studenterkørsel: ingen strøm på ladet, og anlægget skal kunne løftes op og ned hele dagen.",
      usecase_en: "Graduation truck: no power on the truck bed, and the speaker gets lifted on and off all day.",
      parts: [
        { productId: "soundboks", label_da: "Soundboks 4", label_en: "Soundboks 4", price: 695 },
        { productId: "batteri", label_da: "Ekstra batteri", label_en: "Extra battery", price: 395 },
      ],
    },
  },
  {
    id: "pakke_filmaften",
    hidden: true,
    page: "/filmaften",
    youtubeUrl: "https://www.youtube.com/watch?v=PfUdmfpiV6k",
    category: "av",
    image: "/images/product-projektor-white.webp",
    name_da: "Filmaften-pakken",
    name_en: "Movie night package",
    desc_da: "Projektor, lærred og to højtalere, biograf i haven eller i gården.",
    desc_en: "Projector, screen and two speakers, cinema in the garden or the courtyard.",
    contents: ["Full HD projektor", "Lærred 160 cm på stativ", '2× Alto 10" højtalere', "HDMI + alle kabler"],
    allowedAddons: ["stativer", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Film i gården, fodboldkamp til festen eller børnebiograf til fødselsdagen. Lyden fra en projektor rækker ikke, derfor er højtalerne med.",
      usecase_en: "A film in the courtyard, the match at the party or a kids' cinema for the birthday. A projector's own sound is not enough, that is why the speakers are included.",
      parts: [
        { productId: "projektor", label_da: "Projektor", label_en: "Projector", price: 495 },
        { productId: "laerred_160", label_da: "Lærred 160 cm", label_en: "Screen 160 cm", price: 195 },
        { productId: "party", label_da: "Lille højtalerpakke", label_en: "Small speaker package", price: 595 },
      ],
    },
  },
  {
    id: "pakke_stemningslys",
    page: "/stemningslys",
    youtubeUrl: "https://www.youtube.com/watch?v=DLi7MQbRH8c",
    category: "lys",
    image: "/images/product-pakke-stemningslys-taendt-v3-white.webp",
    name_da: "Stemningslys-pakken",
    name_en: "Ambient light package",
    desc_da: "4 uplights, lyskæde og discokugle, hele rummet skifter karakter.",
    desc_en: "4 uplights, fairy lights and a disco ball, the whole room changes character.",
    contents: ["4× LED uplight til vægge og hjørner", "10 m lyskæde", "Discokugle med motor og spot", "Strømkabler"],
    allowedAddons: [...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Lys uden lyd: uplights vasker væggene, lyskæden giver varmen, discokuglen giver dansegulvet. Til lokaler der er lejet med lysstofrør i loftet.",
      usecase_en: "Light without sound: uplights wash the walls, fairy lights bring warmth, the disco ball makes the dancefloor. For venues rented with fluorescent tubes in the ceiling.",
      parts: [
        { productId: "uplight_4", label_da: "Uplight 4-pak", label_en: "Uplight 4-pack", price: 595 },
        { productId: "lyskaeder", label_da: "Lyskæde varm hvid", label_en: "Fairy lights warm white", price: 195 },
        { productId: "discokugle", label_da: "Discokugle 40 cm", label_en: "Disco ball 40 cm", price: 645 },
      ],
    },
  },
  {
    id: "pakke_diskolys",
    hidden: true,
    page: "/diskolys",
    youtubeUrl: "https://www.youtube.com/watch?v=XhecuXfY0vo",
    category: "lys",
    image: "/images/product-pakke-diskolys-taendt-v2-white.webp",
    name_da: "Diskolys-pakken",
    name_en: "Disco light package",
    desc_da: "Diskolyseffekt og discokugle, dansegulvet for 645 kr.",
    desc_en: "Disco light effect and disco ball, the dancefloor for 645 DKK.",
    contents: ["LED-par-lys med automatiske farveeffekter", "Discokugle 40 cm med motor og spot", "Stativ/ophæng til kuglen", "Strømkabler"],
    allowedAddons: ["rog", "lyskaeder_farvet", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Den billigste vej til et dansegulv: kuglen over gulvet, effekten pegende hen over det. Alt kører på almindelig strøm, sæt til, og det virker.",
      usecase_en: "The cheapest way to a dancefloor: the ball above the floor, the effect pointing across it. Everything runs on a normal socket, plug in and it works.",
      parts: [
        { productId: "lyseffekt", label_da: "Enkelt lyseffekt", label_en: "Single light effect", price: 195 },
        { productId: "discokugle", label_da: "Discokugle 40 cm", label_en: "Disco ball 40 cm", price: 645 },
      ],
    },
  },
  {
    id: "pakke_teenagefest",
    hidden: true,
    page: "/teenagefest-lys",
    youtubeUrl: "https://www.youtube.com/watch?v=okV56ZfjetM",
    category: "lys",
    image: "/images/product-pakke-teenagefest-taendt-v2-white.webp",
    name_da: "Teenagefest-lys",
    name_en: "Teen party lights",
    desc_da: "Diskolyseffekt, discokugle og farvet lyskæde, kælderen bliver en klub for 785 kr.",
    desc_en: "Disco effect, disco ball and coloured fairy lights, the basement becomes a club for 785 DKK.",
    contents: ["LED-par-lys med automatiske farveeffekter", "Discokugle 30 cm med motor og spot", "10 m farvet lyskæde", "Strømkabler"],
    allowedAddons: ["rog", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Til 16- og 18-årsfødselsdagen i kælderen eller garagen: kuglen og effekten laver dansegulvet, den farvede kæde tegner rummet op. Forældre bestiller, teenageren godkender.",
      usecase_en: "For the 16th or 18th birthday in the basement or garage: ball and effect make the dancefloor, the coloured string outlines the room. Parents book it, the teenager approves.",
      parts: [
        { productId: "lyseffekt", label_da: "Enkelt lyseffekt", label_en: "Single light effect", price: 195 },
        { productId: "discokugle_30", label_da: "Discokugle 30 cm", label_en: "Disco ball 30 cm", price: 545 },
        { productId: "lyskaeder_farvet", label_da: "Lyskæde farvet", label_en: "Fairy lights coloured", price: 195 },
      ],
    },
  },
  {
    id: "pakke_festtelt",
    hidden: true,
    page: "/festtelt-lys",
    youtubeUrl: "https://www.youtube.com/watch?v=DLi7MQbRH8c",
    category: "lys",
    image: "/images/product-pakke-festtelt-taendt-white.webp",
    name_da: "Festtelt-lys",
    name_en: "Party tent lights",
    desc_da: "To lyskæder og fire uplights, teltet og haven lyst op for 695 kr.",
    desc_en: "Two strings of fairy lights and four uplights, tent and garden lit for 695 DKK.",
    contents: ["10 m lyskæde varm hvid", "10 m lyskæde farvet", "4× LED uplight", "Strømkabler"],
    allowedAddons: ["discokugle", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Kæderne krydser under teltdugen eller hen over bordene, og uplightene står i hjørnerne og løfter teltet, hækken eller husmuren. 20 meter kæde rækker til et almindeligt festtelt.",
      usecase_en: "The strings cross under the tent roof or run above the tables, and the uplights stand in the corners lifting the canvas, hedge or house wall. 20 metres of string covers a normal party tent.",
      parts: [
        { productId: "lyskaeder", label_da: "Lyskæde varm hvid", label_en: "Fairy lights warm white", price: 195 },
        { productId: "lyskaeder_farvet", label_da: "Lyskæde farvet", label_en: "Fairy lights coloured", price: 195 },
        { productId: "uplight_4", label_da: "Uplight 4-pak", label_en: "Uplight 4-pack", price: 595 },
      ],
    },
  },
  {
    id: "pakke_bryllupslys",
    hidden: true,
    page: "/bryllupslys",
    youtubeUrl: "https://www.youtube.com/watch?v=GM_WsXv1FU4",
    category: "lys",
    image: "/images/product-pakke-bryllupslys-taendt-white.webp",
    name_da: "Bryllupslys-pakken",
    name_en: "Wedding light package",
    desc_da: "Lyskæde, uplights og low fog til brudevalsen, dans på skyer for 1.200 kr.",
    desc_en: "Fairy lights, uplights and low fog for the wedding waltz, dancing on clouds for 1,200 DKK.",
    contents: ["10 m lyskæde varm hvid", "4× LED uplight", "Low fog-maskine med væske og is-instruks", "Strømkabler"],
    allowedAddons: ["discokugle", "lyskaeder_farvet", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Lys uden lyd, til brylluppet hvor musikken er en DJ eller en playliste. Uplightene løfter laden eller salen, kæden giver det varme lys over bordene, og til brudevalsen lægger low fog-maskinen et gulv af skyer.",
      usecase_en: "Light without sound, for the wedding where the music is a DJ or a playlist. Uplights lift the barn or hall, the string gives warm light above the tables, and for the first dance the low fog machine lays a floor of clouds.",
      parts: [
        { productId: "lyskaeder", label_da: "Lyskæde varm hvid", label_en: "Fairy lights warm white", price: 195 },
        { productId: "uplight_4", label_da: "Uplight 4-pak", label_en: "Uplight 4-pack", price: 595 },
        { productId: "low_fog", label_da: "Low fog-maskine (røggulv)", label_en: "Low fog machine (fog floor)", price: 545 },
      ],
    },
  },
  {
    id: "pakke_diskotek",
    hidden: true,
    page: "/diskotek-pakke",
    youtubeUrl: "https://www.youtube.com/watch?v=FcOqGlPsyYY",
    category: "lys",
    image: "/images/product-pakke-diskotek-taendt-v2-white.webp",
    name_da: "Diskotek-pakken",
    name_en: "Club light package",
    desc_da: "Lysbar, diskolyseffekt og discokugle, fuldt dansegulv uden røg.",
    desc_en: "Light bar, disco effect and disco ball, a full dancefloor without fog.",
    contents: ["2× farvede LED-lamper + centereffekt på stativ", "Ekstra LED-par-lys", "Discokugle 40 cm med motor og spot", "Strøm og kabler"],
    allowedAddons: ["rog", "uplight_4", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Det fulde dansegulv, uden røgmaskine. Mange forsamlingshuse og lejede lokaler har røgalarm, hvor Lysshowets røg ikke må tændes; her laver fire lamper og kuglen showet alene.",
      usecase_en: "The full dancefloor, without a fog machine. Many rented venues have smoke alarms where fog is off limits; here four lamps and the ball make the show on their own.",
      parts: [
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
        { productId: "lyseffekt", label_da: "Enkelt lyseffekt", label_en: "Single light effect", price: 195 },
        { productId: "discokugle", label_da: "Discokugle 40 cm", label_en: "Disco ball 40 cm", price: 645 },
      ],
    },
  },
  {
    id: "pakke_soundboks_lys",
    page: "/soundboks-pakke-lys",
    category: "lyd",
    image: "/images/product-soundboks-v2-white.webp",
    showPartImages: true,
    name_da: "Stor soundboks pakke",
    name_en: "Large Soundboks package",
    desc_da: "Soundboks 4 + lysbar. Batteridrevet lyd og lys til festen.",
    desc_en: "Soundboks 4 + light bar. Battery-powered sound and lights.",
    contents: ["Soundboks 4 (batteri)", "Lysbar (2 lamper + centereffekt)", "Stativ", "Alle kabler"],
    allowedAddons: ["stativer", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Soundboks klarer lyden uden en stikkontakt, lysbaren gør det til en fest. Lysbaren kræver strøm, så den skal tænkes med, hvis I er udenfor.",
      usecase_en: "The Soundboks handles sound without a socket, the light bar makes it a party. The light bar needs power, so plan for that if you are outdoors.",
      parts: [
        { productId: "soundboks", label_da: "Soundboks 4", label_en: "Soundboks 4", price: 695 },
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
      ],
    },
  },
  // Ungdomsfest-pakkerne (11. sept 2026): lyd + diskolys i én pris. De gav
  // udlejninger dengang sitet var nyt, og "ungdomsfest"/"18 års fødselsdag" er
  // søgeord med værdi, selv om Keyword Planner ikke måler lejevolumen på dem.
  // Ingen UV, strobe eller laser, det ejer vi ikke, og vi lister ikke grej,
  // vi ikke kan levere. Siden /ungdomsfest siger det ærligt og samler efterspørgslen.
  {
    id: "pakke_ungdomsfest",
    hidden: true,
    page: "/ungdomsfest-pakke",
    category: "lyd",
    image: "/images/product-pakke-ungdomsfest-taendt-white.webp",
    name_da: "Ungdomsfest-pakken",
    name_en: "Youth party package",
    desc_da: "Soundboks 4, diskolyseffekt og discokugle, lyd og lys til ungdomsfesten for 1.295 kr.",
    desc_en: "Soundboks 4, disco light effect and mirror ball, sound and lights for a youth party at 1,295 DKK.",
    contents: ["Soundboks 4 (batteri)", "LED-par-lys med automatiske farveeffekter", "Discokugle 30 cm med motor og spot", "Strømkabler"],
    allowedAddons: ["rog", "lyskaeder_farvet", "batteri", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Til 16-, 18- og 20-årsfødselsdagen, efterfesten og gymnasiefesten hjemme: Soundboksen spiller højt nok til 50 gæster og kører på batteri, kuglen og lyseffekten laver dansegulvet. Sæt op på ti minutter, uden teknikker.",
      usecase_en: "For the 16th, 18th or 20th birthday, the after-party or the school party at home: the Soundboks is loud enough for 50 guests and runs on battery, the mirror ball and light effect make the dancefloor. Set up in ten minutes, no technician.",
      parts: [
        { productId: "soundboks", label_da: "Soundboks 4", label_en: "Soundboks 4", price: 695 },
        { productId: "lyseffekt", label_da: "Enkelt lyseffekt", label_en: "Single light effect", price: 195 },
        { productId: "discokugle_30", label_da: "Discokugle 30 cm", label_en: "Disco ball 30 cm", price: 545 },
      ],
    },
  },
  {
    id: "pakke_ungdomsfest_stor",
    hidden: true,
    page: "/ungdomsfest-pakke-stor",
    category: "lyd",
    image: "/images/product-pakke-ungdomsfest-stor-taendt-white.webp",
    name_da: "Stor ungdomsfest-pakke",
    name_en: "Large youth party package",
    desc_da: "2× 12\" højtalere, lysbar, discokugle 40 cm og røgmaskine, et rigtigt diskotek til 100 gæster for 1.860 kr.",
    desc_en: "2× 12\" speakers, light bar, 40 cm mirror ball and fog machine, a proper disco for 100 guests at 1,860 DKK.",
    contents: ['2× EV 12" højtalere', "2× farvede LED-lamper + centereffekt på stativ", "Discokugle 40 cm med motor og spot", "Røgmaskine med væske", "Alle kabler"],
    allowedAddons: ["subwoofer", "stativer", "mikrofon", "lyskaeder_farvet", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Til den store ungdomsfest i forsamlingshuset, hallen eller laden, studenterfesten, blå mandag-festen eller 18-årsfødselsdagen med hele årgangen. Højtalerne fylder rummet til 100 gæster, tag subwooferen med, hvis I er flere, røgen får lysstrålerne og kuglens prikker frem.",
      usecase_en: "For the big youth party in a community hall, sports hall or barn, the graduation party or the 18th birthday with the whole year group. The speakers fill a room of 100 guests, add the subwoofer if you are more, and the fog makes the light beams and the ball's dots visible.",
      parts: [
        { productId: "festival", label_da: "Mellem højtalerpakke", label_en: "Medium speaker package", price: 795 },
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
        { productId: "discokugle", label_da: "Discokugle 40 cm", label_en: "Disco ball 40 cm", price: 645 },
        { productId: "rog", label_da: "Røgmaskine", label_en: "Fog machine", price: 245 },
      ],
    },
  },
  {
    id: "pakke_speaker_mik",
    page: "/speakerpakke",
    category: "lyd",
    image: "/images/product-festival-v2-white.webp",
    showPartImages: true,
    name_da: "Speakerpakke 30-50",
    name_en: "Speaker package 30-50",
    desc_da: "Mellem højtalerpakke + mikrofon med ledning. Lyd og taler til 30-50 gæster.",
    desc_en: "Medium speaker package + wired microphone. Sound and speeches for 30-50 guests.",
    contents: ["2× EV 12\" højtalere", "Mikrofon med ledning", "Bluetooth", "Alle kabler"],
    allowedAddons: ["stativer", "mixer_stor", "mikrofonstativ", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Til det arrangement hvor der både skal spilles musik og holdes tale. Mikrofonen går direkte i højtaleren, så der ikke skal en mixer imellem.",
      usecase_en: "For the event with both music and speeches. The microphone plugs straight into the speaker, so no mixer is needed in between.",
      parts: [
        { productId: "festival", label_da: "Mellem højtalerpakke", label_en: "Medium speaker package", price: 795 },
        { productId: "mikrofon_kabel", label_da: "Mikrofon med ledning", label_en: "Wired microphone", price: 95 },
      ],
    },
  },
  {
    // Prisarkets fjerde speakerpakke, "Speakerpakke trådløs 50-100". De tre
    // andre fandtes allerede.
    //
    // Den var skjult, indtil pakken havde sit eget foto. Det blev overflødigt
    // 22. sept 2026: sitet havde i forvejen den samme pakke under navnet
    // pakke_tale_musik — samme to dele, samme pris — og arkets udgave har
    // overtaget dens side. Kortet viser delenes billeder (showPartImages), så
    // der er intet genbrugt løsdelsfoto at skamme sig over.
    id: "pakke_speaker_traadloes_stor",
    page: "/pakke-tale-musik",
    category: "lyd",
    image: "/images/product-festival-v2-white.webp",
    showPartImages: true,
    name_da: "Speakerpakke trådløs 30-50",
    name_en: "Speech package wireless 30-50",
    desc_da: "Mellem højtalerpakke + trådløs mikrofon. Taleren kan gå rundt, til 30-50 gæster.",
    desc_en: "Medium speaker package + wireless microphone. The speaker can move around, for 30-50 guests.",
    contents: ["2× EV 12\" højtalere", "Shure trådløs mikrofon", "Bluetooth", "Alle kabler"],
    allowedAddons: ["stativer", "mixer_stor", "mikrofonstativ", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Receptionen eller generalforsamlingen hvor taleren skal kunne bevæge sig, og hvor der også skal spilles musik.",
      usecase_en: "The reception or general assembly where the speaker needs to move around and music is played too.",
      parts: [
        { productId: "festival", label_da: "Mellem højtalerpakke", label_en: "Medium speaker package", price: 795 },
        { productId: "mikrofon", label_da: "Trådløs mikrofon", label_en: "Wireless microphone", price: 445 },
      ],
    },
  },
  {
    id: "pakke_lysshow",
    hidden: true,
    page: "/lysshow-pakke",
    category: "lys",
    image: "/images/product-lys-v4-white.webp",
    name_da: "Lysshow",
    name_en: "Light show",
    desc_da: "Lysbar, discokugle og røgmaskine. Lyset bliver synligt i luften.",
    desc_en: "Light bar, disco ball and fog machine. The beams become visible in the air.",
    contents: ["2× farvet LED-lyseffekt", "Centereffekt", "Discokugle 40 cm med motor og spot", "Røgmaskine med væske", "Stativer og kabler"],
    allowedAddons: ["uplight_4", "lyskaeder", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Røgen er det, der gør forskellen. Uden den ser man kun farvede pletter på væggen; med den bliver strålerne synlige i luften, og lyseffekterne ligner et show.",
      usecase_en: "The fog is what makes the difference. Without it you only see coloured dots on the wall; with it the beams become visible and the effects look like a show.",
      parts: [
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
        { productId: "discokugle", label_da: "Discokugle 40 cm", label_en: "Disco ball 40 cm", price: 645 },
        { productId: "rog", label_da: "Røgmaskine", label_en: "Fog machine", price: 245 },
      ],
    },
  },
  {
    id: "pakke_lysshow_stor",
    hidden: true,
    page: "/lysshow-stor",
    category: "lys",
    image: "/images/product-uplight-4-v2-white.webp",
    name_da: "Lysshow stort",
    name_en: "Light show large",
    desc_da: "Lysbar, fire uplights, discokugle og low fog. Hele rummet skifter karakter.",
    desc_en: "Light bar, four uplights, disco ball and low fog. The whole room changes.",
    contents: ["2× farvet LED-lyseffekt", "Centereffekt", "4× LED uplight til vægge og hjørner", "Discokugle 40 cm", "Low fog-maskine (røggulv)", "Stativer og kabler"],
    allowedAddons: ["lyskaeder", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Til den store fest eller det lejede lokale med lysstofrør i loftet. Uplights maler væggene, lyseffekterne dækker dansegulvet, og low fog lægger et røggulv i stedet for at fylde rummet med røg, så røgalarmen får fred.",
      usecase_en: "For the big party or the rented venue with fluorescent ceiling lights. Uplights paint the walls, the effects cover the dancefloor, and low fog lays a carpet of fog instead of filling the room, so the smoke alarm stays quiet.",
      parts: [
        { productId: "lys", label_da: "Lysbar", label_en: "Light bar", price: 395 },
        { productId: "uplight_4", label_da: "Uplight 4-pak", label_en: "Uplight 4-pack", price: 595 },
        { productId: "discokugle", label_da: "Discokugle 40 cm", label_en: "Disco ball 40 cm", price: 645 },
        { productId: "low_fog", label_da: "Low fog-maskine", label_en: "Low fog machine", price: 545 },
      ],
    },
  },
  { id: "discokugle", page: "/discokugle", youtubeUrl: "https://www.youtube.com/watch?v=okV56ZfjetM", category: "lys", price: 645, image: "/images/product-discokugle-v2-white.webp", name_da: "Discokugle 40 cm", name_en: "Disco ball 40 cm", desc_da: "Komplet pakke: 40 cm roterende discokugle med motor, spot og stativ.", desc_en: "Complete package: 40 cm rotating disco ball with motor, spotlight and stand.", allowedAddons: [...DELIVERY_ADDON_IDS], contents: ["Showtec Professional Mirrorball 40 cm", "Motor", "LED-spot", "Stativ", "Strømkabel"] },
  // Samme pakke, mindre kugle. Egen side er ikke lavet, begge peger på
  // /discokugle, hvor størrelserne står beskrevet.
  { id: "discokugle_30", page: "/discokugle", youtubeUrl: "https://www.youtube.com/watch?v=okV56ZfjetM", category: "lys", price: 545, image: "/images/product-discokugle-v2-white.webp", name_da: "Discokugle 30 cm", name_en: "Disco ball 30 cm", desc_da: "Komplet pakke: 30 cm roterende discokugle med motor, spot og stativ.", desc_en: "Complete package: 30 cm rotating disco ball with motor, spotlight and stand.", allowedAddons: [...DELIVERY_ADDON_IDS], contents: ["Showtec Professional Mirrorball 30 cm", "Motor", "LED-spot", "Stativ", "Strømkabel"] },
  { id: "lyskaeder", page: "/lyskaeder", youtubeUrl: "https://www.youtube.com/watch?v=DLi7MQbRH8c", category: "lys", price: 195, image: "/images/product-lyskaeder-v2-white.webp", name_da: "Lyskæde varm hvid", name_en: "Fairy lights warm white", desc_da: "10m lyskæde med varmt hvidt lys, hyggelig festbelysning.", desc_en: "10m fairy lights with warm white light, cosy party lighting.", allowedAddons: [...DELIVERY_ADDON_IDS], contents: ["10m lyskæde", "Varm hvide pærer", "Strømforsyning"] },
  { id: "lyskaeder_farvet", page: "/lyskaeder", youtubeUrl: "https://www.youtube.com/watch?v=DLi7MQbRH8c", category: "lys", price: 195, image: "/images/product-lyskaeder-farvet-v2-white.webp", name_da: "Lyskæde farvet", name_en: "Fairy lights coloured", desc_da: "10m lyskæde med farvede pærer, festlig stemning fra første sekund.", desc_en: "10m fairy lights with coloured bulbs, party mood instantly.", allowedAddons: [...DELIVERY_ADDON_IDS], contents: ["10m lyskæde", "Farvede pærer", "Strømforsyning"] },
  { id: "uplight", page: "/uplights", category: "lys", price: 195, image: "/images/product-uplight-v2-white.webp", name_da: "Uplight", name_en: "Uplight", desc_da: "Fun Generation PartyPar 12 LED uplight inkl. fjernbetjening, plug and play. Vasker vægge og hjørner i farvet lys.", desc_en: "Fun Generation PartyPar 12 LED uplight incl. remote, plug and play. Washes walls and corners in coloured light.", allowedAddons: [...DELIVERY_ADDON_IDS], contents: ["1× Fun Generation PartyPar 12 LED", "Fjernbetjening", "Strømkabel"] },
  { id: "uplight_4", page: "/uplights", category: "lys", price: 595, image: "/images/product-uplight-4-v2-white.webp", name_da: "Uplight 4-pak", name_en: "Uplight 4-pack", desc_da: "4 simple LED uplights til vægge og hjørner vs enkeltvis.", desc_en: "4 simple LED uplights for walls and corners vs singles.", allowedAddons: [...DELIVERY_ADDON_IDS], contents: ["4× Fun Generation PartyPar 12 LED", "Fjernbetjening", "Strømkabler"] },
  { id: "projektor", page: "/projektor", youtubeUrl: "https://www.youtube.com/watch?v=PfUdmfpiV6k", category: "av", price: 495, image: "/images/product-projektor-white.webp", name_da: "Projektor", name_en: "Projector", desc_da: "Full HD projektor til præsentationer og film.", desc_en: "Full HD projector for presentations and film.", contents: ["Full HD projektor", "HDMI-kabel", "Strømkabel", "Fjernbetjening"] },
  { id: "skaerm_55", page: "/skaerm", youtubeUrl: "https://www.youtube.com/watch?v=wIsu3Lo5kK4", category: "av", price: 595, image: "/images/product-skaerm-white.webp", name_da: '55" Storskærm', name_en: '55" Screen', desc_da: "55\" LED-skærm på 3-fod stativ, justerbar højde.", desc_en: '55" LED screen on tripod stand, adjustable height.', contents: ['55" LED-skærm', "3-fod stativ", "HDMI-kabel", "Strømkabel"] },
  { id: "skaerm_32", page: "/skaerm-32", youtubeUrl: "https://www.youtube.com/watch?v=wIsu3Lo5kK4", category: "av", price: 395, image: "/images/product-skaerm-32-white.webp", name_da: '32" Skærm', name_en: '32" Screen', desc_da: "32\" LED-skærm på 3-fod stativ, kompakt og nem at flytte. Perfekt til karaoke.", desc_en: '32" LED screen on tripod stand, compact and easy to move. Perfect for karaoke.', contents: ['32" LED-skærm', "3-fod stativ", "HDMI-kabel", "Strømkabel"] },
  { id: "traadloes_mikrofon_pro", hidden: true, page: "/traadloes-mikrofon-pro", youtubeUrl: "https://www.youtube.com/watch?v=mnNM1npG_EM", category: "av", price: 595, image: "/images/product-mikrofon-pro-v2-white.webp", name_da: "Trådløs mikrofon PRO", name_en: "Wireless mic PRO", desc_da: "Shure BLX trådløs mikrofon, scenekvalitet til events og konferencer.", desc_en: "Shure BLX wireless microphone, stage quality for events and conferences.", contents: ["Shure trådløs håndholdt mic", "Shure modtager", "Kabelforbindelse til højtaler"] },
  { id: "headset", page: "/headset-mikrofon", youtubeUrl: "https://www.youtube.com/watch?v=mnNM1npG_EM", category: "av", price: 445, image: "/images/product-headset-pro-v2-white.webp", name_da: "Trådløst headset", name_en: "Wireless headset", desc_da: "Shure BLX14 trådløst headset, frie hænder til præsentationer og undervisning.", desc_en: "Shure BLX14 wireless headset, hands free for presentations and teaching.", allowedAddons: ["mixer_stor", ...DELIVERY_ADDON_IDS], contents: ["Shure BLX14 med PGA31 headset", "Bodypack + modtager", "Kabel til højtaler"] },
  { id: "headset_pro", hidden: true, page: "/headset-pro", youtubeUrl: "https://www.youtube.com/watch?v=mnNM1npG_EM", category: "av", price: 595, image: "/images/product-headset-pro-v2-white.webp", name_da: "Trådløst headset PRO", name_en: "Wireless headset PRO", desc_da: "Professionelt headset i broadcast-kvalitet, til konferencer og scener.", desc_en: "Professional broadcast-quality headset, for conferences and stages.", contents: ["PRO headset-mikrofon", "Bodypack + modtager", "Kabelforbindelse"] },
  { id: "haandholdt_mikrofon_pro", page: "/haandholdt-mikrofon-pro", youtubeUrl: "https://www.youtube.com/watch?v=Y8CBYnicB5g", category: "av", price: 345, image: "/images/product-mikrofon-kabel-pro-v2-white.webp", name_da: "Håndholdt mikrofon PRO (kabel)", name_en: "Handheld microphone PRO (wired)", desc_da: "Shure Beta 58A med kabel, klassikeren til sang og taler.", desc_en: "Shure Beta 58A wired, the classic for vocals and speeches.", allowedAddons: ["mixer_stor", "mikrofonstativ", ...DELIVERY_ADDON_IDS], contents: ["Shure Beta 58A", "XLR/kabel"] },
  { id: "laerred_160", page: "/laerred-160", youtubeUrl: "https://www.youtube.com/watch?v=PLqEcB93Sac", category: "av", price: 195, image: "/images/product-laerred-v2-white.webp", name_da: "Lærred 160 cm", name_en: "Projector screen 160 cm", desc_da: "160 cm lærred på stativ, perfekt til projektor.", desc_en: "160 cm projector screen on stand.", contents: ["160 cm lærred", "Stativ"] },
  { id: "projektor_pro", page: "/projektor-pro", youtubeUrl: "https://www.youtube.com/watch?v=7FhRTCCKCm0", category: "av", price: 795, image: "/images/product-projektor-pro-v2-white.webp", name_da: "Projektor Pro (5000 lumen)", name_en: "Projector Pro (5000 lumen)", desc_da: "Kraftig 5000 lumen projektor, skarp selv i dagslys.", desc_en: "Powerful 5000 lumen projector, sharp even in daylight.", contents: ["5000 lumen projektor", "HDMI-kabel", "Strømkabel", "Fjernbetjening"] },
  { id: "pakke_praesentation", page: "/pakke-praesentation", youtubeUrl: "https://www.youtube.com/watch?v=PfUdmfpiV6k", category: "av", showPartImages: true, image: "/images/product-projektor-white.webp", name_da: "Præsentationspakken", name_en: "Presentation bundle", desc_da: "Projektor + lærred 160 cm + håndholdt mikrofon. Alt til præsentationen.", desc_en: "Projector + 160 cm screen + wired handheld mic. Everything for your presentation.", contents: ["Full HD projektor", "Lærred 160 cm", "Håndholdt mic + kabel", "HDMI + strøm"], bundle: { usecase_da: "Alt til præsentationen, projektor, lærred og mikrofon.", usecase_en: "Everything for your presentation.", parts: [ { productId: "projektor", label_da: "Projektor", label_en: "Projector", price: 495 }, { productId: "laerred_160", label_da: "Lærred 160 cm", label_en: "Screen 160 cm", price: 195 }, { productId: "mikrofon_kabel", label_da: "Håndholdt mikrofon", label_en: "Wired mic", price: 95 } ] } },
  { id: "pakke_konference", page: "/pakke-konference", youtubeUrl: "https://www.youtube.com/watch?v=wIsu3Lo5kK4", category: "av", showPartImages: true, image: "/images/product-skaerm-white.webp", name_da: "Konferencepakken", name_en: "Conference bundle", desc_da: "55\" storskærm + trådløst headset + lille højtalerpakke. Klar til konference.", desc_en: "55\" screen + wireless headset + small speaker package. Conference-ready.", contents: ['55" skærm + stativ', "Trådløst headset", '2× 10" højtalere', "Kabler + adapter"], bundle: { usecase_da: "Klar til konference, skærm, headset og lyd.", usecase_en: "Conference-ready, screen, headset and sound.", parts: [ { productId: "skaerm_55", label_da: '55" Storskærm', label_en: '55" Screen', price: 595 }, { productId: "headset", label_da: "Trådløst headset", label_en: "Wireless headset", price: 445 }, { productId: "party", label_da: "Lille højtalerpakke", label_en: "Small speakers", price: 595 } ] } },
  { id: "pakke_konference_150", page: "/konferencepakke-150", youtubeUrl: "https://www.youtube.com/watch?v=wIsu3Lo5kK4", category: "av", showPartImages: true, image: "/images/product-skaerm-white.webp", name_da: "Konferencepakke 150", name_en: "Conference package 150", desc_da: '2× 12" højtalere på stativer + Shure trådløs mikrofon + headset + 55" skærm. Til sale med 100-150 deltagere.', desc_en: 'Two 12" speakers on stands + Shure wireless mic + headset + 55" screen. For rooms with 100-150 attendees.', contents: ['2× EV 12" højtalere + stativer', "Trådløs mikrofon", "Trådløst headset", '55" skærm på stativ', "HDMI + alle kabler"], allowedAddons: ["mikrofon",...DELIVERY_ADDON_IDS], bundle: { usecase_da: "Konference eller generalforsamling hvor både taleren og salen skal kunne høres og se med.", usecase_en: "Conference or general assembly where both the speaker and the room must be heard and seen.", parts: [ { productId: "festival", label_da: 'Mellem højtalerpakke (2× 12")', label_en: 'Medium speaker package (2× 12")', price: 795 }, { productId: "stativer", label_da: "Højtalerstativer", label_en: "Speaker stands", price: 95 }, { productId: "mikrofon", label_da: "Trådløs mikrofon", label_en: "Wireless mic", price: 445 }, { productId: "headset", label_da: "Trådløst headset", label_en: "Wireless headset", price: 445 }, { productId: "skaerm_55", label_da: '55" Storskærm', label_en: '55" Screen', price: 595 } ] } },
  {
    // Udgået 22. sept 2026: samme to dele og samme pris som arkets
    // "Speakerpakke trådløs 50-100" (pakke_speaker_traadloes_stor), som har
    // overtaget siden /pakke-tale-musik.
    id: "pakke_tale_musik",
    hidden: true,
    category: "av",
    image: "/images/product-festival-v2-white.webp",
    showPartImages: true,
    youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0",
    name_da: "Speakerpakke trådløs 30-50",
    name_en: "Wireless speaker package 30-50",
    desc_da: "Mellem højtalerpakke + trådløs Shure-mikrofon. Taler og musik til 30-50 gæster.",
    desc_en: "Medium speaker package + wireless Shure microphone. Speeches and music for 30-50 guests.",
    contents: ["2× EV 12\" højtalere", "Trådløs Shure-mikrofon", "Alle kabler"],
    allowedAddons: ["stativer", "mixer_stor", "mikrofonstativ", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Taler uden kabel: den trådløse mikrofon giver frihed til at gå rundt, højtalerne klarer musikken bagefter.",
      usecase_en: "Speeches without a cable: the wireless microphone lets you move around, the speakers handle the music afterwards.",
      parts: [
        { productId: "festival", label_da: "Mellem højtalerpakke", label_en: "Medium speaker package", price: 795 },
        { productId: "mikrofon", label_da: "Trådløs mikrofon", label_en: "Wireless mic", price: 445 },
      ],
    },
  },
  { id: "karaoke", page: "/karaoke-maskine", youtubeUrl: "https://www.youtube.com/watch?v=_UaBe_xR3JY", category: "av", price: 695, image: "/images/product-karaoke-v2-white.webp", name_da: "Karaokemaskine", name_en: "Karaoke machine", desc_da: "Singing Machine med indbygget skærm, 2 trådløse mikrofoner og festlys, tilslut TV via HDMI.", desc_en: "Singing Machine with built-in screen, 2 wireless mics and party lights, HDMI for your TV.", contents: ["Singing Machine karaoke-maskine", "2 trådløse mikrofoner", "Indbygget skærm + festlys", "HDMI-kabel + Bluetooth"] },
  {
    id: "pakke_karaoke",
    hidden: true,
    page: "/pakke-karaoke",
    youtubeUrl: "https://www.youtube.com/watch?v=_UaBe_xR3JY",
    category: "av",
    image: "/images/product-pakke-karaoke-v2-white.webp",
    name_da: "Karaokepakken",
    name_en: "Karaoke bundle",
    desc_da: "Karaokemaskine + 32\" skærm + lille højtalerpakke. Alt til karaoke op til 40 pers.",
    desc_en: "Karaoke machine + 32\" screen + small speaker package. Everything for karaoke up to 40 people.",
    contents: ["Singing Machine + 2 trådløse mikrofoner", '32" LED-skærm på 3-fod stativ', '2× Alto 10" højtalere', "HDMI + alle kabler"],
    allowedAddons: ["rog", "lyseffekt", "subwoofer", "stativer", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Karaoke til hjemmefesten, skærm til teksterne og rigtige højtalere til lyden.",
      usecase_en: "Karaoke for the house party, a screen for the lyrics and real speakers for the sound.",
      parts: [
        { productId: "karaoke", label_da: "Karaokemaskine", label_en: "Karaoke machine", price: 695 },
        { productId: "skaerm_32", label_da: '32" Skærm', label_en: '32" Screen', price: 395 },
        { productId: "party", label_da: "Lille højtalerpakke", label_en: "Small speaker package", price: 595 },
      ],
    },
  },
  {
    id: "pakke_karaoke_fest",
    hidden: true,
    page: "/pakke-karaoke-fest",
    youtubeUrl: "https://www.youtube.com/watch?v=_UaBe_xR3JY",
    category: "av",
    image: "/images/product-pakke-karaoke-fest-v2-white.webp",
    name_da: "Karaoke-festpakken",
    name_en: "Karaoke party bundle",
    desc_da: "Karaokemaskine + 55\" storskærm + store højtalere, karaoke til op til 100 pers.",
    desc_en: "Karaoke machine + 55\" screen + large speakers, karaoke for up to 100 people.",
    contents: ["Singing Machine + 2 trådløse mikrofoner", '55" LED-skærm på 3-fod stativ', '2× 12" højtalere', "Alle kabler"],
    allowedAddons: ["rog", "lyseffekt", "lys", "subwoofer", ...DELIVERY_ADDON_IDS],
    bundle: {
      usecase_da: "Fuld karaoke-fest: storskærm til teksterne og store højtalere til lyden.",
      usecase_en: "Full karaoke party: big screen for lyrics, large speakers for the sound.",
      parts: [
        { productId: "karaoke", label_da: "Karaokemaskine", label_en: "Karaoke machine", price: 695 },
        { productId: "skaerm_55", label_da: '55" Storskærm', label_en: '55" Screen', price: 595 },
        { productId: "festival", label_da: "Mellem højtalerpakke", label_en: "Large speakers", price: 795 },
      ],
    },
  },
  { id: "low_fog", page: "/roeg", youtubeUrl: "https://www.youtube.com/watch?v=GM_WsXv1FU4", category: "roeg", price: 545, image: "/images/product-lowfog-v2-white.webp", name_da: "Low fog-maskine (røggulv)", name_en: "Low fog machine (fog floor)", desc_da: "Laver et flot gulv af røg vha. is, 'dansen på skyer'-effekten fra bryllupper og musikvideoer.", desc_en: "Creates a floor of low-lying fog using ice, the 'dancing on clouds' effect.", allowedAddons: ["roegvaeske", ...DELIVERY_ADDON_IDS], contents: ["Eurolite NB-60 ICE low fog-maskine", "Røgvæske", "Is-bakke / instruks"] },
];

/**
 * Kataloget som resten af koden ser det: pakkepriserne er regnet ud af delene,
 * så et prisskift på en lysbar slår igennem på hver pakke, den er med i — også
 * i Stripe, fordi serverens pristabel kører samme udregning.
 */
export const rentalProducts: RentalProduct[] = refreshBundlePrices(
  rentalProductsRaw.map((p): RentalProduct => {
    const { bundle, price, ...rest } = p;
    return {
      ...rest,
      price: price ?? 0,
      ...(bundle ? { bundle: { ...bundle, discount: bundle.discount ?? 0 } } : {}),
    };
  }),
  [
    ...speakers.map((s) => ({ id: s.id, price: s.price })),
    ...addons.map((a) => ({ id: a.id, price: a.price })),
    ...rentalProductsRaw.map((p) => ({ id: p.id, price: p.price ?? 0 })),
  ],
);

/* ───── På pause ─────
 *
 * Stroboskop er en skjult kladde indtil indkøb og modelvalg. Skærme, projektor, lærred og karaoke var taget
 * ud af sortimentet i august 2026, men blev sat i udlejning igen 8. september:
 * Search Console viste ~350 visninger om måneden på "lej storskærm"-søgninger,
 * der landede på en side, som svarede "udlejes ikke lige nu". Efterspørgslen
 * var der, svaret var forkert. Kun ANNONCERNE for de produkter er stadig
 * pauset, vi køber ikke klik på dem, men vi tager imod dem, der selv finder os.
 *
 * Mekanikken bliver stående og virker: sætter Frederik et produkt på pause i
 * /admin/produkter, sætter det `hidden`, og så filtreres produktet væk hos
 * kunden (useProducts), i søgningen, i DBA-feedet og i serverens prisopslag
 * så et pauset produkt hverken kan findes eller betales. Listen herunder er
 * for de sider og tests, der skal kunne sige pausen højt.
 * Sandheden om hvad kunden kan booke er `hidden` i kataloget ovenfor.
 */
export const PAUSEDE_PRODUKTER: string[] = [
  "mixer_lille", "mixer_xl",
  // Produktarket 17. sept 2026: arkets trådløse mikrofon og headset ER Shure-modellerne,
  // så PRO-varianterne er overflødige. Bæretasken står ikke i arket.
  "traadloes_mikrofon_pro", "headset_pro", "taske",
  // Hovedtelefonerne fulgte med Pioneer-pulten; arkets AlphaTheta XDJ står uden, og de er ikke i arket.
  "dj_headphones",
];

/**
 * Produkter der er i kataloget, men skjult alene fordi der endnu ikke findes et
 * ærligt produktfoto. En anden grund end pause: udstyret kan lejes ud, og det må
 * gerne indgå som del i en pakke. Tom siden 18. sept 2026, hvor arkets nye
 * produkter fik genererede fotos i husstilen. Reglen står: står Frederiks ark på
 * et produkt, er det ikke på pause.
 */
/** Produkter der venter på et foto, før de kan blive synlige. */
export const AFVENTER_FOTO: string[] = [
  // Arkets afsnit 5 og 6: 46 anledningspakker, se anledningPakker.ts
  ...ANLEDNING_PAKKE_IDS,
];

/**
 * Prisarkets afsnit 4: strøm og forlængerledninger.
 *
 * Frederik: "Man skal også spørges om man vil leje forlænger ledning. Find på
 * en smooth måde at det bliver tilbudt." Det er ikke et tilvalg på linje med
 * en røgmaskine — det er det, kunden opdager mangler, når teltet står 20
 * meter fra stikkontakten. Derfor får de deres eget sammenfoldede afsnit i
 * checkout med afkrydsninger og uden billeder, i stedet for fem kort der
 * skubber lysbaren og mikrofonen ned under skærmkanten.
 *
 * Rækkefølgen er arkets.
 */
export const STROEM_ADDON_IDS = [
  "kabeltromle",
  "kabeltromle_jord",
  "stikdaase",
  "stikdaase_jord",
  "omformer_udendors",
];

/** Er produktet sat på pause? Bruges af produktsiderne, der ellers ville stå
 *  med en bookingknap til noget, vi ikke udlejer. */
export function erPaaPause(productId: string): boolean {
  return PAUSEDE_PRODUKTER.includes(productId);
}

/** Siderne der ligger fremme, men ikke kan bookes fra. Tom, når intet er pauset. */
export const PAUSEDE_SIDER: string[] = rentalProducts
  .filter((p) => p.hidden && p.page)
  .map((p) => p.page!);

/** Navigation categories, single source of truth used by BurgerMenu and admin */
export interface NavLink { href: string; label: string; label_en: string }
export interface NavCategory { id: string; title: string; title_en: string; href: string; links: NavLink[] }

/**
 * Menuen er en vej ind i en kategori, ikke et katalog.
 *
 * Da pakkestigen og lejlighedspakkerne kom til, voksede menuen til 44 links,
 * hvoraf fjorten lå under Lyd alene. Det gør det sværere at vælge, ikke
 * nemmere: en liste man skal læse er ikke en menu, den er en opgave. Hver
 * kategori viser derfor kun det man oftest booker, og slutter med "Se alle",
 * hvor kategorisiden har hele udvalget.
 *
 * Reglen holdes af en test: højst seks links pr. kategori, og hvert produkt
 * skal kunne nås fra sin kategoriside, ikke fra menuen.
 */
export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: "lyd",
    title: "Lyd & Højtalere",
    title_en: "Sound & Speakers",
    href: "/lej-hojtaler",
    links: [
      { href: "/lydanlaeg", label: "Anlæg efter antal gæster", label_en: "PA systems by guest count" },
      { href: "/soundboks-4", label: "Soundboks 4", label_en: "Soundboks 4" },
      { href: "/festpakke-stor", label: "Festpakke 30-50", label_en: "Party package 30-50" },
      // Mikrofonen hører til lyden, ikke til AV-udstyret: den lejes til talen
      // ved brylluppet, hvor højtaleren alligevel er med.
      { href: "/lej-mikrofon", label: "Mikrofoner", label_en: "Microphones" },
      { href: "/mixer", label: "Mixer", label_en: "Mixers" },
      { href: "/lej-hojtaler", label: "Se alle højtalere og pakker", label_en: "All speakers and packages" },
    ],
  },
  {
    id: "lys",
    title: "Lys & Effekter",
    title_en: "Lighting & Effects",
    href: "/festlys",
    links: [
      { href: "/lyspakker", label: "Lyspakker, vælg efter festen", label_en: "Light bars, by occasion" },
      { href: "/stemningslys", label: "Stemningslys-pakken", label_en: "Ambient light package" },
      { href: "/lys-pakke", label: "Lysbar", label_en: "Light bar" },
      { href: "/discokugle", label: "Discokugle", label_en: "Disco ball" },
      { href: "/lysshow", label: "Lysshow, færdige pakker", label_en: "Light shows, ready-made" },
      { href: "/festlys", label: "Se alt lys", label_en: "All party lights" },
    ],
  },
  {
    id: "roeg",
    title: "Røg",
    title_en: "Fog",
    href: "/roeg",
    links: [
      { href: "/roegmaskine", label: "Røgmaskine", label_en: "Fog machine" },
      { href: "/roeg", label: "Low fog, røggulv", label_en: "Low fog, fog floor" },
    ],
  },
  {
    id: "anledning",
    title: "Til din anledning",
    title_en: "For your occasion",
    href: "/bryllup",
    links: [
      { href: "/bryllup", label: "Bryllup", label_en: "Weddings" },
      { href: "/konfirmation", label: "Konfirmation", label_en: "Confirmations" },
      { href: "/foedselsdag", label: "Fødselsdag", label_en: "Birthdays" },
      { href: "/havefest", label: "Havefest", label_en: "Garden parties" },
      { href: "/studenterkoersel", label: "Studenterkørsel", label_en: "Graduation trucks" },
    ],
  },
  {
    // Kom tilbage 8. september 2026 sammen med produkterne. Uden en vej ind i
    // menuen lå de ti sider som blindgyder, Google crawlede uden intern
    // linkværdi, se generate-sitemap.py's advarsel om forældreløse sider.
    id: "av",
    title: "Billede & Karaoke",
    title_en: "Screens & Karaoke",
    href: "/av-udstyr",
    links: [
      { href: "/skaerm", label: "Storskærm 55\"", label_en: '55" Screen' },
      { href: "/lej-projektor", label: "Projektor og lærred", label_en: "Projectors and screens" },
      { href: "/karaoke", label: "Karaoke", label_en: "Karaoke" },
      { href: "/pakke-konference", label: "Konferencepakken", label_en: "Conference bundle" },
      { href: "/av-udstyr", label: "Se alt AV-udstyr", label_en: "All AV equipment" },
    ],
  },
];

/**
 * Hvilke pakker der bor på hvilken kategoriside. Menuen viser dem ikke længere,
 * så det her er kontrakten for at de stadig kan findes, en test kræver at hver
 * pakke med en egen side står på præcis én kategoriside.
 */
/**
 * Prisarkets afsnit 1.2: anlæg + mikrofon. Ren lyd, så de bor på /lydanlaeg.
 *
 * Speakerpakke 30-50 lå før på /av-udstyr, fordi mikrofonen blev regnet som
 * AV-udstyr. Men kunden, der skal holde en tale til en reception, leder efter
 * lyd — og /av-udstyr handler om skærme og projektorer.
 */
export const SPEAKERPAKKER = [
  "pakke_speaker_lille",
  "pakke_speaker_mik",
  "pakke_speaker_traadloes_lille",
  "pakke_speaker_traadloes_stor",
];

export const KATEGORI_PAKKER: Record<string, string[]> = {
  "/dj-pult": ["dj_pakke_lille", "dj_pakke_mellem", "dj_pakke_stor"],
  ...Object.fromEntries(eventSituations.map(s => [`/events/${s.slug}`, [...s.packageIds]])),
  // Feststigen + lejlighedspakkerne, de to gitre siden faktisk renderer.
  // Skrevet ud, fordi FEST_LADDER_IDS og LYD_LEJLIGHEDSPAKKER erklæres
  // længere nede i filen og derfor ikke kan læses herfra.
  "/lej-hojtaler": [
    "pakke_fest_lille",
    "pakke_fest_stor",
    "pakke_fest_150",
    "pakke_fest_250",
    "halloween_lys",
    "halloween_lille",
    "halloween_stor",
    "jul_hygge",
    "pakke_elegant",
    "pakke_fest_100",
    "pakke_soundboks_lille",
    "pakke_soundboks_lys",
    "pakke_firmafest",
  ],
  // Lyspakkerne bor på /lyspakker, landingssiden der rendrer fra denne liste.
  // /festlys viser dem OGSÅ i sit produktgitter, men kategorisiden er én.
  // Arkets 2.3: tre lyspakker, ikke seks temanavne for den samme lysbar.
  // Diskolys, Teenagefest-lys, Festtelt-lys, Bryllupslys og Diskotek-pakken
  // er udgået, se UDGAAEDE_PAKKER.
  "/lyspakker": [
    "pakke_festlys_50",
    "pakke_festlys_100",
    "pakke_stemningslys",
  ],
  // Lyspakkerne ejes af /lyspakker. /lysshow viser de samme tre, men er ikke
  // den ansvarlige kategoriside, se LYSSHOW_PAKKER.
  "/lysshow": [],
  // Karaokemaskinen lejes for sig. De to karaokepakker står ikke i arket.
  "/karaoke": [],
  // Speakerpakkerne er arkets afsnit 1.2 og bor på /lydanlaeg, ikke her: det er
  // lyd med mikrofon, ikke skærm og projektor.
  "/av-udstyr": ["pakke_praesentation", "pakke_konference", "pakke_konference_150"],
  "/lydanlaeg": SPEAKERPAKKER,
  "/lej-projektor": [],
};

/**
 * De ti Frederik lejer mest ud, i den rækkefølge han skrev dem i arket.
 *
 * Forsiden viste før en anledningsvælger med faneblade: kunden skulle først
 * gætte hvilken slags fest han holdt, og fik så fire pakker at se. Listen her
 * er det modsatte greb — de ting der rent faktisk går ud ad døren, pakker og
 * enkeltprodukter mellem hinanden, så den der kom efter en røgmaskine kan se
 * prisen uden at vælge en anledning først.
 *
 * Kilde: "LejHøjtaler Katalog.xlsx", Frederiks liste 22. september 2026.
 */
export const POPULAERE_IDS = [
  "pakke_speaker_traadloes_lille", // Speakerpakke trådløs 0-50
  "festival",                      // Mellem højtalerpakke (30-50 personer)
  "pakke_soundboks_lys",           // Stor soundboks pakke
  "dj_pakke_stor",                 // DJ Pakke 50-100 personer
  "pakke_festlys_50",              // Festlys 0-50 personer
  "pakke_elegant",                 // Elegant festpakke
  "pakke_fest_stor",               // Festpakke 30-50
  "rog",                           // Røgmaskine
  "discokugle",                    // Diskokugle 40 cm komplet inkl. stativ og spot
  "lys",                           // Lysbar
];

/**
 * Pakker der ikke står i det nye prisark — udgået 22. september 2026.
 *
 * Frederik: "Fjern produkter/pakker der ikke er med i det nye prisark,
 * undtaget specialpakker for sæsoner." Arket sælger sit sortiment som
 * enkeltdele plus de pakker, der står i afsnit 1-3 og 5-6. Alt herunder var
 * pakker, sitet havde fundet på selv, og hver af dem er det samme udstyr som
 * en pakke, der ER i arket, under et andet navn: Bryllupspakken er en
 * Festpakke, Teenagefest-lys er en lyspakke, de tre lydmand-pakker er en
 * pakke plus arkets teknikertime.
 *
 * De er skjult, ikke slettet. `hidden` filtrerer dem væk hos kunden
 * (useProducts), i søgningen, i DBA-feedet og i serverens prisopslag, så de
 * hverken kan findes eller betales, og PAUSEDE_SIDER lukker annoncerne for
 * deres landingssider. Siderne bliver liggende, fordi de har deres plads i
 * Google — men de siger det selv og sender kunden videre til afløseren.
 *
 * Værdien er afløseren: siden man skal hen på i stedet.
 */
export const UDGAAEDE_PAKKER: Record<string, string> = {
  pakke_bryllup: "/bryllup",
  pakke_udendors: "/havefest",
  pakke_student: "/studenterkoersel",
  pakke_filmaften: "/lej-projektor",
  pakke_diskolys: "/lyspakker",
  pakke_teenagefest: "/lyspakker",
  pakke_festtelt: "/lyspakker",
  pakke_bryllupslys: "/lyspakker",
  pakke_diskotek: "/lyspakker",
  pakke_ungdomsfest: "/ungdomsfest",
  pakke_ungdomsfest_stor: "/ungdomsfest",
  pakke_lysshow: "/lysshow",
  pakke_lysshow_stor: "/lysshow",
  pakke_lydmand_fest: "/lydmand",
  pakke_lydmand_firma: "/lydmand",
  pakke_lydmand_stor: "/lydmand",
  pakke_karaoke: "/karaoke",
  pakke_karaoke_fest: "/karaoke",
};

/**
 * Samme beslutning, men uden en side at sende kunden videre til.
 *
 * Mikrofonpakkerne findes kun som kort på /av-udstyr. Arket sælger
 * mikrofonerne som enkeltlinjer med en mixer ved siden af, og det er den
 * vej, siden nu anviser.
 */
export const UDGAAEDE_UDEN_SIDE: string[] = [
  // Siden gik videre til arkets egen udgave, så den har ingen at aflevere
  "pakke_tale_musik",
  "pakke_mikrofon_batteri",
  "pakke_mikrofon_traadloes",
  "pakke_mikrofon_duo",
  "pakke_mikrofon_av",
  "pakke_mikrofon_panel",
  "pakke_hybrid_teams",
];

/** Alle udgåede pakker, med og uden side. */
export const UDGAAEDE_IDER: string[] = [...Object.keys(UDGAAEDE_PAKKER), ...UDGAAEDE_UDEN_SIDE];

/** Afløsersiden for en udgået pakke, eller undefined hvis den stadig lejes ud. */
export function udgaaetPakke(productId: string): string | undefined {
  return UDGAAEDE_PAKKER[productId];
}

/** Lejlighedspakkerne, vises under stigen på /lej-hojtaler */
export const LYD_LEJLIGHEDSPAKKER = ["halloween_lys", "halloween_lille", "halloween_stor", "jul_hygge", "pakke_elegant", "pakke_fest_100", "pakke_soundboks_lille", "pakke_soundboks_lys", "pakke_firmafest"];

/**
 * Lydmanden er en time i arkets checkout, ikke tre pakker.
 *
 * Festpakke med lydmand, Firmaevent med lydmand og Stor fest med lydmand var
 * en pakke plus en teknikertime plus kørslen, bundtet til ét kort. Arket
 * sælger teknikertimen for sig, og kunden vælger den i bookingen på hvilken
 * som helst pakke. Listen står tom, så gitteret på /lej-hojtaler ikke
 * renderer en overskrift uden kort under.
 */
export const LYDMAND_PAKKER: string[] = [];

/**
 * Hvad /lysshow viser.
 *
 * Lysshow og Lysshow stort er udgået — de var en lysbar og en røgmaskine
 * under et tredje navn. Siden bliver liggende som landingsside for "lysshow"
 * og viser arkets tre lyspakker, men KATEGORISIDEN for dem er /lyspakker:
 * en pakke hører hjemme ét sted, ellers ved ingen hvor den skal rettes.
 */
export const LYSSHOW_PAKKER = ["pakke_festlys_50", "pakke_festlys_100", "pakke_stemningslys"];

/** Lydpakker der (også) vises som ekstra på /av-udstyr og i anledningslisten */
export const LYD_EKSTRAPAKKER = ["pakke_soundboks_lys"];

/**
 * AV-pakkerne, vises samlet på /av-udstyr.
 *
 * Speakerpakke trådløs 30-50 lå her som `pakke_tale_musik` OG i arkets afsnit
 * 1.2 som `pakke_speaker_traadloes_stor` — samme to dele, samme pris, to kort.
 * Arkets udgave vandt, og den hører til på /lydanlaeg sammen med de andre
 * speakerpakker, ikke mellem skærm og projektor. Mikrofonpakkerne er væk med
 * samme begrundelse: arket sælger mikrofonerne som enkeltlinjer.
 */
export const AV_PAKKER = ["pakke_praesentation", "pakke_konference", "pakke_konference_150"];

/* ───── Pakkestigen ─────
 *
 * Stigen er navngivet efter antal gæster, ikke efter grej: kunden ved hvor
 * mange der kommer, men ikke hvad 2× 12" EV betyder. Den bruges af
 * /lydanlaeg og er samtidig kontrakten mellem siden og kataloget, en test
 * låser at hvert trin peger på et produkt der findes, og at pakkeprisen er
 * lavere end delene hver for sig.
 *
 * Gæstetallene gælder INDENDØRS. Udendørs uden vægge halveres de, og det skal
 * stå på siden, ellers lover vi mere end anlægget kan.
 */
export interface LadderStep {
  /** Produkt-id i kataloget. null = for stor til hylden, kun tilbud. */
  productId: string | null;
  navn: string;
  gaester: string;
  /** Øvre grænse indendørs, bruges til at sortere og til at vælge trin */
  maxGaester: number;
  href: string;
  hvad: string;
  koersel: "tilvalg" | "anbefalet" | "tilbud";
  /** Engelsk udgave af de tre tekster, /en/lydanlaeg viser samme stige. */
  navn_en: string;
  gaester_en: string;
  hvad_en: string;
}

/**
 * Hvilken pakke en anledningsside anbefaler. Før pegede siderne på et
 * enkeltprodukt, polterabend anbefalede en højtaler til 345 kr, og så bliver
 * ordren i den størrelse. En test låser at hver anledning har en pakke, og at
 * siden rent faktisk bruger den.
 */
export const OCCASION_PACKAGES: Record<string, string> = {
  bryllup: "pakke_bryllup",
  havefest: "pakke_udendors",
  polterabend: "pakke_udendors",
  studenterkoersel: "pakke_student",
  foedselsdag: "pakke_fest_stor",
  konfirmation: "pakke_fest_stor",
  ungdomsfest: "pakke_ungdomsfest",
  nytaar: "pakke_fest_150",
};

/**
 * Prisen på et trin. Den står IKKE i stigen: pakkeprisen er udledt af delene,
 * så et tal skrevet her ville drive fra kurven ved næste prisrettelse. null =
 * for stor til hylden, kun tilbud.
 */
export function ladderPrice(step: LadderStep): number | null {
  return step.productId ? catalogPrice(step.productId) : null;
}

/* ───── Lydstigen, prisarkets afsnit 1.1 ─────
 *
 * /lydanlaeg lovede "vælg anlæg efter antal gæster" og viste Festpakker — hvor
 * en lysbar og en røgmaskine er en del af prisen. Kunden kom for at vide, hvor
 * store højtalere der skal til 60 gæster, og fik et lysshow med.
 *
 * Arket skiller de to ting: 1.1 Højtalerpakker er lyden alene, 3. LYD OG LYS
 * PAKKER er festpakkerne. Lydstigen herunder er 1.1, og siden linker videre til
 * afsnit 3 for dem der vil have lys med. katalog-struktur.test.ts holder
 * skellet: ingen del i et trin på lydstigen må høre til lys eller røg.
 */
export const LADDER_LYD: LadderStep[] = [
  { productId: "party", navn: "Lille højtalerpakke", navn_en: "Small speaker package", gaester: "op til 30", gaester_en: "up to 30", maxGaester: 30, href: "/hojtalerpakke-lille", hvad: '2× 10" Alto med Bluetooth, 12 kg i alt', hvad_en: '2× 10" Alto with Bluetooth, 12 kg in total', koersel: "tilvalg" },
  { productId: "festival", navn: "Mellem højtalerpakke", navn_en: "Medium speaker package", gaester: "30-50", gaester_en: "30-50", maxGaester: 50, href: "/hojtalerpakke-normal", hvad: '2× 12" EV ZLX, mere tryk og mere rækkevidde', hvad_en: '2× 12" EV ZLX, more punch and more reach', koersel: "tilvalg" },
  { productId: "hojtaler_100", navn: "Stor højtalerpakke", navn_en: "Large speaker package", gaester: "50-100", gaester_en: "50-100", maxGaester: 100, href: "/hojtalerpakke-bas", hvad: '2× 12" EV ZLX + subwoofer, bas til dansegulvet', hvad_en: '2× 12" EV ZLX + subwoofer, bass for the dancefloor', koersel: "anbefalet" },
  { productId: null, navn: "Over 100 gæster", navn_en: "More than 100 guests", gaester: "100+", gaester_en: "100+", maxGaester: 9999, href: "/erhverv#tilbud", hvad: "Flere tops og subs skaffes, tekniker med på dagen", hvad_en: "We source more tops and subs, a technician comes on the day", koersel: "tilbud" },
];

/** Højtalerpakkerne i stigen, uden trinnet der kun er et tilbud. */
export const LYD_LADDER_IDS: string[] = LADDER_LYD.map((t) => t.productId).filter(
  (id): id is string => id !== null,
);

export const LADDER_FEST: LadderStep[] = [
  { productId: "pakke_fest_lille", navn: "Festpakke 0-30", navn_en: "Party package 0-30", gaester: "op til 30", gaester_en: "up to 30", maxGaester: 30, href: "/festpakke-lille", hvad: '2× 10" højtalere + lysbar', hvad_en: '2× 10" speakers + light bar', koersel: "tilvalg" },
  { productId: "pakke_fest_stor", navn: "Festpakke 30-50", navn_en: "Party package 30-50", gaester: "30-50", gaester_en: "30-50", maxGaester: 50, href: "/festpakke-stor", hvad: '2× 12" højtalere + lysbar', hvad_en: '2× 12" speakers + light bar', koersel: "tilvalg" },
  { productId: "pakke_fest_150", navn: "Festpakke 150", navn_en: "Party package 150", gaester: "50-150", gaester_en: "50-150", maxGaester: 150, href: "/festpakke-150", hvad: '2× 12" + sub + stativer + lys + røg', hvad_en: '2× 12" + sub + stands + lights + fog', koersel: "anbefalet" },
  { productId: "pakke_fest_250", navn: "Festpakke 250", navn_en: "Party package 250", gaester: "150-250", gaester_en: "150-250", maxGaester: 250, href: "/festpakke-250", hvad: '4× 12" + 2 subs + stativer + lys + røg', hvad_en: '4× 12" + 2 subs + stands + lights + fog', koersel: "anbefalet" },
  { productId: null, navn: "Over 250 gæster", navn_en: "More than 250 guests", gaester: "250+", gaester_en: "250+", maxGaester: 9999, href: "/erhverv#tilbud", hvad: "Større tops og subs skaffes, tekniker med på dagen", hvad_en: "We source larger tops and subs, a technician comes on the day", koersel: "tilbud" },
];

/** Pakkerne fra feststigen, i rækkefølge, det forsiden viser. Lejlighedspakkerne
 *  (bryllup, firmafest, udendørs …) hører til på deres egne sider, ikke i en
 *  grid med otte kort hvor ingen af dem bliver læst. */
export const FEST_LADDER_IDS: string[] = LADDER_FEST.map((t) => t.productId).filter(
  (id): id is string => id !== null,
);

/** Forsidens to første trin. De store pakker (150 og 250) er taget af toppen
 *  8. september 2026: fire tunge kort skubbede alt andet under skærmkanten, og
 *  de store bliver alligevel valgt via /lej-hojtaler og deres egne sider.
 *  Forsiden linker videre til dem i teksten under kortene. */
export const FEST_LADDER_FORSIDE_IDS: string[] = FEST_LADDER_IDS.slice(0, 2);

/* LADDER_TALE er fjernet sammen med pausen: alle tre trin, Præsentation,
 * Møde 100 og Konference 150, havde projektor eller skærm med, og en stige
 * hvor hvert trin er udsolgt er ikke en stige. /lydanlaeg henviser i stedet
 * til Tale & musik-pakken, mikrofonerne og et tilbud på det større.
 */

/** Price multiplier by number of rental days, flat price regardless of duration */
export const dayMultiplier: Record<number, number> = {
  1: 1.0,
  2: 1.0,
  3: 1.0,
  4: 1.0,
  5: 1.0,
};

/* ───── Summer sale disabled (juli-rabat fjernet) ───── */

export function isSummerSale(): boolean {
  return false;
}

export function applyDiscount(price: number): number {
  return price;
}

/** Cheapest speaker price, use in meta tags, hero, etc. */
export function cheapestSpeakerPrice(list: Speaker[] = speakers): number {
  const visible = list.filter((s) => !s.hidden);
  return visible.length ? Math.min(...visible.map((s) => s.price)) : 0;
}

export const startPrice = cheapestSpeakerPrice();

/* ───── Priser i sidetekst ─────
 *
 * Hver produktside, kategoriside og lejlighedsside skrev sine egne beløb ind i
 * titel, brødtekst og "se også"-knapper. Da Frederiks prisstigning ramte
 * kataloget, blev de tal ikke til løgn ét sted, men hundrede: /soundboks-4
 * sendte kunden videre til Mackie Thump GO "– 345 kr", mens bookingen tog 395.
 *
 * Derfor slås beløb i tekst op her frem for at blive skrevet af. Et ukendt id
 * er en fejl ved build, ikke en tavs nul-pris.
 */

/** Katalogpris for et produkt-id (default-kataloget, brug LivePrice for admin-redigerede tal). */
/**
 * Katalogets billede for et produkt.
 *
 * Produktsiderne skrev deres eget `image=`, og 110 af 116 skrev heldigvis det
 * samme som kataloget. De sidste seks gjorde ikke: /hojtalerpakke-bas viste
 * generiske søjlehøjtalere i stedet for pakkens EV'er, og Udendørspakken viste
 * en bar Soundboks uden det batteri og den lyskæde, kunden betaler for. Et
 * billede skrevet i siden driver fra kataloget på præcis samme måde som en
 * pris gjorde det.
 */
export function catalogImage(id: string): string {
  const p =
    speakers.find((s) => s.id === id) ??
    rentalProducts.find((r) => r.id === id) ??
    addons.find((a) => a.id === id);
  if (!p) throw new Error(`catalogImage: ukendt produkt-id "${id}"`);
  const src = "product" in p ? p.product : p.image;
  if (!src) throw new Error(`catalogImage: "${id}" har intet billede`);
  return src;
}

/**
 * Delenes billeder til en pakkes produktside.
 *
 * Præsentationspakken viste ét foto af en projektor, og Konferencepakken ét
 * af en skærm — Philip spurgte hvor resten af pakken var blevet af. Et
 * pakkekort i gitteret har vist delene længe (showPartImages i BundleGrid);
 * produktsiden, hvor kunden rent faktisk beslutter sig, gjorde det ikke.
 *
 * Tom liste = vis det ene billede som før. Kun pakker med showPartImages
 * svarer her, så en pakke MED sit eget rigtige pakkefoto (festpakkerne,
 * halloween) beholder det.
 */
export interface PakkeDel {
  productId: string;
  label_da: string;
  label_en: string;
  qty: number;
  image: string | null;
}

export function catalogBundleParts(id: string): PakkeDel[] {
  const p = rentalProducts.find((r) => r.id === id);
  if (!p?.showPartImages || !p.bundle) return [];
  return p.bundle.parts.map((del) => {
    const s = speakers.find((x) => x.id === del.productId);
    const a = addons.find((x) => x.id === del.productId);
    const r = rentalProducts.find((x) => x.id === del.productId);
    return {
      productId: del.productId,
      label_da: del.label_da,
      label_en: del.label_en,
      qty: del.qty ?? 1,
      image: s?.product ?? a?.image ?? r?.image ?? null,
    };
  });
}

export function catalogPrice(id: string): number {
  const p =
    speakers.find((s) => s.id === id) ??
    addons.find((a) => a.id === id) ??
    rentalProducts.find((r) => r.id === id);
  if (!p) throw new Error(`catalogPrice: ukendt produkt-id "${id}"`);
  return p.price;
}

/** Rabatten i kr på en pakke, "spar X kr". */
export function catalogDiscount(id: string): number {
  const p = rentalProducts.find((r) => r.id === id);
  if (!p?.bundle) throw new Error(`catalogDiscount: "${id}" er ikke en pakke`);
  return p.bundle.discount;
}

/** Hvad delene koster hver for sig, "1.300 kr i stedet for 1.685 kr". */
export function catalogPartsPrice(id: string): number {
  const p = rentalProducts.find((r) => r.id === id);
  if (!p?.bundle) throw new Error(`catalogPartsPrice: "${id}" er ikke en pakke`);
  return p.bundle.parts.reduce((sum, part) => sum + part.price, 0);
}

/** Beløb som det skrives i tekst: 2345 → "2.345". */
export function prisTekst(n: number): string {
  return n.toLocaleString("da-DK");
}

/** "595 kr", prisen som den skrives midt i en sætning. */
export function prisKr(id: string): string {
  return `${prisTekst(catalogPrice(id))} kr`;
}

/** ""-beløbet som tekst. */
export function rabatKr(id: string): string {
  return `${prisTekst(catalogDiscount(id))} kr`;
}

/** "fra 395 kr" som tekst, billigste højtaler, til sidetitler og meta. */
export function startPrisKr(): string {
  return `${prisTekst(startPrice)} kr`;
}

/** "95-3645 kr", LocalBusiness priceRange over hele det synlige katalog. */
export function prisSpaend(): string {
  const alle = [...speakers, ...addons, ...rentalProducts]
    .filter((p) => !p.hidden)
    .map((p) => p.price);
  return `${Math.min(...alle)}-${Math.max(...alle)} kr`;
}

/** "595 DKK", samme tal, engelsk valutakode. Til /en-sider. */
export function prisDkk(id: string): string {
  return `${prisTekst(catalogPrice(id))} DKK`;
}

/** "220 DKK", pakkens besparelse, engelsk. */
export function rabatDkk(id: string): string {
  return `${prisTekst(catalogDiscount(id))} DKK`;
}

/** "395 DKK", billigste højtaler, engelsk. */
export function startPrisDkk(): string {
  return `${prisTekst(startPrice)} DKK`;
}
