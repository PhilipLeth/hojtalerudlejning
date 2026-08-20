/* ───── Single source of truth for all product data (v2 — cache-rotation 4/8) ─────
 *
 * These arrays are the DEFAULT catalog (fallback/seed).
 * The live catalog can be overridden from /admin/produkter and is stored in
 * Cloudflare KV under "products_catalog" — served by GET /api/products.
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
  /** Produktvideo (instruktion/demo) — vist med play-knap i produkt-hero */
  video?: string;
  /** YouTube-URL fra producenten — vist som ekstra info under produktbeskrivelsen */
  youtubeUrl?: string;
  /** Addon IDs shown to the customer during booking. Undefined = show all. */
  allowedAddons?: string[];
  /** Hvad er med i pakken — vist ved hover på produktkort */
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
  /** Produktvideo (instruktion/demo) — vist med play-knap i produkt-hero */
  video?: string;
  /** YouTube-URL fra producenten — vist som ekstra info under produktbeskrivelsen */
  youtubeUrl?: string;
  /** Hvad er med — vist ved hover på produktkort */
  contents?: string[];
  da: AddonText;
  en: AddonText;
}

/** Del af en sammensat pakke (bundle) — listes visuelt med + og rabat */
export interface BundlePart {
  productId: string;
  label_da: string;
  label_en: string;
  /** Listepris for denne del (til “spar X”-beregning) */
  price: number;
}

export interface ProductBundle {
  parts: BundlePart[];
  /** Rabat i kr vs sum af parts (0 = convenience-pakke uden prisrabat) */
  discount: number;
  usecase_da: string;
  usecase_en: string;
}

export interface RentalProduct {
  id: string;
  /** Produktside (Info-knap) */
  page?: string;
  category: ProductCategory;
  price: number;
  image: string;
  name_da: string;
  name_en: string;
  desc_da?: string;
  desc_en?: string;
  hidden?: boolean;
  /** Produktvideo (instruktion/demo) — vist med play-knap i produkt-hero */
  video?: string;
  /** YouTube-URL fra producenten — vist som ekstra info under produktbeskrivelsen */
  youtubeUrl?: string;
  /** Addon IDs shown to the customer during booking. Undefined = show all. */
  allowedAddons?: string[];
  /** Hvad er med i pakken — vist ved hover på produktkort */
  contents?: string[];
  /** Sammensat produkt — vises i BundleGrid, ikke i almindeligt produktgrid */
  bundle?: ProductBundle;
  /**
   * Lader kortbilledet i BundleGrid fylde hele kortets bredde (object-cover)
   * i stedet for at stå som en lille firkant midt i feltet (object-contain).
   * Værdien er en CSS object-position — altså hvor beskæringens midte lander,
   * fx "50% 46%" når motivet ligger lidt over billedets midte.
   * Kun til billeder hvor motivet ligger i et vandret bånd med luft over/under.
   */
  cardImageCrop?: string;
}

export function isBundleProduct(p: RentalProduct): boolean {
  return !!p.bundle?.parts?.length;
}

export function bundleListPrice(p: RentalProduct): number {
  if (!p.bundle?.parts?.length) return p.price;
  return p.bundle.parts.reduce((sum, part) => sum + part.price, 0);
}

export const speakers: Speaker[] = [
  {
    id: "thumpgo",
    page: "/mackie-thump-go",
    youtubeUrl: "https://www.youtube.com/watch?v=0M7xZoiqn9U",
    price: 345,
    product: "/images/product-thumpgo.webp",
    mood: "/images/mood-party.webp",
    power: "batteri",
    sizeClass: "lille",
    weight: "10 kg",
    contents: ["Mackie Thump GO 8\"", "Oplader", "AUX-kabel", "Bluetooth"],
    da: {
      name: "Mackie Thump GO",
      size: '8" batterihøjtaler',
      capacity: "Op til 30 pers.",
      desc: 'Batteridrevet 8" højtaler med Bluetooth og op til 12 timers batteri. Ingen strøm nødvendig — tag den med i parken, på stranden eller i baggården.',
      extra: "Inkl. oplader og AUX-kabel. Batteriet holder hele festen.",
    },
    en: {
      name: "Mackie Thump GO",
      size: '8" battery speaker',
      capacity: "Up to 30 people",
      desc: 'Battery-powered 8" speaker with Bluetooth and up to 12 hours of battery. No power needed — bring it to the park, the beach or the courtyard.',
      extra: "Incl. charger and AUX cable. The battery lasts the whole party.",
    },
  },
  {
    id: "party",
    page: "/hojtalerpakke-lille",
    youtubeUrl: "https://www.youtube.com/watch?v=0VN2Q2bMufA",
    price: 395,
    product: "/images/product-party.webp",
    mood: "/images/mood-party.webp",
    power: "kabel",
    sizeClass: "lille",
    weight: "12 kg",
    contents: ['2× Alto 10" højtalere', "Bluetooth", "AUX + strømkabler", "USB-C / iPhone-adapter"],
    da: {
      name: "Lille højtalerpakke",
      size: '2× 10" Alto',
      capacity: "0-30 pers.",
      desc: 'To kompakte 10" højtalere med Bluetooth. Vejer kun 12 kg — passer i bæretaske, klar til cyklen.',
      extra: "Inkl. alle kabler. Bæretaske og stativ kan tilkøbes.",
    },
    en: {
      name: "Small Speaker Package",
      size: '2× 10" Alto',
      capacity: "0-30 people",
      desc: 'Two compact 10" speakers with Bluetooth. Only 12 kg — fits in a carry bag, ready for your bike.',
      extra: "Incl. all cables. Carry bag and stands available as add-ons.",
    },
  },
  {
    id: "soundboks",
    page: "/soundboks-4",
    youtubeUrl: "https://www.youtube.com/watch?v=k7nG3O4I6JI",
    price: 595,
    product: "/images/product-soundboks.webp",
    mood: "/images/mood-party.webp",
    power: "batteri",
    sizeClass: "stor",
    weight: "11 kg",
    contents: ["Soundboks 4", "Oplader", "AUX-kabel", "Bluetooth"],
    da: {
      name: "Soundboks 4",
      size: "Soundboks 4",
      capacity: "Op til 50 pers.",
      desc: "Den populære Soundboks 4 med kraftig bas og Bluetooth. Batteridrevet — ingen strøm nødvendig. Perfekt til udendørs fester.",
      extra: "Inkl. oplader og AUX-kabel.",
    },
    en: {
      name: "Soundboks 4",
      size: "Soundboks 4",
      capacity: "Up to 50 people",
      desc: "The popular Soundboks 4 with powerful bass and Bluetooth. Battery-powered — no power needed. Perfect for outdoor parties.",
      extra: "Incl. charger and AUX cable.",
    },
  },
  {
    id: "festival",
    page: "/hojtalerpakke-normal",
    youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0",
    price: 495,
    product: "/images/product-festival.webp",
    mood: "/images/mood-festival.webp",
    power: "kabel",
    sizeClass: "stor",
    weight: "2× 16 kg",
    contents: ['2× EV 12" højtalere', "Bluetooth", "AUX + strømkabler", "USB-C / iPhone-adapter"],
    da: {
      name: "Stor højtalerpakke",
      size: '2× 12" EV',
      capacity: "30-50 pers.",
      desc: 'To kraftige 12" aktive højtalere med Bluetooth. Klar lyd til større rum og udendørs arrangementer.',
      extra: "Inkl. alle kabler. Stativer kan tilkøbes for 100 kr.",
    },
    en: {
      name: "Large Speaker Package",
      size: '2× 12" EV',
      capacity: "30-50 people",
      desc: 'Two powerful 12" active speakers with Bluetooth. Clear sound for larger rooms and outdoor events.',
      extra: "Incl. all cables. Stands available as add-on for 100 kr.",
    },
  },
];

