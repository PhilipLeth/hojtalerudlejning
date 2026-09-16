import type { RentalProduct } from "./products";

/** Færdige mikrofonpakker med faktiske antal; trådløs modtager kræver strøm. */
export const microphonePackages: RentalProduct[] = [
  {
    "id": "pakke_mikrofon_batteri",
    "category": "av",
    "price": 445,
    "image": "/images/product-thumpgo-v2-white.webp",
    "showPartImages": true,
    "name_da": "Batteripakke til tale",
    "name_en": "Battery-powered speech package",
    "desc_da": "Til vielse, have og tale uden stikkontakt. Batterihøjtaler og mikrofon med kabel.",
    "desc_en": "For outdoor ceremonies and speeches without mains power. Battery speaker and wired microphone.",
    "allowedAddons": [
      "stativer",
      "lydmand"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "thumpgo",
          "label_da": "Mackie Thump GO",
          "label_en": "Mackie Thump GO",
          "price": 395,
          "qty": 1
        },
        {
          "productId": "haandholdt_mikrofon",
          "label_da": "Mikrofon med kabel",
          "label_en": "Wired microphone",
          "price": 95,
          "qty": 1
        }
      ],
      "discount": 45,
      "usecase_da": "Til vielse, have og tale uden stikkontakt. Batterihøjtaler og mikrofon med kabel.",
      "usecase_en": "For outdoor ceremonies and speeches without mains power. Battery speaker and wired microphone."
    }
  },
  {
    "id": "pakke_mikrofon_traadloes",
    "category": "av",
    "price": 645,
    "image": "/images/product-thumpgo-v2-white.webp",
    "showPartImages": true,
    "name_da": "Trådløs talepakke",
    "name_en": "Wireless speech package",
    "desc_da": "Én trådløs mikrofon og kompakt batterihøjtaler. Beregn en stikkontakt til mikrofonmodtageren.",
    "desc_en": "One wireless microphone and a compact battery speaker. Allow a mains socket for the microphone receiver.",
    "allowedAddons": [
      "stativer",
      "lydmand"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "thumpgo",
          "label_da": "Mackie Thump GO",
          "label_en": "Mackie Thump GO",
          "price": 395,
          "qty": 1
        },
        {
          "productId": "traadloes_mikrofon",
          "label_da": "Trådløs mikrofon",
          "label_en": "Wireless microphone",
          "price": 295,
          "qty": 1
        }
      ],
      "discount": 45,
      "usecase_da": "Én trådløs mikrofon og kompakt batterihøjtaler. Beregn en stikkontakt til mikrofonmodtageren.",
      "usecase_en": "One wireless microphone and a compact battery speaker. Allow a mains socket for the microphone receiver."
    }
  },
  {
    "id": "pakke_mikrofon_duo",
    "category": "av",
    "price": 1395,
    "image": "/images/product-party-v2-white.webp",
    "showPartImages": true,
    "name_da": "To trådløse mikrofoner og lyd",
    "name_en": "Two wireless microphones and PA",
    "desc_da": "Til panel, møde og duet: to trådløse mikrofoner, to højtalere og mixer til mikrofoner og musik. Kræver strøm.",
    "desc_en": "For panels, meetings and duets: two wireless microphones, two speakers and a mixer for microphones and music. Mains power required.",
    "allowedAddons": [
      "stativer",
      "lydmand"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "party",
          "label_da": "2× Alto 10″ højtalere",
          "label_en": "2× Alto 10″ speakers",
          "price": 595,
          "qty": 1
        },
        {
          "productId": "traadloes_mikrofon",
          "label_da": "2× Trådløs mikrofon",
          "label_en": "2× Wireless microphone",
          "price": 590,
          "qty": 2
        },
        {
          "productId": "mixer_stor",
          "label_da": "t.mix mixer · 6 mikrofonindgange",
          "label_en": "t.mix mixer · 6 microphone inputs",
          "price": 395,
          "qty": 1
        }
      ],
      "discount": 185,
      "usecase_da": "Til panel, møde og duet: to trådløse mikrofoner, to højtalere og mixer til mikrofoner og musik. Kræver strøm.",
      "usecase_en": "For panels, meetings and duets: two wireless microphones, two speakers and a mixer for microphones and music. Mains power required."
    }
  },
  {
    "id": "pakke_mikrofon_av",
    "category": "av",
    "price": 1995,
    "image": "/images/product-party-v2-white.webp",
    "showPartImages": true,
    "name_da": "AV-pakke med to trådløse mikrofoner",
    "name_en": "AV package with two wireless microphones",
    "desc_da": "Til præsentation og møde: projektor, lærred, to højtalere, mixer og to trådløse mikrofoner. Kræver strøm. Computer medbringes.",
    "desc_en": "For presentations and meetings: projector, screen, two speakers, mixer and two wireless microphones. Mains power required. Bring your laptop.",
    "allowedAddons": [
      "stativer",
      "lydmand"
    ],
    "bundle": {
      "parts": [
        {
          "productId": "party",
          "label_da": "2× Alto 10″ højtalere",
          "label_en": "2× Alto 10″ speakers",
          "price": 595,
          "qty": 1
        },
        {
          "productId": "traadloes_mikrofon",
          "label_da": "2× Trådløs mikrofon",
          "label_en": "2× Wireless microphone",
          "price": 590,
          "qty": 2
        },
        {
          "productId": "mixer_stor",
          "label_da": "t.mix mixer · 6 mikrofonindgange",
          "label_en": "t.mix mixer · 6 microphone inputs",
          "price": 395,
          "qty": 1
        },
        {
          "productId": "projektor",
          "label_da": "Projektor",
          "label_en": "Projector",
          "price": 495,
          "qty": 1
        },
        {
          "productId": "laerred_160",
          "label_da": "Lærred 160 cm",
          "label_en": "160 cm screen",
          "price": 195,
          "qty": 1
        }
      ],
      "discount": 275,
      "usecase_da": "Til præsentation og møde: projektor, lærred, to højtalere, mixer og to trådløse mikrofoner. Kræver strøm. Computer medbringes.",
      "usecase_en": "For presentations and meetings: projector, screen, two speakers, mixer and two wireless microphones. Mains power required. Bring your laptop."
    }
  },
  {
    "id": "pakke_mikrofon_panel",
    "category": "av",
    "price": 1995,
    "image": "/images/product-party-v2-white.webp",
    "showPartImages": true,
    "name_da": "Panelpakke med fire mikrofoner",
    "name_en": "Panel package with four microphones",
    "desc_da": "Fire trådløse mikrofoner, to højtalere og USB-mixer. Book online til panel, generalforsamling og debat. Kræver strøm.",
    "desc_en": "Four wireless microphones, two speakers and a USB mixer. Book online for panels, assemblies and debates. Mains power required.",
    "allowedAddons": ["stativer", "lydmand"],
    "bundle": {
      "parts": [
        { "productId": "party", "label_da": "2× Alto 10″ højtalere", "label_en": "2× Alto 10″ speakers", "price": 595, "qty": 1 },
        { "productId": "traadloes_mikrofon", "label_da": "4× Trådløs mikrofon", "label_en": "4× Wireless microphone", "price": 1180, "qty": 4 },
        { "productId": "mixer_stor", "label_da": "t.mix mixer · 6 mikrofonindgange", "label_en": "t.mix mixer · 6 microphone inputs", "price": 395, "qty": 1 }
      ],
      "discount": 175,
      "usecase_da": "Fire trådløse mikrofoner, to højtalere og USB-mixer. Book online til panel, generalforsamling og debat. Kræver strøm.",
      "usecase_en": "Four wireless microphones, two speakers and a USB mixer. Book online for panels, assemblies and debates. Mains power required."
    }
  },
  {
    "id": "pakke_hybrid_teams",
    "category": "av",
    "price": 1195,
    "image": "/images/product-mixer-tmix-1202-fx-usb.jpg",
    "showPartImages": true,
    "name_da": "Teams- og Zoom-pakken",
    "name_en": "Teams and Zoom package",
    "desc_da": "USB-mixer sender salens tale til mødet og mødets lyd i højtalerne. En trådløs mikrofon og to højtalere. Book online. Kræver strøm og jeres computer.",
    "desc_en": "A USB mixer sends the room to the call and the call to the speakers. One wireless microphone and two speakers. Book online. Mains power and your laptop required.",
    "allowedAddons": ["stativer", "lydmand"],
    "bundle": {
      "parts": [
        { "productId": "party", "label_da": "2× Alto 10″ højtalere", "label_en": "2× Alto 10″ speakers", "price": 595, "qty": 1 },
        { "productId": "mixer_stor", "label_da": "t.mix mixer · USB til Teams/Zoom", "label_en": "t.mix mixer · USB for Teams/Zoom", "price": 395, "qty": 1 },
        { "productId": "traadloes_mikrofon", "label_da": "Trådløs mikrofon", "label_en": "Wireless microphone", "price": 295, "qty": 1 }
      ],
      "discount": 90,
      "usecase_da": "USB-mixer sender salens tale til mødet og mødets lyd i højtalerne. En trådløs mikrofon og to højtalere. Book online. Kræver strøm og jeres computer.",
      "usecase_en": "A USB mixer sends the room to the call and the call to the speakers. One wireless microphone and two speakers. Book online. Mains power and your laptop required."
    }
  }
];
