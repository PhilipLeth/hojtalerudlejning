import type { Addon } from "./products";

/** mixer_stor bevares som id af hensyn til eksisterende bookinger; den er nu mellemklassen. */
export const mixerModels: Addon[] = [
  {
    id: "mixer_lille", page: "/mixer", price: 295, hidden: true,
    image: "/images/product-mixer-mackie-mix12fx.jpg",
    contents: ["Mackie Mix12FX", "Strømforsyning", "Kabel til højtaler"],
    da: { label: "Mixer lille · Mackie Mix12FX", desc: "4 mikrofonindgange, stereoindgange og effekter. Til taler og mindre arrangementer. På forespørgsel." },
    en: { label: "Small mixer · Mackie Mix12FX", desc: "4 microphone inputs, stereo inputs and effects. For speeches and smaller events. On request." },
  },
  {
    id: "mixer_stor", page: "/mixer", price: 345,
    image: "/images/product-mixer-tmix-1202-fx-usb.jpg",
    contents: ["the t.mix xmix 1202 FXMP USB", "Strømforsyning", "Kabler til højtaler"],
    da: { label: "Mixer med effekter · t.mix 1202 FXMP USB", desc: "6 mikrofonindgange, 2 stereoindgange, effekter og stereo-USB. Til panel, møde og mindre band. Kræver strøm." },
    en: { label: "Mixer with effects · t.mix 1202 FXMP USB", desc: "6 microphone inputs, 2 stereo inputs, effects and stereo USB. For panels, meetings and small bands. Mains power required." },
  },
  {
    id: "mixer_xl", page: "/mixer", price: 495, hidden: true,
    image: "/images/product-mixer-tmix-1402-fxmp-usb.jpg",
    contents: ["the t.mix xmix 1402 FXMP USB", "Strømforsyning", "Kabler til højtaler"],
    da: { label: "Mixer stor · t.mix 1402 FXMP USB", desc: "8 mikrofonindgange, 2 stereoindgange, effekter og Bluetooth. Til flere talere, band og kor. På forespørgsel." },
    en: { label: "Large mixer · t.mix 1402 FXMP USB", desc: "8 microphone inputs, 2 stereo inputs, effects and Bluetooth. For larger panels, bands and choirs. On request." },
  },
];
export const MIXER_INPUTS: Record<string, number> = { mixer_lille: 4, mixer_stor: 6, mixer_xl: 8 };