export const addons: Addon[] = [
  {
    id: "lyseffekt",
    page: "/enkelt-lyseffekt",
    youtubeUrl: "https://www.youtube.com/watch?v=XhecuXfY0vo",
    price: 195,
    image: "/images/product-lyseffekt.webp",
    contents: ["1× LED-par-lys (uden stativ)", "Strømkabel", "Automatiske farveeffekter"],
    da: { label: "Enkelt lyseffekt", desc: "1 LED-par-lys med farveeffekter — leveres uden stativ, plug and play" },
    en: { label: "Single light effect", desc: "1 LED par light with colour effects — comes without a stand, plug and play" },
  },
  {
    id: "lys",
    page: "/lys-pakke",
    youtubeUrl: "https://www.youtube.com/watch?v=FcOqGlPsyYY",
    price: 495,
    image: "/images/product-lys.webp",
    contents: ["2× farvede LED-lamper", "Centereffekt", "Stativ", "Strøm + DMX/kabler"],
    da: { label: "Lys-pakke", desc: "2 farvede lamper + centereffekt på stativ" },
    en: { label: "Light package", desc: "2 coloured lamps + centre effect on stand" },
  },
  {
    id: "rog",
    page: "/roegmaskine",
    youtubeUrl: "https://www.youtube.com/watch?v=hQXFyo28Ndc",
    price: 245,
    image: "/images/product-rog.webp",
    contents: ["Røgmaskine", "Røgvæske", "Strømkabel"],
    da: { label: "Røgmaskine", desc: "Kompakt røgmaskine inkl. røgvæske — gør lyset 10x federe" },
    en: { label: "Fog machine", desc: "Compact fog machine incl. fluid — makes the lights 10x better" },
  },
  {
    id: "subwoofer",
    page: "/subwoofer",
    youtubeUrl: "https://www.youtube.com/watch?v=C9J1G7KQIHA",
    price: 295,
    image: "/images/product-subwoofer-v2.webp",
    contents: ["Behringer 12\" aktiv subwoofer", "Strømkabel", "Signalkabel til højtalere"],
    da: { label: "Subwoofer 12\"", desc: "Behringer 12\" aktiv sub — giver festen den dybe bas" },
    en: { label: "Subwoofer 12\"", desc: "Behringer 12\" powered sub — adds the deep bass" },
  },
  {
    id: "stativer",
    price: 100,
    image: "/images/product-stativer.webp",
    da: { label: "Højtalerstativer", desc: "2 professionelle stativer — løfter lyden op i øjenhøjde" },
    en: { label: "Speaker stands", desc: "2 professional stands — lifts the sound to ear level" },
  },
  {
    id: "mikrofon",
    youtubeUrl: "https://www.youtube.com/watch?v=ED_w3MHXjxk",
    price: 295,
    image: "/images/product-mikrofon.webp",
    da: { label: "Trådløs mikrofon", desc: "Professionel håndholdt mikrofon til taler og karaoke" },
    en: { label: "Wireless mic", desc: "Professional handheld mic for speeches and karaoke" },
  },
  {
    id: "batteri",
    price: 145,
    image: "/images/product-thumpgo.webp",
    da: { label: "Ekstra batteri", desc: "Ekstra batteri til batterihøjtaler — mere spilletid uden strøm" },
    en: { label: "Extra battery", desc: "Extra battery for battery speakers — more playtime without power" },
  },
  {
    id: "taske",
    price: 95,
    image: "/images/product-taske.webp",
    da: { label: "Bæretaske", desc: "Polstret sportstaske til sikker transport på cykel eller i bil" },
    en: { label: "Carry bag", desc: "Padded sports bag for safe transport by bike or car" },
  },
  // ── Kørsel: levering (ud) og afhentning (retur) er to selvstændige ture.
  // Én vej koster 495, begge veje 795 — derfor er "begge veje" et selvstændigt
  // id med sin egen pris i stedet for to linjer der lægges sammen til 990.
  {
    id: "levering_ud",
    price: 495,
    image: null,
    da: {
      label: "Levering + opsætning",
      desc: "Vi kører ud, sætter op klar til brug — du afleverer selv bagefter",
    },
    en: {
      label: "Delivery + setup",
      desc: "We drive out and set everything up — you return it yourself",
    },
  },
  {
    id: "afhentning_retur",
    price: 495,
    image: null,
    da: {
      label: "Afhentning efter festen",
      desc: "Du henter selv — vi henter udstyret igen bagefter",
    },
    en: {
      label: "Collection after the party",
      desc: "You pick it up yourself — we collect the gear afterwards",
    },
  },
  {
    id: "levering_begge",
    price: 795,
    image: null,
    da: {
      label: "Levering + afhentning (begge veje)",
      desc: "Vi kører ud, sætter op og henter igen — spar 195 kr.",
    },
    en: {
      label: "Delivery + collection (both ways)",
      desc: "We deliver, set up and collect again — save 195 DKK",
    },
  },
];

/**
 * Kørsels-tilvalgene. De udelukker hinanden: man kører enten ud, henter hjem,
 * eller begge dele — aldrig to af dem på samme ordre.
 */
export const DELIVERY_ADDON_IDS = ["levering_ud", "afhentning_retur", "levering_begge"] as const;
export type DeliveryAddonId = (typeof DELIVERY_ADDON_IDS)[number];

/** Gamle ordrer/kataloger bruger disse ids — de tæller stadig som kørsel */
export const LEGACY_DELIVERY_IDS = ["levering", "levering_opsaetning"];

export function isDeliveryAddon(id: string): boolean {
  return (DELIVERY_ADDON_IDS as readonly string[]).includes(id) || LEGACY_DELIVERY_IDS.includes(id);
}

/** Hvilke veje vi kører på en given ordre — bruges i admin og på lejesedlen */
export function deliveryDirections(id: string): { out: boolean; back: boolean } {
  if (id === "levering_ud") return { out: true, back: false };
  if (id === "afhentning_retur") return { out: false, back: true };
  if (id === "levering_begge" || LEGACY_DELIVERY_IDS.includes(id)) return { out: true, back: true };
  return { out: false, back: false };
}

