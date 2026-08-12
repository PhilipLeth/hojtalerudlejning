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
    product: "/images/product-thumpgo.png",
    mood: "/images/mood-party.png",
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
    product: "/images/product-party.png",
    mood: "/images/mood-party.png",
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
    product: "/images/product-soundboks.png",
    mood: "/images/mood-party.png",
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
    product: "/images/product-festival.png",
    mood: "/images/mood-festival.png",
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
  {
    id: "festival_bas",
    page: "/hojtalerpakke-bas",
    youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0",
    price: 695,
    product: "/images/product-festival-bas.png",
    mood: "/images/mood-festival.png",
    power: "kabel",
    sizeClass: "stor",
    weight: "2× 16 kg + 18 kg",
    contents: ['2× EV 12" højtalere', '12" aktiv subwoofer', "Stativ + topstang", "Bluetooth", "AUX + strømkabler", "USB-C / iPhone-adapter"],
    da: {
      name: "Stor højtalerpakke + bas",
      size: '2× 12" EV + sub',
      capacity: "50-100 pers.",
      desc: 'Det store sæt med subwoofer: to 12" EV-højtalere plus aktiv bas. Tryk på dansegulvet — spar 95 kr. mod at leje delene hver for sig.',
      extra: "Inkl. subwoofer, stativer og alle kabler.",
    },
    en: {
      name: "Large Speaker Package + Bass",
      size: '2× 12" EV + sub',
      capacity: "50-100 people",
      desc: 'The big rig with a subwoofer: two 12" EV speakers plus active bass. Punch on the dance floor — save 95 kr vs renting separately.',
      extra: "Incl. subwoofer, stands and all cables.",
    },
  },
];

