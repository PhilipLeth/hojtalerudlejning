import type {RentalProduct} from "./products";
export const djGearProducts: RentalProduct[] = [
  {
    "id": "dj_pult",
    "page": "/dj-pult",
    "category": "lyd",
    "price": 1695,
    "image": "/images/product-dj-pult-white.webp",
    "name_da": "DJ-pult · AlphaTheta XDJ-AZ",
    "name_en": "DJ system · AlphaTheta XDJ-AZ",
    "desc_da": "AlphaTheta XDJ-AZ, et komplet standalone DJ-system med touchskærm og fire kanaler. Spil fra USB-stik eller stream direkte, ingen computer nødvendig. DJ og højtalere vælges separat.",
    "desc_en": "AlphaTheta XDJ-AZ, a complete standalone DJ system with a touchscreen and four channels. Play from USB sticks or stream directly, no laptop needed. DJ and speakers are hired separately.",
    "allowedAddons": ["x_stativ", "dj_stativ", "levering_ud", "afhentning_retur", "levering_begge"],
    "contents": [
      "AlphaTheta XDJ-AZ (eller XDJ-RR)",
      "Standalone, ingen computer",
      "Tilslutningskabler til højtalere"
    ]
  },
  {
    "id": "dj_pakke_lille",
    "page": "/dj-pult",
    "category": "lyd",
    "price": 2695,
    "image": "/images/product-dj-pult-white.webp",
    "showPartImages": true,
    "name_da": "DJ Pakke 0-30",
    "name_en": "DJ package 0-30",
    "desc_da": "Pult og to højtalere til mindre fester og baggrundsmusik. DJ/musikafvikler tilvælges pr. time.",
    "desc_en": "Controller and two speakers for smaller parties and background music. Add a DJ/music host by the hour.",
    "allowedAddons": ["rog", "dj_stativ", "levering_ud", "afhentning_retur", "levering_begge"],
    "contents": [
      "DJ-pult · AlphaTheta XDJ-AZ",
      "Lille højtalerpakke",
      "Højtalerstativer",
      "Lysbar",
      "X-stativ"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "dj_pult",
          "price": 1695,
          "label_da": "DJ-pult · AlphaTheta XDJ-AZ",
          "label_en": "DJ system · AlphaTheta XDJ-AZ"
        },
        {
          "productId": "party",
          "price": 595,
          "label_da": "Lille højtalerpakke",
          "label_en": "Small speaker package"
        },
        {
          "productId": "stativer",
          "price": 95,
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands"
        },
        {
          "productId": "lys",
          "price": 395,
          "label_da": "Lysbar",
          "label_en": "Light bar"
        },
        {
          "productId": "x_stativ",
          "price": 95,
          "label_da": "X-stativ",
          "label_en": "X-stand"
        }
      ],
      "discount": 180,
      "usecase_da": "Pult og to højtalere til mindre fester og baggrundsmusik.",
      "usecase_en": "Controller and two speakers for smaller parties and background music."
    }
  },
  {
    "id": "dj_pakke_mellem",
    "page": "/dj-pult",
    "category": "lyd",
    "price": 2995,
    "image": "/images/product-dj-pult-white.webp",
    "showPartImages": true,
    "name_da": "DJ Pakke 30-50",
    "name_en": "DJ package 30-50",
    "desc_da": "Pult, to større højtalere og subwoofer til dansegulvet. DJ/musikafvikler tilvælges pr. time.",
    "desc_en": "Controller, two larger speakers and a subwoofer for the dance floor. Add a DJ/music host by the hour.",
    "allowedAddons": ["rog", "dj_stativ", "levering_ud", "afhentning_retur", "levering_begge"],
    "contents": [
      "DJ-pult · AlphaTheta XDJ-AZ",
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Lysbar",
      "X-stativ"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "dj_pult",
          "price": 1695,
          "label_da": "DJ-pult · AlphaTheta XDJ-AZ",
          "label_en": "DJ system · AlphaTheta XDJ-AZ"
        },
        {
          "productId": "festival",
          "price": 795,
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium speaker package"
        },
        {
          "productId": "stativer",
          "price": 95,
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands"
        },
        {
          "productId": "lys",
          "price": 395,
          "label_da": "Lysbar",
          "label_en": "Light bar"
        },
        {
          "productId": "x_stativ",
          "price": 95,
          "label_da": "X-stativ",
          "label_en": "X-stand"
        }
      ],
      "discount": 80,
      "usecase_da": "Pult, to større højtalere og subwoofer til dansegulvet.",
      "usecase_en": "Controller, two larger speakers and a subwoofer for the dance floor."
    }
  },
  {
    "id": "dj_pakke_stor",
    "page": "/dj-pult",
    "category": "lyd",
    "price": 3725,
    "image": "/images/product-dj-pult-white.webp",
    "showPartImages": true,
    "name_da": "Stor DJ-pakke",
    "name_en": "Large DJ package",
    "desc_da": "Pult, lyd, subwoofer, lys og mikrofon til en hel aften. DJ/musikafvikler tilvælges pr. time.",
    "desc_en": "Controller, speakers, subwoofer, lights and a microphone for the whole evening. Add a DJ/music host by the hour.",
    "contents": [
      "DJ-pult · AlphaTheta XDJ-AZ",
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Subwoofer 12”",
      "Lysbar",
      "Trådløs mikrofon"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "dj_pult",
          "price": 1695,
          "label_da": "DJ-pult · AlphaTheta XDJ-AZ",
          "label_en": "DJ system · AlphaTheta XDJ-AZ"
        },
        {
          "productId": "festival",
          "price": 795,
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package"
        },
        {
          "productId": "stativer",
          "price": 95,
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands"
        },
        {
          "productId": "subwoofer",
          "price": 495,
          "label_da": "Subwoofer 12”",
          "label_en": "Subwoofer 12 inch"
        },
        {
          "productId": "lys",
          "price": 395,
          "label_da": "Lysbar",
          "label_en": "Lighting Package"
        },
        {
          "productId": "mikrofon",
          "price": 445,
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless microphone"
        }
      ],
      "discount": 195,
      "usecase_da": "Pult, lyd, subwoofer, lys og mikrofon til en hel aften.",
      "usecase_en": "Controller, speakers, subwoofer, lights and a microphone for the whole evening."
    }
  }
];
