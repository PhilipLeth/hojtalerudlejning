import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { prisDkk } from "@/lib/products";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: `Birthday Party Speaker Rental Copenhagen | From ${prisDkk("pakke_fest_lille")} | Lejhøjtaler.dk`,
  description: `Rent speakers and lights for a birthday party in Copenhagen from ${prisDkk("pakke_fest_lille")}. From a kids' party with disco lights to a milestone birthday with speeches. All cables included.`,
  keywords: [
    "birthday party speaker rental copenhagen",
    "party sound system rental copenhagen",
    "disco light rental for birthday",
    "speaker hire for birthday party",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/foedselsdag",
    languages: localeAlternates("/foedselsdag"),
  },
  openGraph: {
    title: `Birthday Party Speaker Rental Copenhagen | From ${prisDkk("pakke_fest_lille")} | Lejhøjtaler.dk`,
    description: `From a kids' party with disco lights to a milestone birthday with speeches. Book online.`,
    url: "https://lejhojtaler.dk/en/foedselsdag",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      locale="en"
      slug="foedselsdag"
      popularFor="birthdays"
      headline={"Sound for a birthday"}
      headlinePriceId="pakke_fest_lille"
      intro={"From a kids' party with disco lights to the milestone birthday with speeches. We have the packages, and every cable is included — you just connect your phone."}
      primaryProductId="pakke_fest_stor"
      primaryName={"large party package"}
      primaryWhy={"Two 12\" EV speakers on stands fill a living room or a venue without turning shrill, and the light package puts a difference between the dinner and the party afterwards. Enough for up to 100 guests."}
      gridItems={[{ id: "pakke_fest_stor", tag: "Recommended" }, { id: "pakke_fest_lille" }, { id: "traadloes_mikrofon" }, { id: "discokugle" }, { id: "pakke_fest_150", tag: "100-150 guests" }]}
      tips={[
        { title: "For the milestone ones: bring a microphone", text: "50th and 60th birthdays are speech parties. A wireless microphone makes sure every speech is heard — including the one where the voice goes thin." },
        { title: "For a kids' party: disco lights", text: "A disco ball at " + prisDkk("discokugle") + " or a single light effect at " + prisDkk("lyseffekt") + " turns the living room into a nightclub. Children are easy to entertain with light and music." },
        { title: "Make the playlist before the guests arrive", text: "The system connects to one phone at a time over Bluetooth. With the list ready in advance you avoid five guests taking turns pairing their phones mid-party." },
        { title: "Book the weekend, not the day", text: "The price is the same for 1 to 5 days, so collect on Friday and return on Monday even if the party is only on Saturday. That way you can set up in peace." },
      ]}
      faq={[
        { q: "What does sound for a birthday cost?", a: "The small party package with two speakers and a single light effect is " + prisDkk("pakke_fest_lille") + " for up to 5 days. If you only want speakers, the small speaker package is " + prisDkk("party") + "." },
        { q: "Can you deliver to the address?", a: "Yes. Delivery and setup in Copenhagen is " + prisDkk("levering_ud") + " — we come out and set it up ready to use, and you return it yourself. If we should collect it again after the party, both ways is " + prisDkk("levering_begge") + "." },
        { q: "Is it hard to set up?", a: "No. The speakers go into a socket and the phone connects over Bluetooth. It takes under five minutes, and every cable is included." },
        { q: "Do you have anything for a kids' party?", a: "A disco ball at " + prisDkk("discokugle") + " and a single light effect at " + prisDkk("lyseffekt") + " are the most popular for children — the living room becomes a nightclub and the music comes from a phone. Both can be added directly in the booking." },
      ]}
      related={[
        { href: "/festpakke-stor", label: "Large party package", priceId: "pakke_fest_stor" },
        { href: "/havefest", label: "Sound for a garden party" },
        { href: "/konfirmation", label: "Sound for a confirmation party" },
        { href: "/festlys", label: "Party lights" },
      ]}
    />
  );
}
