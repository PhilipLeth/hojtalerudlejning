import type {RawRentalProduct} from "./products";
export const djGearProducts: RawRentalProduct[] = [
  {
    "id": "dj_pult",
    "page": "/dj-pult",
    "category": "lyd",
    "price": 1695,
    "image": "/images/product-dj-pult-v2-white.webp",
    "name_da": "DJ-pult · AlphaTheta XDJ",
    "name_en": "DJ system · AlphaTheta XDJ",
    "desc_da": "AlphaTheta XDJ, et komplet all-in-one DJ-system. Spil fra USB-stik, ingen computer nødvendig. DJ og højtalere vælges separat.",
    "desc_en": "AlphaTheta XDJ, a complete all-in-one DJ system. Play from USB sticks, no laptop needed. DJ and speakers are hired separately.",
    "allowedAddons": ["x_stativ", "dj_stativ", "levering_ud", "afhentning_retur", "levering_begge"],
    "contents": [
      "AlphaTheta XDJ all-in-one DJ-system",
      "All-in-one, ingen computer",
      "Tilslutningskabler til højtalere"
    ]
  },
  {
    "id": "dj_pakke_lille",
    "page": "/dj-pult",
    "category": "lyd",
    "image": "/images/product-dj-pult-v2-white.webp",
    "showPartImages": true,
    "name_da": "DJ Pakke 0-30",
    "name_en": "DJ package 0-30",
    "desc_da": "Pult, to højtalere på stativer og en lysbar til mindre fester. DJ/musikafvikler tilvælges pr. time.",
    "desc_en": "Controller, two speakers on stands and a light bar for smaller parties. Add a DJ/music host by the hour.",
    "allowedAddons": ["x_stativ", "rog", "dj_stativ", "levering_ud", "afhentning_retur", "levering_begge"],
    "contents": [
      "DJ-pult · AlphaTheta XDJ",
      "Lille højtalerpakke",
      "Højtalerstativer",
      "Lysbar"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "dj_pult",
          "price": 1695,
          "label_da": "DJ-pult · AlphaTheta XDJ",
          "label_en": "DJ system · AlphaTheta XDJ"
        },
        {
          "productId": "party",
          "price": 395,
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
          "price": 295,
          "label_da": "Lysbar",
          "label_en": "Light bar"
        }
      ],
      "usecase_da": "Pult, to højtalere på stativer og en lysbar til mindre fester.",
      "usecase_en": "Controller, two speakers on stands and a light bar for smaller parties."
    }
  },
  {
    "id": "dj_pakke_mellem",
    "page": "/dj-pult",
    "category": "lyd",
    "image": "/images/product-dj-pult-v2-white.webp",
    "showPartImages": true,
    "name_da": "DJ Pakke 30-50",
    "name_en": "DJ package 30-50",
    "desc_da": "Pult, to større højtalere på stativer og to lysbarer til dansegulvet. DJ/musikafvikler tilvælges pr. time.",
    "desc_en": "Controller, two larger speakers on stands and two light bars for the dance floor. Add a DJ/music host by the hour.",
    "allowedAddons": ["x_stativ", "rog", "dj_stativ", "levering_ud", "afhentning_retur", "levering_begge"],
    "contents": [
      "DJ-pult · AlphaTheta XDJ",
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "2× lysbar"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "dj_pult",
          "price": 1695,
          "label_da": "DJ-pult · AlphaTheta XDJ",
          "label_en": "DJ system · AlphaTheta XDJ"
        },
        {
          "productId": "festival",
          "price": 595,
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
          "qty": 2,
          "price": 590,
          "label_da": "2× lysbar",
          "label_en": "2× light bar"
        }
      ],
      "usecase_da": "Pult, to større højtalere på stativer og to lysbarer til dansegulvet.",
      "usecase_en": "Controller, two larger speakers on stands and two light bars for the dance floor."
    }
  },
  {
    "id": "dj_pakke_stor",
    "page": "/dj-pult",
    "category": "lyd",
    "image": "/images/product-dj-pult-v2-white.webp",
    "showPartImages": true,
    "name_da": "DJ Pakke 50-100",
    "name_en": "DJ package 50-100",
    "desc_da": "Pult, den store højtalerpakke med subwoofer og to lysbarer til en hel aften. DJ/musikafvikler tilvælges pr. time.",
    "desc_en": "Controller, the large speaker package with subwoofer and two light bars for the whole evening. Add a DJ/music host by the hour.",
    "contents": [
      "DJ-pult · AlphaTheta XDJ",
      "Stor højtalerpakke",
      "Højtalerstativer",
      "2× lysbar"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "dj_pult",
          "price": 1695,
          "label_da": "DJ-pult · AlphaTheta XDJ",
          "label_en": "DJ system · AlphaTheta XDJ"
        },
        {
          "productId": "hojtaler_100",
          "price": 1195,
          "label_da": "Stor højtalerpakke",
          "label_en": "Large speaker package"
        },
        {
          "productId": "stativer",
          "price": 95,
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands"
        },
        {
          "productId": "lys",
          "qty": 2,
          "price": 590,
          "label_da": "2× lysbar",
          "label_en": "2× light bar"
        }
      ],
      "usecase_da": "Pult, den store højtalerpakke med subwoofer og to lysbarer til en hel aften.",
      "usecase_en": "Controller, the large speaker package with subwoofer and two light bars for the whole evening."
    }
  }
];
