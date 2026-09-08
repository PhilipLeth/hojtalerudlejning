import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { catalogDiscount, prisDkk } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

/** "Save 200 DKK" på et pakkekort — beløbet slås op, så det ikke kan drive. */
const spar = (id: string) => `Save ${catalogDiscount(id)} DKK`;

export const metadata: Metadata = {
  title: `Company Party Sound Rental Copenhagen | From ${prisDkk("pakke_fest_lille")} | Lejhøjtaler.dk`,
  description: `Rent sound and lighting for a Christmas or company party in Copenhagen from ${prisDkk("pakke_fest_lille")}. Speakers, wireless microphone, lights and fog in one package, one price.`,
  keywords: [
    "company party sound rental copenhagen",
    "christmas party pa system hire copenhagen",
    "office party speaker rental",
    "event sound and lighting rental copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/julefrokost",
    languages: localeAlternates("/julefrokost"),
  },
  openGraph: {
    title: `Company Party Sound Rental Copenhagen | From ${prisDkk("pakke_fest_lille")} | Lejhøjtaler.dk`,
    description: `Speakers, wireless microphone, lights and fog in one package, one price. Book online.`,
    url: "https://lejhojtaler.dk/en/julefrokost",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      locale="en"
      slug="julefrokost"
      popularFor="company parties"
      headline={"Sound for the company party"}
      headlinePriceId="pakke_fest_lille"
      intro={"A Christmas party is two parties in one: the speech has to reach the whole room, and afterwards people have to dance. Speakers, microphone, lights and fog — in one package at one price."}
      primaryProductId="pakke_firmafest"
      primaryName={"company party package"}
      primaryWhy={"The evening starts with a speech and ends on the dancefloor. The microphone handles the first half and the subwoofer the second — and the lights and fog are what stop the canteen from looking like a canteen."}
      gridItems={[
        { id: "pakke_firmafest", tag: "Recommended" },
        { id: "pakke_fest_stor", tag: spar("pakke_fest_stor") },
        { id: "pakke_fest_lille", tag: spar("pakke_fest_lille") },
        { id: "pakke_fest_150", tag: "100-150 guests" },
        { id: "pakke_lysshow", tag: spar("pakke_lysshow") },
      ]}
      tips={[
        { title: "The speech first, the dancefloor after", text: "The two halves of a company party each make their own demand: the speech has to carry to the back of the room, the music has to be felt. Pick a package that has a microphone AND bass, so you are not swapping systems mid-evening." },
        { title: "Book November early", text: "November and early December are the busiest weeks of our year. Fridays and Saturdays go several weeks in advance." },
        { title: "Ask whether there is a smoke alarm", text: "Fog is what makes the light beams visible, but an ordinary smoke alarm in a canteen will react to it. If you want fog anyway, a low fog machine lays it along the floor instead of sending it up to the ceiling." },
        { title: "Light is what makes it a party", text: "A single light effect at " + prisDkk("lyseffekt") + " turns an office or a canteen into a venue in five minutes." },
      ]}
      faq={[
        { q: "What does sound for a company party cost?", a: "The small party package is " + prisDkk("pakke_fest_lille") + " and covers the office's own Christmas lunch. The company party package at " + prisDkk("pakke_firmafest") + " is the one we recommend: speakers on stands, a wireless microphone, a subwoofer, lights and a fog machine in one price." },
        { q: "Can everyone hear the speech?", a: "Yes. The wireless microphone comes with the company party package and goes straight into the speaker — no mixer in between, and no cable to trip over." },
        { q: "How many guests do the packages cover?", a: "The small party package takes up to 50 guests, the large one at " + prisDkk("pakke_fest_stor") + " up to 100, and Party package 150 at " + prisDkk("pakke_fest_150") + " covers a party of 100-150. The numbers are for indoor use." },
        { q: "Can we rent it to the company address?", a: "Yes. Delivery and setup in Copenhagen is " + prisDkk("levering_ud") + ", and " + prisDkk("levering_begge") + " if we collect it again after the party — however late that turns out to be." },
      ]}
      related={[
        { href: "/firmafestpakke", label: "The company party package", priceId: "pakke_firmafest" },
        { href: "/lydanlaeg", label: "PA systems by guest count" },
        { href: "/lysshow", label: "Light show packages" },
        { href: "/lej-mikrofon", label: "Microphone rental" },
      ]}
    />
  );
}
