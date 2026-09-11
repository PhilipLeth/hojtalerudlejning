import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Graduation Package | Soundboks, extra battery and bag | 845 DKK | Lejhøjtaler.dk",
  description:
    "Graduation package: Soundboks 4, extra battery and padded carry bag for 845 DKK — save 90 DKK. Plays through the whole graduation truck ride without power. Rent in Copenhagen.",
  keywords: ["graduation truck speaker rental", "soundboks for graduation ride copenhagen", "student party speaker hire", "music for graduation truck"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/studenterpakke",
    languages: localeAlternates("/studenterpakke"),
  },
  openGraph: {
    title: "Graduation package | Soundboks, extra battery and bag | 845 DKK",
    description: "Soundboks 4, extra battery and padded carry bag. No power on the truck — save 90 DKK.",
    url: "https://lejhojtaler.dk/en/studenterpakke",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/studenterpakke"
      name="Graduation package"
      price={845}
      headline="The graduation package — plays through the whole truck ride"
      sub="Soundboks 4, extra battery and padded carry bag. No power on the truck — save 90 DKK."
      image="/images/product-soundboks-v2.webp"
      imageAlt="Graduation package with Soundboks 4, extra battery and carry bag"
      productId="pakke_student"
      faqPhrase="the graduation package"
      capacity={{ level: 2, label: "up to 50 people" }}
      bullets={[
        "Soundboks 4 — the one that can be heard over the engine",
        "Extra battery, so it lasts from morning to the last address",
        "Padded carry bag: the system is lifted on and off all day",
        "Bluetooth — everyone can change the track from their phone",
        "Save 90 DKK compared to renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Remember to strap it down</h2>
          <p className="mb-6 text-white/50">
            A Soundboks weighs 11 kg and does not stay still on a truck bed. Bring a strap or two and place it against the cab. We put the AUX cable and charger in the bag.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/studenterkoersel" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Everything about graduation rides
            </Link>
            <Link href="/en/udendorspakke" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              Need lights as well?
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
