/* ───── Single source of truth for all product data ─────
 *
 * These arrays are the DEFAULT catalog (fallback/seed).
 * The live catalog can be overridden from /admin/produkter and is stored in
 * Cloudflare KV under "products_catalog" — served by GET /api/products.
 * Client components should read products via the useProducts() hook so
 * admin edits apply everywhere without a deploy.
 */

export type ProductCategory = "lyd" | "lys" | "av";
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
}

export const speakers: Speaker[] = [
  {
    id: "thumpgo",
    price: 350,
    product: "/images/product-thumpgo.svg",
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
    price: 399,
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
    price: 600,
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
    price: 700,
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
    price: 500,
    image: "/images/product-lys.png",
    da: { label: "Lys-pakke", desc: "2 farvede lamper + centereffekt på stativ" },
    en: { label: "Light package", desc: "2 coloured lamps + centre effect on stand" },
  },
  {
    id: "rog",
    price: 250,
    image: "/images/product-rog.png",
    da: { label: "Røgmaskine", desc: "Kompakt røgmaskine inkl. røgvæske — gør lyset 10x federe" },
    en: { label: "Fog machine", desc: "Compact fog machine incl. fluid — makes the lights 10x better" },
  },
  {
    id: "stativer",
    price: 100,
    image: "/images/product-stativer.png",
    da: { label: "Højtalerstativer", desc: "2 professionelle stativer — løfter lyden op i øjenhøjde" },
    en: { label: "Speaker stands", desc: "2 professional stands — lifts the sound to ear level" },
  },
  {
    id: "mikrofon",
    price: 300,
    image: "/images/product-mikrofon.png",
    da: { label: "Trådløs mikrofon", desc: "Professionel håndholdt mikrofon til taler og karaoke" },
    en: { label: "Wireless mic", desc: "Professional handheld mic for speeches and karaoke" },
  },
  {
    id: "batteri",
    price: 150,
    image: "/images/product-thumpgo.svg",
    da: { label: "Ekstra batteri", desc: "Ekstra batteri til batterihøjtaler — mere spilletid uden strøm" },
    en: { label: "Extra battery", desc: "Extra battery for battery speakers — more playtime without power" },
  },
  {
    id: "taske",
    price: 100,
    image: "/images/product-taske.png",
    da: { label: "Bæretaske", desc: "Polstret sportstaske til sikker transport på cykel eller i bil" },
    en: { label: "Carry bag", desc: "Padded sports bag for safe transport by bike or car" },
  },
  {
    id: "levering",
    price: 500,
    image: null,
    da: {
      label: "Levering + opsætning",
      desc: "Billig levering i hele København — vi bringer, sætter op og henter",
    },
    en: {
      label: "Delivery + setup",
      desc: "Cheap delivery across Copenhagen — we deliver, set up and collect",
    },
  },
];

/** Standalone rental products (lys, av) — bookable via /?product=ID#book */
export const rentalProducts: RentalProduct[] = [
  { id: "discokugle", category: "lys", price: 250, image: "/images/product-discokugle.png", name_da: "Discokugle", name_en: "Disco ball" },
  { id: "lyskaeder", category: "lys", price: 200, image: "/images/product-lyskaeder.svg", name_da: "Lyskæder", name_en: "Fairy lights" },
  { id: "projektor", category: "av", price: 500, image: "/images/product-projektor.png", name_da: "Projektor", name_en: "Projector" },
  { id: "skaerm_55", category: "av", price: 600, image: "/images/product-skaerm.png", name_da: '55" Storskærm', name_en: '55" Screen' },
  { id: "traadloes_mikrofon", category: "av", price: 300, image: "/images/product-mikrofon.png", name_da: "Trådløs mikrofon", name_en: "Wireless mic" },
  { id: "headset", category: "av", price: 350, image: "/images/product-headset.png", name_da: "Trådløst headset", name_en: "Wireless headset" },
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
