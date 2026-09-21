import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Large Youth Party Package Copenhagen | Disco for 100 Guests | ${prisDkk("pakke_ungdomsfest_stor")} | Lejhøjtaler.dk`,
  description: `2× 12\" speakers, light bar, 40 cm mirror ball and fog machine, a proper disco for a youth party at ${prisDkk("pakke_ungdomsfest_stor")}. Save ${rabatDkk("pakke_ungdomsfest_stor")}. Rental in Copenhagen.`,
  keywords: ["party sound and light bar rental copenhagen", "disco equipment hire copenhagen", "18th birthday party equipment rental", "fog machine and mirror ball rental"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/ungdomsfest-pakke-stor",
    languages: localeAlternates("/ungdomsfest-pakke-stor"),
  },
  openGraph: {
    images: ogImages("/images/product-pakke-ungdomsfest-stor-taendt.webp"),
    title: `Large Youth Party Package Copenhagen | Disco for 100 Guests | ${prisDkk("pakke_ungdomsfest_stor")} | Lejhøjtaler.dk`,
    description: `2× 12\" speakers, light bar on a stand, 40 cm mirror ball and fog machine. A proper disco, save ${rabatDkk("pakke_ungdomsfest_stor")}.`,
    url: "https://lejhojtaler.dk/en/ungdomsfest-pakke-stor",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/ungdomsfest-pakke-stor"
      name="Large youth party package"
      headline="Large youth party package, a proper disco"
      sub={`Two 12&quot; speakers, a light bar on a stand, a 40 cm mirror ball and a fog machine. The hall becomes a club, save ${rabatDkk("pakke_ungdomsfest_stor")}.`}
      image="/images/product-pakke-ungdomsfest-stor-taendt-white.webp"
      imageAlt="Large youth party package switched on: two 12-inch speakers, light bar on a stand, mirror ball with spotlight and fog machine"
      productId="pakke_ungdomsfest_stor"
      faqPhrase="the large youth party package"
      capacity={{ level: 3, label: "up to 100 guests in a hall, gym or barn" }}
      bullets={[
        "2× EV 12\" speakers, fill a hall, Bluetooth from your phone",
        "Light bar: two colour lamps and a centre effect on a stand",
        "40 cm mirror ball with motor and spotlight, dots across the whole room",
        "Fog machine with fluid, the fog is what makes the beams visible",
        `Subwoofer, stands and microphone can be added, save ${rabatDkk("pakke_ungdomsfest_stor")} vs the parts separately`,
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Smaller party, or no power?</h2>
          <p className="mb-6 text-white/50">
            For the basement or garage the small youth party package is enough: a Soundboks on battery, a light effect and a mirror ball for 1,295 DKK.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/en/ungdomsfest-pakke" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Youth party package
            </Link>
            <Link href="/en/ungdomsfest" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              All about sound and lights for youth parties
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
