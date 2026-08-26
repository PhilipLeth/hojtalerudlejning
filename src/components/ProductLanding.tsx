import Link from "next/link";
import CapacityBadge from "@/components/CapacityBadge";
import LivePrice from "@/components/LivePrice";
import FaqSection, { type FaqItem } from "@/components/FaqSection";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";
import { bookHref as toBook } from "@/lib/bookUrl";
import { PhoneText } from "@/components/PhoneLink";
import { buildProductFaq } from "@/lib/productFaq";
import { erPaaPause } from "@/lib/products";
import ProductGallery from "@/components/ProductGallery";
import type { Locale } from "@/lib/i18n";

/**
 * Sidens faste tekster på begge sprog.
 *
 * Komponenten var dansk hele vejen igennem, så en engelsk produktside var
 * ikke mulig uden at kopiere hele filen. Teksterne står her, så de to sprog
 * ikke kan komme til at vise hver sin side.
 */
const COPY = {
  da: {
    kicker: "Betal ved afhentning · Ring",
    perWeekend: "/weekend",
    book: (navn: string) => `Book ${navn} nu`,
    faqTitle: (navn: string) => `Ofte stillede spørgsmål om ${navn}`,
    ctaTitle: "Klar til at booke?",
    ctaText: "Book online på 2 minutter. Hent fredag i København S, aflever mandag.",
    allProducts: "← Se alle produkter",
    home: "/",
    pausedTitle: "Udlejes ikke lige nu",
    pausedBody:
      "Vi har samlet udlejningen om højtalere, lys og røg. Skærme, projektor, lærred og karaoke er sat på pause, og derfor kan du ikke booke her.",
    pausedSound: "Se højtalere",
    pausedLight: "Se lys og effekter",
    pausedCall: "Ring, hvis du er i tvivl",
  },
  en: {
    kicker: "Pay on pickup · Call",
    perWeekend: "/weekend",
    book: (navn: string) => `Book ${navn} now`,
    faqTitle: (navn: string) => `Frequently asked questions about ${navn}`,
    ctaTitle: "Ready to book?",
    ctaText: "Book online in 2 minutes. Collect on Friday in Copenhagen, return Monday.",
    allProducts: "← See all products",
    home: "/en",
    pausedTitle: "Not available for rent right now",
    pausedBody:
      "We have narrowed our rental range to speakers, lighting and fog. Screens, projectors, projector screens and karaoke are paused, so this cannot be booked.",
    pausedSound: "See speakers",
    pausedLight: "See lighting",
    pausedCall: "Call us if you are unsure",
  },
} as const;

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
  /** Sprog. Styrer sidens faste tekster, FAQ'en og hvor "se alle produkter" fører hen. */
  locale?: Locale;
  /** Optional extra section under product detail */
  children?: React.ReactNode;
}