/** Standalone rental products (lys, av) — bookable via /?product=ID#book */
export const rentalProducts: RentalProduct[] = [
  // Festpakke-bundles (lyd + lys) — ikke almindelige produkter; se BundleGrid.
  // Levering/opsætning er bevidst IKKE med i pakken — det kan tilvælges i booking.
  {
    id: "pakke_fest_lille",
    page: "/festpakke-lille",
    youtubeUrl: "https://www.youtube.com/watch?v=0VN2Q2bMufA",
    category: "lyd",
    price: 495,
    image: "/images/product-pakke-fest-lille.webp",
    cardImageCrop: "50% 46%",
    name_da: "Lille festpakke",
    name_en: "Small party package",
    desc_da: "Lille højtalerpakke + enkelt lyseffekt. Lyd og lys til op til 40 pers. — spar 95 kr.",
    desc_en: "Small speaker package + single light effect. Sound and lights for up to 40 people — save 90 DKK.",
    contents: ['2× Alto 10" højtalere', "1 LED-lyseffekt", "Bluetooth + alle kabler"],
    allowedAddons: ["subwoofer", "rog", "stativer", "mikrofon", ...DELIVERY_ADDON_IDS],
    bundle: {
      discount: 95,
      usecase_da: "Lyd og lys til den lille fest — op til 40 pers. Kompakt sæt, klar på 10 minutter.",
      usecase_en: "Sound and lights for the small party — up to 40 people. Compact set, ready in 10 minutes.",
      parts: [
        { productId: "party", label_da: "Lille højtalerpakke", label_en: "Small speaker package", price: 395 },
        { productId: "lyseffekt", label_da: "Enkelt lyseffekt", label_en: "Single light effect", price: 195 },
      ],
    },
  },
  {
    id: "pakke_fest_stor",
    page: "/festpakke-stor",
    youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0",
    category: "lyd",
    price: 895,
    image: "/images/product-pakke-fest-stor.webp",
    cardImageCrop: "50% 47%",
    name_da: "Stor festpakke",
    name_en: "Large party package",
    desc_da: "Stor højtalerpakke + lys-pakke. Lyd og lys til op til 100 pers. — spar 95 kr.",
    desc_en: "Large speaker package + light package. Sound and lights for up to 100 people — save 190 DKK.",
    contents: ['2× EV 12" højtalere', "Lys-pakke (2 lamper + centereffekt)", "Bluetooth + alle kabler"],
    allowedAddons: ["subwoofer", "rog", "mikrofon", ...DELIVERY_ADDON_IDS],
    bundle: {
      discount: 95,
      usecase_da: "Lyd og lys til den store fest — op til 100 pers. med de store højtalere.",
      usecase_en: "Sound and lights for the big party — up to 100 people with the large speakers.",
      parts: [
        { productId: "festival", label_da: "Stor højtalerpakke", label_en: "Large speaker package", price: 495 },
        { productId: "lys", label_da: "Lys-pakke", label_en: "Light package", price: 495 },
      ],
    },
  },
  // ── Pakkestigen 150 og 250: navngivet efter antal gæster, ikke efter grej.
  // Kunden ved hvor mange der kommer; han ved ikke hvad 2× 12" EV betyder.
  // Kørsel er stadig et tilvalg her — se epic_aov i prd.json for hvorfor den
  // skal med i prisen på sigt, og hvad der mangler i flowet før det kan lade sig gøre.
  {
    id: "pakke_fest_150",
    page: "/festpakke-150",
    youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0",
    category: "lyd",
    price: 1495,
    image: "/images/product-pakke-fest-150.webp",
    name_da: "Festpakke 150",
    name_en: "Party package 150",
    desc_da: 'Højtalere, sub, lys og røg til op til 150 gæster — spar 135 kr.',
    desc_en: "Speakers, sub, lights and fog for up to 150 guests — save 135 DKK.",
    contents: ['2× EV 12" højtalere', '12" subwoofer', "Stativer", "Lys-pakke (2 lamper + centereffekt)", "Røgmaskine + væske", "Alle kabler"],
    allowedAddons: ["mikrofon", "subwoofer", ...DELIVERY_ADDON_IDS],
    bundle: {
      discount: 135,
      usecase_da: "Festen hvor dansegulvet skal fungere: bassen giver tryk, lyset giver rum, røgen gør lyset synligt.",
      usecase_en: "The party where the dancefloor has to work: sub for punch, lights for the room, fog to make the light visible.",
      parts: [
        { productId: "festival", label_da: 'Stor højtalerpakke (2× 12")', label_en: 'Large speakers (2× 12")', price: 495 },
        { productId: "subwoofer", label_da: 'Subwoofer 12"', label_en: 'Subwoofer 12"', price: 295 },
        { productId: "stativer", label_da: "Højtalerstativer", label_en: "Speaker stands", price: 100 },
        { productId: "lys", label_da: "Lys-pakke", label_en: "Light package", price: 495 },
        { productId: "rog", label_da: "Røgmaskine", label_en: "Fog machine", price: 245 },
      ],
    },
  },
  {
    id: "pakke_fest_250",
    page: "/festpakke-250",
    youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0",
    category: "lyd",
    price: 2295,
    image: "/images/product-pakke-fest-250.webp",
    name_da: "Festpakke 250",
    name_en: "Party package 250",
    desc_da: "Dobbelt anlæg med to subs, lys og røg til op til 250 gæster — spar 225 kr. Leveres og sættes op.",
    desc_en: "Double system with two subs, lights and fog for up to 250 guests — save 225 DKK.",
    contents: ['4× EV 12" højtalere', '2× 12" subwoofer', "2 sæt stativer", "Lys-pakke", "Røgmaskine + væske", "Alle kabler + strøm"],
    allowedAddons: ["mikrofon", ...DELIVERY_ADDON_IDS],
    bundle: {
      discount: 225,
      usecase_da: "Sal, gård eller hal med 150-250 gæster. Fire tops dækker bredden, to subs holder bunden.",
      usecase_en: "Hall or courtyard with 150-250 guests. Four tops cover the width, two subs hold the bottom.",
      parts: [
        { productId: "festival", label_da: 'Stor højtalerpakke (2× 12")', label_en: 'Large speakers (2× 12")', price: 495 },
        { productId: "festival", label_da: 'Stor højtalerpakke nr. 2', label_en: "Large speakers no. 2", price: 495 },
        { productId: "subwoofer", label_da: 'Subwoofer 12"', label_en: 'Subwoofer 12"', price: 295 },
        { productId: "subwoofer", label_da: 'Subwoofer 12" nr. 2', label_en: 'Subwoofer 12" no. 2', price: 295 },
        { productId: "stativer", label_da: "Højtalerstativer", label_en: "Speaker stands", price: 100 },
        { productId: "stativer", label_da: "Højtalerstativer nr. 2", label_en: "Speaker stands no. 2", price: 100 },
        { productId: "lys", label_da: "Lys-pakke", label_en: "Light package", price: 495 },
        { productId: "rog", label_da: "Røgmaskine", label_en: "Fog machine", price: 245 },
      ],
    },
  },
  // ── Lejlighedspakker: én pakke pr. område kunden faktisk søger på.
  // Anledningssiderne pegede før på et enkeltprodukt eller en generisk
  // festpakke — polterabend anbefalede en højtaler til 345 kr. Her er
  // pakken bygget til det der skal ske: taler, ingen strøm, film, eller lys.
  {
    id: "pakke_bryllup",
    page: "/bryllupspakke",
    youtubeUrl: "https://www.youtube.com/watch?v=GM_WsXv1FU4",
    category: "lyd",
    price: 1695,
    image: "/images/product-lowfog.webp",
    name_da: "Bryllupspakke",
    name_en: "Wedding package",
    desc_da: "Højtalere, mikrofon til talerne, lys, lyskæder og low fog til første dans — spar 180 kr.",
    desc_en: "Speakers, a mic for the speeches, lights, fairy lights and low fog for the first dance — save 180 DKK.",
    contents: ['2× EV 12" højtalere + stativer', "Trådløs mikrofon til talerne", "Lys-pakke", "10 m lyskæde", "Low fog-maskine"],
    allowedAddons: ["mikrofon", "subwoofer", "rog", ...DELIVERY_ADDON_IDS],
    bundle: {
      discount: 180,
      usecase_da: "Dagen har to dele: taler alle kan høre, og et dansegulv der holder. Low fog giver 'dansen på skyer' til første dans.",
      usecase_en: "The day has two halves: speeches everyone can hear, and a dancefloor that holds. Low fog gives the 'dancing on clouds' first dance.",
      parts: [
        { productId: "festival", label_da: 'Stor højtalerpakke (2× 12")', label_en: 'Large speakers (2× 12")', price: 495 },
        { productId: "stativer", label_da: "Højtalerstativer", label_en: "Speaker stands", price: 100 },
        { productId: "traadloes_mikrofon", label_da: "Trådløs mikrofon", label_en: "Wireless mic", price: 295 },
        { productId: "lys", label_da: "Lys-pakke", label_en: "Light package", price: 495 },
        { productId: "lyskaeder", label_da: "Lyskæde varm hvid", label_en: "Fairy lights warm white", price: 195 },
        { productId: "low_fog", label_da: "Low fog-maskine", label_en: "Low fog machine", price: 295 },
      ],
    },
  },
  {
    id: "pakke_firmafest",
    page: "/firmafestpakke",
    youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0",
    category: "lyd",
    price: 1795,
    image: "/images/product-pakke-fest-stor.webp",
    cardImageCrop: "50% 47%",
    name_da: "Firmafestpakke",
    name_en: "Company party package",
    desc_da: "Mikrofon til chefens tale, sub til dansegulvet bagefter, lys og røg — spar 130 kr.",
    desc_en: "A mic for the speech, a sub for the dancefloor afterwards, lights and fog — save 130 DKK.",
    contents: ['2× EV 12" højtalere + stativer', "Trådløs mikrofon", '12" subwoofer', "Lys-pakke", "Røgmaskine"],
    allowedAddons: ["mikrofon", ...DELIVERY_ADDON_IDS],
    bundle: {
      discount: 130,
      usecase_da: "Julefrokost og firmafest i ét: talen skal høres af alle, og bagefter skal der danses.",
      usecase_en: "Christmas lunch and company party in one: the speech must be heard, and afterwards there is dancing.",
      parts: [
        { productId: "festival", label_da: 'Stor højtalerpakke (2× 12")', label_en: 'Large speakers (2× 12")', price: 495 },
        { productId: "stativer", label_da: "Højtalerstativer", label_en: "Speaker stands", price: 100 },
        { productId: "traadloes_mikrofon", label_da: "Trådløs mikrofon", label_en: "Wireless mic", price: 295 },
        { productId: "subwoofer", label_da: 'Subwoofer 12"', label_en: 'Subwoofer 12"', price: 295 },
        { productId: "lys", label_da: "Lys-pakke", label_en: "Light package", price: 495 },
        { productId: "rog", label_da: "Røgmaskine", label_en: "Fog machine", price: 245 },
      ],
    },
  },
  {
    id: "pakke_udendors",
    page: "/udendorspakke",
    youtubeUrl: "https://www.youtube.com/watch?v=k7nG3O4I6JI",
    category: "lyd",
    price: 795,
    image: "/images/product-soundboks.webp",
    name_da: "Udendørspakke",
    name_en: "Outdoor package",
    desc_da: "Soundboks 4, ekstra batteri og lyskæde — hele festen uden en eneste stikkontakt. Spar 140 kr.",
    desc_en: "Soundboks 4, spare battery and fairy lights — a whole party without a single power socket. Save 140 DKK.",
    contents: ["Soundboks 4 (batteri)", "Ekstra batteri", "10 m lyskæde", "Oplader + AUX-kabel"],
    allowedAddons: ["taske", "lyseffekt", ...DELIVERY_ADDON_IDS],
    bundle: {
      discount: 140,
      usecase_da: "Baggård, strand, park eller polterabend: der er ingen strøm, og festen skal holde til langt ud på aftenen.",
      usecase_en: "Courtyard, beach, park or stag do: there is no power, and the party has to last all evening.",
      parts: [
        { productId: "soundboks", label_da: "Soundboks 4", label_en: "Soundboks 4", price: 595 },
        { productId: "batteri", label_da: "Ekstra batteri", label_en: "Extra battery", price: 145 },
        { productId: "lyskaeder", label_da: "Lyskæde varm hvid", label_en: "Fairy lights warm white", price: 195 },
      ],
    },
  },
  {
    id: "pakke_student",
    page: "/studenterpakke",
    youtubeUrl: "https://www.youtube.com/watch?v=k7nG3O4I6JI",
    category: "lyd",
    price: 745,
    image: "/images/product-soundboks.webp",
    name_da: "Studenterpakken",
    name_en: "Graduation package",
    desc_da: "Soundboks 4, ekstra batteri og bæretaske — spiller hele vognturen. Spar 90 kr.",
    desc_en: "Soundboks 4, spare battery and carry bag — plays the whole truck ride. Save 90 DKK.",
    contents: ["Soundboks 4 (batteri)", "Ekstra batteri", "Polstret bæretaske", "Oplader + AUX-kabel"],
    allowedAddons: ["lyseffekt", ...DELIVERY_ADDON_IDS],
    bundle: {
      discount: 90,
      usecase_da: "Studenterkørsel: ingen strøm på ladet, og anlægget skal kunne løftes op og ned hele dagen.",
      usecase_en: "Graduation truck: no power on the truck bed, and the speaker gets lifted on and off all day.",
      parts: [
        { productId: "soundboks", label_da: "Soundboks 4", label_en: "Soundboks 4", price: 595 },
        { productId: "batteri", label_da: "Ekstra batteri", label_en: "Extra battery", price: 145 },
        { productId: "taske", label_da: "Bæretaske", label_en: "Carry bag", price: 95 },
      ],
    },
  },
  {
    id: "pakke_filmaften",
    page: "/filmaften",
    youtubeUrl: "https://www.youtube.com/watch?v=PfUdmfpiV6k",
    category: "av",
    price: 995,
    image: "/images/product-projektor.webp",
    name_da: "Filmaften-pakken",
    name_en: "Movie night package",
    desc_da: "Projektor, lærred og to højtalere — biograf i haven eller i gården. Spar 90 kr.",
    desc_en: "Projector, screen and two speakers — cinema in the garden or the courtyard. Save 90 DKK.",
    contents: ["Full HD projektor", "Lærred 160 cm på stativ", '2× Alto 10" højtalere', "HDMI + alle kabler"],
    allowedAddons: ["stativer", ...DELIVERY_ADDON_IDS],
    bundle: {
      discount: 90,
      usecase_da: "Film i gården, fodboldkamp til festen eller børnebiograf til fødselsdagen. Lyden fra en projektor rækker ikke — derfor er højtalerne med.",
      usecase_en: "A film in the courtyard, the match at the party or a kids' cinema for the birthday. A projector's own sound is not enough — that is why the speakers are included.",
      parts: [
        { productId: "projektor", label_da: "Projektor", label_en: "Projector", price: 495 },
        { productId: "laerred_160", label_da: "Lærred 160 cm", label_en: "Screen 160 cm", price: 195 },
        { productId: "party", label_da: "Lille højtalerpakke", label_en: "Small speaker package", price: 395 },
      ],
    },
  },
  {
    id: "pakke_stemningslys",
    page: "/stemningslys",
    youtubeUrl: "https://www.youtube.com/watch?v=DLi7MQbRH8c",
    category: "lys",
    price: 695,
    image: "/images/product-uplight-4.webp",
    name_da: "Stemningslys-pakken",
    name_en: "Ambient light package",
    desc_da: "4 uplights, lyskæde og discokugle — hele rummet skifter karakter. Spar 140 kr.",
    desc_en: "4 uplights, fairy lights and a disco ball — the whole room changes character. Save 140 DKK.",
    contents: ["4× LED uplight til vægge og hjørner", "10 m lyskæde", "Discokugle med motor og spot", "Strømkabler"],
    allowedAddons: ["rog", ...DELIVERY_ADDON_IDS],
    bundle: {
      discount: 140,
      usecase_da: "Lys uden lyd: uplights vasker væggene, lyskæden giver varmen, discokuglen giver dansegulvet. Til lokaler der er lejet med lysstofrør i loftet.",
      usecase_en: "Light without sound: uplights wash the walls, fairy lights bring warmth, the disco ball makes the dancefloor. For venues rented with fluorescent tubes in the ceiling.",
      parts: [
        { productId: "uplight_4", label_da: "Uplight 4-pak", label_en: "Uplight 4-pack", price: 395 },
        { productId: "lyskaeder", label_da: "Lyskæde varm hvid", label_en: "Fairy lights warm white", price: 195 },
        { productId: "discokugle", label_da: "Discokugle", label_en: "Disco ball", price: 245 },
      ],
    },
  },
  { id: "discokugle", page: "/discokugle", youtubeUrl: "https://www.youtube.com/watch?v=okV56ZfjetM", category: "lys", price: 245, image: "/images/product-discokugle.webp", name_da: "Discokugle", name_en: "Disco ball", desc_da: "Roterende discokugle med LED-lys og farver.", desc_en: "Rotating disco ball with LED lights.", contents: ["Discokugle m. motor", "LED-lys", "Stativ/ophæng", "Strømkabel"] },
  { id: "lyskaeder", page: "/lyskaeder", youtubeUrl: "https://www.youtube.com/watch?v=DLi7MQbRH8c", category: "lys", price: 195, image: "/images/product-lyskaeder.webp", name_da: "Lyskæde varm hvid", name_en: "Fairy lights warm white", desc_da: "10m lyskæde med varmt hvidt lys — hyggelig festbelysning.", desc_en: "10m fairy lights with warm white light — cosy party lighting.", contents: ["10m lyskæde", "Varm hvide pærer", "Strømforsyning"] },
  { id: "lyskaeder_farvet", page: "/lyskaeder", youtubeUrl: "https://www.youtube.com/watch?v=DLi7MQbRH8c", category: "lys", price: 195, image: "/images/product-lyskaeder-farvet.webp", name_da: "Lyskæde farvet", name_en: "Fairy lights coloured", desc_da: "10m lyskæde med farvede pærer — festlig stemning fra første sekund.", desc_en: "10m fairy lights with coloured bulbs — party mood instantly.", contents: ["10m lyskæde", "Farvede pærer", "Strømforsyning"] },
  { id: "uplight", page: "/uplights", category: "lys", price: 125, image: "/images/product-uplight.webp", name_da: "Uplight", name_en: "Uplight", desc_da: "Simpel LED uplight på gulv — plug and play. Vasker vægge og hjørner i farvet lys.", desc_en: "Simple floor LED uplight — plug and play. Washes walls and corners in coloured light.", contents: ["1× LED uplight", "Strømkabel", "Automatiske farver"] },
  { id: "uplight_4", page: "/uplights", category: "lys", price: 395, image: "/images/product-uplight-4.webp", name_da: "Uplight 4-pak", name_en: "Uplight 4-pack", desc_da: "4 simple LED uplights til vægge og hjørner — spar 105 kr vs enkeltvis.", desc_en: "4 simple LED uplights for walls and corners — save 105 DKK vs singles.", contents: ["4× LED uplight", "Strømkabler", "Plug and play"] },
  { id: "projektor", page: "/projektor", youtubeUrl: "https://www.youtube.com/watch?v=PfUdmfpiV6k", category: "av", price: 495, image: "/images/product-projektor.webp", name_da: "Projektor", name_en: "Projector", desc_da: "Full HD projektor til præsentationer og film.", desc_en: "Full HD projector for presentations and film.", contents: ["Full HD projektor", "HDMI-kabel", "Strømkabel", "Fjernbetjening"] },
  { id: "skaerm_55", page: "/skaerm", youtubeUrl: "https://www.youtube.com/watch?v=wIsu3Lo5kK4", category: "av", price: 595, image: "/images/product-skaerm.webp", name_da: '55" Storskærm', name_en: '55" Screen', desc_da: "55\" LED-skærm på 3-fod stativ — justerbar højde.", desc_en: '55" LED screen on tripod stand — adjustable height.', contents: ['55" LED-skærm', "3-fod stativ", "HDMI-kabel", "Strømkabel"] },
  { id: "skaerm_32", page: "/skaerm-32", youtubeUrl: "https://www.youtube.com/watch?v=wIsu3Lo5kK4", category: "av", price: 395, image: "/images/product-skaerm-32.webp", name_da: '32" Skærm', name_en: '32" Screen', desc_da: "32\" LED-skærm på 3-fod stativ — kompakt og nem at flytte. Perfekt til karaoke.", desc_en: '32" LED screen on tripod stand — compact and easy to move. Perfect for karaoke.', contents: ['32" LED-skærm', "3-fod stativ", "HDMI-kabel", "Strømkabel"] },
  { id: "traadloes_mikrofon", page: "/traadloes-mikrofon", youtubeUrl: "https://www.youtube.com/watch?v=ED_w3MHXjxk", category: "av", price: 295, image: "/images/product-mikrofon.webp", name_da: "Trådløs mikrofon", name_en: "Wireless mic", desc_da: "Trådløs håndholdt mikrofon til taler og karaoke.", desc_en: "Wireless handheld microphone for speeches and karaoke.", contents: ["Trådløs håndholdt mic", "Modtager", "Kabelforbindelse til højtaler"] },
  { id: "traadloes_mikrofon_pro", page: "/traadloes-mikrofon-pro", youtubeUrl: "https://www.youtube.com/watch?v=mnNM1npG_EM", category: "av", price: 495, image: "/images/product-mikrofon-pro.webp", name_da: "Trådløs mikrofon PRO", name_en: "Wireless mic PRO", desc_da: "Shure BLX trådløs mikrofon — scenekvalitet til events og konferencer.", desc_en: "Shure BLX wireless microphone — stage quality for events and conferences.", contents: ["Shure trådløs håndholdt mic", "Shure modtager", "Kabelforbindelse til højtaler"] },
  { id: "headset", page: "/headset-mikrofon", youtubeUrl: "https://www.youtube.com/watch?v=mnNM1npG_EM", category: "av", price: 345, image: "/images/product-headset.webp", name_da: "Trådløst headset", name_en: "Wireless headset", desc_da: "Headset-mikrofon til præsentationer.", desc_en: "Headset mic for presentations.", contents: ["Headset-mikrofon", "Bodypack + modtager", "Kabelforbindelse"] },
  { id: "headset_pro", page: "/headset-pro", youtubeUrl: "https://www.youtube.com/watch?v=mnNM1npG_EM", category: "av", price: 495, image: "/images/product-headset-pro.webp", name_da: "Trådløst headset PRO", name_en: "Wireless headset PRO", desc_da: "Professionelt headset i broadcast-kvalitet — til konferencer og scener.", desc_en: "Professional broadcast-quality headset — for conferences and stages.", contents: ["PRO headset-mikrofon", "Bodypack + modtager", "Kabelforbindelse"] },
  { id: "haandholdt_mikrofon", page: "/haandholdt-mikrofon", youtubeUrl: "https://www.youtube.com/watch?v=4gssAwctUFQ", category: "av", price: 95, image: "/images/product-mikrofon-kabel.webp", name_da: "Håndholdt mikrofon (kabel)", name_en: "Handheld microphone (wired)", desc_da: "Almindelig håndholdt mikrofon med kabel — til taler og sang.", desc_en: "Standard wired handheld microphone — for speeches and vocals.", contents: ["Håndholdt mic", "XLR/kabel"] },
  { id: "haandholdt_mikrofon_pro", page: "/haandholdt-mikrofon-pro", youtubeUrl: "https://www.youtube.com/watch?v=Y8CBYnicB5g", category: "av", price: 195, image: "/images/product-mikrofon-kabel-pro.webp", name_da: "Håndholdt mikrofon PRO (kabel)", name_en: "Handheld microphone PRO (wired)", desc_da: "Shure Beta 58A med kabel — klassikeren til sang og taler.", desc_en: "Shure Beta 58A wired — the classic for vocals and speeches.", contents: ["Shure Beta 58A", "XLR/kabel"] },
  { id: "laerred_160", page: "/laerred-160", youtubeUrl: "https://www.youtube.com/watch?v=PLqEcB93Sac", category: "av", price: 195, image: "/images/product-laerred.webp", name_da: "Lærred 160 cm", name_en: "Projector screen 160 cm", desc_da: "160 cm lærred på stativ — perfekt til projektor.", desc_en: "160 cm projector screen on stand.", contents: ["160 cm lærred", "Stativ"] },
  { id: "projektor_pro", page: "/projektor-pro", youtubeUrl: "https://www.youtube.com/watch?v=7FhRTCCKCm0", category: "av", price: 795, image: "/images/product-projektor-pro.webp", name_da: "Projektor Pro (5000 lumen)", name_en: "Projector Pro (5000 lumen)", desc_da: "Kraftig 5000 lumen projektor — skarp selv i dagslys.", desc_en: "Powerful 5000 lumen projector — sharp even in daylight.", contents: ["5000 lumen projektor", "HDMI-kabel", "Strømkabel", "Fjernbetjening"] },
  { id: "pakke_praesentation", page: "/pakke-praesentation", youtubeUrl: "https://www.youtube.com/watch?v=PfUdmfpiV6k", category: "av", price: 695, image: "/images/product-projektor.webp", name_da: "Præsentationspakken", name_en: "Presentation bundle", desc_da: "Projektor + lærred 160 cm + håndholdt mikrofon. Alt til præsentationen — spar 90 kr.", desc_en: "Projector + 160 cm screen + wired handheld mic. Everything for your presentation — save 90 kr.", contents: ["Full HD projektor", "Lærred 160 cm", "Håndholdt mic + kabel", "HDMI + strøm"], bundle: { discount: 90, usecase_da: "Alt til præsentationen — projektor, lærred og mikrofon.", usecase_en: "Everything for your presentation.", parts: [ { productId: "projektor", label_da: "Projektor", label_en: "Projector", price: 495 }, { productId: "laerred_160", label_da: "Lærred 160 cm", label_en: "Screen 160 cm", price: 195 }, { productId: "haandholdt_mikrofon", label_da: "Håndholdt mikrofon", label_en: "Wired mic", price: 95 } ] } },
  { id: "pakke_konference", page: "/pakke-konference", youtubeUrl: "https://www.youtube.com/watch?v=wIsu3Lo5kK4", category: "av", price: 1195, image: "/images/product-skaerm.webp", name_da: "Konferencepakken", name_en: "Conference bundle", desc_da: "55\" storskærm + trådløst headset + lille højtalerpakke. Klar til konference — spar 140 kr.", desc_en: "55\" screen + wireless headset + small speaker package. Conference-ready — save 140 kr.", contents: ['55" skærm + stativ', "Trådløst headset", '2× 10" højtalere', "Kabler + adapter"], bundle: { discount: 140, usecase_da: "Klar til konference — skærm, headset og lyd.", usecase_en: "Conference-ready — screen, headset and sound.", parts: [ { productId: "skaerm_55", label_da: '55" Storskærm', label_en: '55" Screen', price: 595 }, { productId: "headset", label_da: "Trådløst headset", label_en: "Wireless headset", price: 345 }, { productId: "party", label_da: "Lille højtalerpakke", label_en: "Small speakers", price: 395 } ] } },
  { id: "pakke_konference_150", page: "/konferencepakke-150", youtubeUrl: "https://www.youtube.com/watch?v=wIsu3Lo5kK4", category: "av", price: 1795, image: "/images/product-skaerm.webp", name_da: "Konferencepakke 150", name_en: "Conference package 150", desc_da: '2× 12" højtalere på stativer + Shure trådløs mikrofon + headset + 55" skærm. Til sale med 100-150 deltagere — spar 235 kr.', desc_en: 'Two 12" speakers on stands + Shure wireless mic + headset + 55" screen. For rooms with 100-150 attendees — save 235 DKK.', contents: ['2× EV 12" højtalere + stativer', "Shure trådløs mikrofon PRO", "Trådløst headset", '55" skærm på stativ', "HDMI + alle kabler"], allowedAddons: ["mikrofon", ...DELIVERY_ADDON_IDS], bundle: { discount: 235, usecase_da: "Konference eller generalforsamling hvor både taleren og salen skal kunne høres og se med.", usecase_en: "Conference or general assembly where both the speaker and the room must be heard and seen.", parts: [ { productId: "festival", label_da: 'Stor højtalerpakke (2× 12")', label_en: 'Large speakers (2× 12")', price: 495 }, { productId: "stativer", label_da: "Højtalerstativer", label_en: "Speaker stands", price: 100 }, { productId: "traadloes_mikrofon_pro", label_da: "Trådløs mikrofon PRO", label_en: "Wireless mic PRO", price: 495 }, { productId: "headset", label_da: "Trådløst headset", label_en: "Wireless headset", price: 345 }, { productId: "skaerm_55", label_da: '55" Storskærm', label_en: '55" Screen', price: 595 } ] } },
  { id: "pakke_tale_musik", page: "/pakke-tale-musik", youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0", category: "av", price: 695, image: "/images/product-festival.webp", name_da: "Tale & musik-pakken", name_en: "Speech & music bundle", desc_da: "Stor højtalerpakke + trådløs mikrofon. Taler og musik til events — spar 95 kr.", desc_en: "Large speaker package + wireless mic. Speeches and music for events — save 95 kr.", contents: ['2× 12" højtalere', "Trådløs mikrofon", "Alle kabler"], bundle: { discount: 95, usecase_da: "Taler og musik til events.", usecase_en: "Speeches and music for events.", parts: [ { productId: "festival", label_da: "Stor højtalerpakke", label_en: "Large speakers", price: 495 }, { productId: "traadloes_mikrofon", label_da: "Trådløs mikrofon", label_en: "Wireless mic", price: 295 } ] } },
  { id: "karaoke", page: "/karaoke-maskine", youtubeUrl: "https://www.youtube.com/watch?v=_UaBe_xR3JY", category: "av", price: 695, image: "/images/product-karaoke.webp", name_da: "Karaokemaskine", name_en: "Karaoke machine", desc_da: "Singing Machine med indbygget skærm, 2 trådløse mikrofoner og festlys — tilslut TV via HDMI.", desc_en: "Singing Machine with built-in screen, 2 wireless mics and party lights — HDMI for your TV.", contents: ["Singing Machine karaoke-maskine", "2 trådløse mikrofoner", "Indbygget skærm + festlys", "HDMI-kabel + Bluetooth"] },
  {
    id: "pakke_karaoke",
    page: "/pakke-karaoke",
    youtubeUrl: "https://www.youtube.com/watch?v=_UaBe_xR3JY",
    category: "av",
    price: 1100,
    image: "/images/product-pakke-karaoke.webp",
    name_da: "Karaokepakken",
    name_en: "Karaoke bundle",
    desc_da: "Karaokemaskine + 32\" skærm + lille højtalerpakke. Alt til karaoke op til 40 pers. — spar 385 kr.",
    desc_en: "Karaoke machine + 32\" screen + small speaker package. Everything for karaoke up to 40 people — save 385 kr.",
    contents: ["Singing Machine + 2 trådløse mikrofoner", '32" LED-skærm på 3-fod stativ', '2× Alto 10" højtalere', "HDMI + alle kabler"],
    allowedAddons: ["rog", "lyseffekt", "subwoofer", "stativer", ...DELIVERY_ADDON_IDS],
    bundle: {
      discount: 385,
      usecase_da: "Karaoke til hjemmefesten — skærm til teksterne og rigtige højtalere til lyden.",
      usecase_en: "Karaoke for the house party — a screen for the lyrics and real speakers for the sound.",
      parts: [
        { productId: "karaoke", label_da: "Karaokemaskine", label_en: "Karaoke machine", price: 695 },
        { productId: "skaerm_32", label_da: '32" Skærm', label_en: '32" Screen', price: 395 },
        { productId: "party", label_da: "Lille højtalerpakke", label_en: "Small speaker package", price: 395 },
      ],
    },
  },
  {
    id: "pakke_karaoke_fest",
    page: "/pakke-karaoke-fest",
    youtubeUrl: "https://www.youtube.com/watch?v=_UaBe_xR3JY",
    category: "av",
    price: 1500,
    image: "/images/product-pakke-karaoke-fest.webp",
    name_da: "Karaoke-festpakken",
    name_en: "Karaoke party bundle",
    desc_da: "Karaokemaskine + 55\" storskærm + store højtalere — karaoke til op til 100 pers. Spar 285 kr.",
    desc_en: "Karaoke machine + 55\" screen + large speakers — karaoke for up to 100 people. Save 285 kr.",
    contents: ["Singing Machine + 2 trådløse mikrofoner", '55" LED-skærm på 3-fod stativ', '2× 12" højtalere', "Alle kabler"],
    allowedAddons: ["rog", "lyseffekt", "lys", "subwoofer", ...DELIVERY_ADDON_IDS],
    bundle: {
      discount: 285,
      usecase_da: "Fuld karaoke-fest: storskærm til teksterne og store højtalere til lyden.",
      usecase_en: "Full karaoke party: big screen for lyrics, large speakers for the sound.",
      parts: [
        { productId: "karaoke", label_da: "Karaokemaskine", label_en: "Karaoke machine", price: 695 },
        { productId: "skaerm_55", label_da: '55" Storskærm', label_en: '55" Screen', price: 595 },
        { productId: "festival", label_da: "Stor højtalerpakke", label_en: "Large speakers", price: 495 },
      ],
    },
  },
  { id: "low_fog", page: "/roeg", youtubeUrl: "https://www.youtube.com/watch?v=GM_WsXv1FU4", category: "roeg", price: 295, image: "/images/product-lowfog.webp", name_da: "Low fog-maskine (røggulv)", name_en: "Low fog machine (fog floor)", desc_da: "Laver et flot gulv af røg vha. is — 'dansen på skyer'-effekten fra bryllupper og musikvideoer.", desc_en: "Creates a floor of low-lying fog using ice — the 'dancing on clouds' effect.", contents: ["Low fog-maskine", "Røgvæske", "Is-bakke / instruks"] },
];

/** Navigation categories — single source of truth used by BurgerMenu and admin */
export interface NavLink { href: string; label: string }
export interface NavCategory { id: string; title: string; href: string; links: NavLink[] }

/**
 * Menuen er en vej ind i en kategori — ikke et katalog.
 *
 * Da pakkestigen og lejlighedspakkerne kom til, voksede menuen til 44 links,
 * hvoraf fjorten lå under Lyd alene. Det gør det sværere at vælge, ikke
 * nemmere: en liste man skal læse er ikke en menu, den er en opgave. Hver
 * kategori viser derfor kun det man oftest booker, og slutter med "Se alle",
 * hvor kategorisiden har hele udvalget.
 *
 * Reglen holdes af en test: højst seks links pr. kategori, og hvert produkt
 * skal kunne nås fra sin kategoriside — ikke fra menuen.
 */
export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: "lyd",
    title: "Lyd & Højtalere",
    href: "/lej-hojtaler",
    links: [
      { href: "/lydanlaeg", label: "Anlæg efter antal gæster" },
      { href: "/soundboks-4", label: "Soundboks 4" },
      { href: "/festpakke-stor", label: "Festpakke 100" },
      { href: "/lej-hojtaler", label: "Se alle højtalere og pakker" },
    ],
  },
  {
    id: "lys",
    title: "Lys & Effekter",
    href: "/festlys",
    links: [
      { href: "/stemningslys", label: "Stemningslys-pakken" },
      { href: "/lys-pakke", label: "Lys-pakke" },
      { href: "/discokugle", label: "Discokugle" },
      { href: "/festlys", label: "Se alt lys" },
    ],
  },
  {
    id: "karaoke",
    title: "Karaoke",
    href: "/karaoke",
    links: [
      { href: "/pakke-karaoke", label: "Karaokepakken" },
      { href: "/karaoke-maskine", label: "Karaokemaskine" },
      { href: "/karaoke", label: "Se alt karaoke" },
    ],
  },
  {
    id: "roeg",
    title: "Røg",
    href: "/roeg",
    links: [
      { href: "/roegmaskine", label: "Røgmaskine" },
      { href: "/roeg", label: "Low fog — røggulv" },
    ],
  },
  {
    id: "anledning",
    title: "Til din anledning",
    href: "/bryllup",
    links: [
      { href: "/bryllup", label: "Bryllup" },
      { href: "/konfirmation", label: "Konfirmation" },
      { href: "/foedselsdag", label: "Fødselsdag" },
      { href: "/julefrokost", label: "Julefrokost & firmafest" },
      { href: "/havefest", label: "Havefest" },
      { href: "/studenterkoersel", label: "Studenterkørsel" },
    ],
  },
  {
    id: "av",
    title: "AV-udstyr",
    href: "/av-udstyr",
    links: [
      { href: "/konferencepakke-150", label: "Konferencepakke 150" },
      { href: "/filmaften", label: "Filmaften-pakken" },
      { href: "/projektor", label: "Projektor" },
      { href: "/av-udstyr", label: "Se alt AV-udstyr" },
    ],
  },
];

