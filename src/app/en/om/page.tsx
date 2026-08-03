import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About us | Lejhøjtaler.dk",
  description:
    "Meet Frederik Scharling, founder of lejhøjtaler.dk. Copenhagen's most accessible rental service for sound and lights for private parties, corporate events and everything in between.",
  alternates: { canonical: "https://lejhojtaler.dk/en/om" },
  openGraph: {
    title: "About us | Lejhøjtaler.dk",
    description:
      "Meet Frederik Scharling, founder of lejhøjtaler.dk. Copenhagen's most accessible rental service for sound and lights.",
    url: "https://lejhojtaler.dk/en/om",
    siteName: "Lejhøjtaler.dk",
    locale: "en_GB",
    type: "website",
  },
};

export default function AboutPageEn() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://lejhojtaler.dk/en",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "About us",
        item: "https://lejhojtaler.dk/en/om",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <main className="min-h-screen bg-[#07060b] px-4 py-20">
        <div className="mx-auto max-w-2xl">
          {/* Breadcrumb nav */}
          <nav className="mb-8 flex items-center gap-2 text-sm text-white/40">
            <Link href="/en" className="hover:text-brand-400 transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-white/60">About us</span>
          </nav>

          {/* Page heading */}
          <h1 className="text-3xl font-bold text-white sm:text-4xl leading-tight">
            Rent speakers in Copenhagen{" "}
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              &ndash; easy, affordable and hassle-free
            </span>
          </h1>
          <p className="mt-4 text-lg text-white/50 leading-relaxed">
            We are lejh&oslash;jtaler.dk &ndash; Copenhagen&rsquo;s most accessible
            rental service for sound and lights for private parties, corporate
            events and everything in between.
          </p>

          {/* Content sections */}
          <div className="mt-12 space-y-10">
            {/* How it started */}
            <section className="glass rounded-2xl p-8">
              <h2 className="mb-4 text-xl font-semibold text-brand-400">
                How it started
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  Behind lejh&oslash;jtaler.dk is Frederik Scharling, who has
                  worked with sound, events and music production for more than 15
                  years. But even with all that experience, he ran into the same
                  problem as every other Copenhagener: it&rsquo;s surprisingly hard
                  to get decent sound equipment for a private party &ndash; without
                  it costing a fortune or taking half a day of work.
                </p>
                <p>
                  It hit him one Saturday in May when he was throwing a birthday
                  party for his girlfriend in their apartment. Nothing big &ndash;
                  20 friends, good food and proper music. He asked around for a
                  Soundboks. One friend had lent his out. Another lived in Valby
                  and couldn&rsquo;t deliver it in time. When he finally got hold
                  of one, the battery died after 20 minutes.
                </p>
                <p>
                  The next day the decision was made: speaker rental in Copenhagen
                  had to be done properly. Cheap, simple and adapted to the life
                  people actually live in a big city.
                </p>
              </div>
            </section>

            {/* Speaker rental in Copenhagen K */}
            <section className="glass rounded-2xl p-8">
              <h2 className="mb-4 text-xl font-semibold text-brand-400">
                Speaker rental in Copenhagen K &ndash; for cyclists
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  We know that most of our customers don&rsquo;t have a car.
                  That&rsquo;s why our equipment is chosen with that in mind. Our
                  small speaker package weighs only 12 kg, fits in a bag and can
                  easily go on the back of a bike. Professional sound doesn&rsquo;t
                  have to mean heavy logistics.
                </p>
                <p>
                  If you&rsquo;d rather not cycle with equipment, we&rsquo;ll
                  deliver it to you. Delivery + setup in greater Copenhagen is
                  495 DKK. Drop-off only (no setup) is 295 DKK.
                </p>
              </div>
            </section>

            {/* Sound rental without the hassle */}
            <section className="glass rounded-2xl p-8">
              <h2 className="mb-4 text-xl font-semibold text-brand-400">
                Sound rental without the annoying details
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  We&rsquo;ve deliberately cut away everything unnecessary. No
                  long contracts. No hidden fees — you pay at pickup. You book online in
                  three minutes, show up in Copenhagen K, pay when you pick up
                  &ndash; and you&rsquo;re good to go.
                </p>
                <p>
                  We believe that sound for a party in Copenhagen doesn&rsquo;t
                  have to cost a fortune. Our prices start from 395 DKK for a
                  complete speaker package with all cables included. Compare that
                  with what others charge, and you&rsquo;ll quickly see the
                  difference.
                </p>
              </div>
            </section>

            {/* More than just speakers */}
            <section className="glass rounded-2xl p-8">
              <h2 className="mb-4 text-xl font-semibold text-brand-400">
                More than just speakers
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  At lejh&oslash;jtaler.dk you can rent everything you need for a
                  complete party:
                </p>
                <p>
                  Our small speaker package is perfect for the apartment, the
                  courtyard or the intimate gathering. Two compact 10&quot;
                  speakers in a carry bag &ndash; 12 kg in total, ready for the
                  bike.
                </p>
                <p>
                  Our large speaker package with two 12&quot; active speakers
                  delivers powerful, clear sound for larger rooms and outdoor
                  events.
                </p>
                <p>
                  Want atmosphere with lights? We offer a complete light bar with
                  LED effects and light show &ndash; all included, ready to set up.
                  And for a real party vibe, you can rent our fog machine with fog
                  fluid included.
                </p>
              </div>
            </section>

            {/* A cheap Soundboks alternative */}
            <section className="glass rounded-2xl p-8">
              <h2 className="mb-4 text-xl font-semibold text-brand-400">
                An affordable Soundboks alternative in Copenhagen
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  Many people search for a Soundboks to rent in Copenhagen &ndash;
                  and we completely understand why. It&rsquo;s easy to recognise
                  and simple to explain. But a Soundboks has a battery that runs
                  out, a price that quickly adds up, and sound that doesn&rsquo;t
                  really scale when the party grows.
                </p>
                <p>
                  Our speakers use power from a normal wall outlet &ndash; and yes,
                  there&rsquo;s power almost everywhere. That&rsquo;s not a
                  limitation, it&rsquo;s just reality. In return, you get
                  professional sound that actually fills the room, at a lower price
                  than most alternatives on the market.
                </p>
              </div>
            </section>

            {/* Book CTA */}
            <section className="glass rounded-2xl p-8 text-center">
              <h2 className="mb-4 text-xl font-semibold text-brand-400">
                Book your sound rental today
              </h2>
              <div className="mx-auto max-w-2xl space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  It takes three minutes to book on lejh&oslash;jtaler.dk. Choose
                  your equipment, pick your date, and we&rsquo;ll take care of the
                  rest. Pickup is in Copenhagen K, where there&rsquo;s always free
                  parking for one hour &ndash; or you just cycle there.
                </p>
                <p>
                  We look forward to hearing from you.
                  <br />
                  <span className="font-medium text-white/90">
                    &ndash; Frederik Scharling, founder of lejh&oslash;jtaler.dk
                  </span>
                </p>
              </div>
              <Link
                href="/en#book"
                className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
              >
                Book now
              </Link>
            </section>
          </div>

          {/* Back link */}
          <Link
            href="/en"
            className="mt-10 inline-block text-sm text-white/40 hover:text-brand-400 transition"
          >
            &larr; Back to home
          </Link>
        </div>
      </main>
    </>
  );
}
