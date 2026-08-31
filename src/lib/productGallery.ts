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
  /** 1600px WebP */
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
      "src": "/images/gallery/discokugle/hvad_du_faar.webp",
      "thumb": "/images/gallery/discokugle/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/discokugle/i_brug.webp",
      "thumb": "/images/gallery/discokugle/i_brug-400.webp",
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
      "src": "/images/gallery/discokugle/opstilling.webp",
      "thumb": "/images/gallery/discokugle/opstilling-400.webp",
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
      "src": "/images/gallery/discokugle_30/hvad_du_faar.webp",
      "thumb": "/images/gallery/discokugle_30/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/discokugle_30/i_brug.webp",
      "thumb": "/images/gallery/discokugle_30/i_brug-400.webp",
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
      "src": "/images/gallery/discokugle_30/opstilling.webp",
      "thumb": "/images/gallery/discokugle_30/opstilling-400.webp",
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
      "src": "/images/gallery/festival/hvad_du_faar.webp",
      "thumb": "/images/gallery/festival/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/festival/i_brug.webp",
      "thumb": "/images/gallery/festival/i_brug-400.webp",
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
      "src": "/images/gallery/festival/opstilling.webp",
      "thumb": "/images/gallery/festival/opstilling-400.webp",
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
      "src": "/images/gallery/hojtaler_100/hvad_du_faar.webp",
      "thumb": "/images/gallery/hojtaler_100/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/hojtaler_100/i_brug.webp",
      "thumb": "/images/gallery/hojtaler_100/i_brug-400.webp",
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
      "src": "/images/gallery/hojtaler_100/opstilling.webp",
      "thumb": "/images/gallery/hojtaler_100/opstilling-400.webp",
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
      "src": "/images/gallery/lys/hvad_du_faar.webp",
      "thumb": "/images/gallery/lys/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/lys/i_brug.webp",
      "thumb": "/images/gallery/lys/i_brug-400.webp",
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
      "src": "/images/gallery/lys/opstilling.webp",
      "thumb": "/images/gallery/lys/opstilling-400.webp",
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
      "src": "/images/gallery/lyseffekt/hvad_du_faar.webp",
      "thumb": "/images/gallery/lyseffekt/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/lyseffekt/i_brug.webp",
      "thumb": "/images/gallery/lyseffekt/i_brug-400.webp",
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
      "src": "/images/gallery/lyseffekt/opstilling.webp",
      "thumb": "/images/gallery/lyseffekt/opstilling-400.webp",
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
      "src": "/images/gallery/lyskaeder/hvad_du_faar.webp",
      "thumb": "/images/gallery/lyskaeder/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/lyskaeder/i_brug.webp",
      "thumb": "/images/gallery/lyskaeder/i_brug-400.webp",
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
      "src": "/images/gallery/lyskaeder/opstilling.webp",
      "thumb": "/images/gallery/lyskaeder/opstilling-400.webp",
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
      "src": "/images/gallery/lyskaeder_farvet/hvad_du_faar.webp",
      "thumb": "/images/gallery/lyskaeder_farvet/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/lyskaeder_farvet/i_brug.webp",
      "thumb": "/images/gallery/lyskaeder_farvet/i_brug-400.webp",
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
      "src": "/images/gallery/lyskaeder_farvet/opstilling.webp",
      "thumb": "/images/gallery/lyskaeder_farvet/opstilling-400.webp",
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
      "src": "/images/gallery/mixer_lille/hvad_du_faar.webp",
      "thumb": "/images/gallery/mixer_lille/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/mixer_lille/i_brug.webp",
      "thumb": "/images/gallery/mixer_lille/i_brug-400.webp",
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
      "src": "/images/gallery/mixer_lille/opstilling.webp",
      "thumb": "/images/gallery/mixer_lille/opstilling-400.webp",
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
      "src": "/images/gallery/mixer_stor/hvad_du_faar.webp",
      "thumb": "/images/gallery/mixer_stor/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/mixer_stor/i_brug.webp",
      "thumb": "/images/gallery/mixer_stor/i_brug-400.webp",
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
      "src": "/images/gallery/mixer_stor/opstilling.webp",
      "thumb": "/images/gallery/mixer_stor/opstilling-400.webp",
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
      "src": "/images/gallery/pakke_bryllup/komposition.webp",
      "thumb": "/images/gallery/pakke_bryllup/komposition-400.webp",
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
      "src": "/images/gallery/pakke_bryllup/i_brug.webp",
      "thumb": "/images/gallery/pakke_bryllup/i_brug-400.webp",
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
      "src": "/images/gallery/pakke_bryllup/opstilling.webp",
      "thumb": "/images/gallery/pakke_bryllup/opstilling-400.webp",
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
  "pakke_fest_150": [
    {
      "src": "/images/gallery/pakke_fest_150/komposition.webp",
      "thumb": "/images/gallery/pakke_fest_150/komposition-400.webp",
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
      "src": "/images/gallery/pakke_fest_150/i_brug.webp",
      "thumb": "/images/gallery/pakke_fest_150/i_brug-400.webp",
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
      "src": "/images/gallery/pakke_fest_150/opstilling.webp",
      "thumb": "/images/gallery/pakke_fest_150/opstilling-400.webp",
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
      "src": "/images/gallery/pakke_fest_250/komposition.webp",
      "thumb": "/images/gallery/pakke_fest_250/komposition-400.webp",
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
      "src": "/images/gallery/pakke_fest_250/i_brug.webp",
      "thumb": "/images/gallery/pakke_fest_250/i_brug-400.webp",
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
      "src": "/images/gallery/pakke_fest_250/opstilling.webp",
      "thumb": "/images/gallery/pakke_fest_250/opstilling-400.webp",
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
      "src": "/images/gallery/pakke_fest_lille/komposition.webp",
      "thumb": "/images/gallery/pakke_fest_lille/komposition-400.webp",
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
      "src": "/images/gallery/pakke_fest_lille/i_brug.webp",
      "thumb": "/images/gallery/pakke_fest_lille/i_brug-400.webp",
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
      "src": "/images/gallery/pakke_fest_lille/opstilling.webp",
      "thumb": "/images/gallery/pakke_fest_lille/opstilling-400.webp",
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
      "src": "/images/gallery/pakke_fest_stor/komposition.webp",
      "thumb": "/images/gallery/pakke_fest_stor/komposition-400.webp",
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
      "src": "/images/gallery/pakke_fest_stor/i_brug.webp",
      "thumb": "/images/gallery/pakke_fest_stor/i_brug-400.webp",
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
      "src": "/images/gallery/pakke_fest_stor/opstilling.webp",
      "thumb": "/images/gallery/pakke_fest_stor/opstilling-400.webp",
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
  "pakke_firmafest": [
    {
      "src": "/images/gallery/pakke_firmafest/komposition.webp",
      "thumb": "/images/gallery/pakke_firmafest/komposition-400.webp",
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
      "src": "/images/gallery/pakke_firmafest/i_brug.webp",
      "thumb": "/images/gallery/pakke_firmafest/i_brug-400.webp",
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
      "src": "/images/gallery/pakke_firmafest/opstilling.webp",
      "thumb": "/images/gallery/pakke_firmafest/opstilling-400.webp",
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
      "src": "/images/gallery/pakke_stemningslys/komposition.webp",
      "thumb": "/images/gallery/pakke_stemningslys/komposition-400.webp",
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
      "src": "/images/gallery/pakke_stemningslys/i_brug.webp",
      "thumb": "/images/gallery/pakke_stemningslys/i_brug-400.webp",
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
      "src": "/images/gallery/pakke_stemningslys/opstilling.webp",
      "thumb": "/images/gallery/pakke_stemningslys/opstilling-400.webp",
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
      "src": "/images/gallery/pakke_student/komposition.webp",
      "thumb": "/images/gallery/pakke_student/komposition-400.webp",
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
      "src": "/images/gallery/pakke_student/i_brug.webp",
      "thumb": "/images/gallery/pakke_student/i_brug-400.webp",
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
      "src": "/images/gallery/pakke_student/opstilling.webp",
      "thumb": "/images/gallery/pakke_student/opstilling-400.webp",
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
  "pakke_udendors": [
    {
      "src": "/images/gallery/pakke_udendors/komposition.webp",
      "thumb": "/images/gallery/pakke_udendors/komposition-400.webp",
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
      "src": "/images/gallery/pakke_udendors/i_brug.webp",
      "thumb": "/images/gallery/pakke_udendors/i_brug-400.webp",
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
      "src": "/images/gallery/pakke_udendors/opstilling.webp",
      "thumb": "/images/gallery/pakke_udendors/opstilling-400.webp",
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
      "src": "/images/gallery/party/hvad_du_faar.webp",
      "thumb": "/images/gallery/party/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/party/i_brug.webp",
      "thumb": "/images/gallery/party/i_brug-400.webp",
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
      "src": "/images/gallery/party/opstilling.webp",
      "thumb": "/images/gallery/party/opstilling-400.webp",
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
      "src": "/images/gallery/rog/hvad_du_faar.webp",
      "thumb": "/images/gallery/rog/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/rog/i_brug.webp",
      "thumb": "/images/gallery/rog/i_brug-400.webp",
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
      "src": "/images/gallery/rog/opstilling.webp",
      "thumb": "/images/gallery/rog/opstilling-400.webp",
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
      "src": "/images/gallery/soundboks/hvad_du_faar.webp",
      "thumb": "/images/gallery/soundboks/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/soundboks/i_brug.webp",
      "thumb": "/images/gallery/soundboks/i_brug-400.webp",
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
      "src": "/images/gallery/soundboks/opstilling.webp",
      "thumb": "/images/gallery/soundboks/opstilling-400.webp",
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
      "src": "/images/gallery/subwoofer/hvad_du_faar.webp",
      "thumb": "/images/gallery/subwoofer/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/subwoofer/i_brug.webp",
      "thumb": "/images/gallery/subwoofer/i_brug-400.webp",
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
      "src": "/images/gallery/subwoofer/opstilling.webp",
      "thumb": "/images/gallery/subwoofer/opstilling-400.webp",
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
      "src": "/images/gallery/thumpgo/hvad_du_faar.webp",
      "thumb": "/images/gallery/thumpgo/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/thumpgo/i_brug.webp",
      "thumb": "/images/gallery/thumpgo/i_brug-400.webp",
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
      "src": "/images/gallery/thumpgo/opstilling.webp",
      "thumb": "/images/gallery/thumpgo/opstilling-400.webp",
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
      "src": "/images/gallery/traadloes_mikrofon/hvad_du_faar.webp",
      "thumb": "/images/gallery/traadloes_mikrofon/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/uplight/hvad_du_faar.webp",
      "thumb": "/images/gallery/uplight/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/uplight/i_brug.webp",
      "thumb": "/images/gallery/uplight/i_brug-400.webp",
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
      "src": "/images/gallery/uplight/opstilling.webp",
      "thumb": "/images/gallery/uplight/opstilling-400.webp",
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
      "src": "/images/gallery/uplight_4/hvad_du_faar.webp",
      "thumb": "/images/gallery/uplight_4/hvad_du_faar-400.webp",
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
      "src": "/images/gallery/uplight_4/i_brug.webp",
      "thumb": "/images/gallery/uplight_4/i_brug-400.webp",
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
