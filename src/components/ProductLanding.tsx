import Link from "next/link";
import CapacityBadge from "@/components/CapacityBadge";
import LivePrice from "@/components/LivePrice";
import ProductVideo from "@/components/ProductVideo";
import ProductYouTube from "@/components/ProductYouTube";
import FaqSection, { type FaqItem } from "@/components/FaqSection";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { bookHref as toBook } from "@/lib/bookUrl";
import { PhoneText } from "@/components/PhoneLink";
import { buildProductFaq } from "@/lib/productFaq";

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
   * Stjerner i Product-schema. **Ingen side sætter den i dag, og det er med
   * vilje** — de synlige testimonials er opdigtede, og markup bygget på dem er
   * spammy structured markup hos Google og en falsk anmeldelse efter
   * markedsføringsloven. structured-data.test.tsx fejler hvis proppen tages i
   * brug igen.
   *
   * Mekanikken bliver stående, fordi den skal bruges den dag der ligger ægte
   * Google-anmeldelser — men kun på de produkter anmeldelserne handler om.
   * Se prd.json → seo.reviews_policy.
   */
  reviewed?: { ratingValue: string; reviewCount: string };
  /** Kapacitets-ikon: personfigurer + interval (fx 30-50 pers.) */
  capacity?: { level: 1 | 2 | 3; label: string };
  /**
   * Spørgsmål der kun giver mening på netop denne side. Resten — pris, hvad
   * der er med, kapacitet, afhentning og lejeperiode — bygges automatisk af
   * produktets egne tal i buildProductFaq, så de ikke kan drive fra prisen
   * øverst på siden.
   */
  faqExtra?: FaqItem[];
  /**
   * Navnet midt i en sætning, når produktnavnet er et fællesnavn:
   * "Hvad koster det at leje Stor højtalerpakke?" er ikke dansk, men
   * "…at leje den store højtalerpakke?" er. Se buildProductFaq.
   */
  faqPhrase?: string;
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
  capacity,
  faqExtra,
  faqPhrase,
  children,
}: ProductLandingProps) {
  const bookHref = toBook(productId);
  const cta = bookLabel ?? `Book ${name} nu`;
  const faq = buildProductFaq({ name, price, productId, phrase: faqPhrase, capacity: capacity?.label, extra: faqExtra });

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
          style={{ backgroundImage: "url(/images/hero.webp)" }}
        />
        <div className="fixed inset-0 bg-gradient-to-b from-[#07060b]/40 via-transparent to-[#07060b]/80" />

        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            København · Betal ved afhentning · Ring <PhoneText />
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {headline}
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              <LivePrice productId={productId} fallback={price} />
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">{sub}</p>
          {capacity && (
            <div className="mt-4 flex justify-center">
              <CapacityBadge level={capacity.level} label={capacity.label} />
            </div>
          )}
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

        <FaqSection items={faq} title={`Ofte stillede spørgsmål om ${name}`} />

        <Testimonials />

        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Klar til at booke?</h2>
          <p className="mx-auto mt-4 max-w-md text-white/50">
            Book online på 2 minutter. Hent fredag i København S, aflever mandag. <LivePrice productId={productId} fallback={price} prefix="" suffix=" kr" />/weekend.
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
