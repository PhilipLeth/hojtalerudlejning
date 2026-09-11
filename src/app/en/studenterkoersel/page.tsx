import { Metadata } from "next";
import OccasionLanding from "@/components/OccasionLanding";
import { prisDkk } from "@/lib/products";
import { PHONE_DISPLAY } from "@/lib/phone";
import { localeAlternates } from "@/lib/hreflang";

/**
 * /en/studenterkoersel — studenterkørsel på engelsk.
 *
 * Slug'en er den danske, fordi EN_PAGES parrer sider på den sti. Fænomenet
 * findes ikke på engelsk, så teksten forklarer det ("graduation truck") frem
 * for at oversætte ordet: den engelske læser er typisk en international student
 * i København, der skal med på en andens vogn.
 */
export const metadata: Metadata = {
  title: `Graduation Truck Speaker Rental Copenhagen | From ${prisDkk("soundboks")} | Lejhøjtaler.dk`,
  description: `Rent a battery-powered speaker for a graduation truck in Copenhagen from ${prisDkk("soundboks")}. Loud enough over the engine and 30 singing students. Spare battery and padded bag included.`,
  keywords: [
    "loud speaker rental copenhagen",
    "battery speaker rental copenhagen",
    "soundboks rental copenhagen",
    "speaker rental for truck party",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/studenterkoersel",
    languages: localeAlternates("/studenterkoersel"),
  },
  openGraph: {
    title: `Graduation Truck Speaker Rental Copenhagen | From ${prisDkk("soundboks")} | Lejhøjtaler.dk`,
    description: `Battery-powered and loud enough over the engine. Spare battery and padded bag included.`,
    url: "https://lejhojtaler.dk/en/studenterkoersel",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <OccasionLanding
      locale="en"
      slug="studenterkoersel"
      popularFor="graduation trucks"
      headline={"A speaker for the graduation truck"}
      headlinePriceId="soundboks"
      intro={"Music that carries over the engine and 30 singing students. Battery-powered, so it only has to be strapped to the truck."}
      primaryProductId="pakke_student"
      primaryName={"graduation package"}
      primaryWhy={"There is no power on the flatbed, and the speaker gets lifted on and off all day. Two batteries last from morning to the last address, and the padded bag is what gets the Soundboks through the trip."}
      gridItems={[{ id: "pakke_student", tag: "Recommended" }, { id: "soundboks" }, { id: "thumpgo" }, { id: "batteri" }, { id: "traadloes_mikrofon" }]}
      tips={[
        { title: "Strap it down properly", text: "The Soundboks has to be lashed to the truck with straps — it weighs 11 kg and must not be able to slide under braking. We are happy to lend you straps." },
        { title: "Book early in June", text: "Graduation season is concentrated in a few weeks in June, and our battery speakers go first. April is not too early." },
        { title: "A spare battery for long days", text: "If you are out from morning to evening, a spare battery can be added for " + prisDkk("batteri") + " — then you know the music lasts the whole route." },
        { title: "Count on rain", text: "A Danish June is unpredictable. Have a tarpaulin or a plastic bag ready so the speaker can be covered if it pours." },
      ]}
      faq={[
        { q: "Does the battery last a whole day of driving?", a: "Yes. The Soundboks 4 plays for up to 40 hours at normal volume — at full blast closer to 5-8 hours, which covers a typical day on the route. A spare battery can be added." },
        { q: "Can it cope with riding on a truck?", a: "The Soundboks is built for outdoor use and handles vibration and dust. It just has to be strapped down properly and kept out of direct rain." },
        { q: "What does it cost for a whole week?", a: "We charge the same price for 1 to 5 days. If you need it for longer, call us on " + PHONE_DISPLAY + " and we will find a price." },
        { q: "Who is liable if it gets damaged?", a: "The renter is liable for damage beyond ordinary wear — see the rental terms. So: strap it down, and do not leave it unattended." },
      ]}
      related={[
        { href: "/studenterpakke", label: "The graduation package", priceId: "pakke_student" },
        { href: "/soundboks-4", label: "Soundboks 4" },
        { href: "/ungdomsfest", label: "Sound and lights for the graduation party" },
        { href: "/lej-hojtaler", label: "All speakers" },
        { href: "/mackie-thump-go", label: "Mackie Thump GO" },
      ]}
    />
  );
}
