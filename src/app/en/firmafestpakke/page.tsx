import { prisDkk, rabatDkk } from "@/lib/products";
import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

import { ogImages } from "@/lib/og";
export const metadata: Metadata = {
  title: `Company Party Package | Microphone, sub, lights and fog | ${prisDkk("pakke_firmafest")} | Lejhøjtaler.dk`,
  description:
    `Company party package: 2× EV 12\" speakers on stands, wireless microphone, 12\" subwoofer, light bar and fog machine for ${prisDkk("pakke_firmafest")}, save ${rabatDkk("pakke_firmafest")}. For Christmas parties and company events in Copenhagen.`,
  keywords: ["company party sound system rental copenhagen", "christmas party sound hire", "corporate event speakers rental", "microphone for speeches rental copenhagen"],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/firmafestpakke",
    languages: localeAlternates("/firmafestpakke"),
  },
  openGraph: {
    images: ogImages("/images/product-pakke-fest-stor.webp"),
    title: `Company party package | Microphone, sub, lights and fog | ${prisDkk("pakke_firmafest")}`,
    description: `Speakers on stands, wireless microphone, subwoofer, lights and fog. For Christmas parties and company events, save ${rabatDkk("pakke_firmafest")}.`,
    url: "https://lejhojtaler.dk/en/firmafestpakke",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/firmafestpakke"
      name="Company party package"
      headline="The company party package, the speech first, the dancefloor after"
      sub={`Speakers on stands, wireless microphone, subwoofer, lights and fog. For Christmas parties and company events, save ${rabatDkk("pakke_firmafest")}.`}
      imageAlt="Company party package with speakers, subwoofer, lights and fog machine"
      productId="pakke_firmafest"
      faqPhrase="the company party package"
      capacity={{ level: 3, label: "up to 120 people" }}
      bullets={[
        "2× EV 12\" speakers on stands",
        "Wireless microphone for the welcome and the thank-you speech",
        "12\" subwoofer, the bass that gets people up from the tables",
        "Light bar and fog machine, so the room is more than just lit",
        "All cables and Bluetooth included",
        `Save ${rabatDkk("pakke_firmafest")} compared to renting the parts separately`,
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Need an invoice?</h2>
          <p className="mb-6 text-white/50">
            We send invoices with EAN or CVR, and we can deliver, set up and collect again. If you are more than 120, or need more than two microphones on stage, we make a quote instead.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/erhverv" className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10">
              Rental for businesses
            </Link>
            <Link href="/en/lydanlaeg" className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35">
              See the whole ladder
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
