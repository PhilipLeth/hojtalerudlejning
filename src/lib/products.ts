/* ───── Single source of truth for all product data ─────
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
  price: number;
  product: string;
  mood: string;
  power: PowerType;
  sizeClass: SizeClass;
  weight: string;
  hidden?: boolean;
  /** Addon IDs shown to the customer during booking. Undefined = show all. */
  allowedAddons?: string[];
  da: SpeakerText;
  en: SpeakerText;
}

export interface AddonText {
  label: string;
  desc: string;
}

export interface Addon {
  id: string;
  price: number;
  image: string | null;
  hidden?: boolean;
  da: AddonText;
  en: AddonText;
}

export interface RentalProduct {
  id: string;
  category: ProductCategory;
  price: number;
  image: string;
  name_da: string;
  name_en: string;
  desc_da?: string;
  desc_en?: string;
  hidden?: boolean;
  /** Addon IDs shown to the customer during booking. Undefined = show all. */
  allowedAddons?: string[];
}

export const speakers: Speaker[] = [
  {
    id: "thumpgo",
    price: 345,
    product: "/images/product-thumpgo.png",
    mood: "/images/mood-party.png",
    power: "batteri",
    sizeClass: "lille",
    weight: "10 kg",
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
    price: 395,
    product: "/images/product-party.png",
    mood: "/images/mood-party.png",
    power: "kabel",
    sizeClass: "lille",
    weight: "12 kg",
    da: {
      name: "Lille højtalerpakke",
      size: '2× 10" Alto',
      capacity: "Op til 40 pers.",
      desc: 'To kompakte 10" højtalere med Bluetooth. Vejer kun 12 kg — passer i bæretaske, klar til cyklen.',
      extra: "Inkl. bæretaske og alle kabler. Stativ kan tilkøbes.",
    },
    en: {
      name: "Small Speaker Package",
      size: '2× 10" Alto',
      capacity: "Up to 40 people",
      desc: 'Two compact 10" speakers with Bluetooth. Only 12 kg — fits in a carry bag, ready for your bike.',
      extra: "Incl. carry bag and all cables. Stands available as add-on.",
    },
  },
  {
    id: "soundboks",
    price: 595,
    product: "/images/product-soundboks.png",
    mood: "/images/mood-party.png",
    power: "batteri",
    sizeClass: "stor",
    weight: "11 kg",
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
    price: 695,
    product: "/images/product-festival.png",
    mood: "/images/mood-festival.png",
    power: "kabel",
    sizeClass: "stor",
    weight: "2× 16 kg",
    da: {
      name: "Stor højtalerpakke",
      size: '2× 12" EV',
      capacity: "40–100 pers.",
      desc: 'To kraftige 12" aktive højtalere med Bluetooth. Klar lyd til større rum og udendørs arrangementer.',
      extra: "Inkl. stativer og alle kabler som standard.",
    },
    en: {
      name: "Large Speaker Package",
      size: '2× 12" EV',
      capacity: "40–100 people",
      desc: 'Two powerful 12" active speakers with Bluetooth. Clear sound for larger rooms and outdoor events.',
      extra: "Incl. stands and all cables as standard.",
    },
  },
];