/**
 * Hvilke pakker der bor på hvilken kategoriside. Menuen viser dem ikke længere,
 * så det her er kontrakten for at de stadig kan findes — en test kræver at hver
 * pakke med en egen side står på præcis én kategoriside.
 */
export const KATEGORI_PAKKER: Record<string, string[]> = {
  "/lej-hojtaler": [
    "pakke_fest_lille",
    "pakke_fest_stor",
    "pakke_fest_150",
    "pakke_fest_250",
    "pakke_bryllup",
    "pakke_firmafest",
    "pakke_udendors",
    "pakke_student",
  ],
  "/festlys": ["pakke_stemningslys"],
  "/karaoke": ["pakke_karaoke", "pakke_karaoke_fest"],
  "/av-udstyr": [
    "pakke_konference_150",
    "pakke_konference",
    "pakke_praesentation",
    "pakke_tale_musik",
    "pakke_filmaften",
  ],
};

/** Lejlighedspakkerne — vises under stigen på /lej-hojtaler */
export const LYD_LEJLIGHEDSPAKKER = ["pakke_bryllup", "pakke_firmafest", "pakke_udendors", "pakke_student"];

/** AV-pakkerne — vises samlet på /av-udstyr */
export const AV_PAKKER = [
  "pakke_konference_150",
  "pakke_konference",
  "pakke_praesentation",
  "pakke_tale_musik",
  "pakke_filmaften",
];

