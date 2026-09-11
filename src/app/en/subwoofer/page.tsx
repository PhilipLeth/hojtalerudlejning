import { Metadata } from "next";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Subwoofer 12\" Rental Copenhagen | 295 DKK | Lejhøjtaler.dk",
  description:
    "Rent a Behringer 12\" powered subwoofer in Copenhagen from 295 DKK per weekend. Gives the party the deep bass — fits all our speaker packages. Book online in 2 minutes.",
  keywords: ["subwoofer rental copenhagen", "subwoofer hire", "behringer subwoofer rental", "bass for party rental", "powered subwoofer hire denmark"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/subwoofer",
    languages: localeAlternates("/subwoofer"),
  },
  openGraph: {
    title: "Subwoofer 12\" rental Copenhagen | 295 DKK",
    description: "Behringer 12\" powered subwoofer — the deep bass for the party. Fits all our speaker packages. Book online.",
    url: "https://lejhojtaler.dk/en/subwoofer",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/subwoofer"
      name={"Subwoofer 12\""}
      price={295}
      headline="Rent a subwoofer in Copenhagen"
      sub={"Behringer 12\" powered subwoofer — the deep bass that makes the party felt in the body."}
      image="/images/product-subwoofer-v2.webp"
      imageAlt={"Behringer 12\" powered subwoofer for rent in Copenhagen"}
      productId="subwoofer"
      faqPhrase="a subwoofer"
      bullets={[
        "Behringer 12\" powered subwoofer with built-in amplifier",
        "Adds deep bass to all our speaker packages",
        "Power and signal cables included",
        "Ready in 5 minutes — just place it between the speakers",
        "Perfect for dancing, DJs and parties over 40 people",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-4 text-2xl font-bold">When does a subwoofer make sense?</h2>
          <p className="mb-4 text-white/50">
            Our speaker packages play loud and clean on their own — but they do not reproduce the deepest bass
            frequencies. If people are dancing to hip hop, house or anything with punch, the subwoofer is what gives
            the physical feeling of bass.
          </p>
          <p className="text-white/50">
            Add it directly in the booking together with your speaker package — then it is ready for collection
            with the rest of the equipment.
          </p>
        </div>
      </section>
    </ProductLanding>
  );
}
