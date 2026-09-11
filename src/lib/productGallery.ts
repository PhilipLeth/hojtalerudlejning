/* GENERERET FIL — ret den ikke i hånden.
 *
 * Skrives af scripts/product-images/generate.mjs ud fra gallery/scenes.json og
 * de billeder, der faktisk ligger i public/images/gallery/. Kør scriptet igen
 * efter en ny generering:
 *
 *   node scripts/product-images/generate.mjs --manifest
 *
 * Alle billeder her er AI-genererede med vores egne produktfotos som reference.
 * De vises med en mærkat i galleriet — se ProductGallery.tsx og
 * produktgalleri.test.tsx, som fejler hvis mærkaten forsvinder.
 */

export interface GalleryImage {
  /** 1600px WebP — med indholdshash som ?v=, så CDN'et slipper det gamle billede ved en ny generering */
  src: string;
  /** 400px WebP til gitteret */
  thumb: string;
  /** Scene-id fra gallery/scenes.json */
  scene: string;
  /** Billedforhold, fx "16:9" — bruges til at reservere pladsen før billedet er hentet */
  ratio: string;
  titel_da: string;
  titel_en: string;
  alt_da: string;
  alt_en: string;
  caption_da: string;
  caption_en: string;
}

export const PRODUCT_GALLERY: Record<string, GalleryImage[]> = {
  "discokugle": [
    {
      "src": "/images/gallery/discokugle/hvad_du_faar.webp?v=ddf17aca",
      "thumb": "/images/gallery/discokugle/hvad_du_faar-400.webp?v=71067131",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Discokugle 40 cm med alt hvad der følger med",
      "alt_en": "Disco ball 40 cm with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Discokugle 40 cm.",
      "caption_en": "This is what comes along when you rent Disco ball 40 cm."
    },
    {
      "src": "/images/gallery/discokugle/i_brug.webp?v=e2bd73f3",
      "thumb": "/images/gallery/discokugle/i_brug-400.webp?v=9f5a234d",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Discokugle 40 cm sat op og i brug",
      "alt_en": "Disco ball 40 cm set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/discokugle/opstilling.webp?v=fce1bb61",
      "thumb": "/images/gallery/discokugle/opstilling-400.webp?v=850b0c9c",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Discokugle 40 cm tæt på",
      "alt_en": "Disco ball 40 cm up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "discokugle_30": [
    {
      "src": "/images/gallery/discokugle_30/hvad_du_faar.webp?v=911181b7",
      "thumb": "/images/gallery/discokugle_30/hvad_du_faar-400.webp?v=c9d11de1",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Discokugle 30 cm med alt hvad der følger med",
      "alt_en": "Disco ball 30 cm with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Discokugle 30 cm.",
      "caption_en": "This is what comes along when you rent Disco ball 30 cm."
    },
    {
      "src": "/images/gallery/discokugle_30/i_brug.webp?v=85897e29",
      "thumb": "/images/gallery/discokugle_30/i_brug-400.webp?v=9c58f208",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Discokugle 30 cm sat op og i brug",
      "alt_en": "Disco ball 30 cm set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/discokugle_30/opstilling.webp?v=78e297e7",
      "thumb": "/images/gallery/discokugle_30/opstilling-400.webp?v=2b67ea36",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Discokugle 30 cm tæt på",
      "alt_en": "Disco ball 30 cm up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "festival": [
    {
      "src": "/images/gallery/festival/hvad_du_faar.webp?v=3fa26d5c",
      "thumb": "/images/gallery/festival/hvad_du_faar-400.webp?v=c7dc29e0",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Stor højtalerpakke med alt hvad der følger med",
      "alt_en": "Large Speaker Package with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Stor højtalerpakke.",
      "caption_en": "This is what comes along when you rent Large Speaker Package."
    },
    {
      "src": "/images/gallery/festival/i_brug.webp?v=a80b4384",
      "thumb": "/images/gallery/festival/i_brug-400.webp?v=820e3782",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Stor højtalerpakke sat op og i brug",
      "alt_en": "Large Speaker Package set up and in use",
      "caption_da": "30-50 personer indendørs — udendørs uden vægge, regn med det halve.",
      "caption_en": "30-50 people indoors — outdoors without walls, expect half that."
    },
    {
      "src": "/images/gallery/festival/opstilling.webp?v=36c8c386",
      "thumb": "/images/gallery/festival/opstilling-400.webp?v=a7f800ab",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Stor højtalerpakke tæt på",
      "alt_en": "Large Speaker Package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "hojtaler_100": [
    {
      "src": "/images/gallery/hojtaler_100/hvad_du_faar.webp?v=6aa66711",
      "thumb": "/images/gallery/hojtaler_100/hvad_du_faar-400.webp?v=baa6c996",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Højtalerpakke 100 med alt hvad der følger med",
      "alt_en": "Speaker package 100 with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Højtalerpakke 100.",
      "caption_en": "This is what comes along when you rent Speaker package 100."
    },
    {
      "src": "/images/gallery/hojtaler_100/i_brug.webp?v=a02d57b0",
      "thumb": "/images/gallery/hojtaler_100/i_brug-400.webp?v=a7ff27d5",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Højtalerpakke 100 sat op og i brug",
      "alt_en": "Speaker package 100 set up and in use",
      "caption_da": "50-100 personer indendørs — udendørs uden vægge, regn med det halve.",
      "caption_en": "50-100 people indoors — outdoors without walls, expect half that."
    },
    {
      "src": "/images/gallery/hojtaler_100/opstilling.webp?v=cd6be415",
      "thumb": "/images/gallery/hojtaler_100/opstilling-400.webp?v=e699194e",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Højtalerpakke 100 tæt på",
      "alt_en": "Speaker package 100 up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "lys": [
    {
      "src": "/images/gallery/lys/hvad_du_faar.webp?v=1306275f",
      "thumb": "/images/gallery/lys/hvad_du_faar-400.webp?v=50889b40",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Lys-pakke med alt hvad der følger med",
      "alt_en": "Light package with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Lys-pakke.",
      "caption_en": "This is what comes along when you rent Light package."
    },
    {
      "src": "/images/gallery/lys/i_brug.webp?v=3a15a325",
      "thumb": "/images/gallery/lys/i_brug-400.webp?v=f57ab482",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Lys-pakke sat op og i brug",
      "alt_en": "Light package set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/lys/opstilling.webp?v=a091bac5",
      "thumb": "/images/gallery/lys/opstilling-400.webp?v=1da6d43f",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Lys-pakke tæt på",
      "alt_en": "Light package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "lyseffekt": [
    {
      "src": "/images/gallery/lyseffekt/hvad_du_faar.webp?v=ab2edf4f",
      "thumb": "/images/gallery/lyseffekt/hvad_du_faar-400.webp?v=4b3f45ce",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Enkelt lyseffekt med alt hvad der følger med",
      "alt_en": "Single light effect with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Enkelt lyseffekt.",
      "caption_en": "This is what comes along when you rent Single light effect."
    },
    {
      "src": "/images/gallery/lyseffekt/i_brug.webp?v=e0d5adc0",
      "thumb": "/images/gallery/lyseffekt/i_brug-400.webp?v=1f7f92af",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Enkelt lyseffekt sat op og i brug",
      "alt_en": "Single light effect set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/lyseffekt/opstilling.webp?v=f269f66e",
      "thumb": "/images/gallery/lyseffekt/opstilling-400.webp?v=92cefb77",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Enkelt lyseffekt tæt på",
      "alt_en": "Single light effect up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "lyskaeder": [
    {
      "src": "/images/gallery/lyskaeder/hvad_du_faar.webp?v=c1da156a",
      "thumb": "/images/gallery/lyskaeder/hvad_du_faar-400.webp?v=79acfc6d",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Lyskæde varm hvid med alt hvad der følger med",
      "alt_en": "Fairy lights warm white with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Lyskæde varm hvid.",
      "caption_en": "This is what comes along when you rent Fairy lights warm white."
    },
    {
      "src": "/images/gallery/lyskaeder/i_brug.webp?v=c3e3fae1",
      "thumb": "/images/gallery/lyskaeder/i_brug-400.webp?v=592e834f",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Lyskæde varm hvid sat op og i brug",
      "alt_en": "Fairy lights warm white set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/lyskaeder/opstilling.webp?v=1d564841",
      "thumb": "/images/gallery/lyskaeder/opstilling-400.webp?v=b64b52b3",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Lyskæde varm hvid tæt på",
      "alt_en": "Fairy lights warm white up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "lyskaeder_farvet": [
    {
      "src": "/images/gallery/lyskaeder_farvet/hvad_du_faar.webp?v=730bc083",
      "thumb": "/images/gallery/lyskaeder_farvet/hvad_du_faar-400.webp?v=eee2d9b1",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Lyskæde farvet med alt hvad der følger med",
      "alt_en": "Fairy lights coloured with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Lyskæde farvet.",
      "caption_en": "This is what comes along when you rent Fairy lights coloured."
    },
    {
      "src": "/images/gallery/lyskaeder_farvet/i_brug.webp?v=c074b708",
      "thumb": "/images/gallery/lyskaeder_farvet/i_brug-400.webp?v=787d4c3b",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Lyskæde farvet sat op og i brug",
      "alt_en": "Fairy lights coloured set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/lyskaeder_farvet/opstilling.webp?v=e0350101",
      "thumb": "/images/gallery/lyskaeder_farvet/opstilling-400.webp?v=bbe68c4d",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Lyskæde farvet tæt på",
      "alt_en": "Fairy lights coloured up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "mixer_lille": [
    {
      "src": "/images/gallery/mixer_lille/hvad_du_faar.webp?v=71badc4a",
      "thumb": "/images/gallery/mixer_lille/hvad_du_faar-400.webp?v=2aa6171d",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Mixer lille med alt hvad der følger med",
      "alt_en": "Small mixer with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Mixer lille.",
      "caption_en": "This is what comes along when you rent Small mixer."
    },
    {
      "src": "/images/gallery/mixer_lille/i_brug.webp?v=0d00f178",
      "thumb": "/images/gallery/mixer_lille/i_brug-400.webp?v=4f81a84e",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Mixer lille sat op og i brug",
      "alt_en": "Small mixer set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/mixer_lille/opstilling.webp?v=e38484f4",
      "thumb": "/images/gallery/mixer_lille/opstilling-400.webp?v=2e91dc66",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Mixer lille tæt på",
      "alt_en": "Small mixer up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "mixer_stor": [
    {
      "src": "/images/gallery/mixer_stor/hvad_du_faar.webp?v=023bb6ad",
      "thumb": "/images/gallery/mixer_stor/hvad_du_faar-400.webp?v=f6b29141",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Mixer stor med alt hvad der følger med",
      "alt_en": "Large mixer with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Mixer stor.",
      "caption_en": "This is what comes along when you rent Large mixer."
    },
    {
      "src": "/images/gallery/mixer_stor/i_brug.webp?v=6fc95cee",
      "thumb": "/images/gallery/mixer_stor/i_brug-400.webp?v=b96f0fe9",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Mixer stor sat op og i brug",
      "alt_en": "Large mixer set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/mixer_stor/opstilling.webp?v=1408e031",
      "thumb": "/images/gallery/mixer_stor/opstilling-400.webp?v=cc7d0925",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Mixer stor tæt på",
      "alt_en": "Large mixer up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_bryllup": [
    {
      "src": "/images/gallery/pakke_bryllup/komposition.webp?v=b6488293",
      "thumb": "/images/gallery/pakke_bryllup/komposition-400.webp?v=6b26d1ae",
      "scene": "komposition",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Bryllupspakke — alle dele stillet op sammen",
      "alt_en": "Wedding package — every part laid out together",
      "caption_da": "Det her er hvad der står i bilen, når du henter Bryllupspakke.",
      "caption_en": "This is what goes in the car when you pick up Wedding package."
    },
    {
      "src": "/images/gallery/pakke_bryllup/i_brug.webp?v=c767f392",
      "thumb": "/images/gallery/pakke_bryllup/i_brug-400.webp?v=7f6c34a3",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Bryllupspakke sat op og i brug",
      "alt_en": "Wedding package set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/pakke_bryllup/opstilling.webp?v=eded84e5",
      "thumb": "/images/gallery/pakke_bryllup/opstilling-400.webp?v=abf49fa8",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Bryllupspakke tæt på",
      "alt_en": "Wedding package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_bryllupslys": [
    {
      "src": "/images/gallery/pakke_bryllupslys/i_brug.webp?v=7aee1b9c",
      "thumb": "/images/gallery/pakke_bryllupslys/i_brug-400.webp?v=432cbfd9",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Bryllupslys-pakken sat op og i brug",
      "alt_en": "Wedding light package set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/pakke_bryllupslys/opstilling.webp?v=c849b3e5",
      "thumb": "/images/gallery/pakke_bryllupslys/opstilling-400.webp?v=60647184",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Bryllupslys-pakken tæt på",
      "alt_en": "Wedding light package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_diskolys": [
    {
      "src": "/images/gallery/pakke_diskolys/komposition.webp?v=4da3b791",
      "thumb": "/images/gallery/pakke_diskolys/komposition-400.webp?v=4bddfe1f",
      "scene": "komposition",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Diskolys-pakken — alle dele stillet op sammen",
      "alt_en": "Disco light package — every part laid out together",
      "caption_da": "Det her er hvad der står i bilen, når du henter Diskolys-pakken.",
      "caption_en": "This is what goes in the car when you pick up Disco light package."
    },
    {
      "src": "/images/gallery/pakke_diskolys/i_brug.webp?v=f8f723b0",
      "thumb": "/images/gallery/pakke_diskolys/i_brug-400.webp?v=05c94130",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Diskolys-pakken sat op og i brug",
      "alt_en": "Disco light package set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/pakke_diskolys/opstilling.webp?v=b4e80102",
      "thumb": "/images/gallery/pakke_diskolys/opstilling-400.webp?v=6661b663",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Diskolys-pakken tæt på",
      "alt_en": "Disco light package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_diskotek": [
    {
      "src": "/images/gallery/pakke_diskotek/komposition.webp?v=811589da",
      "thumb": "/images/gallery/pakke_diskotek/komposition-400.webp?v=634590ef",
      "scene": "komposition",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Diskotek-pakken — alle dele stillet op sammen",
      "alt_en": "Club light package — every part laid out together",
      "caption_da": "Det her er hvad der står i bilen, når du henter Diskotek-pakken.",
      "caption_en": "This is what goes in the car when you pick up Club light package."
    },
    {
      "src": "/images/gallery/pakke_diskotek/i_brug.webp?v=f125996a",
      "thumb": "/images/gallery/pakke_diskotek/i_brug-400.webp?v=1938eee8",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Diskotek-pakken sat op og i brug",
      "alt_en": "Club light package set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/pakke_diskotek/opstilling.webp?v=b2ee7635",
      "thumb": "/images/gallery/pakke_diskotek/opstilling-400.webp?v=c12f8e87",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Diskotek-pakken tæt på",
      "alt_en": "Club light package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_fest_150": [
    {
      "src": "/images/gallery/pakke_fest_150/komposition.webp?v=b8da25bb",
      "thumb": "/images/gallery/pakke_fest_150/komposition-400.webp?v=81d3ab44",
      "scene": "komposition",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Festpakke 150 — alle dele stillet op sammen",
      "alt_en": "Party package 150 — every part laid out together",
      "caption_da": "Det her er hvad der står i bilen, når du henter Festpakke 150.",
      "caption_en": "This is what goes in the car when you pick up Party package 150."
    },
    {
      "src": "/images/gallery/pakke_fest_150/i_brug.webp?v=cbfcaf07",
      "thumb": "/images/gallery/pakke_fest_150/i_brug-400.webp?v=2e7ab8e7",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Festpakke 150 sat op og i brug",
      "alt_en": "Party package 150 set up and in use",
      "caption_da": "100-150 gæster indendørs — udendørs uden vægge, regn med det halve.",
      "caption_en": "100-150 guests indoors — outdoors without walls, expect half that."
    },
    {
      "src": "/images/gallery/pakke_fest_150/opstilling.webp?v=b3de0a47",
      "thumb": "/images/gallery/pakke_fest_150/opstilling-400.webp?v=b6c543ad",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Festpakke 150 tæt på",
      "alt_en": "Party package 150 up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_fest_250": [
    {
      "src": "/images/gallery/pakke_fest_250/komposition.webp?v=02064a88",
      "thumb": "/images/gallery/pakke_fest_250/komposition-400.webp?v=cbf01a57",
      "scene": "komposition",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Festpakke 250 — alle dele stillet op sammen",
      "alt_en": "Party package 250 — every part laid out together",
      "caption_da": "Det her er hvad der står i bilen, når du henter Festpakke 250.",
      "caption_en": "This is what goes in the car when you pick up Party package 250."
    },
    {
      "src": "/images/gallery/pakke_fest_250/i_brug.webp?v=da6a5e9d",
      "thumb": "/images/gallery/pakke_fest_250/i_brug-400.webp?v=ecc46310",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Festpakke 250 sat op og i brug",
      "alt_en": "Party package 250 set up and in use",
      "caption_da": "150-250 gæster indendørs — udendørs uden vægge, regn med det halve.",
      "caption_en": "150-250 guests indoors — outdoors without walls, expect half that."
    },
    {
      "src": "/images/gallery/pakke_fest_250/opstilling.webp?v=970a5ade",
      "thumb": "/images/gallery/pakke_fest_250/opstilling-400.webp?v=28da2994",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Festpakke 250 tæt på",
      "alt_en": "Party package 250 up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_fest_lille": [
    {
      "src": "/images/gallery/pakke_fest_lille/komposition.webp?v=61e167f0",
      "thumb": "/images/gallery/pakke_fest_lille/komposition-400.webp?v=8c4dc1f3",
      "scene": "komposition",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Lille festpakke — alle dele stillet op sammen",
      "alt_en": "Small party package — every part laid out together",
      "caption_da": "Det her er hvad der står i bilen, når du henter Lille festpakke.",
      "caption_en": "This is what goes in the car when you pick up Small party package."
    },
    {
      "src": "/images/gallery/pakke_fest_lille/i_brug.webp?v=2a45565a",
      "thumb": "/images/gallery/pakke_fest_lille/i_brug-400.webp?v=3b41504e",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Lille festpakke sat op og i brug",
      "alt_en": "Small party package set up and in use",
      "caption_da": "Op til 50 gæster indendørs — udendørs uden vægge, regn med det halve.",
      "caption_en": "Up to 50 guests indoors — outdoors without walls, expect half that."
    },
    {
      "src": "/images/gallery/pakke_fest_lille/opstilling.webp?v=e192af09",
      "thumb": "/images/gallery/pakke_fest_lille/opstilling-400.webp?v=33e8920b",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Lille festpakke tæt på",
      "alt_en": "Small party package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_fest_stor": [
    {
      "src": "/images/gallery/pakke_fest_stor/komposition.webp?v=dbb16c95",
      "thumb": "/images/gallery/pakke_fest_stor/komposition-400.webp?v=84ab7a1f",
      "scene": "komposition",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Stor festpakke — alle dele stillet op sammen",
      "alt_en": "Large party package — every part laid out together",
      "caption_da": "Det her er hvad der står i bilen, når du henter Stor festpakke.",
      "caption_en": "This is what goes in the car when you pick up Large party package."
    },
    {
      "src": "/images/gallery/pakke_fest_stor/i_brug.webp?v=5d9f7776",
      "thumb": "/images/gallery/pakke_fest_stor/i_brug-400.webp?v=68eb92b8",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Stor festpakke sat op og i brug",
      "alt_en": "Large party package set up and in use",
      "caption_da": "50-100 gæster indendørs — udendørs uden vægge, regn med det halve.",
      "caption_en": "50-100 guests indoors — outdoors without walls, expect half that."
    },
    {
      "src": "/images/gallery/pakke_fest_stor/opstilling.webp?v=ec376ebd",
      "thumb": "/images/gallery/pakke_fest_stor/opstilling-400.webp?v=9728f2d5",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Stor festpakke tæt på",
      "alt_en": "Large party package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_festtelt": [
    {
      "src": "/images/gallery/pakke_festtelt/i_brug.webp?v=2ee967ab",
      "thumb": "/images/gallery/pakke_festtelt/i_brug-400.webp?v=f19e7510",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Festtelt-lys sat op og i brug",
      "alt_en": "Party tent lights set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    }
  ],
  "pakke_firmafest": [
    {
      "src": "/images/gallery/pakke_firmafest/komposition.webp?v=ec231240",
      "thumb": "/images/gallery/pakke_firmafest/komposition-400.webp?v=f04b4549",
      "scene": "komposition",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Firmafestpakke — alle dele stillet op sammen",
      "alt_en": "Company party package — every part laid out together",
      "caption_da": "Det her er hvad der står i bilen, når du henter Firmafestpakke.",
      "caption_en": "This is what goes in the car when you pick up Company party package."
    },
    {
      "src": "/images/gallery/pakke_firmafest/i_brug.webp?v=7098b661",
      "thumb": "/images/gallery/pakke_firmafest/i_brug-400.webp?v=71d25bea",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Firmafestpakke sat op og i brug",
      "alt_en": "Company party package set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/pakke_firmafest/opstilling.webp?v=3bcf7711",
      "thumb": "/images/gallery/pakke_firmafest/opstilling-400.webp?v=90dca059",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Firmafestpakke tæt på",
      "alt_en": "Company party package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_stemningslys": [
    {
      "src": "/images/gallery/pakke_stemningslys/komposition.webp?v=dfbaa627",
      "thumb": "/images/gallery/pakke_stemningslys/komposition-400.webp?v=a9806d8e",
      "scene": "komposition",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Stemningslys-pakken — alle dele stillet op sammen",
      "alt_en": "Ambient light package — every part laid out together",
      "caption_da": "Det her er hvad der står i bilen, når du henter Stemningslys-pakken.",
      "caption_en": "This is what goes in the car when you pick up Ambient light package."
    },
    {
      "src": "/images/gallery/pakke_stemningslys/i_brug.webp?v=2064ed1e",
      "thumb": "/images/gallery/pakke_stemningslys/i_brug-400.webp?v=1f98c0e2",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Stemningslys-pakken sat op og i brug",
      "alt_en": "Ambient light package set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/pakke_stemningslys/opstilling.webp?v=b4ea6957",
      "thumb": "/images/gallery/pakke_stemningslys/opstilling-400.webp?v=7cb4dae5",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Stemningslys-pakken tæt på",
      "alt_en": "Ambient light package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_student": [
    {
      "src": "/images/gallery/pakke_student/komposition.webp?v=3c1330e8",
      "thumb": "/images/gallery/pakke_student/komposition-400.webp?v=311af150",
      "scene": "komposition",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Studenterpakken — alle dele stillet op sammen",
      "alt_en": "Graduation package — every part laid out together",
      "caption_da": "Det her er hvad der står i bilen, når du henter Studenterpakken.",
      "caption_en": "This is what goes in the car when you pick up Graduation package."
    },
    {
      "src": "/images/gallery/pakke_student/i_brug.webp?v=05a70d06",
      "thumb": "/images/gallery/pakke_student/i_brug-400.webp?v=ba423225",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Studenterpakken sat op og i brug",
      "alt_en": "Graduation package set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/pakke_student/opstilling.webp?v=81547c44",
      "thumb": "/images/gallery/pakke_student/opstilling-400.webp?v=0a1c11c9",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Studenterpakken tæt på",
      "alt_en": "Graduation package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_teenagefest": [
    {
      "src": "/images/gallery/pakke_teenagefest/komposition.webp?v=4f104c76",
      "thumb": "/images/gallery/pakke_teenagefest/komposition-400.webp?v=2235fed5",
      "scene": "komposition",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Teenagefest-lys — alle dele stillet op sammen",
      "alt_en": "Teen party lights — every part laid out together",
      "caption_da": "Det her er hvad der står i bilen, når du henter Teenagefest-lys.",
      "caption_en": "This is what goes in the car when you pick up Teen party lights."
    },
    {
      "src": "/images/gallery/pakke_teenagefest/i_brug.webp?v=3978a2dc",
      "thumb": "/images/gallery/pakke_teenagefest/i_brug-400.webp?v=61da59a5",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Teenagefest-lys sat op og i brug",
      "alt_en": "Teen party lights set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/pakke_teenagefest/opstilling.webp?v=22d67f96",
      "thumb": "/images/gallery/pakke_teenagefest/opstilling-400.webp?v=dad3e400",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Teenagefest-lys tæt på",
      "alt_en": "Teen party lights up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "pakke_udendors": [
    {
      "src": "/images/gallery/pakke_udendors/komposition.webp?v=2fb5db94",
      "thumb": "/images/gallery/pakke_udendors/komposition-400.webp?v=0436fc28",
      "scene": "komposition",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Udendørspakke — alle dele stillet op sammen",
      "alt_en": "Outdoor package — every part laid out together",
      "caption_da": "Det her er hvad der står i bilen, når du henter Udendørspakke.",
      "caption_en": "This is what goes in the car when you pick up Outdoor package."
    },
    {
      "src": "/images/gallery/pakke_udendors/i_brug.webp?v=ed39aa7e",
      "thumb": "/images/gallery/pakke_udendors/i_brug-400.webp?v=e6763c51",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Udendørspakke sat op og i brug",
      "alt_en": "Outdoor package set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/pakke_udendors/opstilling.webp?v=45051b21",
      "thumb": "/images/gallery/pakke_udendors/opstilling-400.webp?v=24032969",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Udendørspakke tæt på",
      "alt_en": "Outdoor package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "party": [
    {
      "src": "/images/gallery/party/hvad_du_faar.webp?v=f842302c",
      "thumb": "/images/gallery/party/hvad_du_faar-400.webp?v=74a07036",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Lille højtalerpakke med alt hvad der følger med",
      "alt_en": "Small Speaker Package with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Lille højtalerpakke.",
      "caption_en": "This is what comes along when you rent Small Speaker Package."
    },
    {
      "src": "/images/gallery/party/i_brug.webp?v=0eb185f1",
      "thumb": "/images/gallery/party/i_brug-400.webp?v=ef290cb0",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Lille højtalerpakke sat op og i brug",
      "alt_en": "Small Speaker Package set up and in use",
      "caption_da": "0-30 personer indendørs — udendørs uden vægge, regn med det halve.",
      "caption_en": "0-30 people indoors — outdoors without walls, expect half that."
    },
    {
      "src": "/images/gallery/party/opstilling.webp?v=0f735e6e",
      "thumb": "/images/gallery/party/opstilling-400.webp?v=827000ad",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Lille højtalerpakke tæt på",
      "alt_en": "Small Speaker Package up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "rog": [
    {
      "src": "/images/gallery/rog/hvad_du_faar.webp?v=f1f65908",
      "thumb": "/images/gallery/rog/hvad_du_faar-400.webp?v=725c5994",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Røgmaskine med alt hvad der følger med",
      "alt_en": "Fog machine with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Røgmaskine.",
      "caption_en": "This is what comes along when you rent Fog machine."
    },
    {
      "src": "/images/gallery/rog/i_brug.webp?v=301358ff",
      "thumb": "/images/gallery/rog/i_brug-400.webp?v=e9a291da",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Røgmaskine sat op og i brug",
      "alt_en": "Fog machine set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/rog/opstilling.webp?v=f7fcc633",
      "thumb": "/images/gallery/rog/opstilling-400.webp?v=6ec58907",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Røgmaskine tæt på",
      "alt_en": "Fog machine up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "soundboks": [
    {
      "src": "/images/gallery/soundboks/hvad_du_faar.webp?v=4cea8d27",
      "thumb": "/images/gallery/soundboks/hvad_du_faar-400.webp?v=6d33fd91",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Soundboks 4 med alt hvad der følger med",
      "alt_en": "Soundboks 4 with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Soundboks 4.",
      "caption_en": "This is what comes along when you rent Soundboks 4."
    },
    {
      "src": "/images/gallery/soundboks/i_brug.webp?v=d68a430f",
      "thumb": "/images/gallery/soundboks/i_brug-400.webp?v=da16cac5",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Soundboks 4 sat op og i brug",
      "alt_en": "Soundboks 4 set up and in use",
      "caption_da": "Op til 50 personer indendørs — udendørs uden vægge, regn med det halve.",
      "caption_en": "Up to 50 people indoors — outdoors without walls, expect half that."
    },
    {
      "src": "/images/gallery/soundboks/opstilling.webp?v=dc1143cd",
      "thumb": "/images/gallery/soundboks/opstilling-400.webp?v=6ddad534",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Soundboks 4 tæt på",
      "alt_en": "Soundboks 4 up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "subwoofer": [
    {
      "src": "/images/gallery/subwoofer/hvad_du_faar.webp?v=e23bffc1",
      "thumb": "/images/gallery/subwoofer/hvad_du_faar-400.webp?v=bc644a8a",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Subwoofer 12\" med alt hvad der følger med",
      "alt_en": "Subwoofer 12\" with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Subwoofer 12\".",
      "caption_en": "This is what comes along when you rent Subwoofer 12\"."
    },
    {
      "src": "/images/gallery/subwoofer/i_brug.webp?v=1222974e",
      "thumb": "/images/gallery/subwoofer/i_brug-400.webp?v=2560c0e8",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Subwoofer 12\" sat op og i brug",
      "alt_en": "Subwoofer 12\" set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/subwoofer/opstilling.webp?v=2fee42e3",
      "thumb": "/images/gallery/subwoofer/opstilling-400.webp?v=dfee5d52",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Subwoofer 12\" tæt på",
      "alt_en": "Subwoofer 12\" up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "thumpgo": [
    {
      "src": "/images/gallery/thumpgo/hvad_du_faar.webp?v=e049220a",
      "thumb": "/images/gallery/thumpgo/hvad_du_faar-400.webp?v=27995386",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Mackie Thump GO med alt hvad der følger med",
      "alt_en": "Mackie Thump GO with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Mackie Thump GO.",
      "caption_en": "This is what comes along when you rent Mackie Thump GO."
    },
    {
      "src": "/images/gallery/thumpgo/i_brug.webp?v=9d097bfc",
      "thumb": "/images/gallery/thumpgo/i_brug-400.webp?v=0e432fc0",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Mackie Thump GO sat op og i brug",
      "alt_en": "Mackie Thump GO set up and in use",
      "caption_da": "Op til 30 personer indendørs — udendørs uden vægge, regn med det halve.",
      "caption_en": "Up to 30 people indoors — outdoors without walls, expect half that."
    },
    {
      "src": "/images/gallery/thumpgo/opstilling.webp?v=0482661d",
      "thumb": "/images/gallery/thumpgo/opstilling-400.webp?v=89bcde12",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Mackie Thump GO tæt på",
      "alt_en": "Mackie Thump GO up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "traadloes_mikrofon": [
    {
      "src": "/images/gallery/traadloes_mikrofon/hvad_du_faar.webp?v=37a19e9f",
      "thumb": "/images/gallery/traadloes_mikrofon/hvad_du_faar-400.webp?v=5917b426",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Trådløs mikrofon med alt hvad der følger med",
      "alt_en": "Wireless mic with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Trådløs mikrofon.",
      "caption_en": "This is what comes along when you rent Wireless mic."
    }
  ],
  "uplight": [
    {
      "src": "/images/gallery/uplight/hvad_du_faar.webp?v=d10249b0",
      "thumb": "/images/gallery/uplight/hvad_du_faar-400.webp?v=6a548089",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Uplight med alt hvad der følger med",
      "alt_en": "Uplight with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Uplight.",
      "caption_en": "This is what comes along when you rent Uplight."
    },
    {
      "src": "/images/gallery/uplight/i_brug.webp?v=0c9ce45a",
      "thumb": "/images/gallery/uplight/i_brug-400.webp?v=41b632af",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Uplight sat op og i brug",
      "alt_en": "Uplight set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    },
    {
      "src": "/images/gallery/uplight/opstilling.webp?v=eb3c0bfe",
      "thumb": "/images/gallery/uplight/opstilling-400.webp?v=149baff0",
      "scene": "opstilling",
      "ratio": "4:3",
      "titel_da": "Tæt på",
      "titel_en": "Close up",
      "alt_da": "Uplight tæt på",
      "alt_en": "Uplight up close",
      "caption_da": "Sådan ser det ud, når det står klar.",
      "caption_en": "This is what it looks like standing ready."
    }
  ],
  "uplight_4": [
    {
      "src": "/images/gallery/uplight_4/hvad_du_faar.webp?v=ea790f34",
      "thumb": "/images/gallery/uplight_4/hvad_du_faar-400.webp?v=8eb061af",
      "scene": "hvad_du_faar",
      "ratio": "4:3",
      "titel_da": "Alt det du får",
      "titel_en": "Everything included",
      "alt_da": "Uplight 4-pak med alt hvad der følger med",
      "alt_en": "Uplight 4-pack with everything that comes with it",
      "caption_da": "Det her får du med, når du lejer Uplight 4-pak.",
      "caption_en": "This is what comes along when you rent Uplight 4-pack."
    },
    {
      "src": "/images/gallery/uplight_4/i_brug.webp?v=31323298",
      "thumb": "/images/gallery/uplight_4/i_brug-400.webp?v=764beae6",
      "scene": "i_brug",
      "ratio": "16:9",
      "titel_da": "Sådan ser det ud til festen",
      "titel_en": "How it looks at the party",
      "alt_da": "Uplight 4-pak sat op og i brug",
      "alt_en": "Uplight 4-pack set up and in use",
      "caption_da": "Et eksempel på en opstilling — du sætter det op, som det passer til din fest.",
      "caption_en": "One example of a setup — arrange it however suits your party."
    }
  ],
};

/** Galleriet for et produkt — tom liste hvis der ikke er genereret nogen endnu. */
export function galleryFor(productId: string): GalleryImage[] {
  return PRODUCT_GALLERY[productId] ?? [];
}

/** Bredde/højde-forhold som et tal, til CSS aspect-ratio. */
export function ratioTal(ratio: string): number {
  const [b, h] = ratio.split(":").map(Number);
  return b && h ? b / h : 1;
}
