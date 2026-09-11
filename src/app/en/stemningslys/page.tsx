import { Metadata } from "next";
import Link from "next/link";
import ProductLanding from "@/components/ProductLanding";
import { localeAlternates } from "@/lib/hreflang";

export const metadata: Metadata = {
  title: "Ambient Light Package | Uplights, Fairy Lights & Disco Ball | 1.045 DKK | Lejhøjtaler.dk",
  description:
    "The ambient light package: 4 LED uplights, 10 m of fairy lights and a disco ball for 1.045 DKK — save 140 DKK. Lighting that transforms a rented venue. Rental in Copenhagen.",
  keywords: [
    "uplighting rental copenhagen",
    "wedding lighting rental copenhagen",
    "venue lighting hire copenhagen",
    "fairy lights rental copenhagen",
    "ambient lighting rental denmark",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/stemningslys",
    languages: localeAlternates("/stemningslys"),
  },
  openGraph: {
    title: "Ambient Light Package | Uplights, Fairy Lights & Disco Ball | 1.045 DKK",
    description:
      "4 LED uplights, 10 m of fairy lights and a disco ball. For the venue with fluorescent tubes in the ceiling — save 140 DKK.",
    url: "https://lejhojtaler.dk/en/stemningslys",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  return (
    <ProductLanding
      locale="en"
      slug="en/stemningslys"
      name="Ambient light package"
      price={1045}
      headline="Ambient light package — light without sound"
      sub="4 LED uplights, 10 m of fairy lights and a disco ball. For the venue with fluorescent tubes in the ceiling — save 140 DKK."
      image="/images/product-pakke-stemningslys-taendt-v3.webp"
      imageAlt="Ambient light package with uplights, fairy lights and a disco ball"
      productId="pakke_stemningslys"
      faqPhrase="the ambient light package"
      capacity={{ level: 2, label: "a whole venue" }}
      bullets={[
        "4× LED uplight — washes walls and corners in coloured light",
        "10 m of fairy lights for the ceiling, a marquee or the bar",
        "Disco ball with motor and spotlight for the dancefloor",
        "Plug and play: everything runs on ordinary power, no DMX control",
        "Save 140 DKK vs renting the parts separately",
      ]}
    >
      <section className="mx-auto max-w-3xl px-4 pb-16">
        <div className="glass rounded-2xl p-8">
          <h2 className="mb-3 text-2xl font-bold">Already sorted for sound?</h2>
          <p className="mb-6 text-white/50">
            Then this is the package you are missing. A rented venue with fluorescent
            tubes in the ceiling looks like a canteen until the light is replaced —
            four uplights along the walls are the cheapest transformation there is.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/en/festlys"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              All about party lights
            </Link>
            <Link
              href="/en/roegmaskine"
              className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/70 transition hover:border-white/35"
            >
              Fog makes the light visible
            </Link>
          </div>
        </div>
      </section>
    </ProductLanding>
  );
}
