import type { Locale } from "@/lib/i18n";

/** Tilbudsløsninger: udstyr er et udgangspunkt, ikke en fast pris eller lagerreservation. */
export const eventSolutions = [
  {
    id: "moeder", image: "meeting", productIds: ["projektor_pro", "laerred_160", "festival", "stativer", "traadloes_mikrofon_pro", "mixer_stor"],
    da: { title: "Møder & præsentationer", intro: "Tydelig tale. Et billede, alle kan følge.", audience: "Møder, seminarer og generalforsamlinger", equipment: ['Projektor og lærred eller 55″ skærm', 'Højtalere på stativer', 'Trådløs mikrofon og mixer'], service: "Levering, opstilling og afprøvning med jeres præsentation. Tekniker under mødet aftales efter behov.", example: "Et seminar med oplæg, spørgsmål fra salen og præsentationer fra egen computer.", note: "Vi vælger skærm eller projektion efter afstand, dagslys og deltagerantal." },
    en: { title: "Meetings & presentations", intro: "Clear speech. A picture everyone can follow.", audience: "Meetings, seminars and general assemblies", equipment: ['Projector and screen or a 55″ display', 'PA speakers on stands', 'Wireless microphone and mixer'], service: "Delivery, setup and a test with your presentation. An on-site technician can be included as needed.", example: "A seminar with presentations, audience questions and slides from your own laptop.", note: "We choose the display or projection setup to suit viewing distance, daylight and attendance." },
  },
  {
    id: "messe", image: "expo", productIds: ["skaerm_55", "thumpgo", "traadloes_mikrofon_pro"],
    da: { title: "Messestand & lancering", intro: "Jeres budskab. Tydeligt præsenteret.", audience: "Messer, produktdemoer og mindre stande", equipment: ['55″ skærm på gulvstativ', 'Kompakt lyd til præsentationer', 'Mikrofon og nødvendige forbindelser'], service: "Vi planlægger levering og opstilling efter jeres stand, adgangstider og program. Afhentning aftales samlet.", example: "En mindre stand med produktvideo, kundemøder og korte præsentationer.", note: "Til fx Bella Center afklarer vi adgang, strøm og arrangørens regler med jer. Eventuelle venueydelser aftales særskilt." },
    en: { title: "Exhibitions & launches", intro: "Your message. Clearly presented.", audience: "Trade shows, product demos and small stands", equipment: ['55″ display on a floor stand', 'Compact sound for presentations', 'Microphone and required connections'], service: "Delivery and setup are planned around your stand, access times and schedule. Collection is agreed as part of the quote.", example: "A small exhibition stand with a product video, customer meetings and short presentations.", note: "For venues such as Bella Center, we confirm access, power and organiser requirements with you. Venue services are agreed separately." },
  },
  {
    id: "reception", image: "reception-front-v2", productIds: ["festival", "stativer", "traadloes_mikrofon_pro", "mixer_stor", "uplight_4"],
    da: { title: "Reception & firmaevent", intro: "God lyd, der giver plads til rummet.", audience: "Receptioner, middage og firmaarrangementer", equipment: ['To højtalere med stativer', 'Trådløs mikrofon og mixer', 'Uplights til vægge og hjørner'], service: "Diskret placering, lydprøve og gennemgang før gæsterne kommer. Vi aftaler musikafspilning, taler og afhentning med jer.", example: "Velkomstmusik, et par taler og en rolig overgang til middag eller netværk.", note: "Vi tilpasser placering og lydniveau til rummet og gæsternes samtaler." },
    en: { title: "Receptions & company events", intro: "Good sound that belongs in the room.", audience: "Receptions, dinners and company gatherings", equipment: ['Two speakers with stands', 'Wireless microphone and mixer', 'Uplights for walls and corners'], service: "Discreet placement, a sound check and a handover before guests arrive. Music playback, speeches and collection are agreed with you.", example: "Welcome music, a few speeches and an easy transition to dinner or networking.", note: "We adapt speaker placement and volume to the room and your guests’ conversations." },
  },
  {
    id: "koncert", image: "concert", productIds: ["festival", "stativer", "subwoofer", "mixer_stor", "mikrofon_kabel", "uplight_4"],
    da: { title: "Mindre koncerter & live", intro: "Nærvær på scenen. Styr på lyden.", audience: "Akustiske indslag, duoer og intime koncerter", equipment: ['PA-højtalere og eventuel subwoofer', 'Mixer og mikrofoner efter inputliste', 'Enkel belysning og kabler'], service: "Planlægning ud fra jeres program og musikerens behov. Opsætning, soundcheck og lydmand under indslaget indgår efter aftale.", example: "En akustisk duo til et firmaevent eller en lille koncert med tale mellem numrene.", note: "Vi gennemgår inputliste, monitorbehov og lokale, før vi bekræfter løsningen." },
    en: { title: "Small concerts & live music", intro: "An intimate performance. Sound taken care of.", audience: "Acoustic sets, duos and intimate concerts", equipment: ['PA speakers and an optional subwoofer', 'Mixer and microphones to suit the input list', 'Simple lighting and cables'], service: "Planning around your programme and the performers’ needs. Setup, soundcheck and a sound engineer during the performance are agreed in the quote.", example: "An acoustic duo at a company event or a small concert with spoken introductions.", note: "We review the input list, monitor requirements and venue before confirming the setup." },
  },
] as const;

export function solutionHref(id: string, locale: Locale) {
  return `${locale === "en" ? "/en" : ""}/eventloesninger?loesning=${encodeURIComponent(id)}#foresp`;
}
