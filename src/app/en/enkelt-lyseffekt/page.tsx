import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Single Light Effect Rental Copenhagen | 395 DKK | Lejhøjtaler.dk",
  description:
    "Rent a single LED party light in Copenhagen for 395 DKK per weekend. Plug-and-play colour effect for birthdays, house parties and small venues. Book online in 2 minutes.",
  keywords: [
    "party light rental copenhagen",
    "led light effect rental copenhagen",
    "disco light hire copenhagen",
    "cheap party lighting rental copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/enkelt-lyseffekt",
    languages: localeAlternates("/enkelt-lyseffekt"),
  },
  openGraph: {
    title: "Single Light Effect Rental Copenhagen | 395 DKK",
    description:
      "One LED par light (no stand) — a plug-and-play colour effect for your party. Book online, pay on pickup.",
    url: "https://lejhojtaler.dk/en/enkelt-lyseffekt",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/enkelt-lyseffekt"
      name="Single light effect"
      price={395}
      headline="Rent a single light effect in Copenhagen"
      sub="One LED par light (no stand) — a plug-and-play colour effect that sets the mood in minutes."
      image="/images/product-lyseffekt-v2.webp"
      imageAlt="Single LED party light for rent in Copenhagen"
      productId="lyseffekt"
      faqPhrase="a single light effect"
      bullets={[
        "1 LED par light (no stand) with automatic colour effects",
        "Plug and play — connect the power and it runs",
        "Right for living rooms, small venues and garden parties up to about 40 people",
        "Combine it with a speaker package, or pick the small party package instead",
        "Add a fog machine to make the beams visible in the air",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-4 text-2xl font-bold">When is one light effect enough?</h2>
          <p className="mb-4 text-white/50">
            For most house parties and birthdays, one good light effect is enough to
            make it feel like a party without filling the room with equipment. If you
            want a light bar for a proper dancefloor, the{" "}
            <Link href="/en/lys-pakke" className="text-brand-400 underline-offset-2 hover:underline">
              light package
            </Link>{" "}
            is the right choice.
          </p>
          <p className="text-white/50">
            You can add the light effect directly in the booking together with
            speakers — or choose the{" "}
            <Link href="/en/festpakke-lille" className="text-brand-400 underline-offset-2 hover:underline">
              small party package
            </Link>
            , where sound and light already come together.
          </p>
        </div>
      </section>
    </ProductLanding>
  );
}
