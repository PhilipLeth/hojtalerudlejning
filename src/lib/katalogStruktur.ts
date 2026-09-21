/**
 * Katalogets struktur, som prisarket inddeler det.
 *
 * Kilde: "LejHøjtaler Katalog.xlsx", Frederiks eget ark. Det deler udlejningen
 * i nummererede afsnit — 1. LYD, 2. LYS, 3. LYD OG LYS PAKKER, 4. STRØM,
 * 0. CHECKOUT — og hver ting hører i præcis én gruppe.
 *
 * Hvorfor det står her og ikke bare på siderne:
 *
 * /lydanlaeg lovede "vælg anlæg efter antal gæster" og viste Festpakker, hvor
 * en lysbar og en røgmaskine er en del af pakken. Kunden kom for at finde ud af,
 * hvor store højtalere der skal til 60 gæster, og fik et lysshow med i prisen.
 * Det er ikke en pakke for meget, det er et forkert svar på spørgsmålet.
 *
 * Med strukturen som data kan en test holde løftet: en side, der siger LYD, må
 * kun vise pakker, hvis dele ALLE hører til lyd. Skal der lys med, er det et
 * andet afsnit og en anden side. Se katalog-struktur.test.ts.
 */

export type KatalogKategori = "lyd" | "lys" | "roeg" | "lydlys" | "strom" | "av" | "service";

export interface KatalogGruppe {
  /** Arkets nummer, fx "1.2" */
  nr: string;
  titel: string;
  titel_en: string;
  /** Produkt-id'er i kataloget. Rækkefølgen er arkets. */
  ids: string[];
}

export interface KatalogAfsnit {
  id: KatalogKategori;
  /** Arkets nummer, fx "1" */
  nr: string;
  titel: string;
  titel_en: string;
  /** Kategorisiden, hvis afsnittet har én */
  side?: string;
  grupper: KatalogGruppe[];
}

