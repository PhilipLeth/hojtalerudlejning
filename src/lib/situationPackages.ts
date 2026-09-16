import type { RentalProduct } from "./products";
/** Udstyrspakker. Transport og bemanding tilvælges separat. */
export const situationPackages: RentalProduct[] = [
  {
    "id": "event_konference_1",
    "page": "/events/konference",
    "category": "av",
    "price": 2545,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Konference med skærm",
    "name_en": "Conference with display",
    "desc_da": "Når programmet skal holde fra første oplæg til sidste spørgsmål.",
    "desc_en": "Keep the programme moving, from the first presentation to the final question.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon PRO",
      "Mixer mellem · t.mix 1202 FX USB",
      "55\" Storskærm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer mellem · t.mix 1202 FX USB",
          "label_en": "Medium mixer · t.mix 1202 FX USB",
          "price": 395
        },
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        }
      ],
      "discount": 135,
      "usecase_da": "Når programmet skal holde fra første oplæg til sidste spørgsmål.",
      "usecase_en": "Keep the programme moving, from the first presentation to the final question."
    }
  },
  {
    "id": "event_konference_2",
    "page": "/events/konference",
    "category": "av",
    "price": 3485,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Konference med projektion",
    "name_en": "Conference with projection",
    "desc_da": "Når programmet skal holde fra første oplæg til sidste spørgsmål.",
    "desc_en": "Keep the programme moving, from the first presentation to the final question.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon PRO",
      "Trådløst headset PRO",
      "Mixer mellem · t.mix 1202 FX USB",
      "Projektor Pro (5000 lumen)",
      "Lærred 160 cm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        },
        {
          "productId": "headset_pro",
          "label_da": "Trådløst headset PRO",
          "label_en": "Wireless headset PRO",
          "price": 595
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer mellem · t.mix 1202 FX USB",
          "label_en": "Medium mixer · t.mix 1202 FX USB",
          "price": 395
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
      "discount": 185,
      "usecase_da": "Når programmet skal holde fra første oplæg til sidste spørgsmål.",
      "usecase_en": "Keep the programme moving, from the first presentation to the final question."
    }
  },
  {
    "id": "event_moede_1",
    "page": "/events/moede",
    "category": "av",
    "price": 595,
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
      "discount": 0,
      "usecase_da": "Et møde, hvor alle kan høre og følge med.",
      "usecase_en": "A meeting everyone can hear and follow."
    }
  },
  {
    "id": "event_moede_2",
    "page": "/events/moede",
    "category": "av",
    "price": 1505,
    "image": "/images/product-skaerm-white.webp",
    "showPartImages": true,
    "name_da": "Møde med billede og tale",
    "name_en": "Meeting display and speech",
    "desc_da": "Et møde, hvor alle kan høre og følge med.",
    "desc_en": "A meeting everyone can hear and follow.",
    "contents": [
      "55\" Storskærm",
      "Mackie Thump GO",
      "Trådløs mikrofon PRO"
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
          "price": 395
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        }
      ],
      "discount": 80,
      "usecase_da": "Et møde, hvor alle kan høre og følge med.",
      "usecase_en": "A meeting everyone can hear and follow."
    }
  },
  {
    "id": "event_praesentation_1",
    "page": "/events/praesentation",
    "category": "av",
    "price": 595,
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
      "discount": 0,
      "usecase_da": "Gør plads til budskabet på skærmen.",
      "usecase_en": "Give your message the screen it needs."
    }
  },
  {
    "id": "event_praesentation_2",
    "page": "/events/praesentation",
    "category": "av",
    "price": 1405,
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
          "price": 395
        },
        {
          "productId": "haandholdt_mikrofon",
          "label_da": "Håndholdt mikrofon (kabel)",
          "label_en": "Handheld microphone (wired)",
          "price": 95
        }
      ],
      "discount": 75,
      "usecase_da": "Gør plads til budskabet på skærmen.",
      "usecase_en": "Give your message the screen it needs."
    }
  },
  {
    "id": "event_generalforsamling_1",
    "page": "/events/generalforsamling",
    "category": "av",
    "price": 1225,
    "image": "/images/product-party-v2-white.webp",
    "showPartImages": true,
    "name_da": "Generalforsamling med tale",
    "name_en": "Assembly speech setup",
    "desc_da": "Tydelig tale og plads til spørgsmål.",
    "desc_en": "Clear speech with room for questions.",
    "contents": [
      "Lille højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon PRO"
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
          "price": 100
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        }
      ],
      "discount": 65,
      "usecase_da": "Tydelig tale og plads til spørgsmål.",
      "usecase_en": "Clear speech with room for questions."
    }
  },
  {
    "id": "event_generalforsamling_2",
    "page": "/events/generalforsamling",
    "category": "av",
    "price": 2635,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Generalforsamling med billede",
    "name_en": "Assembly with display",
    "desc_da": "Tydelig tale og plads til spørgsmål.",
    "desc_en": "Clear speech with room for questions.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon PRO",
      "Håndholdt mikrofon (kabel)",
      "Mixer mellem · t.mix 1202 FX USB",
      "55\" Storskærm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        },
        {
          "productId": "haandholdt_mikrofon",
          "label_da": "Håndholdt mikrofon (kabel)",
          "label_en": "Handheld microphone (wired)",
          "price": 95
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer mellem · t.mix 1202 FX USB",
          "label_en": "Medium mixer · t.mix 1202 FX USB",
          "price": 395
        },
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        }
      ],
      "discount": 140,
      "usecase_da": "Tydelig tale og plads til spørgsmål.",
      "usecase_en": "Clear speech with room for questions."
    }
  },
  {
    "id": "event_foredrag_1",
    "page": "/events/foredrag",
    "category": "av",
    "price": 1225,
    "image": "/images/product-party-v2-white.webp",
    "showPartImages": true,
    "name_da": "Foredrag med mikrofon",
    "name_en": "Talk with microphone",
    "desc_da": "Lad publikum koncentrere sig om indholdet.",
    "desc_en": "Let your audience concentrate on the content.",
    "contents": [
      "Lille højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon PRO"
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
          "price": 100
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        }
      ],
      "discount": 65,
      "usecase_da": "Lad publikum koncentrere sig om indholdet.",
      "usecase_en": "Let your audience concentrate on the content."
    }
  },
  {
    "id": "event_foredrag_2",
    "page": "/events/foredrag",
    "category": "av",
    "price": 2920,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Undervisning med headset og billede",
    "name_en": "Training with headset and projection",
    "desc_da": "Lad publikum koncentrere sig om indholdet.",
    "desc_en": "Let your audience concentrate on the content.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Trådløst headset PRO",
      "Mixer mellem · t.mix 1202 FX USB",
      "Projektor Pro (5000 lumen)",
      "Lærred 160 cm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "headset_pro",
          "label_da": "Trådløst headset PRO",
          "label_en": "Wireless headset PRO",
          "price": 595
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer mellem · t.mix 1202 FX USB",
          "label_en": "Medium mixer · t.mix 1202 FX USB",
          "price": 395
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
      "discount": 155,
      "usecase_da": "Lad publikum koncentrere sig om indholdet.",
      "usecase_en": "Let your audience concentrate on the content."
    }
  },
  {
    "id": "event_messe_1",
    "page": "/events/messe",
    "category": "av",
    "price": 595,
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
      "discount": 0,
      "usecase_da": "Et tydeligt budskab på få kvadratmeter.",
      "usecase_en": "A clear message in a compact space."
    }
  },
  {
    "id": "event_messe_2",
    "page": "/events/messe",
    "category": "av",
    "price": 1880,
    "image": "/images/product-skaerm-white.webp",
    "showPartImages": true,
    "name_da": "Stand med præsentationslyd",
    "name_en": "Stand presentation setup",
    "desc_da": "Et tydeligt budskab på få kvadratmeter.",
    "desc_en": "A clear message in a compact space.",
    "contents": [
      "55\" Storskærm",
      "Mackie Thump GO",
      "Trådløs mikrofon PRO",
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
          "price": 395
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        },
        {
          "productId": "uplight_4",
          "label_da": "Uplight 4-pak",
          "label_en": "Uplight 4-pack",
          "price": 395
        }
      ],
      "discount": 100,
      "usecase_da": "Et tydeligt budskab på få kvadratmeter.",
      "usecase_en": "A clear message in a compact space."
    }
  },
  {
    "id": "event_produktlancering_1",
    "page": "/events/produktlancering",
    "category": "av",
    "price": 1505,
    "image": "/images/product-skaerm-white.webp",
    "showPartImages": true,
    "name_da": "Lancering med skærm",
    "name_en": "Launch with display",
    "desc_da": "Fra afsløring til præsentation.",
    "desc_en": "From the reveal to the presentation.",
    "contents": [
      "55\" Storskærm",
      "Mackie Thump GO",
      "Trådløs mikrofon PRO"
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
          "price": 395
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        }
      ],
      "discount": 80,
      "usecase_da": "Fra afsløring til præsentation.",
      "usecase_en": "From the reveal to the presentation."
    }
  },
  {
    "id": "event_produktlancering_2",
    "page": "/events/produktlancering",
    "category": "av",
    "price": 2920,
    "image": "/images/product-skaerm-white.webp",
    "showPartImages": true,
    "name_da": "Lancering med lys og stor lyd",
    "name_en": "Launch with lighting and PA",
    "desc_da": "Fra afsløring til præsentation.",
    "desc_en": "From the reveal to the presentation.",
    "contents": [
      "55\" Storskærm",
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon PRO",
      "Mixer mellem · t.mix 1202 FX USB",
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
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer mellem · t.mix 1202 FX USB",
          "label_en": "Medium mixer · t.mix 1202 FX USB",
          "price": 395
        },
        {
          "productId": "uplight_4",
          "label_da": "Uplight 4-pak",
          "label_en": "Uplight 4-pack",
          "price": 395
        }
      ],
      "discount": 155,
      "usecase_da": "Fra afsløring til præsentation.",
      "usecase_en": "From the reveal to the presentation."
    }
  },
  {
    "id": "event_reception_1",
    "page": "/events/reception",
    "category": "lyd",
    "price": 940,
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
          "price": 100
        },
        {
          "productId": "traadloes_mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 295
        }
      ],
      "discount": 50,
      "usecase_da": "Musik og taler med plads til samtalen.",
      "usecase_en": "Music and speeches with space for conversation."
    }
  },
  {
    "id": "event_reception_2",
    "page": "/events/reception",
    "category": "lyd",
    "price": 2355,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Reception med stemningslys",
    "name_en": "Reception with uplighting",
    "desc_da": "Musik og taler med plads til samtalen.",
    "desc_en": "Music and speeches with space for conversation.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon PRO",
      "Mixer mellem · t.mix 1202 FX USB",
      "Uplight 4-pak"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer mellem · t.mix 1202 FX USB",
          "label_en": "Medium mixer · t.mix 1202 FX USB",
          "price": 395
        },
        {
          "productId": "uplight_4",
          "label_da": "Uplight 4-pak",
          "label_en": "Uplight 4-pack",
          "price": 395
        }
      ],
      "discount": 125,
      "usecase_da": "Musik og taler med plads til samtalen.",
      "usecase_en": "Music and speeches with space for conversation."
    }
  },
  {
    "id": "event_fredagsbar_1",
    "page": "/events/fredagsbar",
    "category": "lyd",
    "price": 940,
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
          "price": 100
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 295
        }
      ],
      "discount": 50,
      "usecase_da": "Fra arbejdsdag til en god aften sammen.",
      "usecase_en": "From the working day to a good evening together."
    }
  },
  {
    "id": "event_fredagsbar_2",
    "page": "/events/fredagsbar",
    "category": "lyd",
    "price": 2070,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Fredagsbar med dansegulv",
    "name_en": "Friday bar dance floor",
    "desc_da": "Fra arbejdsdag til en god aften sammen.",
    "desc_en": "From the working day to a good evening together.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Subwoofer 12\"",
      "Lys-pakke",
      "Trådløs mikrofon"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "subwoofer",
          "label_da": "Subwoofer 12\"",
          "label_en": "Subwoofer 12\"",
          "price": 295
        },
        {
          "productId": "lys",
          "label_da": "Lys-pakke",
          "label_en": "Light package",
          "price": 495
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 295
        }
      ],
      "discount": 110,
      "usecase_da": "Fra arbejdsdag til en god aften sammen.",
      "usecase_en": "From the working day to a good evening together."
    }
  },
  {
    "id": "event_firmafest_1",
    "page": "/events/firmafest",
    "category": "lyd",
    "price": 1695,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Firmafest med tale og musik",
    "name_en": "Company party sound",
    "desc_da": "Taler ved bordene. Musik på dansegulvet.",
    "desc_en": "Dinner speeches. Music on the dance floor.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon",
      "Mixer mellem · t.mix 1202 FX USB"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 295
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer mellem · t.mix 1202 FX USB",
          "label_en": "Medium mixer · t.mix 1202 FX USB",
          "price": 395
        }
      ],
      "discount": 90,
      "usecase_da": "Taler ved bordene. Musik på dansegulvet.",
      "usecase_en": "Dinner speeches. Music on the dance floor."
    }
  },
  {
    "id": "event_firmafest_2",
    "page": "/events/firmafest",
    "category": "lyd",
    "price": 2820,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Firmafest med bas og lys",
    "name_en": "Company party sound and lighting",
    "desc_da": "Taler ved bordene. Musik på dansegulvet.",
    "desc_en": "Dinner speeches. Music on the dance floor.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Subwoofer 12\"",
      "Trådløs mikrofon",
      "Mixer mellem · t.mix 1202 FX USB",
      "Lys-pakke",
      "Uplight 4-pak"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "subwoofer",
          "label_da": "Subwoofer 12\"",
          "label_en": "Subwoofer 12\"",
          "price": 295
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 295
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer mellem · t.mix 1202 FX USB",
          "label_en": "Medium mixer · t.mix 1202 FX USB",
          "price": 395
        },
        {
          "productId": "lys",
          "label_da": "Lys-pakke",
          "label_en": "Light package",
          "price": 495
        },
        {
          "productId": "uplight_4",
          "label_da": "Uplight 4-pak",
          "label_en": "Uplight 4-pack",
          "price": 395
        }
      ],
      "discount": 150,
      "usecase_da": "Taler ved bordene. Musik på dansegulvet.",
      "usecase_en": "Dinner speeches. Music on the dance floor."
    }
  },
  {
    "id": "event_koncert_1",
    "page": "/events/koncert",
    "category": "lyd",
    "price": 1790,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Akustisk livesæt",
    "name_en": "Acoustic live set",
    "desc_da": "Et nærværende livesæt med styr på lyden.",
    "desc_en": "An intimate live set with sound taken care of.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Mixer mellem · t.mix 1202 FX USB",
      "Håndholdt mikrofon PRO (kabel)"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer mellem · t.mix 1202 FX USB",
          "label_en": "Medium mixer · t.mix 1202 FX USB",
          "price": 395
        },
        {
          "productId": "haandholdt_mikrofon_pro",
          "label_da": "Håndholdt mikrofon PRO (kabel)",
          "label_en": "Handheld microphone PRO (wired)",
          "price": 395
        }
      ],
      "discount": 95,
      "usecase_da": "Et nærværende livesæt med styr på lyden.",
      "usecase_en": "An intimate live set with sound taken care of."
    }
  },
  {
    "id": "event_koncert_2",
    "page": "/events/koncert",
    "category": "lyd",
    "price": 2535,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Live med ekstra bas og lys",
    "name_en": "Live sound with bass and lighting",
    "desc_da": "Et nærværende livesæt med styr på lyden.",
    "desc_en": "An intimate live set with sound taken care of.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Subwoofer 12\"",
      "Mixer mellem · t.mix 1202 FX USB",
      "Håndholdt mikrofon PRO (kabel)",
      "Håndholdt mikrofon (kabel)",
      "Uplight 4-pak"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "subwoofer",
          "label_da": "Subwoofer 12\"",
          "label_en": "Subwoofer 12\"",
          "price": 295
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer mellem · t.mix 1202 FX USB",
          "label_en": "Medium mixer · t.mix 1202 FX USB",
          "price": 395
        },
        {
          "productId": "haandholdt_mikrofon_pro",
          "label_da": "Håndholdt mikrofon PRO (kabel)",
          "label_en": "Handheld microphone PRO (wired)",
          "price": 395
        },
        {
          "productId": "haandholdt_mikrofon",
          "label_da": "Håndholdt mikrofon (kabel)",
          "label_en": "Handheld microphone (wired)",
          "price": 95
        },
        {
          "productId": "uplight_4",
          "label_da": "Uplight 4-pak",
          "label_en": "Uplight 4-pack",
          "price": 395
        }
      ],
      "discount": 135,
      "usecase_da": "Et nærværende livesæt med styr på lyden.",
      "usecase_en": "An intimate live set with sound taken care of."
    }
  },
  {
    "id": "event_bryllup_1",
    "page": "/events/bryllup",
    "category": "lyd",
    "price": 1980,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Bryllup med taler og musik",
    "name_en": "Wedding speeches and music",
    "desc_da": "Fra den første tale til den sidste dans.",
    "desc_en": "From the first speech to the last dance.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon PRO",
      "Mixer mellem · t.mix 1202 FX USB"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer mellem · t.mix 1202 FX USB",
          "label_en": "Medium mixer · t.mix 1202 FX USB",
          "price": 395
        }
      ],
      "discount": 105,
      "usecase_da": "Fra den første tale til den sidste dans.",
      "usecase_en": "From the first speech to the last dance."
    }
  },
  {
    "id": "event_bryllup_2",
    "page": "/events/bryllup",
    "category": "lyd",
    "price": 3105,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Bryllup med dansegulv og lys",
    "name_en": "Wedding dance floor and lighting",
    "desc_da": "Fra den første tale til den sidste dans.",
    "desc_en": "From the first speech to the last dance.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Subwoofer 12\"",
      "Trådløs mikrofon PRO",
      "Mixer mellem · t.mix 1202 FX USB",
      "Lys-pakke",
      "Uplight 4-pak"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "subwoofer",
          "label_da": "Subwoofer 12\"",
          "label_en": "Subwoofer 12\"",
          "price": 295
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        },
        {
          "productId": "mixer_stor",
          "label_da": "Mixer mellem · t.mix 1202 FX USB",
          "label_en": "Medium mixer · t.mix 1202 FX USB",
          "price": 395
        },
        {
          "productId": "lys",
          "label_da": "Lys-pakke",
          "label_en": "Light package",
          "price": 495
        },
        {
          "productId": "uplight_4",
          "label_da": "Uplight 4-pak",
          "label_en": "Uplight 4-pack",
          "price": 395
        }
      ],
      "discount": 165,
      "usecase_da": "Fra den første tale til den sidste dans.",
      "usecase_en": "From the first speech to the last dance."
    }
  },
  {
    "id": "event_privatfest_1",
    "page": "/events/privatfest",
    "category": "lyd",
    "price": 660,
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
          "price": 100
        }
      ],
      "discount": 35,
      "usecase_da": "Den rigtige lyd til jeres lokale og gæster.",
      "usecase_en": "The right sound for your room and guests."
    }
  },
  {
    "id": "event_privatfest_2",
    "page": "/events/privatfest",
    "category": "lyd",
    "price": 1790,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Privatfest med lyd og lys",
    "name_en": "Private party sound and lights",
    "desc_da": "Den rigtige lyd til jeres lokale og gæster.",
    "desc_en": "The right sound for your room and guests.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Lys-pakke",
      "Trådløs mikrofon"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "lys",
          "label_da": "Lys-pakke",
          "label_en": "Light package",
          "price": 495
        },
        {
          "productId": "mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless mic",
          "price": 295
        }
      ],
      "discount": 95,
      "usecase_da": "Den rigtige lyd til jeres lokale og gæster.",
      "usecase_en": "The right sound for your room and guests."
    }
  },
  {
    "id": "event_filmaften_1",
    "page": "/events/filmaften",
    "category": "av",
    "price": 940,
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
          "price": 395
        }
      ],
      "discount": 50,
      "usecase_da": "Et stort billede og lyd, der følger med.",
      "usecase_en": "A big picture with sound to match."
    }
  },
  {
    "id": "event_filmaften_2",
    "page": "/events/filmaften",
    "category": "av",
    "price": 1600,
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
          "price": 100
        }
      ],
      "discount": 85,
      "usecase_da": "Et stort billede og lyd, der følger med.",
      "usecase_en": "A big picture with sound to match."
    }
  },
  {
    "id": "event_udendoers_1",
    "page": "/events/udendoers",
    "category": "lyd",
    "price": 465,
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
          "price": 395
        },
        {
          "productId": "haandholdt_mikrofon",
          "label_da": "Håndholdt mikrofon (kabel)",
          "label_en": "Handheld microphone (wired)",
          "price": 95
        }
      ],
      "discount": 25,
      "usecase_da": "Musik og tale under åben himmel.",
      "usecase_en": "Music and speech in the open air."
    }
  },
  {
    "id": "event_udendoers_2",
    "page": "/events/udendoers",
    "category": "lyd",
    "price": 845,
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
          "price": 795
        },
        {
          "productId": "haandholdt_mikrofon",
          "label_da": "Håndholdt mikrofon (kabel)",
          "label_en": "Handheld microphone (wired)",
          "price": 95
        }
      ],
      "discount": 45,
      "usecase_da": "Musik og tale under åben himmel.",
      "usecase_en": "Music and speech in the open air."
    }
  },
  {
    "id": "event_forening_1",
    "page": "/events/forening",
    "category": "lyd",
    "price": 465,
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
          "price": 395
        },
        {
          "productId": "haandholdt_mikrofon",
          "label_da": "Håndholdt mikrofon (kabel)",
          "label_en": "Handheld microphone (wired)",
          "price": 95
        }
      ],
      "discount": 25,
      "usecase_da": "Beskeder, præmier og musik til fællesskabet.",
      "usecase_en": "Announcements, awards and music for your community."
    }
  },
  {
    "id": "event_forening_2",
    "page": "/events/forening",
    "category": "lyd",
    "price": 2170,
    "image": "/images/product-festival-v2-white.webp",
    "showPartImages": true,
    "name_da": "Klubhus med lyd og billede",
    "name_en": "Clubhouse sound and display",
    "desc_da": "Beskeder, præmier og musik til fællesskabet.",
    "desc_en": "Announcements, awards and music for your community.",
    "contents": [
      "Stor højtalerpakke",
      "Højtalerstativer",
      "Trådløs mikrofon PRO",
      "55\" Storskærm"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "festival",
          "label_da": "Stor højtalerpakke",
          "label_en": "Large Speaker Package",
          "price": 995
        },
        {
          "productId": "stativer",
          "label_da": "Højtalerstativer",
          "label_en": "Speaker stands",
          "price": 100
        },
        {
          "productId": "traadloes_mikrofon_pro",
          "label_da": "Trådløs mikrofon PRO",
          "label_en": "Wireless mic PRO",
          "price": 595
        },
        {
          "productId": "skaerm_55",
          "label_da": "55\" Storskærm",
          "label_en": "55\" Screen",
          "price": 595
        }
      ],
      "discount": 115,
      "usecase_da": "Beskeder, præmier og musik til fællesskabet.",
      "usecase_en": "Announcements, awards and music for your community."
    }
  }
];