export const addons: Addon[] = [
  {
    id: "lys",
    price: 495,
    image: "/images/product-lys.png",
    da: { label: "Lys-pakke", desc: "2 farvede lamper + centereffekt på stativ" },
    en: { label: "Light package", desc: "2 coloured lamps + centre effect on stand" },
  },
  {
    id: "rog",
    price: 245,
    image: "/images/product-rog.png",
    da: { label: "Røgmaskine", desc: "Kompakt røgmaskine inkl. røgvæske — gør lyset 10x federe" },
    en: { label: "Fog machine", desc: "Compact fog machine incl. fluid — makes the lights 10x better" },
  },
  {
    id: "stativer",
    price: 95,
    image: "/images/product-stativer.png",
    da: { label: "Højtalerstativer", desc: "2 professionelle stativer — løfter lyden op i øjenhøjde" },
    en: { label: "Speaker stands", desc: "2 professional stands — lifts the sound to ear level" },
  },
  {
    id: "mikrofon",
    price: 295,
    image: "/images/product-mikrofon.png",
    da: { label: "Trådløs mikrofon", desc: "Professionel håndholdt mikrofon til taler og karaoke" },
    en: { label: "Wireless mic", desc: "Professional handheld mic for speeches and karaoke" },
  },
  {
    id: "batteri",
    price: 145,
    image: "/images/product-thumpgo.png",
    da: { label: "Ekstra batteri", desc: "Ekstra batteri til batterihøjtaler — mere spilletid uden strøm" },
    en: { label: "Extra battery", desc: "Extra battery for battery speakers — more playtime without power" },
  },
  {
    id: "taske",
    price: 95,
    image: "/images/product-taske.png",
    da: { label: "Bæretaske", desc: "Polstret sportstaske til sikker transport på cykel eller i bil" },
    en: { label: "Carry bag", desc: "Padded sports bag for safe transport by bike or car" },
  },
  {
    id: "levering",
    price: 495,
    image: null,
    da: {
      label: "Levering i København",
      desc: "Vi bringer udstyret ud og henter det igen efter festen",
    },
    en: {
      label: "Delivery in Copenhagen",
      desc: "We deliver the equipment and collect it again after the party",
    },
  },
  {
    id: "levering_opsaetning",
    price: 795,
    image: null,
    da: {
      label: "Levering + opsætning i København",
      desc: "Vi bringer, sætter alt op klar til brug og henter igen",
    },
    en: {
      label: "Delivery + setup in Copenhagen",
      desc: "We deliver, set everything up ready to use and collect again",
    },
  },
];