export const KATALOG_AFSNIT: KatalogAfsnit[] = [
  {
    id: "lyd",
    nr: "1",
    titel: "Lyd",
    titel_en: "Sound",
    side: "/lydanlaeg",
    grupper: [
      {
        nr: "1.1",
        titel: "Højtalerpakker",
        titel_en: "Speaker packages",
        ids: ["party", "festival", "hojtaler_100"],
      },
      {
        nr: "1.2",
        titel: "Speakerpakker",
        titel_en: "Speech packages",
        ids: [
          "pakke_speaker_lille",
          "pakke_speaker_mik",
          "pakke_speaker_traadloes_lille",
          "pakke_speaker_traadloes_stor",
        ],
      },
      {
        nr: "1.3",
        titel: "Batterihøjtalere",
        titel_en: "Battery speakers",
        ids: ["soundboks", "thumpgo", "batteri"],
      },
      {
        nr: "1.4",
        titel: "DJ-udstyr",
        titel_en: "DJ equipment",
        ids: ["dj_pult", "x_stativ", "dj_stativ", "monitor", "dj_headphones", "dj_pakke_lille", "dj_pakke_mellem", "dj_pakke_stor"],
      },
      {
        nr: "1.5",
        titel: "Mikrofoner",
        titel_en: "Microphones",
        ids: [
          // Én linje pr. fysisk mikrofon, som i arket. Tilvalget og
          // udlejningsvaren var det samme og er lagt sammen, se SAMMENLAGTE_IDER.
          "mikrofon_kabel",
          "haandholdt_mikrofon_pro",
          "mikrofon",
          "traadloes_mikrofon_pro",
          "headset",
          "headset_pro",
          "mikrofonstativ",
        ],
      },
      {
        nr: "1.6",
        titel: "Tilbehør til lyd",
        titel_en: "Sound accessories",
        ids: ["subwoofer", "stativer", "stativ_enkelt", "mixer_lille", "mixer_stor", "mixer_xl", "taske"],
      },
    ],
  },
  {
    id: "lys",
    nr: "2",
    titel: "Lys",
    titel_en: "Lighting",
    side: "/festlys",
    grupper: [
      {
        nr: "2.1",
        titel: "Lyseffekter",
        titel_en: "Light effects",
        ids: ["uplight", "lyseffekt", "stroboskop", "foelgespot", "uv_lampe", "laser", "lysstativ"],
      },
      { nr: "2.2", titel: "Lyskæder", titel_en: "String lights", ids: ["lyskaeder", "lyskaeder_farvet"] },
      {
        nr: "2.3",
        titel: "Lyspakker",
        titel_en: "Light packages",
        ids: ["lys", "uplight_4", "scenelys", "pakke_festlys_50", "pakke_festlys_100", "pakke_stemningslys"],
      },
      {
        nr: "2.4",
        titel: "Diskokugler",
        titel_en: "Disco balls",
        ids: ["discokugle_30", "discokugle", "discokugle_guld"],
      },
    ],
  },
  {
    id: "roeg",
    nr: "2.5",
    titel: "Røg, sne og sæbebobler",
    titel_en: "Fog, snow and bubbles",
    side: "/roeg",
    grupper: [
      {
        nr: "2.5",
        titel: "Maskiner og væske",
        titel_en: "Machines and fluid",
        ids: ["rog", "low_fog", "snemaskine", "saebeboblemaskine", "roegvaeske", "snevaeske", "boblevaeske"],
      },
    ],
  },
  {
    id: "lydlys",
    nr: "3",
    titel: "Lyd og lys",
    titel_en: "Sound and light",
    side: "/lej-hojtaler",
    grupper: [
      {
        nr: "3",
        titel: "Lyd og lys-pakker",
        titel_en: "Sound and light packages",
        ids: [
          "pakke_elegant",
          "pakke_fest_lille",
          "pakke_fest_stor",
          "pakke_fest_100",
          "pakke_fest_150",
          "pakke_fest_250",
          "pakke_soundboks_lille",
          "pakke_soundboks_lys",
        ],
      },
    ],
  },
  {
    id: "strom",
    nr: "4",
    titel: "Strøm og forlængerledninger",
    titel_en: "Power and extension leads",
    grupper: [
      {
        nr: "4",
        titel: "Kabler og stikdåser",
        titel_en: "Cables and power strips",
        ids: ["kabeltromle", "kabeltromle_jord", "stikdaase", "stikdaase_jord", "omformer_udendors"],
      },
    ],
  },
  {
    id: "av",
    nr: "7",
    titel: "Billede og karaoke",
    titel_en: "Screens and karaoke",
    side: "/av-udstyr",
    grupper: [
      {
        nr: "7.1",
        titel: "Skærme og projektorer",
        titel_en: "Screens and projectors",
        ids: ["skaerm_55", "skaerm_32", "projektor", "projektor_pro", "laerred_160"],
      },
      { nr: "7.2", titel: "Karaoke", titel_en: "Karaoke", ids: ["karaoke"] },
    ],
  },
  {
    id: "service",
    nr: "0",
    titel: "Kørsel og bemanding",
    titel_en: "Delivery and crew",
    grupper: [
      {
        nr: "0",
        titel: "Vælges i checkout",
        titel_en: "Chosen at checkout",
        ids: [
          "levering_ud",
          "afhentning_retur",
          "levering_begge",
          "levering_begge_opsaetning",
          "lydmand",
          "dj_musikafvikler",
          "faktureringsgebyr",
        ],
      },
    ],
  },
];

/** id → afsnit. Bygget én gang, bruges af kategoriopslag og af testen. */
const AFSNIT_FOR_ID = new Map<string, KatalogAfsnit>();
for (const afsnit of KATALOG_AFSNIT) {
  for (const gruppe of afsnit.grupper) {
    for (const id of gruppe.ids) if (!AFSNIT_FOR_ID.has(id)) AFSNIT_FOR_ID.set(id, afsnit);
  }
}

/** Hvilket afsnit et produkt hører til, eller undefined hvis det mangler i arket. */
export function afsnitFor(id: string): KatalogAfsnit | undefined {
  return AFSNIT_FOR_ID.get(id);
}

/** Alle id'er strukturen kender. */
export function strukturensIder(): string[] {
  return [...AFSNIT_FOR_ID.keys()];
}

/**
 * Hvilke afsnit en pakkes dele trækker den ind i.
 *
 * En Festpakke består af en højtalerpakke og en lysbar, og den hører derfor til
 * i "lyd og lys" — ikke på en ren lydside. Pakker inde i pakker foldes ud, så
 * en DJ-pakke med lysbar også tæller som lys.
 */
export function deleAfsnit(
  id: string,
  pakkeDele: (id: string) => string[] | undefined,
  set = new Set<string>(),
  besøgt = new Set<string>(),
): Set<string> {
  if (besøgt.has(id)) return set;
  besøgt.add(id);
  const dele = pakkeDele(id);
  if (!dele?.length) {
    const a = afsnitFor(id);
    if (a) set.add(a.id);
    return set;
  }
  for (const del of dele) deleAfsnit(del, pakkeDele, set, besøgt);
  return set;
}
