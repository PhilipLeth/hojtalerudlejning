import { Metadata } from "next";
import LivePrice from "@/components/LivePrice";
import { catalogDiscount, catalogPrice, prisDkk, prisTekst } from "@/lib/products";
import Link from "next/link";
import GoogleReviews from "@/components/GoogleReviews";
import Footer from "@/components/Footer";
import FaqSection from "@/components/FaqSection";
import { CATEGORY_FAQ } from "@/lib/categoryFaq";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import { LocationKicker } from "@/components/PhoneLink";
import { localeAlternates } from "@/lib/hreflang";

/** Højtaler + lysbar + røgmaskine hver for sig — tallet i "complete party package from …". */
const KOMPLET_FEST = prisTekst(catalogPrice("party") + catalogPrice("lys") + catalogPrice("rog"));

/**
 * "Save 140 DKK"-mærkatet på et pakkekort.
 *
 * Beløbet slås op i kataloget i stedet for at stå i hånden ved siden af linket
 * til pakken. Den danske side skriver "Spar 140,-" som tekst, og præcis den
 * slags tal er dem, der bliver stående, når en pris ændrer sig — se
 * priser-i-tekst.test.ts.
 */
const spar = (id: string) => `Save ${prisTekst(catalogDiscount(id))} DKK`;

/** Uplight 4-pakken er ikke et bundle — rabatten er fire enkelte minus pakken. */
const SPAR_UPLIGHT_4 = `Save ${prisTekst(4 * catalogPrice("uplight") - catalogPrice("uplight_4"))} DKK`;

export const metadata: Metadata = {
  title: "Party Light Rental Copenhagen | Disco Ball & Fog Machine | Lejhøjtaler.dk",
  description:
    `Rent party lights in Copenhagen: light package from ${prisDkk("lys")}, fog machine from ${prisDkk("rog")}, disco ball and fairy lights. Add sound for a complete party package from ${KOMPLET_FEST} DKK. Pay on pickup.`,
  keywords: [
    "party light rental copenhagen",
    "disco light rental copenhagen",
    "event lighting rental copenhagen",
    "fog machine rental copenhagen",
    "disco ball rental copenhagen",
    "uplighting rental copenhagen",
    "led lighting hire copenhagen",
  ],
  alternates: {
    canonical: "https://lejhojtaler.dk/en/festlys",
    languages: localeAlternates("/festlys"),
  },
  openGraph: {
    title: "Party Light Rental Copenhagen | Disco Ball & Fog Machine | Lejhøjtaler.dk",
    description:
      `Light package from ${prisDkk("lys")}, fog machine from ${prisDkk("rog")}, disco ball and fairy lights. Book online.`,
    url: "https://lejhojtaler.dk/en/festlys",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function Page() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://lejhojtaler.dk/en" },
      { "@type": "ListItem", position: 2, name: "Party lights", item: "https://lejhojtaler.dk/en/festlys" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero */}
      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div
          className="fixed inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url(/images/hero.webp)" }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            <LocationKicker locale="en" extra="Pay on pickup" />
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Party lights, disco ball and fog machine
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              for rent in Copenhagen
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">
            Single light effect <LivePrice productId="lyseffekt" prefix="from " suffix=" DKK" />{" · "}
            Uplights <LivePrice productId="uplight" prefix="from " suffix=" DKK" />{" · "}
            Light package <LivePrice productId="lys" prefix="from " suffix=" DKK" />{" · "}
            Fog machine <LivePrice productId="rog" prefix="from " suffix=" DKK" />
          </p>
          <a
            href="/en?product=lys#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book party lights now
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        {/* Product cards */}
        <section className="mx-auto max-w-4xl px-4 py-24">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
            Lights and fog for your party
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-center text-white/50">
            Set the mood with a single light effect, uplights, the light package, a
            fog machine, a disco ball or fairy lights.
          </p>

          <CategoryProductGrid
            locale="en"
            items={[
              { id: "pakke_stemningslys", href: "/stemningslys", tag: spar("pakke_stemningslys") },
              { id: "pakke_diskolys", href: "/diskolys", tag: spar("pakke_diskolys") },
              { id: "pakke_teenagefest", href: "/teenagefest-lys", tag: spar("pakke_teenagefest") },
              { id: "pakke_festtelt", href: "/festtelt-lys", tag: spar("pakke_festtelt") },
              { id: "pakke_bryllupslys", href: "/bryllupslys", tag: spar("pakke_bryllupslys") },
              { id: "pakke_diskotek", href: "/diskotek-pakke", tag: spar("pakke_diskotek") },
              { id: "lyseffekt", href: "/enkelt-lyseffekt" },
              { id: "uplight", href: "/uplights" },
              { id: "uplight_4", href: "/uplights", tag: SPAR_UPLIGHT_4 },
              { id: "lys", href: "/lys-pakke" },
              { id: "rog", href: "/roegmaskine" },
              { id: "discokugle", href: "/discokugle" },
              { id: "lyskaeder", href: "/lyskaeder" },
            ]}
          />
        </section>

        {/* Upsell */}
        <section className="mx-auto max-w-3xl px-4 pb-24">
          <div className="glass rounded-2xl p-8 text-center">
            <h2 className="mb-4 text-2xl font-bold text-white">
              Add sound — a complete party package from {KOMPLET_FEST} DKK
            </h2>
            <p className="mx-auto mb-6 max-w-md text-white/50">
              Rent speakers, lights and a fog machine together. Everything you need
              for the party, in one booking.
            </p>
            <div className="mb-6 grid gap-4 sm:grid-cols-3">
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-lg font-bold text-white">Party speaker</p>
                <p className="text-xl font-bold text-brand-400"><LivePrice productId="party" prefix="" suffix=" DKK" /></p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-lg font-bold text-white">Light package</p>
                <p className="text-xl font-bold text-brand-400"><LivePrice productId="lys" prefix="" suffix=" DKK" /></p>
              </div>
              <div className="glass rounded-xl p-4 text-center">
                <p className="text-lg font-bold text-white">Fog machine</p>
                <p className="text-xl font-bold text-brand-400"><LivePrice productId="rog" prefix="" suffix=" DKK" /></p>
              </div>
            </div>
            <Link
              href="/en"
              className="rounded-full border border-brand-500/30 px-6 py-3 font-semibold text-brand-400 transition hover:bg-brand-500/10"
            >
              See speaker packages
            </Link>
          </div>
        </section>

        <FaqSection items={CATEGORY_FAQ["en-festlys"]} title="Frequently asked questions" />

        <GoogleReviews locale="en" />

        {/* Final CTA */}
        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to light up the party?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online in 2 minutes. Collect on Friday in Copenhagen S, return Monday.
          </p>
          <a
            href="/en?product=lys#book"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book party lights now
          </a>
        </section>

        <Footer locale="en" />
      </main>
    </>
  );
}