/* ───── Pakkestigen ─────
 *
 * Stigen er navngivet efter antal gæster, ikke efter grej: kunden ved hvor
 * mange der kommer, men ikke hvad 2× 12" EV betyder. Den bruges af
 * /lydanlaeg og er samtidig kontrakten mellem siden og kataloget — en test
 * låser at hvert trin peger på et produkt der findes, og at pakkeprisen er
 * lavere end delene hver for sig.
 *
 * Gæstetallene gælder INDENDØRS. Udendørs uden vægge halveres de, og det skal
 * stå på siden — ellers lover vi mere end anlægget kan.
 */
export interface LadderStep {
  /** Produkt-id i kataloget. null = for stor til hylden, kun tilbud. */
  productId: string | null;
  navn: string;
  gaester: string;
  /** Øvre grænse indendørs — bruges til at sortere og til at vælge trin */
  maxGaester: number;
  href: string;
  /** null = pris efter tilbud */
  pris: number | null;
  hvad: string;
  koersel: "tilvalg" | "anbefalet" | "tilbud";
}

/**
 * Hvilken pakke en anledningsside anbefaler. Før pegede siderne på et
 * enkeltprodukt — polterabend anbefalede en højtaler til 345 kr — og så bliver
 * ordren i den størrelse. En test låser at hver anledning har en pakke, og at
 * siden rent faktisk bruger den.
 */
