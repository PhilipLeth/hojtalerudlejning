import type { RawRentalProduct } from "./products";
/** Udstyrspakker. Transport og bemanding tilvælges separat. */
export const situationPackages: RawRentalProduct[] = [
  {
    "id": "event_konference_1",
    "page": "/events/konference",
    "category": "av",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Konference med skærm",
    "name_en": "Conference with display",
    "desc_da": "Når programmet skal holde fra første oplæg til sidste spørgsmål.",
    "desc_en": "Keep the programme moving, from the first presentation to the final question.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon",
      "Mixer med effekter · t.mix 1202 FXMP USB",
      "55\" Storskærm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer med effekter · t.mix 1202 FXMP USB",
          "label_en": "Mixer with effects · t.mix 1202 FXMP USB",
          "price": 345
        },
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        }
      ],
      "usecase_da": "Når programmet skal holde fra første oplæg til sidste spørgsmål.",
      "usecase_en": "Keep the programme moving, from the first presentation to the final question."
    }
  },
  {
    "id": "event_konference_2",
    "page": "/events/konference",
    "category": "av",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Konference med projektion",
    "name_en": "Conference with projection",
    "desc_da": "Når programmet skal holde fra første oplæg til sidste spørgsmål.",
    "desc_en": "Keep the programme moving, from the first presentation to the final question.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon",
      "Trådløst headset",
      "Mixer med effekter · t.mix 1202 FXMP USB",
      "Projektor Pro (5000 lumen)",
      "Lærred 160 cm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        },
        {
          "productId": "headset",
          "label_da": "Trådløst headset",
          "label_en": "Wireless headset",
          "price": 445
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer med effekter · t.mix 1202 FXMP USB",
          "label_en": "Mixer with effects · t.mix 1202 FXMP USB",
          "price": 345
        },
        {
          "productId": "projektor_pro",
          "label_da": "Projektor Pro (5000 lumen)",
          "label_en": "Projector Pro (5000 lumen)",
          "price": 795
        },
        {
          "productId": "laerred_160",
          "label_da": "Lærred 160 cm",
          "label_en": "Projector screen 160 cm",
          "price": 195
        }
      ],
      "usecase_da": "Når programmet skal holde fra første oplæg til sidste spørgsmål.",
      "usecase_en": "Keep the programme moving, from the first presentation to the final question."
    }
  },
  {
    "id": "event_moede_1",
    "page": "/events/moede",
    "category": "av",
    "image": "/images/product-skaerm-white.webp",
    "showPartImages": true,
    "name_da": "Mødeskærm",
    "name_en": "Meeting display",
    "desc_da": "Et møde, hvor alle kan høre og følge med.",
    "desc_en": "A meeting everyone can hear and follow.",
    "contents": [
      "55\" Storskærm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        }
      ],
      "usecase_da": "Et møde, hvor alle kan høre og følge med.",
      "usecase_en": "A meeting everyone can hear and follow."
    }
  },
  {
    "id": "event_moede_2",
    "page": "/events/moede",
    "category": "av",
    "image": "/images/product-skaerm-white.webp",
    "showPartImages": true,
    "name_da": "Møde med billede og tale",
    "name_en": "Meeting display and speech",
    "desc_da": "Et møde, hvor alle kan høre og følge med.",
    "desc_en": "A meeting everyone can hear and follow.",
    "contents": [
      "55\" Storskærm",
      "Mackie Thump GO",
      "Trådløs mikrofon"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        },
        {
          "productId": "thumpgo",
          "label_da": "Mackie Thump GO",
          "label_en": "Mackie Thump GO",
          "price": 495
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        }
      ],
      "usecase_da": "Et møde, hvor alle kan høre og følge med.",
      "usecase_en": "A meeting everyone can hear and follow."
    }
  },
  {
    "id": "event_praesentation_1",
    "page": "/events/praesentation",
    "category": "av",
    "image": "/images/product-skaerm-white.webp",
    "showPartImages": true,
    "name_da": "Præsentation på skærm",
    "name_en": "Presentation on a display",
    "desc_da": "Gør plads til budskabet på skærmen.",
    "desc_en": "Give your message the screen it needs.",
    "contents": [
      "55\" Storskærm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        }
      ],
      "usecase_da": "Gør plads til budskabet på skærmen.",
      "usecase_en": "Give your message the screen it needs."
    }
  },
  {
    "id": "event_praesentation_2",
    "page": "/events/praesentation",
    "category": "av",
    "image": "/images/product-projektor-pro-v2-white.webp",
    "showPartImages": true,
    "name_da": "Præsentation med projektion",
    "name_en": "Projected presentation",
    "desc_da": "Gør plads til budskabet på skærmen.",
    "desc_en": "Give your message the screen it needs.",
    "contents": [
      "Projektor Pro (5000 lumen)",
      "Lærred 160 cm",
      "Mackie Thump GO",
      "Håndholdt mikrofon (kabel)"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "projektor_pro",
          "label_da": "Projektor Pro (5000 lumen)",
          "label_en": "Projector Pro (5000 lumen)",
          "price": 795
        },
        {
          "productId": "laerred_160",
          "label_da": "Lærred 160 cm",
          "label_en": "Projector screen 160 cm",
          "price": 195
        },
        {
          "productId": "thumpgo",
          "label_da": "Mackie Thump GO",
          "label_en": "Mackie Thump GO",
          "price": 495
        },
        {
          "productId": "mikrofon_kabel",
          "label_da": "Håndholdt mikrofon (kabel)",
          "label_en": "Handheld microphone (wired)",
          "price": 95
        }
      ],
      "usecase_da": "Gør plads til budskabet på skærmen.",
      "usecase_en": "Give your message the screen it needs."
    }
  },
  {
    "id": "event_generalforsamling_1",
    "page": "/events/generalforsamling",
    "category": "av",
    "image": "/images/product-party-v2-white.webp",
    "showPartImages": true,
    "name_da": "Generalforsamling med tale",
    "name_en": "Assembly speech setup",
    "desc_da": "Tydelig tale og plads til spørgsmål.",
    "desc_en": "Clear speech with room for questions.",
    "contents": [
      "Lille højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "party",
          "label_da": "Lille højtalerpakke",
          "label_en": "Small Speaker Package",
          "price": 595
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        }
      ],
      "usecase_da": "Tydelig tale og plads til spørgsmål.",
      "usecase_en": "Clear speech with room for questions."
    }
  },
  {
    "id": "event_generalforsamling_2",
    "page": "/events/generalforsamling",
    "category": "av",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Generalforsamling med billede",
    "name_en": "Assembly with display",
    "desc_da": "Tydelig tale og plads til spørgsmål.",
    "desc_en": "Clear speech with room for questions.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon",
      "Håndholdt mikrofon (kabel)",
      "Mixer med effekter · t.mix 1202 FXMP USB",
      "55\" Storskærm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        },
        {
          "productId": "mikrofon_kabel",
          "label_da": "Håndholdt mikrofon (kabel)",
          "label_en": "Handheld microphone (wired)",
          "price": 95
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer med effekter · t.mix 1202 FXMP USB",
          "label_en": "Mixer with effects · t.mix 1202 FXMP USB",
          "price": 345
        },
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        }
      ],
      "usecase_da": "Tydelig tale og plads til spørgsmål.",
      "usecase_en": "Clear speech with room for questions."
    }
  },
  {
    "id": "event_foredrag_1",
    "page": "/events/foredrag",
    "category": "av",
    "image": "/images/product-party-v2-white.webp",
    "showPartImages": true,
    "name_da": "Foredrag med mikrofon",
    "name_en": "Talk with microphone",
    "desc_da": "Lad publikum koncentrere sig om indholdet.",
    "desc_en": "Let your audience concentrate on the content.",
    "contents": [
      "Lille højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "party",
          "label_da": "Lille højtalerpakke",
          "label_en": "Small Speaker Package",
          "price": 595
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        }
      ],
      "usecase_da": "Lad publikum koncentrere sig om indholdet.",
      "usecase_en": "Let your audience concentrate on the content."
    }
  },
  {
    "id": "event_foredrag_2",
    "page": "/events/foredrag",
    "category": "av",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Undervisning med headset og billede",
    "name_en": "Training with headset and projection",
    "desc_da": "Lad publikum koncentrere sig om indholdet.",
    "desc_en": "Let your audience concentrate on the content.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Trådløst headset",
      "Mixer med effekter · t.mix 1202 FXMP USB",
      "Projektor Pro (5000 lumen)",
      "Lærred 160 cm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "headset",
          "label_da": "Trådløst headset",
          "label_en": "Wireless headset",
          "price": 445
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer med effekter · t.mix 1202 FXMP USB",
          "label_en": "Mixer with effects · t.mix 1202 FXMP USB",
          "price": 345
        },
        {
          "productId": "projektor_pro",
          "label_da": "Projektor Pro (5000 lumen)",
          "label_en": "Projector Pro (5000 lumen)",
          "price": 795
        },
        {
          "productId": "laerred_160",
          "label_da": "Lærred 160 cm",
          "label_en": "Projector screen 160 cm",
          "price": 195
        }
      ],
      "usecase_da": "Lad publikum koncentrere sig om indholdet.",
      "usecase_en": "Let your audience concentrate on the content."
    }
  },
  {
    "id": "event_messe_1",
    "page": "/events/messe",
    "category": "av",
    "image": "/images/product-skaerm-white.webp",
    "showPartImages": true,
    "name_da": "Stand med skærm",
    "name_en": "Exhibition display",
    "desc_da": "Et tydeligt budskab på få kvadratmeter.",
    "desc_en": "A clear message in a compact space.",
    "contents": [
      "55\" Storskærm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        }
      ],
      "usecase_da": "Et tydeligt budskab på få kvadratmeter.",
      "usecase_en": "A clear message in a compact space."
    }
  },
  {
    "id": "event_messe_2",
    "page": "/events/messe",
    "category": "av",
    "image": "/images/product-skaerm-white.webp",
    "showPartImages": true,
    "name_da": "Stand med præsentationslyd",
    "name_en": "Stand presentation setup",
    "desc_da": "Et tydeligt budskab på få kvadratmeter.",
    "desc_en": "A clear message in a compact space.",
    "contents": [
      "55\" Storskærm",
      "Mackie Thump GO",
      "Trådløs mikrofon",
      "Uplight 4-pak"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        },
        {
          "productId": "thumpgo",
          "label_da": "Mackie Thump GO",
          "label_en": "Mackie Thump GO",
          "price": 495
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        },
        {
          "productId": "uplight_4",
          "label_da": "Uplight 4-pak",
          "label_en": "Uplight 4-pack",
          "price": 595
        }
      ],
      "usecase_da": "Et tydeligt budskab på få kvadratmeter.",
      "usecase_en": "A clear message in a compact space."
    }
  },
  {
    "id": "event_produktlancering_1",
    "page": "/events/produktlancering",
    "category": "av",
    "image": "/images/product-skaerm-white.webp",
    "showPartImages": true,
    "name_da": "Lancering med skærm",
    "name_en": "Launch with display",
    "desc_da": "Fra afsløring til præsentation.",
    "desc_en": "From the reveal to the presentation.",
    "contents": [
      "55\" Storskærm",
      "Mackie Thump GO",
      "Trådløs mikrofon"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        },
        {
          "productId": "thumpgo",
          "label_da": "Mackie Thump GO",
          "label_en": "Mackie Thump GO",
          "price": 495
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        }
      ],
      "usecase_da": "Fra afsløring til præsentation.",
      "usecase_en": "From the reveal to the presentation."
    }
  },
  {
    "id": "event_produktlancering_2",
    "page": "/events/produktlancering",
    "category": "av",
    "image": "/images/product-skaerm-white.webp",
    "showPartImages": true,
    "name_da": "Lancering med lys og stor lyd",
    "name_en": "Launch with lighting and PA",
    "desc_da": "Fra afsløring til præsentation.",
    "desc_en": "From the reveal to the presentation.",
    "contents": [
      "55\" Storskærm",
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon",
      "Mixer med effekter · t.mix 1202 FXMP USB",
      "Uplight 4-pak"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        },
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer med effekter · t.mix 1202 FXMP USB",
          "label_en": "Mixer with effects · t.mix 1202 FXMP USB",
          "price": 345
        },
        {
          "productId": "uplight_4",
          "label_da": "Uplight 4-pak",
          "label_en": "Uplight 4-pack",
          "price": 595
        }
      ],
      "usecase_da": "Fra afsløring til præsentation.",
      "usecase_en": "From the reveal to the presentation."
    }
  },
  {
    "id": "event_reception_1",
    "page": "/events/reception",
    "category": "lyd",
    "image": "/images/product-party-v2-white.webp",
    "showPartImages": true,
    "name_da": "Reception med tale og musik",
    "name_en": "Reception sound and speech",
    "desc_da": "Musik og taler med plads til samtalen.",
    "desc_en": "Music and speeches with space for conversation.",
    "contents": [
      "Lille højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "party",
          "label_da": "Lille højtalerpakke",
          "label_en": "Small Speaker Package",
          "price": 595
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        }
      ],
      "usecase_da": "Musik og taler med plads til samtalen.",
      "usecase_en": "Music and speeches with space for conversation."
    }
  },
  {
    "id": "event_reception_2",
    "page": "/events/reception",
    "category": "lyd",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Reception med stemningslys",
    "name_en": "Reception with uplighting",
    "desc_da": "Musik og taler med plads til samtalen.",
    "desc_en": "Music and speeches with space for conversation.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon",
      "Mixer med effekter · t.mix 1202 FXMP USB",
      "Uplight 4-pak"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer med effekter · t.mix 1202 FXMP USB",
          "label_en": "Mixer with effects · t.mix 1202 FXMP USB",
          "price": 345
        },
        {
          "productId": "uplight_4",
          "label_da": "Uplight 4-pak",
          "label_en": "Uplight 4-pack",
          "price": 595
        }
      ],
      "usecase_da": "Musik og taler med plads til samtalen.",
      "usecase_en": "Music and speeches with space for conversation."
    }
  },
  {
    "id": "event_fredagsbar_1",
    "page": "/events/fredagsbar",
    "category": "lyd",
    "image": "/images/product-party-v2-white.webp",
    "showPartImages": true,
    "name_da": "Fredagsbar med musik",
    "name_en": "Friday bar sound",
    "desc_da": "Fra arbejdsdag til en god aften sammen.",
    "desc_en": "From the working day to a good evening together.",
    "contents": [
      "Lille højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "party",
          "label_da": "Lille højtalerpakke",
          "label_en": "Small Speaker Package",
          "price": 595
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        }
      ],
      "usecase_da": "Fra arbejdsdag til en god aften sammen.",
      "usecase_en": "From the working day to a good evening together."
    }
  },
  {
    "id": "event_fredagsbar_2",
    "page": "/events/fredagsbar",
    "category": "lyd",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Fredagsbar med dansegulv",
    "name_en": "Friday bar dance floor",
    "desc_da": "Fra arbejdsdag til en god aften sammen.",
    "desc_en": "From the working day to a good evening together.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Subwoofer 12\"",
      "Lysbar",
      "Trådløs mikrofon"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "subwoofer",
          "label_da": "Subwoofer 12\"",
          "label_en": "Subwoofer 12\"",
          "price": 495
        },
        {
          "productId": "lys",
          "label_da": "Lysbar",
          "label_en": "Light bar",
          "price": 395
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        }
      ],
      "usecase_da": "Fra arbejdsdag til en god aften sammen.",
      "usecase_en": "From the working day to a good evening together."
    }
  },
  {
    "id": "event_firmafest_1",
    "page": "/events/firmafest",
    "category": "lyd",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Firmafest med tale og musik",
    "name_en": "Company party sound",
    "desc_da": "Taler ved bordene. Musik på dansegulvet.",
    "desc_en": "Dinner speeches. Music on the dance floor.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon",
      "Mixer med effekter · t.mix 1202 FXMP USB"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer med effekter · t.mix 1202 FXMP USB",
          "label_en": "Mixer with effects · t.mix 1202 FXMP USB",
          "price": 345
        }
      ],
      "usecase_da": "Taler ved bordene. Musik på dansegulvet.",
      "usecase_en": "Dinner speeches. Music on the dance floor."
    }
  },
  {
    "id": "event_firmafest_2",
    "page": "/events/firmafest",
    "category": "lyd",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Firmafest med bas og lys",
    "name_en": "Company party sound and lighting",
    "desc_da": "Taler ved bordene. Musik på dansegulvet.",
    "desc_en": "Dinner speeches. Music on the dance floor.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Subwoofer 12\"",
      "Trådløs mikrofon",
      "Mixer med effekter · t.mix 1202 FXMP USB",
      "Lysbar",
      "Uplight 4-pak"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "subwoofer",
          "label_da": "Subwoofer 12\"",
          "label_en": "Subwoofer 12\"",
          "price": 495
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer med effekter · t.mix 1202 FXMP USB",
          "label_en": "Mixer with effects · t.mix 1202 FXMP USB",
          "price": 345
        },
        {
          "productId": "lys",
          "label_da": "Lysbar",
          "label_en": "Light bar",
          "price": 395
        },
        {
          "productId": "uplight_4",
          "label_da": "Uplight 4-pak",
          "label_en": "Uplight 4-pack",
          "price": 595
        }
      ],
      "usecase_da": "Taler ved bordene. Musik på dansegulvet.",
      "usecase_en": "Dinner speeches. Music on the dance floor."
    }
  },
  {
    "id": "event_koncert_1",
    "page": "/events/koncert",
    "category": "lyd",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Akustisk livesæt",
    "name_en": "Acoustic live set",
    "desc_da": "Et nærværende livesæt med styr på lyden.",
    "desc_en": "An intimate live set with sound taken care of.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Mixer med effekter · t.mix 1202 FXMP USB",
      "Håndholdt mikrofon PRO (kabel)"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer med effekter · t.mix 1202 FXMP USB",
          "label_en": "Mixer with effects · t.mix 1202 FXMP USB",
          "price": 345
        },
        {
          "productId": "haandholdt_mikrofon_pro",
          "label_da": "Håndholdt mikrofon PRO (kabel)",
          "label_en": "Handheld microphone PRO (wired)",
          "price": 345
        }
      ],
      "usecase_da": "Et nærværende livesæt med styr på lyden.",
      "usecase_en": "An intimate live set with sound taken care of."
    }
  },
  {
    "id": "event_koncert_2",
    "page": "/events/koncert",
    "category": "lyd",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Live med ekstra bas og lys",
    "name_en": "Live sound with bass and lighting",
    "desc_da": "Et nærværende livesæt med styr på lyden.",
    "desc_en": "An intimate live set with sound taken care of.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Subwoofer 12\"",
      "Mixer med effekter · t.mix 1202 FXMP USB",
      "Håndholdt mikrofon PRO (kabel)",
      "Håndholdt mikrofon (kabel)",
      "Uplight 4-pak"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "subwoofer",
          "label_da": "Subwoofer 12\"",
          "label_en": "Subwoofer 12\"",
          "price": 495
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer med effekter · t.mix 1202 FXMP USB",
          "label_en": "Mixer with effects · t.mix 1202 FXMP USB",
          "price": 345
        },
        {
          "productId": "haandholdt_mikrofon_pro",
          "label_da": "Håndholdt mikrofon PRO (kabel)",
          "label_en": "Handheld microphone PRO (wired)",
          "price": 345
        },
        {
          "productId": "mikrofon_kabel",
          "label_da": "Håndholdt mikrofon (kabel)",
          "label_en": "Handheld microphone (wired)",
          "price": 95
        },
        {
          "productId": "uplight_4",
          "label_da": "Uplight 4-pak",
          "label_en": "Uplight 4-pack",
          "price": 595
        }
      ],
      "usecase_da": "Et nærværende livesæt med styr på lyden.",
      "usecase_en": "An intimate live set with sound taken care of."
    }
  },
  {
    "id": "event_bryllup_1",
    "page": "/events/bryllup",
    "category": "lyd",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Bryllup med taler og musik",
    "name_en": "Wedding speeches and music",
    "desc_da": "Fra den første tale til den sidste dans.",
    "desc_en": "From the first speech to the last dance.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon",
      "Mixer med effekter · t.mix 1202 FXMP USB"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer med effekter · t.mix 1202 FXMP USB",
          "label_en": "Mixer with effects · t.mix 1202 FXMP USB",
          "price": 345
        }
      ],
      "usecase_da": "Fra den første tale til den sidste dans.",
      "usecase_en": "From the first speech to the last dance."
    }
  },
  {
    "id": "event_bryllup_2",
    "page": "/events/bryllup",
    "category": "lyd",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Bryllup med dansegulv og lys",
    "name_en": "Wedding dance floor and lighting",
    "desc_da": "Fra den første tale til den sidste dans.",
    "desc_en": "From the first speech to the last dance.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Subwoofer 12\"",
      "Trådløs mikrofon",
      "Mixer med effekter · t.mix 1202 FXMP USB",
      "Lysbar",
      "Uplight 4-pak"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "subwoofer",
          "label_da": "Subwoofer 12\"",
          "label_en": "Subwoofer 12\"",
          "price": 495
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer med effekter · t.mix 1202 FXMP USB",
          "label_en": "Mixer with effects · t.mix 1202 FXMP USB",
          "price": 345
        },
        {
          "productId": "lys",
          "label_da": "Lysbar",
          "label_en": "Light bar",
          "price": 395
        },
        {
          "productId": "uplight_4",
          "label_da": "Uplight 4-pak",
          "label_en": "Uplight 4-pack",
          "price": 595
        }
      ],
      "usecase_da": "Fra den første tale til den sidste dans.",
      "usecase_en": "From the first speech to the last dance."
    }
  },
  {
    "id": "event_privatfest_1",
    "page": "/events/privatfest",
    "category": "lyd",
    "image": "/images/product-party-v2-white.webp",
    "showPartImages": true,
    "name_da": "Privatfest med musik",
    "name_en": "Private party sound",
    "desc_da": "Den rigtige lyd til jeres lokale og gæster.",
    "desc_en": "The right sound for your room and guests.",
    "contents": [
      "Lille højtalerpakke",
      "Højtalerstativer"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "party",
          "label_da": "Lille højtalerpakke",
          "label_en": "Small Speaker Package",
          "price": 595
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        }
      ],
      "usecase_da": "Den rigtige lyd til jeres lokale og gæster.",
      "usecase_en": "The right sound for your room and guests."
    }
  },
  {
    "id": "event_privatfest_2",
    "page": "/events/privatfest",
    "category": "lyd",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Privatfest med lyd og lys",
    "name_en": "Private party sound and lights",
    "desc_da": "Den rigtige lyd til jeres lokale og gæster.",
    "desc_en": "The right sound for your room and guests.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Lysbar",
      "Trådløs mikrofon"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "lys",
          "label_da": "Lysbar",
          "label_en": "Light bar",
          "price": 395
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        }
      ],
      "usecase_da": "Den rigtige lyd til jeres lokale og gæster.",
      "usecase_en": "The right sound for your room and guests."
    }
  },
  {
    "id": "event_filmaften_1",
    "page": "/events/filmaften",
    "category": "av",
    "image": "/images/product-skaerm-white.webp",
    "showPartImages": true,
    "name_da": "Fællesvisning på skærm",
    "name_en": "Shared screen viewing",
    "desc_da": "Et stort billede og lyd, der følger med.",
    "desc_en": "A big picture with sound to match.",
    "contents": [
      "55\" Storskærm",
      "Mackie Thump GO"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        },
        {
          "productId": "thumpgo",
          "label_da": "Mackie Thump GO",
          "label_en": "Mackie Thump GO",
          "price": 495
        }
      ],
      "usecase_da": "Et stort billede og lyd, der følger med.",
      "usecase_en": "A big picture with sound to match."
    }
  },
  {
    "id": "event_filmaften_2",
    "page": "/events/filmaften",
    "category": "av",
    "image": "/images/product-projektor-pro-v2-white.webp",
    "showPartImages": true,
    "name_da": "Filmaften med projektor",
    "name_en": "Projected film night",
    "desc_da": "Et stort billede og lyd, der følger med.",
    "desc_en": "A big picture with sound to match.",
    "contents": [
      "Projektor Pro (5000 lumen)",
      "Lærred 160 cm",
      "Lille højtalerpakke",
      "Højtalerstativer"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "projektor_pro",
          "label_da": "Projektor Pro (5000 lumen)",
          "label_en": "Projector Pro (5000 lumen)",
          "price": 795
        },
        {
          "productId": "laerred_160",
          "label_da": "Lærred 160 cm",
          "label_en": "Projector screen 160 cm",
          "price": 195
        },
        {
          "productId": "party",
          "label_da": "Lille højtalerpakke",
          "label_en": "Small Speaker Package",
          "price": 595
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        }
      ],
      "usecase_da": "Et stort billede og lyd, der følger med.",
      "usecase_en": "A big picture with sound to match."
    }
  },
  {
    "id": "event_udendoers_1",
    "page": "/events/udendoers",
    "category": "lyd",
    "image": "/images/product-thumpgo-v2-white.webp",
    "showPartImages": true,
    "name_da": "Udendørs tale",
    "name_en": "Outdoor speech",
    "desc_da": "Musik og tale under åben himmel.",
    "desc_en": "Music and speech in the open air.",
    "contents": [
      "Mackie Thump GO",
      "Håndholdt mikrofon (kabel)"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "thumpgo",
          "label_da": "Mackie Thump GO",
          "label_en": "Mackie Thump GO",
          "price": 495
        },
        {
          "productId": "mikrofon_kabel",
          "label_da": "Håndholdt mikrofon (kabel)",
          "label_en": "Handheld microphone (wired)",
          "price": 95
        }
      ],
      "usecase_da": "Musik og tale under åben himmel.",
      "usecase_en": "Music and speech in the open air."
    }
  },
  {
    "id": "event_udendoers_2",
    "page": "/events/udendoers",
    "category": "lyd",
    "image": "/images/product-soundboks-v2-white.webp",
    "showPartImages": true,
    "name_da": "Udendørs musik og tale",
    "name_en": "Outdoor music and speech",
    "desc_da": "Musik og tale under åben himmel.",
    "desc_en": "Music and speech in the open air.",
    "contents": [
      "Soundboks 4",
      "Håndholdt mikrofon (kabel)"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "soundboks",
          "label_da": "Soundboks 4",
          "label_en": "Soundboks 4",
          "price": 695
        },
        {
          "productId": "mikrofon_kabel",
          "label_da": "Håndholdt mikrofon (kabel)",
          "label_en": "Handheld microphone (wired)",
          "price": 95
        }
      ],
      "usecase_da": "Musik og tale under åben himmel.",
      "usecase_en": "Music and speech in the open air."
    }
  },
  {
    "id": "event_forening_1",
    "page": "/events/forening",
    "category": "lyd",
    "image": "/images/product-thumpgo-v2-white.webp",
    "showPartImages": true,
    "name_da": "Klubdag med mikrofon",
    "name_en": "Club day with microphone",
    "desc_da": "Beskeder, præmier og musik til fællesskabet.",
    "desc_en": "Announcements, awards and music for your community.",
    "contents": [
      "Mackie Thump GO",
      "Håndholdt mikrofon (kabel)"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "thumpgo",
          "label_da": "Mackie Thump GO",
          "label_en": "Mackie Thump GO",
          "price": 495
        },
        {
          "productId": "mikrofon_kabel",
          "label_da": "Håndholdt mikrofon (kabel)",
          "label_en": "Handheld microphone (wired)",
          "price": 95
        }
      ],
      "usecase_da": "Beskeder, præmier og musik til fællesskabet.",
      "usecase_en": "Announcements, awards and music for your community."
    }
  },
  {
    "id": "event_forening_2",
    "page": "/events/forening",
    "category": "lyd",
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Klubhus med lyd og billede",
    "name_en": "Clubhouse sound and display",
    "desc_da": "Beskeder, præmier og musik til fællesskabet.",
    "desc_en": "Announcements, awards and music for your community.",
    "contents": [
      "Mellem højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon",
      "55\" Storskærm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Mellem højtalerpakke",
          "label_en": "Medium Speaker Package",
          "price": 795
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 95
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 445
        },
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        }
      ],
      "usecase_da": "Beskeder, præmier og musik til fællesskabet.",
      "usecase_en": "Announcements, awards and music for your community."
    }
  }
];