/** Standalone rental products (lys, av) — bookable via /?product=ID#book */
export const rentalProducts: RentalProduct[] = [
  { id: "discokugle", category: "lys", price: 245, image: "/images/product-discokugle.png", name_da: "Discokugle", name_en: "Disco ball", desc_da: "Roterende discokugle med LED-lys og farver.", desc_en: "Rotating disco ball with LED lights." },
  { id: "lyskaeder", category: "lys", price: 195, image: "/images/product-lyskaeder.png", name_da: "Lyskæder", name_en: "Fairy lights", desc_da: "10m lyskæde — varm hvid eller farvet.", desc_en: "10m fairy lights — warm white or coloured." },
  { id: "projektor", category: "av", price: 495, image: "/images/product-projektor.png", name_da: "Projektor", name_en: "Projector", desc_da: "Full HD projektor til præsentationer og film.", desc_en: "Full HD projector for presentations and film." },
  { id: "skaerm_55", category: "av", price: 595, image: "/images/product-skaerm.png", name_da: '55" Storskærm', name_en: '55" Screen', desc_da: "55\" LED-skærm på gulvstativ.", desc_en: '55" LED screen on floor stand.' },
  { id: "traadloes_mikrofon", category: "av", price: 295, image: "/images/product-mikrofon.png", name_da: "Trådløs mikrofon", name_en: "Wireless mic", desc_da: "Professionel håndholdt mikrofon.", desc_en: "Professional handheld microphone." },
  { id: "headset", category: "av", price: 345, image: "/images/product-headset.png", name_da: "Trådløst headset", name_en: "Wireless headset", desc_da: "Headset-mikrofon til præsentationer.", desc_en: "Headset mic for presentations." },
  { id: "headset_pro", category: "av", price: 495, image: "/images/product-headset.png", name_da: "Trådløst headset PRO", name_en: "Wireless headset PRO", desc_da: "Professionelt headset i broadcast-kvalitet — til konferencer og scener.", desc_en: "Professional broadcast-quality headset — for conferences and stages." },
  { id: "haandholdt_mikrofon", category: "av", price: 95, image: "/images/product-mikrofon.png", name_da: "Håndholdt mikrofon (kabel)", name_en: "Handheld microphone (wired)", desc_da: "Almindelig håndholdt mikrofon med kabel — til taler og sang.", desc_en: "Standard wired handheld microphone — for speeches and vocals." },
  { id: "laerred_160", category: "av", price: 195, image: "/images/product-laerred.png", name_da: "Lærred 160 cm", name_en: "Projector screen 160 cm", desc_da: "160 cm lærred på stativ — perfekt til projektor.", desc_en: "160 cm projector screen on stand." },
  { id: "projektor_pro", category: "av", price: 795, image: "/images/product-projektor.png", name_da: "Projektor Pro (5000 lumen)", name_en: "Projector Pro (5000 lumen)", desc_da: "Kraftig 5000 lumen projektor — skarp selv i dagslys.", desc_en: "Powerful 5000 lumen projector — sharp even in daylight." },
  { id: "pakke_praesentation", category: "av", price: 695, image: "/images/product-projektor.png", name_da: "Præsentationspakken", name_en: "Presentation bundle", desc_da: "Projektor + lærred 160 cm + håndholdt mikrofon. Alt til præsentationen — spar 90 kr.", desc_en: "Projector + 160 cm screen + wired handheld mic. Everything for your presentation — save 90 kr." },
  { id: "pakke_konference", category: "av", price: 1195, image: "/images/product-skaerm.png", name_da: "Konferencepakken", name_en: "Conference bundle", desc_da: "55\" storskærm + trådløst headset + lille højtalerpakke. Klar til konference — spar 140 kr.", desc_en: "55\" screen + wireless headset + small speaker package. Conference-ready — save 140 kr." },
  { id: "pakke_tale_musik", category: "av", price: 895, image: "/images/product-festival.png", name_da: "Tale & musik-pakken", name_en: "Speech & music bundle", desc_da: "Stor højtalerpakke + trådløs mikrofon. Taler og musik til events — spar 95 kr.", desc_en: "Large speaker package + wireless mic. Speeches and music for events — save 95 kr." },
  { id: "low_fog", category: "roeg", price: 295, hidden: true, image: "/images/product-lowfog.png", name_da: "Low fog-maskine (røggulv)", name_en: "Low fog machine (fog floor)", desc_da: "Laver et flot gulv af røg vha. is — 'dansen på skyer'-effekten fra bryllupper og musikvideoer.", desc_en: "Creates a floor of low-lying fog using ice — the 'dancing on clouds' effect." },
];

/** Navigation categories — single source of truth used by BurgerMenu and admin */
export interface NavLink { href: string; label: string }
export interface NavCategory { id: string; title: string; href: string; links: NavLink[] }

export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: "lyd",
    title: "Lyd & Højtalere",
    href: "/lej-hojtaler",
    links: [
      { href: "/soundboks-4", label: "Soundboks 4" },
      { href: "/mackie-thump-go", label: "Mackie Thump GO" },
      { href: "/hojtalerpakke-lille", label: "Højtalerpakke lille" },
      { href: "/hojtalerpakke-normal", label: "Højtalerpakke normal" },
    ],
  },
  {
    id: "lys",
    title: "Lys & Effekter",
    href: "/festlys",
    links: [
      { href: "/festlys", label: "Festlys & lysbar" },
      { href: "/discokugle", label: "Discokugle" },
      { href: "/lyskaeder", label: "Lyskæder" },
    ],
  },
  {
    id: "roeg",
    title: "Røg",
    href: "/roeg",
    links: [
      { href: "/roeg", label: "Røg til fest" },
      { href: "/roegmaskine", label: "Røgmaskine" },
    ],
  },
  {
    id: "av",
    title: "AV-udstyr",
    href: "/av-udstyr",
    links: [
      { href: "/projektor", label: "Projektor" },
      { href: "/skaerm", label: "Storskærm" },
      { href: "/traadloes-mikrofon", label: "Trådløs mikrofon" },
      { href: "/headset-mikrofon", label: "Headset-mikrofon" },
    ],
  },
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