/*
 * VIDEOER_SLAAET_FRA — 26. august 2026
 *
 * Producentens YouTube-video og vores egen ProductVideo vises ikke længere på
 * produktsiderne. YouTube-videoen lå på 42 produkter og kostede en iframe pr.
 * side — netop den slags tredjepartsindlejring, hastighedsarbejdet i august
 * handlede om at komme af med. Den sendte samtidig kunden videre til YouTube
 * midt i et køb, med producentens branding og forslag til andre videoer.
 *
 * Intet er slettet: youtubeUrl bliver liggende på alle 42 produkter, og
 * komponenterne ProductYouTube og ProductVideo står urørte med deres tests.
 * At fortryde er at importere den ønskede komponent igen og sætte den ind i
 * render-træet, hvor kommentaren står.
 *
 * Forklaringen ligger HER og ikke nede i JSX, fordi den første udgave var en
 * lang {/* … *\/}-blok midt i render-træet — og en anden session indsatte
 * ProductGallery inde i den. Deres kommentar lukkede min for tidligt, og
 * build'et brød. En kommentar i render-træet skal være én linje.
 */

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
  locale = "da",
  children,
}: ProductLandingProps) {
  const bookHref = toBook(productId);
  const c = COPY[locale];
  /**
   * Produktet er sat på pause i kataloget (se PAUSEDE_PRODUKTER). Siden bliver
   * liggende — den har sin plads i Google, og pausen kan rulles tilbage — men
   * den må ikke stå med en bookingknap til noget, vi ikke udlejer. Knapperne
   * bliver til en henvisning, og prisen forsvinder: en pris er et tilbud.
   */
  const paused = erPaaPause(productId);
  const cta = bookLabel ?? c.book(name);
  const faq = buildProductFaq({ name, price, productId, phrase: faqPhrase, capacity: capacity?.label, extra: faqExtra, locale });

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
      availability: erPaaPause(productId)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
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
            København · {c.kicker} <PhoneText />
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {headline}
            <br />
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              {paused ? c.pausedTitle : <LivePrice productId={productId} fallback={price} />}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg text-white/60">{sub}</p>
          {capacity && (
            <div className="mt-4 flex justify-center">
              <CapacityBadge level={capacity.level} label={capacity.label} />
            </div>
          )}
          {paused ? (
            <PauseBoks c={c} className="mt-8" />
          ) : (
            <a
              href={bookHref}
              className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
            >
              {cta}
            </a>
          )}
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
              {/* Videoerne er slået fra 26. august 2026 — se kommentaren ved
                  ProductYouTube nedenfor. Play-knappen kommer igen ved at
                  sætte linjen herunder ind:
                  <ProductVideo productId={productId} name={name} /> */}
            </div>
            <div>
              <h2 className="mb-4 text-3xl font-bold">{name}</h2>
              {paused ? (
                <p className="mb-6 text-xl font-bold text-white/40">{c.pausedTitle}</p>
              ) : (
                <p className="mb-6 text-3xl font-bold text-brand-400">
                  <LivePrice productId={productId} fallback={price} prefix="" suffix=" kr" /><span className="text-lg font-normal text-white/40">{c.perWeekend}</span>
                </p>
              )}
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
              {paused ? (
                <PauseBoks c={c} className="mt-8" />
              ) : (
                <a
                  href={bookHref}
                  className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-3 font-semibold text-black transition hover:bg-brand-400 active:scale-95"
                >
                  {cta}
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Produktet i brug. Viser ingenting, før der er genereret billeder for
            netop dette produkt — se scripts/product-images/generate.mjs. */}
        <ProductGallery productId={productId} name={name} locale={locale} />

        {/* Videoerne er slået fra — se VIDEOER_SLAAET_FRA øverst i filen. */}

        {children}

        {/* FAQ'en er bygget af prisen, lejeperioden og afhentningen — svar på
            spørgsmål om noget, der ikke kan lejes. Den udgår på pausede sider. */}
        {!paused && <FaqSection items={faq} title={c.faqTitle(name)} />}

        <Testimonials />

        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">{paused ? c.pausedTitle : c.ctaTitle}</h2>
          {paused ? (
            <>
              <p className="mx-auto mt-4 max-w-md text-white/50">{c.pausedBody}</p>
              <PauseBoks c={c} className="mt-8" />
            </>
          ) : (
            <>
              <p className="mx-auto mt-4 max-w-md text-white/50">
                {c.ctaText} <LivePrice productId={productId} fallback={price} prefix="" suffix=" kr" />{c.perWeekend}.
              </p>
              <a
                href={bookHref}
                className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
              >
                {cta}
              </a>
            </>
          )}
          <p className="mt-4">
            <Link href={c.home} className="text-sm text-white/40 transition hover:text-brand-400">
              {c.allProducts}
            </Link>
          </p>
        </section>

        <Footer locale={locale} />
      </main>
    </>
  );
}

/**
 * Vejen videre fra en pauset side. Ikke en undskyldning, men de to kategorier
 * vi rent faktisk udlejer — plus telefonnummeret, fordi den, der ledte efter
 * en projektor til en firmafest, ofte også mangler lyd.
 */
function PauseBoks({
  c,
  className = "",
}: {
  c: (typeof COPY)["da"] | (typeof COPY)["en"];
  className?: string;
}) {
  return (
    <div className={`mx-auto max-w-md rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left ${className}`}>
      <p className="text-sm text-white/60">{c.pausedBody}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={c.home === "/en" ? "/en" : "/lej-hojtaler"}
          className="rounded-full bg-brand-500 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-brand-400"
        >
          {c.pausedSound}
        </Link>
        <Link
          href={c.home === "/en" ? "/en" : "/festlys"}
          className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-brand-500/40 hover:text-white"
        >
          {c.pausedLight}
        </Link>
      </div>
      <p className="mt-3 text-sm text-white/40">
        {c.pausedCall}: <PhoneText />
      </p>
    </div>
  );
}
