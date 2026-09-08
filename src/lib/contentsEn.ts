import type { Locale } from "@/lib/i18n";

/**
 * Pakkelisten på engelsk.
 *
 * `contents` findes kun på dansk i kataloget, og listen bruges to steder på
 * de engelske sider: hover-panelet på produktkortene (CategoryProductGrid) og
 * svaret på "What is included when I rent …" (productFaq.ts). Begge steder
 * stod der dansk midt i en engelsk sætning — "Wireless microphone comes with
 * Trådløs håndholdt mic, Modtager og Kabelforbindelse til højtaler".
 *
 * Løsningen er en ORDBOG og ikke et `contents_en`-felt på hvert produkt, af
 * to grunde:
 *
 *  1. Kataloget kan overskrives fra /admin og bor i KV. Et nyt felt i
 *     products.ts ville aldrig nå frem på en installation, hvor KV allerede
 *     har et katalog — se mergeRentals i useProducts.ts, der netop findes
 *     for at lappe den slags huller.
 *  2. Ordforrådet er lille og gentager sig selv: "Strømkabel" står i tolv
 *     pakker. Oversat ét sted kan de tolv ikke drive fra hinanden.
 *
 * Ord, der ikke står her, falder tilbage til dansk. Det er med vilje — en
 * teknisk delnavn på dansk er bedre end ingen linje — men
 * pakkeliste-engelsk.test.ts fejler, hvis et produkt i products.ts bruger et
 * ord, ordbogen ikke kender, så nye produkter ikke stille og roligt gør
 * listen dansk igen.
 */