export const OCCASION_PACKAGES: Record<string, string> = {
  bryllup: "pakke_bryllup",
  julefrokost: "pakke_firmafest",
  havefest: "pakke_udendors",
  polterabend: "pakke_udendors",
  studenterkoersel: "pakke_student",
  foedselsdag: "pakke_fest_stor",
  konfirmation: "pakke_fest_stor",
  nytaar: "pakke_fest_150",
};

export const LADDER_FEST: LadderStep[] = [
  { productId: "pakke_fest_lille", navn: "Festpakke 50", gaester: "op til 50", maxGaester: 50, href: "/festpakke-lille", pris: 495, hvad: '2× 10" højtalere + lyseffekt', koersel: "tilvalg" },
  { productId: "pakke_fest_stor", navn: "Festpakke 100", gaester: "50-100", maxGaester: 100, href: "/festpakke-stor", pris: 895, hvad: '2× 12" højtalere + lys-pakke', koersel: "tilvalg" },
  { productId: "pakke_fest_150", navn: "Festpakke 150", gaester: "100-150", maxGaester: 150, href: "/festpakke-150", pris: 1495, hvad: '2× 12" + sub + stativer + lys + røg', koersel: "anbefalet" },
  { productId: "pakke_fest_250", navn: "Festpakke 250", gaester: "150-250", maxGaester: 250, href: "/festpakke-250", pris: 2295, hvad: '4× 12" + 2 subs + stativer + lys + røg', koersel: "anbefalet" },
  { productId: null, navn: "Over 250 gæster", gaester: "250+", maxGaester: 9999, href: "/erhverv#tilbud", pris: null, hvad: "Større tops og subs skaffes — tekniker med på dagen", koersel: "tilbud" },
];