export const addons: Addon[] = [
  {
    id: "lyseffekt",
    page: "/enkelt-lyseffekt",
    youtubeUrl: "https://www.youtube.com/watch?v=XhecuXfY0vo",
    price: 195,
    image: "/images/product-lyseffekt.png",
    contents: ["1× LED-par-lys (uden stativ)", "Strømkabel", "Automatiske farveeffekter"],
    da: { label: "Enkelt lyseffekt", desc: "1 LED-par-lys med farveeffekter — leveres uden stativ, plug and play" },
    en: { label: "Single light effect", desc: "1 LED par light with colour effects — comes without a stand, plug and play" },
  },
  {
    id: "lys",
    page: "/lys-pakke",
    youtubeUrl: "https://www.youtube.com/watch?v=FcOqGlPsyYY",
    price: 495,
    image: "/images/product-lys.png",
    contents: ["2× farvede LED-lamper", "Centereffekt", "Stativ", "Strøm + DMX/kabler"],
    da: { label: "Lys-pakke", desc: "2 farvede lamper + centereffekt på stativ" },
    en: { label: "Light package", desc: "2 coloured lamps + centre effect on stand" },
  },
  {
    id: "rog",
    page: "/roegmaskine",
    youtubeUrl: "https://www.youtube.com/watch?v=hQXFyo28Ndc",
    price: 245,
    image: "/images/product-rog.png",
    contents: ["Røgmaskine", "Røgvæske", "Strømkabel"],
    da: { label: "Røgmaskine", desc: "Kompakt røgmaskine inkl. røgvæske — gør lyset 10x federe" },
    en: { label: "Fog machine", desc: "Compact fog machine incl. fluid — makes the lights 10x better" },
  },
  {
    id: "subwoofer",
    page: "/subwoofer",
    youtubeUrl: "https://www.youtube.com/watch?v=C9J1G7KQIHA",
    price: 295,
    image: "/images/product-subwoofer-v2.png",
    contents: ["Behringer 12\" aktiv subwoofer", "Strømkabel", "Signalkabel til højtalere"],
    da: { label: "Subwoofer 12\"", desc: "Behringer 12\" aktiv sub — giver festen den dybe bas" },
    en: { label: "Subwoofer 12\"", desc: "Behringer 12\" powered sub — adds the deep bass" },
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
    youtubeUrl: "https://www.youtube.com/watch?v=ED_w3MHXjxk",
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
    id: "levering_opsaetning",
    price: 495,
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
  // Festpakke-bundles (lyd + lys) — ikke almindelige produkter; se BundleGrid.
  // Levering/opsætning er bevidst IKKE med i pakken — det kan tilvælges i booking.
  {
    id: "pakke_fest_lille",
    page: "/festpakke-lille",
    youtubeUrl: "https://www.youtube.com/watch?v=0VN2Q2bMufA",
    category: "lyd",
    price: 495,
    image: "/images/product-pakke-fest-lille.png",
    name_da: "Lille festpakke",
    name_en: "Small party package",
    desc_da: "Lille højtalerpakke + enkelt lyseffekt. Lyd og lys til op til 40 pers. — spar 95 kr.",
    desc_en: "Small speaker package + single light effect. Sound and lights for up to 40 people — save 90 DKK.",
    contents: ['2× Alto 10" højtalere', "1 LED-lyseffekt", "Bluetooth + alle kabler"],
    allowedAddons: ["subwoofer", "rog", "stativer", "mikrofon", "levering_opsaetning"],
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
    image: "/images/product-pakke-fest-stor.png",
    name_da: "Stor festpakke",
    name_en: "Large party package",
    desc_da: "Stor højtalerpakke + lys-pakke. Lyd og lys til op til 100 pers. — spar 95 kr.",
    desc_en: "Large speaker package + light package. Sound and lights for up to 100 people — save 190 DKK.",
    contents: ['2× EV 12" højtalere', "Lys-pakke (2 lamper + centereffekt)", "Bluetooth + alle kabler"],
    allowedAddons: ["subwoofer", "rog", "mikrofon", "levering_opsaetning"],
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
  { id: "discokugle", page: "/discokugle", youtubeUrl: "https://www.youtube.com/watch?v=okV56ZfjetM", category: "lys", price: 245, image: "/images/product-discokugle.png", name_da: "Discokugle", name_en: "Disco ball", desc_da: "Roterende discokugle med LED-lys og farver.", desc_en: "Rotating disco ball with LED lights.", contents: ["Discokugle m. motor", "LED-lys", "Stativ/ophæng", "Strømkabel"] },
  { id: "lyskaeder", page: "/lyskaeder", youtubeUrl: "https://www.youtube.com/watch?v=DLi7MQbRH8c", category: "lys", price: 195, image: "/images/product-lyskaeder.png", name_da: "Lyskæde varm hvid", name_en: "Fairy lights warm white", desc_da: "10m lyskæde med varmt hvidt lys — hyggelig festbelysning.", desc_en: "10m fairy lights with warm white light — cosy party lighting.", contents: ["10m lyskæde", "Varm hvide pærer", "Strømforsyning"] },
  { id: "lyskaeder_farvet", page: "/lyskaeder", youtubeUrl: "https://www.youtube.com/watch?v=DLi7MQbRH8c", category: "lys", price: 195, image: "/images/product-lyskaeder-farvet.png", name_da: "Lyskæde farvet", name_en: "Fairy lights coloured", desc_da: "10m lyskæde med farvede pærer — festlig stemning fra første sekund.", desc_en: "10m fairy lights with coloured bulbs — party mood instantly.", contents: ["10m lyskæde", "Farvede pærer", "Strømforsyning"] },
  { id: "uplight", page: "/uplights", category: "lys", price: 125, image: "/images/product-uplight.png", name_da: "Uplight", name_en: "Uplight", desc_da: "Simpel LED uplight på gulv — plug and play. Vasker vægge og hjørner i farvet lys.", desc_en: "Simple floor LED uplight — plug and play. Washes walls and corners in coloured light.", contents: ["1× LED uplight", "Strømkabel", "Automatiske farver"] },
  { id: "uplight_4", page: "/uplights", category: "lys", price: 395, image: "/images/product-uplight-4.png", name_da: "Uplight 4-pak", name_en: "Uplight 4-pack", desc_da: "4 simple LED uplights til vægge og hjørner — spar 105 kr vs enkeltvis.", desc_en: "4 simple LED uplights for walls and corners — save 105 DKK vs singles.", contents: ["4× LED uplight", "Strømkabler", "Plug and play"] },
  { id: "projektor", page: "/projektor", youtubeUrl: "https://www.youtube.com/watch?v=PfUdmfpiV6k", category: "av", price: 495, image: "/images/product-projektor.png", name_da: "Projektor", name_en: "Projector", desc_da: "Full HD projektor til præsentationer og film.", desc_en: "Full HD projector for presentations and film.", contents: ["Full HD projektor", "HDMI-kabel", "Strømkabel", "Fjernbetjening"] },
  { id: "skaerm_55", page: "/skaerm", youtubeUrl: "https://www.youtube.com/watch?v=wIsu3Lo5kK4", category: "av", price: 595, image: "/images/product-skaerm.png", name_da: '55" Storskærm', name_en: '55" Screen', desc_da: "55\" LED-skærm på 3-fod stativ — justerbar højde.", desc_en: '55" LED screen on tripod stand — adjustable height.', contents: ['55" LED-skærm', "3-fod stativ", "HDMI-kabel", "Strømkabel"] },
  { id: "skaerm_32", page: "/skaerm-32", youtubeUrl: "https://www.youtube.com/watch?v=wIsu3Lo5kK4", category: "av", price: 395, image: "/images/product-skaerm-32.png", name_da: '32" Skærm', name_en: '32" Screen', desc_da: "32\" LED-skærm på 3-fod stativ — kompakt og nem at flytte. Perfekt til karaoke.", desc_en: '32" LED screen on tripod stand — compact and easy to move. Perfect for karaoke.', contents: ['32" LED-skærm', "3-fod stativ", "HDMI-kabel", "Strømkabel"] },
  { id: "traadloes_mikrofon", page: "/traadloes-mikrofon", youtubeUrl: "https://www.youtube.com/watch?v=ED_w3MHXjxk", category: "av", price: 295, image: "/images/product-mikrofon.png", name_da: "Trådløs mikrofon", name_en: "Wireless mic", desc_da: "Trådløs håndholdt mikrofon til taler og karaoke.", desc_en: "Wireless handheld microphone for speeches and karaoke.", contents: ["Trådløs håndholdt mic", "Modtager", "Kabelforbindelse til højtaler"] },
  { id: "traadloes_mikrofon_pro", page: "/traadloes-mikrofon-pro", youtubeUrl: "https://www.youtube.com/watch?v=mnNM1npG_EM", category: "av", price: 495, image: "/images/product-mikrofon-pro.png", name_da: "Trådløs mikrofon PRO", name_en: "Wireless mic PRO", desc_da: "Shure BLX trådløs mikrofon — scenekvalitet til events og konferencer.", desc_en: "Shure BLX wireless microphone — stage quality for events and conferences.", contents: ["Shure trådløs håndholdt mic", "Shure modtager", "Kabelforbindelse til højtaler"] },
  { id: "headset", page: "/headset-mikrofon", youtubeUrl: "https://www.youtube.com/watch?v=mnNM1npG_EM", category: "av", price: 345, image: "/images/product-headset.png", name_da: "Trådløst headset", name_en: "Wireless headset", desc_da: "Headset-mikrofon til præsentationer.", desc_en: "Headset mic for presentations.", contents: ["Headset-mikrofon", "Bodypack + modtager", "Kabelforbindelse"] },
  { id: "headset_pro", page: "/headset-pro", youtubeUrl: "https://www.youtube.com/watch?v=mnNM1npG_EM", category: "av", price: 495, image: "/images/product-headset-pro.png", name_da: "Trådløst headset PRO", name_en: "Wireless headset PRO", desc_da: "Professionelt headset i broadcast-kvalitet — til konferencer og scener.", desc_en: "Professional broadcast-quality headset — for conferences and stages.", contents: ["PRO headset-mikrofon", "Bodypack + modtager", "Kabelforbindelse"] },
  { id: "haandholdt_mikrofon", page: "/haandholdt-mikrofon", youtubeUrl: "https://www.youtube.com/watch?v=4gssAwctUFQ", category: "av", price: 95, image: "/images/product-mikrofon-kabel.png", name_da: "Håndholdt mikrofon (kabel)", name_en: "Handheld microphone (wired)", desc_da: "Almindelig håndholdt mikrofon med kabel — til taler og sang.", desc_en: "Standard wired handheld microphone — for speeches and vocals.", contents: ["Håndholdt mic", "XLR/kabel"] },
  { id: "haandholdt_mikrofon_pro", page: "/haandholdt-mikrofon-pro", youtubeUrl: "https://www.youtube.com/watch?v=Y8CBYnicB5g", category: "av", price: 195, image: "/images/product-mikrofon-kabel-pro.png", name_da: "Håndholdt mikrofon PRO (kabel)", name_en: "Handheld microphone PRO (wired)", desc_da: "Shure Beta 58A med kabel — klassikeren til sang og taler.", desc_en: "Shure Beta 58A wired — the classic for vocals and speeches.", contents: ["Shure Beta 58A", "XLR/kabel"] },
  { id: "laerred_160", page: "/laerred-160", youtubeUrl: "https://www.youtube.com/watch?v=PLqEcB93Sac", category: "av", price: 195, image: "/images/product-laerred.png", name_da: "Lærred 160 cm", name_en: "Projector screen 160 cm", desc_da: "160 cm lærred på stativ — perfekt til projektor.", desc_en: "160 cm projector screen on stand.", contents: ["160 cm lærred", "Stativ"] },
  { id: "projektor_pro", page: "/projektor-pro", youtubeUrl: "https://www.youtube.com/watch?v=7FhRTCCKCm0", category: "av", price: 795, image: "/images/product-projektor-pro.png", name_da: "Projektor Pro (5000 lumen)", name_en: "Projector Pro (5000 lumen)", desc_da: "Kraftig 5000 lumen projektor — skarp selv i dagslys.", desc_en: "Powerful 5000 lumen projector — sharp even in daylight.", contents: ["5000 lumen projektor", "HDMI-kabel", "Strømkabel", "Fjernbetjening"] },
  { id: "pakke_praesentation", page: "/pakke-praesentation", youtubeUrl: "https://www.youtube.com/watch?v=PfUdmfpiV6k", category: "av", price: 695, image: "/images/product-projektor.png", name_da: "Præsentationspakken", name_en: "Presentation bundle", desc_da: "Projektor + lærred 160 cm + håndholdt mikrofon. Alt til præsentationen — spar 90 kr.", desc_en: "Projector + 160 cm screen + wired handheld mic. Everything for your presentation — save 90 kr.", contents: ["Full HD projektor", "Lærred 160 cm", "Håndholdt mic + kabel", "HDMI + strøm"], bundle: { discount: 90, usecase_da: "Alt til præsentationen — projektor, lærred og mikrofon.", usecase_en: "Everything for your presentation.", parts: [ { productId: "projektor", label_da: "Projektor", label_en: "Projector", price: 495 }, { productId: "laerred_160", label_da: "Lærred 160 cm", label_en: "Screen 160 cm", price: 195 }, { productId: "haandholdt_mikrofon", label_da: "Håndholdt mikrofon", label_en: "Wired mic", price: 95 } ] } },
  { id: "pakke_konference", page: "/pakke-konference", youtubeUrl: "https://www.youtube.com/watch?v=wIsu3Lo5kK4", category: "av", price: 1195, image: "/images/product-skaerm.png", name_da: "Konferencepakken", name_en: "Conference bundle", desc_da: "55\" storskærm + trådløst headset + lille højtalerpakke. Klar til konference — spar 140 kr.", desc_en: "55\" screen + wireless headset + small speaker package. Conference-ready — save 140 kr.", contents: ['55" skærm + stativ', "Trådløst headset", '2× 10" højtalere', "Kabler + adapter"], bundle: { discount: 140, usecase_da: "Klar til konference — skærm, headset og lyd.", usecase_en: "Conference-ready — screen, headset and sound.", parts: [ { productId: "skaerm_55", label_da: '55" Storskærm', label_en: '55" Screen', price: 595 }, { productId: "headset", label_da: "Trådløst headset", label_en: "Wireless headset", price: 345 }, { productId: "party", label_da: "Lille højtalerpakke", label_en: "Small speakers", price: 395 } ] } },
  { id: "pakke_tale_musik", page: "/pakke-tale-musik", youtubeUrl: "https://www.youtube.com/watch?v=h1nMZO7giU0", category: "av", price: 695, image: "/images/product-festival.png", name_da: "Tale & musik-pakken", name_en: "Speech & music bundle", desc_da: "Stor højtalerpakke + trådløs mikrofon. Taler og musik til events — spar 95 kr.", desc_en: "Large speaker package + wireless mic. Speeches and music for events — save 95 kr.", contents: ['2× 12" højtalere', "Trådløs mikrofon", "Alle kabler"], bundle: { discount: 95, usecase_da: "Taler og musik til events.", usecase_en: "Speeches and music for events.", parts: [ { productId: "festival", label_da: "Stor højtalerpakke", label_en: "Large speakers", price: 495 }, { productId: "traadloes_mikrofon", label_da: "Trådløs mikrofon", label_en: "Wireless mic", price: 295 } ] } },
  { id: "karaoke", page: "/karaoke-maskine", youtubeUrl: "https://www.youtube.com/watch?v=_UaBe_xR3JY", category: "av", price: 695, image: "/images/product-karaoke.png", name_da: "Karaokemaskine", name_en: "Karaoke machine", desc_da: "Singing Machine med indbygget skærm, 2 trådløse mikrofoner og festlys — tilslut TV via HDMI.", desc_en: "Singing Machine with built-in screen, 2 wireless mics and party lights — HDMI for your TV.", contents: ["Singing Machine karaoke-maskine", "2 trådløse mikrofoner", "Indbygget skærm + festlys", "HDMI-kabel + Bluetooth"] },
  {
    id: "pakke_karaoke",
    page: "/pakke-karaoke",
    youtubeUrl: "https://www.youtube.com/watch?v=_UaBe_xR3JY",
    category: "av",
    price: 1100,
    image: "/images/product-pakke-karaoke.png",
    name_da: "Karaokepakken",
    name_en: "Karaoke bundle",
    desc_da: "Karaokemaskine + 32\" skærm + lille højtalerpakke. Alt til karaoke op til 40 pers. — spar 385 kr.",
    desc_en: "Karaoke machine + 32\" screen + small speaker package. Everything for karaoke up to 40 people — save 385 kr.",
    contents: ["Singing Machine + 2 trådløse mikrofoner", '32" LED-skærm på 3-fod stativ', '2× Alto 10" højtalere', "HDMI + alle kabler"],
    allowedAddons: ["rog", "lyseffekt", "subwoofer", "stativer", "levering_opsaetning"],
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
    image: "/images/product-pakke-karaoke-fest.png",
    name_da: "Karaoke-festpakken",
    name_en: "Karaoke party bundle",
    desc_da: "Karaokemaskine + 55\" storskærm + store højtalere — karaoke til op til 100 pers. Spar 285 kr.",
    desc_en: "Karaoke machine + 55\" screen + large speakers — karaoke for up to 100 people. Save 285 kr.",
    contents: ["Singing Machine + 2 trådløse mikrofoner", '55" LED-skærm på 3-fod stativ', '2× 12" højtalere', "Alle kabler"],
    allowedAddons: ["rog", "lyseffekt", "lys", "subwoofer", "levering_opsaetning"],
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
  { id: "low_fog", page: "/roeg", youtubeUrl: "https://www.youtube.com/watch?v=GM_WsXv1FU4", category: "roeg", price: 295, image: "/images/product-lowfog.png", name_da: "Low fog-maskine (røggulv)", name_en: "Low fog machine (fog floor)", desc_da: "Laver et flot gulv af røg vha. is — 'dansen på skyer'-effekten fra bryllupper og musikvideoer.", desc_en: "Creates a floor of low-lying fog using ice — the 'dancing on clouds' effect.", contents: ["Low fog-maskine", "Røgvæske", "Is-bakke / instruks"] },
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
      { href: "/festpakke-lille", label: "Lille festpakke" },
      { href: "/festpakke-stor", label: "Stor festpakke" },
      { href: "/soundboks-4", label: "Soundboks 4" },
      { href: "/mackie-thump-go", label: "Mackie Thump GO" },
      { href: "/hojtalerpakke-lille", label: "Højtalerpakke lille" },
      { href: "/hojtalerpakke-normal", label: "Højtalerpakke normal" },
      { href: "/subwoofer", label: "Subwoofer 12\"" },
    ],
  },
  {
    id: "lys",
    title: "Lys & Effekter",
    href: "/festlys",
    links: [
      { href: "/enkelt-lyseffekt", label: "Enkelt lyseffekt" },
      { href: "/lys-pakke", label: "Lys-pakke" },
      { href: "/uplights", label: "Uplights" },
      { href: "/discokugle", label: "Discokugle" },
      { href: "/lyskaeder", label: "Lyskæder" },
    ],
  },
  {
    id: "karaoke",
    title: "Karaoke",
    href: "/karaoke",
    links: [
      { href: "/karaoke", label: "Karaoke & underholdning" },
      { href: "/karaoke-maskine", label: "Karaokemaskine" },
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
    id: "lejligheder",
    title: "Til din lejlighed",
    href: "/konfirmation",
    links: [
      { href: "/konfirmation", label: "Konfirmation" },
      { href: "/bryllup", label: "Bryllup" },
      { href: "/polterabend", label: "Polterabend" },
      { href: "/studenterkoersel", label: "Studenterkørsel" },
      { href: "/foedselsdag", label: "Fødselsdag" },
      { href: "/havefest", label: "Havefest" },
      { href: "/julefrokost", label: "Julefrokost" },
      { href: "/nytaar", label: "Nytårsfest" },
    ],
  },
  {
    id: "av",
    title: "AV-udstyr",
    href: "/av-udstyr",
    links: [
      { href: "/projektor", label: "Projektor" },
      { href: "/skaerm", label: 'Storskærm 55"' },
      { href: "/skaerm-32", label: 'Skærm 32"' },
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
