import Link from "next/link";
import LivePrice from "@/components/LivePrice";
import ProductVideo from "@/components/ProductVideo";
import ProductYouTube from "@/components/ProductYouTube";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { bookHref as toBook } from "@/lib/bookUrl";

export interface ProductLandingProps {
  slug: string;
  name: string;
  price: number;
  headline: string;
  sub: string;
  image: string;
  imageAlt: string;
  bullets: string[];
  /** Booking product id for /?product=ID#book */
  productId: string;
  bookLabel?: string;
  /**
   * Sæt kun på produkter som de synlige anmeldelser rent faktisk handler om.
   * Må ikke sættes blankt på hele kataloget — se prd.json → seo.reviews_policy.
   */
  reviewed?: { ratingValue: string; reviewCount: string };
  /** Optional extra section under product detail */
  children?: React.ReactNode;
}

export default function ProductLanding({
  slug,
  name,
  price,
  headline,
  sub,
  image,
  imageAlt,
  bullets,
  productId,
  bookLabel,
  reviewed,
  children,
}: ProductLandingProps) {
  const bookHref = toBook(productId);
  const cta = bookLabel ?? `Book ${name} nu`;

  // Product-schema med pris, lagerstatus og leveringspris (rich results i Google)
  const productLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${name} udlejning`,
    description: sub,
    image: `https://lejhojtaler.dk${image}`,
    brand: { "@type": "Brand", name: "Lejhøjtaler.dk" },
    // aggregateRating sættes KUN via reviewed-proppen, og kun på produkter som
    // de synlige anmeldelser faktisk handler om. Aldrig blankt på hele kataloget
    // (Googles regler om spammy structured markup).
    ...(reviewed
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewed.ratingValue,
            reviewCount: reviewed.reviewCount,
            bestRating: "5",
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: String(price),
      priceCurrency: "DKK",
      priceValidUntil: "2027-12-31",
      availability: "https://schema.org/InStock",
      url: `https://lejhojtaler.dk/${slug}`,
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "495",
          currency: "DKK",
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "DK",
          addressRegion: "København",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
        },
      },
    },
  };

  // Produkt-specifik FAQ — navn og pris interpoleres, så indholdet er unikt pr. side
  const faqs = [
    {
      q: `Hvad koster det at leje ${name}?`,
      a: `Det koster fra ${price} kr for en hel weekend — hent fredag (14–18), aflever mandag (15–17). Én weekendpris dækker op til 5 dages leje, og alle kabler er inkluderet.`,
    },
    {
      q: `Hvor henter jeg ${name}?`,
      a: "Afhentning sker på Halvtolv 9, 1436 København K — nemt med cykel eller bil (gratis parkering i én time). Du kan også få det leveret i hele Storkøbenhavn for 495 kr inkl. opsætning og afhentning.",
    },
    {
      q: "Hvordan betaler jeg?",
      a: "Du kan betale sikkert online med kort, eller vælge at betale ved afhentning. Afbestilling er gratis frem til 24 timer før afhentning.",
    },
    {
      q: `Er ${name} ledig til min dato?`,
      a: "Vælg dine datoer i bookingflowet — så ser du med det samme, om der er ledigt. Booking tager 2 minutter, og du får bekræftelse på e-mail.",
    },
  ];

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Forside", item: "https://lejhojtaler.dk" },
      { "@type": "ListItem", position: 2, name, item: `https://lejhojtaler.dk/${slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />

      <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 text-center overflow-hidden">
        <div
          className="fixed inset-0 bg-cover bg-center opacity-55"
          style={{ backgroundImage: "url(/images/hero.png)" }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            København · Betal ved afhentning · Ring 31 13 28 52
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {headline}
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              <LivePrice productId={productId} fallback={price} />
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">{sub}</p>
          <a
            href={bookHref}
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            {cta}
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <section className="mx-auto max-w-4xl px-4 py-24">
          <div className="grid items-center gap-8 sm:grid-cols-2">
            <div className="relative overflow-hidden rounded-2xl bg-[#0d0c12]">
              <img
                src={image}
                alt={imageAlt}
                width={600}
                height={400}
                className="w-full object-contain p-6"
              />
              {/* Play-knap når produktet har video i kataloget (uploades i admin) */}
              <ProductVideo productId={productId} name={name} />
            </div>
            <div>
              <h2 className="mb-4 text-3xl font-bold">{name}</h2>
              <p className="mb-6 text-3xl font-bold text-brand-400">
                <LivePrice productId={productId} fallback={price} prefix="" suffix=" kr" /><span className="text-lg font-normal text-white/40">/weekend</span>
              </p>
              <ul className="space-y-3 text-white/60">
                {bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs text-brand-400">
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <a
                href={bookHref}
                className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-3 font-semibold text-black transition hover:bg-brand-400 active:scale-95"
              >
                {cta}
              </a>
            </div>
          </div>
        </section>

        <ProductYouTube productId={productId} name={name} />

        {children}

        <Testimonials />

        <section className="mx-auto max-w-2xl px-4 pb-24">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
          />
          <h2 className="mb-8 text-center text-3xl font-bold">Ofte stillede spørgsmål</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="glass group rounded-2xl p-6">
                <summary className="cursor-pointer list-none font-semibold text-white/90 transition group-open:text-brand-400">
                  {f.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Klar til at booke?</h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online på 2 minutter. Hent fredag i København K, aflever mandag. <LivePrice productId={productId} fallback={price} prefix="" suffix=" kr" />/weekend.
          </p>
          <a
            href={bookHref}
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            {cta}
          </a>
          <p className="mt-4">
            <Link href="/" className="text-sm text-white/40 transition hover:text-brand-400">
              ← Se alle produkter
            </Link>
          </p>
        </section>

        <Footer />
      </main>
    </>
  );
}
