import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Om os | Lejhøjtaler.dk",
  description:
    "Mød Frederik Scharling, stifter af lejhøjtaler.dk. Københavns mest tilgængelige udlejningsservice for lyd og lys til private fester, firmaevents og alt derimellem.",
  alternates: { canonical: "https://lejhojtaler.dk/om" },
  openGraph: {
    title: "Om os | Lejhøjtaler.dk",
    description:
      "Mød Frederik Scharling, stifter af lejhøjtaler.dk. Københavns mest tilgængelige udlejningsservice for lyd og lys.",
    url: "https://lejhojtaler.dk/om",
    siteName: "Lejhøjtaler.dk",
    locale: "da_DK",
    type: "website",
  },
};

export default function OmPage() {
  const breadcrumbLd = {
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
        name: "Om os",
        item: "https://lejhojtaler.dk/om",
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
            <Link href="/" className="hover:text-brand-400 transition">
              Forside
            </Link>
            <span>/</span>
            <span className="text-white/60">Om os</span>
          </nav>

          {/* Page heading */}
          <h1 className="text-3xl font-bold text-white sm:text-4xl leading-tight">
            Lej h&oslash;jtalere i K&oslash;benhavn{" "}
            <span className="bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              &ndash; nemt, billigt og uden besv&aelig;r
            </span>
          </h1>
          <p className="mt-4 text-lg text-white/50 leading-relaxed">
            Vi er lejh&oslash;jtaler.dk - K&oslash;benhavns mest tilg&aelig;ngelige
            udlejningsservice for lyd og lys til private fester, firmaevents og alt
            derimellem.
          </p>

          {/* Content sections */}
          <div className="mt-12 space-y-10">
            {/* Sådan opstod ideen */}
            <section className="glass rounded-2xl p-8">
              <h2 className="mb-4 text-xl font-semibold text-brand-400">
                S&aring;dan opstod ideen
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  Bag lejh&oslash;jtaler.dk st&aring;r Frederik Scharling, der har
                  arbejdet med lyd, events og musikproduktion i mere end 15 &aring;r.
                  Men selv med al den erfaring i bagagen oplevede han det samme
                  problem som alle andre k&oslash;benhavnere: det er overraskende
                  sv&aelig;rt at skaffe ordentligt lydudstyr til en privat fest -
                  uden at det koster en formue eller kr&aelig;ver en halv dags
                  arbejde.
                </p>
                <p>
                  Det gik op for ham en l&oslash;rdag i maj, da han skulle holde
                  f&oslash;dselsdagsfest for sin k&aelig;reste i deres lejlighed.
                  Ikke noget stort - 20 venner, god mad og ordentlig musik. Han
                  spurgte rundt efter en Soundboks. Den ene ven havde udl&aring;nt
                  den videre. Den anden boede i Valby og kunne ikke aflevere den i
                  tide. Da han endelig fik fat i &eacute;n, l&oslash;b batteriet ud
                  efter 20 minutter.
                </p>
                <p>
                  Dagen efter var beslutningen taget: lydudlejning i K&oslash;benhavn
                  skulle g&oslash;res ordentligt. Billigt, simpelt og tilpasset det
                  liv folk faktisk lever i en storby.
                </p>
              </div>
            </section>

            {/* Højtalerudlejning i København K */}
            <section className="glass rounded-2xl p-8">
              <h2 className="mb-4 text-xl font-semibold text-brand-400">
                H&oslash;jtalerudlejning i K&oslash;benhavn K - til dig der cykler
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  Vi ved at st&oslash;rstedelen af vores kunder ikke har bil. Derfor
                  er vores udstyr valgt med det for &oslash;je. Vores lille
                  h&oslash;jtalerpakke vejer kun 12 kg, passer i en taske og kan
                  sagtens v&aelig;re bag p&aring; cyklen. Professionel lyd
                  beh&oslash;ver ikke betyde tung logistik.
                </p>
                <p>
                  Er du ikke til at cykle med udstyr, k&oslash;rer vi det ud til
                  dig. Levering + opsætning i Stork&oslash;benhavn koster 495 kr
                  — vi sætter op og henter igen.
                </p>
              </div>
            </section>

            {/* Lydudlejning uden de irriterende detaljer */}
            <section className="glass rounded-2xl p-8">
              <h2 className="mb-4 text-xl font-semibold text-brand-400">
                Lydudlejning uden de irriterende detaljer
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  Vi har bevidst sk&aring;ret alt det un&oslash;dvendige v&aelig;k.
                  Ingen lange kontrakter. Ingen skjulte gebyrer. Betal ved afhentning. Du
                  booker online p&aring; tre minutter, m&oslash;der op i
                  K&oslash;benhavn K, betal n&aring;r du henter - og s&aring; er du
                  klar.
                </p>
                <p>
                  Vi tror p&aring; at lyd til fest i K&oslash;benhavn ikke
                  beh&oslash;ver at koste en formue. Vores priser starter fra 399
                  kr. for en komplet h&oslash;jtalerpakke med kabler inkluderet.
                  Sammenlign det med hvad andre opkr&aelig;ver, og du vil hurtigt se
                  forskellen.
                </p>
              </div>
            </section>

            {/* Mere end bare højtalere */}
            <section className="glass rounded-2xl p-8">
              <h2 className="mb-4 text-xl font-semibold text-brand-400">
                Mere end bare h&oslash;jtalere
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  Hos lejh&oslash;jtaler.dk kan du leje alt det du skal bruge til en
                  komplet fest:
                </p>
                <p>
                  Vores lille h&oslash;jtalerpakke er perfekt til lejligheden,
                  g&aring;rdhaven eller det intime selskab. To sm&aring; 10&quot;
                  h&oslash;jtalere i b&aelig;retaske - 12 kg i alt, klar til cyklen.
                </p>
                <p>
                  Vores store h&oslash;jtalerpakke med to 12&quot; aktive
                  h&oslash;jtalere leverer kraftig, klar lyd til st&oslash;rre rum og
                  udend&oslash;rs arrangementer.
                </p>
                <p>
                  Vil du have stemning med lys, tilbyder vi en komplet lysbar med
                  LED-effekter og lysshow - alt inkluderet, klar til at s&aelig;tte
                  op. Og skal der virkelig v&aelig;re fest, kan du leje vores
                  r&oslash;gmaskine med r&oslash;gv&aelig;ske inkluderet.
                </p>
              </div>
            </section>

            {/* Et billigt soundboks-alternativ */}
            <section className="glass rounded-2xl p-8">
              <h2 className="mb-4 text-xl font-semibold text-brand-400">
                Et billigt soundboks-alternativ i K&oslash;benhavn
              </h2>
              <div className="space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  Mange s&oslash;ger efter en Soundboks til leje i K&oslash;benhavn -
                  og vi forst&aring;r godt hvorfor. Den er nem at kende og let at
                  forklare. Men en Soundboks har et batteri der l&oslash;ber ud, en
                  pris der hurtigt l&oslash;ber op, og en lyd der ikke rigtig
                  skalerer n&aring;r selskabet vokser.
                </p>
                <p>
                  Vores h&oslash;jtalere bruger str&oslash;m fra en normal
                  stikkontakt - og ja, der er str&oslash;m n&aelig;sten overalt. Det
                  er ikke en begr&aelig;nsning, det er bare virkeligheden. Til
                  geng&aelig;ld f&aring;r du professionel lyd der faktisk fylder
                  rummet, til en lavere pris end de fleste alternativerne p&aring;
                  markedet.
                </p>
              </div>
            </section>

            {/* Book din lydudlejning */}
            <section className="glass rounded-2xl p-8 text-center">
              <h2 className="mb-4 text-xl font-semibold text-brand-400">
                Book din lydudlejning i dag
              </h2>
              <div className="mx-auto max-w-2xl space-y-4 text-sm leading-relaxed text-white/70">
                <p>
                  Det tager tre minutter at booke p&aring; lejh&oslash;jtaler.dk.
                  V&aelig;lg dit udstyr, v&aelig;lg din dato, og vi s&oslash;rger
                  for resten. Afhentning foreg&aring;r i K&oslash;benhavn K, hvor
                  der altid er gratis parkering i &eacute;n time - eller du cykler
                  bare derhen.
                </p>
                <p>
                  Vi gl&aelig;der os til at h&oslash;re fra dig.
                  <br />
                  <span className="font-medium text-white/90">
                    &ndash; Frederik Scharling, stifter af lejh&oslash;jtaler.dk
                  </span>
                </p>
              </div>
              <Link
                href="/#book"
                className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
              >
                Book nu
              </Link>
            </section>
          </div>

          {/* Back link */}
          <Link
            href="/"
            className="mt-10 inline-block text-sm text-white/40 hover:text-brand-400 transition"
          >
            &larr; Tilbage til forsiden
          </Link>
        </div>
      </main>
    </>
  );
}