export const CONTENTS_EN: Record<string, string> = {
  // Højtalere og lyd
  '2× Alto 10" højtalere': '2× Alto 10" speakers',
  '2× EV 12" højtalere': '2× EV 12" speakers',
  '2× EV 12" højtalere + stativer': '2× EV 12" speakers + stands',
  '4× EV 12" højtalere': '4× EV 12" speakers',
  '2× 10" højtalere': '2× 10" speakers',
  '2× 12" højtalere': '2× 12" speakers',
  '12" subwoofer': '12" subwoofer',
  '2× 12" subwoofer': '2× 12" subwoofer',
  'Behringer 12" aktiv subwoofer': 'Behringer 12" powered subwoofer',
  'Mackie Thump GO 8"': 'Mackie Thump GO 8"',
  "Soundboks 4": "Soundboks 4",
  "Soundboks 4 (batteri)": "Soundboks 4 (battery)",
  "Højtalerstativer": "Speaker stands",
  "Stativer": "Stands",
  "2 sæt stativer": "2 sets of stands",
  "Stativ": "Stand",
  "3-fod stativ": "Tripod stand",
  "Ekstra batteri": "Spare battery",
  "Polstret bæretaske": "Padded carry bag",
  "Oplader": "Charger",
  "Bluetooth": "Bluetooth",

  // Mixere
  "4-kanals minimixer": "4-channel mini mixer",
  "Yamaha-mixer med indbyggede effekter": "Yamaha mixer with built-in effects",

  // Mikrofoner
  "Trådløs mikrofon": "Wireless microphone",
  "Trådløs mikrofon til talerne": "Wireless microphone for the speeches",
  "Trådløs håndholdt mic": "Wireless handheld mic",
  "Shure trådløs håndholdt mic": "Shure wireless handheld mic",
  "Shure trådløs mikrofon PRO": "Shure wireless microphone PRO",
  "Shure modtager": "Shure receiver",
  "Shure Beta 58A": "Shure Beta 58A",
  "Håndholdt mic": "Handheld mic",
  "Håndholdt mic + kabel": "Handheld mic + cable",
  "Håndholdt mikrofon med kabel": "Wired handheld microphone",
  "2 trådløse mikrofoner": "2 wireless microphones",
  "Headset-mikrofon": "Headset microphone",
  "PRO headset-mikrofon": "PRO headset microphone",
  "Trådløst headset": "Wireless headset",
  "Bodypack + modtager": "Bodypack + receiver",
  "Modtager": "Receiver",

  // Lys
  "1 LED-lyseffekt": "1 LED light effect",
  "2× LED-lyseffekt": "2× LED light effect",
  "2× farvet LED-lyseffekt": "2× coloured LED light effect",
  "2× farvede LED-lamper": "2× coloured LED lamps",
  "2× farvede LED-lamper + centereffekt på stativ": "2× coloured LED lamps + centre effect on a stand",
  "1× LED-par-lys (uden stativ)": "1× LED par light (no stand)",
  "Ekstra LED-par-lys": "Extra LED par light",
  "LED-par-lys med automatiske farveeffekter": "LED par light with automatic colour effects",
  "Centereffekt": "Centre effect",
  "Lys-pakke": "Light package",
  "Lys-pakke (2 lamper + centereffekt)": "Light package (2 lamps + centre effect)",
  "1× LED uplight": "1× LED uplight",
  "4× LED uplight": "4× LED uplight",
  "4× LED uplight til vægge og hjørner": "4× LED uplight for walls and corners",
  "Automatiske farver": "Automatic colours",
  "Automatiske farveeffekter": "Automatic colour effects",
  "LED-spot": "LED spotlight",
  "Motor": "Motor",
  "Discokugle 30 cm": "Disco ball 30 cm",
  "Discokugle 40 cm": "Disco ball 40 cm",
  "Discokugle 30 cm med motor og spot": "Disco ball 30 cm with motor and spotlight",
  "Discokugle 40 cm med motor og spot": "Disco ball 40 cm with motor and spotlight",
  "Discokugle med motor og spot": "Disco ball with motor and spotlight",
  "Stativ/ophæng": "Stand or hanging kit",
  "Stativ/ophæng til kuglen": "Stand or hanging kit for the ball",
  "10 m lyskæde": "10 m fairy lights",
  "10m lyskæde": "10 m fairy lights",
  "10 m lyskæde varm hvid": "10 m fairy lights, warm white",
  "10 m lyskæde farvet": "10 m fairy lights, coloured",
  "10 m farvet lyskæde": "10 m coloured fairy lights",
  "Varm hvide pærer": "Warm white bulbs",
  "Farvede pærer": "Coloured bulbs",
  "Indbygget skærm + festlys": "Built-in screen + party lights",

  // Røg
  "Røgmaskine": "Fog machine",
  "Røgmaskine + væske": "Fog machine + fluid",
  "Røgmaskine med væske": "Fog machine with fluid",
  "Røgvæske": "Fog fluid",
  "Low fog-maskine": "Low fog machine",
  "Low fog-maskine (røggulv)": "Low fog machine (fog floor)",
  "Low fog-maskine med væske og is-instruks": "Low fog machine with fluid and ice instructions",
  "Is-bakke / instruks": "Ice tray / instructions",

  // Skærm, projektor og lærred
  "Full HD projektor": "Full HD projector",
  "5000 lumen projektor": "5000 lumen projector",
  '32" LED-skærm': '32" LED screen',
  '55" LED-skærm': '55" LED screen',
  '32" LED-skærm på 3-fod stativ': '32" LED screen on a tripod stand',
  '55" LED-skærm på 3-fod stativ': '55" LED screen on a tripod stand',
  '55" skærm + stativ': '55" screen + stand',
  '55" skærm på stativ': '55" screen on a stand',
  "160 cm lærred": "160 cm projector screen",
  "Lærred 160 cm": "160 cm projector screen",
  "Lærred 160 cm på stativ": "160 cm projector screen on a stand",
  "Fjernbetjening": "Remote control",

  // Karaoke
  "Singing Machine karaoke-maskine": "Singing Machine karaoke machine",
  "Singing Machine + 2 trådløse mikrofoner": "Singing Machine + 2 wireless microphones",

  // Kabler og strøm
  "Alle kabler": "All cables",
  "Alle kabler + strøm": "All cables + power",
  "Bluetooth + alle kabler": "Bluetooth + all cables",
  "HDMI + alle kabler": "HDMI + all cables",
  "HDMI + strøm": "HDMI + power",
  "HDMI-kabel": "HDMI cable",
  "HDMI-kabel + Bluetooth": "HDMI cable + Bluetooth",
  "AUX-kabel": "AUX cable",
  "AUX + strømkabler": "AUX + power cables",
  "Oplader + AUX-kabel": "Charger + AUX cable",
  "Kabel til højtaler": "Cable to the speaker",
  "Kabler til højtaler": "Cables to the speaker",
  "Kabelforbindelse": "Cable connection",
  "Kabelforbindelse til højtaler": "Cable connection to the speaker",
  "Kabler + adapter": "Cables + adapter",
  "Signalkabel til højtalere": "Signal cable to the speakers",
  "Stativer og kabler": "Stands and cables",
  "Strøm og kabler": "Power and cables",
  "Strøm + DMX/kabler": "Power + DMX cables",
  "Strømkabel": "Power cable",
  "Strømkabler": "Power cables",
  "Strømforsyning": "Power supply",
  "XLR/kabel": "XLR cable",
  "USB-C / iPhone-adapter": "USB-C / iPhone adapter",
  "Plug and play": "Plug and play",
};

/**
 * Pakkelisten på sidens sprog.
 *
 * Ukendte linjer beholder deres danske ordlyd — en teknisk delbetegnelse er
 * stadig oplysning, og et tomt punkt er ikke.
 */
export function contentsFor(contents: string[] | undefined, locale: Locale): string[] {
  if (!contents?.length) return [];
  if (locale !== "en") return contents;
  return contents.map((c) => CONTENTS_EN[c] ?? c);
}
