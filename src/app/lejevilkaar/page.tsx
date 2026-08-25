import type { Metadata } from "next";
import Link from "next/link";
import { localeAlternates } from "@/lib/hreflang";
import SiteText from "@/components/SiteText";

export const metadata: Metadata = {
  title: "Lejevilkår | Lejhøjtaler.dk",
  description:
    "Lejevilkår for leje af højtalere, lysudstyr og PA-anlæg hos Lejhøjtaler.dk. Læs om priser, lejeperiode, afhentning, returnering og ansvar.",
  alternates: {
    canonical: "https://lejhojtaler.dk/lejevilkaar",
    languages: localeAlternates("/lejevilkaar"),
  },
};

const sections = [
  {
    title: "1. Lejeperiode og priser",
    content: `Standardlejeperioden er en weekend (fredag til mandag, 3 dage). Lejeperioden kan forlænges op til 5 dage med følgende prismultiplikatorer:

- 1 dag: 80 % af weekendprisen
- 2 dage: 90 % af weekendprisen
- 3 dage (weekend): 100 % (standardpris)
- 4 dage: 120 % af weekendprisen
- 5 dage: 140 % af weekendprisen

Aktuelle priser fremgår af bookingformularen på forsiden.`,
  },
  {
    title: "2. Depositum og kaution",
    content: `Der opkræves ikke depositum eller kaution. Lejer hæfter dog fuldt ud for alt lejet udstyr fra afhentning til returnering, jf. punkt 3.`,
  },
  {
    title: "3. Skader og erstatning",
    content: `Lejer erstatter beskadiget, bortkommet eller stjålet udstyr til nypris. Almindelig slitage (ridser, mærker fra normal brug) er acceptabelt og dækkes af udlejer. Ved skade kontaktes udlejer hurtigst muligt.`,
  },
  {
    title: "4. Forsinket returnering",
    content: `Ved forsinket returnering opkræves 200 kr pr. påbegyndt dag ud over den aftalte returneringsdato. Kan udstyret ikke returneres til aftalt tid, skal lejer give besked hurtigst muligt.`,
  },
  {
    title: "5. Aflysning",
    content: `Bookingen kan aflyses gratis op til 24 timer før det aftalte afhentningstidspunkt. Ved aflysning senere end 24 timer før afhentning opkræves 50 % af den samlede lejepris.`,
  },
  {
    title: "6. Lejers ansvar",
    content: `Lejer forpligter sig til at:

- Behandle udstyret forsvarligt og i overensstemmelse med dets formål
- Ikke videreudleje eller udlåne udstyret til tredjepart
- Ikke udsætte udstyret for regn, vand, sand eller andre skadelige forhold
- Returnere udstyret i samme stand som ved afhentning (almindelig slitage undtaget)
- Sikre at udstyret opbevares forsvarligt under lejeperioden`,
  },
  {
    title: "7. Udlejers ansvar",
    content: `Udlejer garanterer at udstyret er funktionsdygtigt og i god stand ved afhentning. Hvis udstyret viser sig at være defekt ved afhentning eller under normal brug, tilbyder udlejer erstatningsudstyr eller fuld refusion af lejebeløbet.`,
  },
  {
    title: "8. Afhentning og returnering",
    content: `Udstyret afhentes og returneres på:

{{afhentningsadresse}}

{{aabningstider}}

Udstyret leveres med alle nødvendige kabler.`,
  },
  {
    title: "9. Betaling",
    content: `Betaling sker online med kort ved booking (via Stripe) eller ved afhentning efter aftale. Prisen er den totalpris, der fremgår af bookingbekræftelsen.`,
  },
  {
    title: "10. Persondatapolitik",
    content: `Vi gemmer dit navn, e-mailadresse og telefonnummer udelukkende med det formål at håndtere din booking og kommunikere om afhentning/returnering. Dine oplysninger deles ikke med tredjepart og slettes efter endt lejeperiode, medmindre der verserer en uafsluttet sag (f.eks. skadesopgørelse).`,
  },
];

export default function Lejevilkaar() {
  return (
    <main className="min-h-screen bg-[#07060b]">
      {/* Header */}
      <div className="mx-auto max-w-3xl px-4 pt-16 pb-8">
        <Link
          href="/#book"
          className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition mb-8"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Tilbage til booking
        </Link>

        <h1 className="text-4xl font-bold sm:text-5xl">Lejevilkår</h1>
        <p className="mt-4 text-lg text-white/50">
          Vilkår for leje af højtalere, lysudstyr og tilbehør hos
          Lejhøjtaler.dk
        </p>
      </div>

      {/* Sections */}
      <div className="mx-auto max-w-3xl px-4 pb-24 space-y-6">
        {sections.map((section, i) => (
          <div key={i} className="glass rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold mb-4">{section.title}</h2>
            <div className="text-sm leading-relaxed text-white/60 whitespace-pre-line">
              <SiteText>{section.content}</SiteText>
            </div>
          </div>
        ))}

        {/* Business info */}
        <div className="glass rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-semibold mb-4">Udlejer</h2>
          <div className="text-sm leading-relaxed text-white/60 space-y-1">
            <p className="font-medium text-white/80"><SiteText>{"{{firma}}"}</SiteText></p>
            <p>CVR: <SiteText>{"{{cvr}}"}</SiteText></p>
            <p><SiteText>{"{{vej}}"}</SiteText></p>
            <p><SiteText>{"{{postby}}"}</SiteText></p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link
            href="/#book"
            className="inline-flex rounded-xl bg-brand-500 px-8 py-3.5 font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            Book nu
          </Link>
          <p className="mt-3 text-sm text-white/30">
            Bookingen tager under 2 minutter
          </p>
        </div>
      </div>

      {/* JSON-LD Breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Forside",
                item: "https://lejhojtaler.dk",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Lejevilkår",
                item: "https://lejhojtaler.dk/lejevilkaar",
              },
            ],
          }),
        }}
      />
    </main>
  );
}