/** Pakkerne fra feststigen, i rækkefølge — det forsiden viser. Lejlighedspakkerne
 *  (bryllup, firmafest, udendørs …) hører til på deres egne sider, ikke i en
 *  grid med otte kort hvor ingen af dem bliver læst. */
export const FEST_LADDER_IDS: string[] = LADDER_FEST.map((t) => t.productId).filter(
  (id): id is string => id !== null,
);

export const LADDER_TALE: LadderStep[] = [
  { productId: "pakke_praesentation", navn: "Præsentation", gaester: "op til 50", maxGaester: 50, href: "/pakke-praesentation", pris: 695, hvad: "Projektor + lærred + mikrofon", koersel: "tilvalg" },
  { productId: "pakke_konference", navn: "Møde 100", gaester: "50-100", maxGaester: 100, href: "/pakke-konference", pris: 1195, hvad: '55" skærm + headset + 2× 10" højtalere', koersel: "tilvalg" },
  { productId: "pakke_konference_150", navn: "Konference 150", gaester: "100-150", maxGaester: 150, href: "/konferencepakke-150", pris: 1795, hvad: '2× 12" + stativer + Shure mic + headset + 55" skærm', koersel: "anbefalet" },
  { productId: null, navn: "Flere end to mikrofoner", gaester: "panel / hybrid", maxGaester: 9999, href: "/erhverv#tilbud", pris: null, hvad: "Mixer, panelmikrofoner og lyd til Teams/Zoom", koersel: "tilbud" },
];

/** Price multiplier by number of rental days — flat price regardless of duration */
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

/** Cheapest speaker price — use in meta tags, hero, etc. */
export function cheapestSpeakerPrice(list: Speaker[] = speakers): number {
  const visible = list.filter((s) => !s.hidden);
  return visible.length ? Math.min(...visible.map((s) => s.price)) : 0;
}

export const startPrice = cheapestSpeakerPrice();
