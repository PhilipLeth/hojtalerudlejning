import Link from "next/link";
import BundleGrid from "@/components/BundleGrid";
import GoogleReviews from "@/components/GoogleReviews";
import Footer from "@/components/Footer";
import { FEST_LADDER_IDS, LYD_LEJLIGHEDSPAKKER } from "@/lib/products";
import { localizedHref } from "@/lib/enPages";
import type { Locale } from "@/lib/i18n";

/** DJ-pakkerne har lysbar med, så de er også lyd og lys. De ejes af /dj-pult. */
const DJ_PAKKER = ["dj_pakke_lille", "dj_pakke_mellem", "dj_pakke_stor"];

/**
 * Lyd- og lyspakker: prisarkets afsnit 3 som én side.
 *
 * Topmenuens "Lyd- og lyspakker" pegede på /lej-hojtaler, men den side hedder
 * "lej højtalere" og skal åbne med højtalerne (det er en annoncelandingsside).
 * Philip 28. sept 2026: "Lyd- og lyspakker skal være en side for lys og
 * lydpakker". Her står kun pakker, hvor lyd og lys er sat sammen.
 */
export default function LydOgLysPakkerSide({ locale = "da" }: { locale?: Locale }) {
  const en = locale === "en";
  return (
    <>
      <section className="stemnings-hero relative flex min-h-[48vh] sm:min-h-[60vh] flex-col items-center justify-center overflow-hidden px-4 text-center">
        <img
          src="/images/hero/festpakke-stor.webp"
          srcSet="/images/hero/festpakke-stor-800.webp 800w, /images/hero/festpakke-stor.webp 1920w"
          sizes="100vw"
          alt=""
          fetchPriority="high"
          className="stemnings-hero-billede"
        />
        <div className="relative z-10 max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-brand-400">
            {en ? "Sound & light packages · Copenhagen" : "Lyd- og lyspakker · København"}
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {en ? "Sound and light in one package" : "Lyd og lys i én pakke"}
          </h1>
          <p className="mx-auto mt-6 max-w-md text-lg">
            {en
              ? "Speakers, light bar and cables put together for the party, cheaper than renting the parts separately. Choose by the number of guests."
              : "Højtalere, lysbar og kabler sat sammen til festen, billigere end at leje delene hver for sig. Vælg efter antal gæster."}
          </p>
          <a
            href="#pakker"
            className="mt-8 inline-block rounded-full bg-brand-500 px-8 py-4 text-lg font-semibold text-black transition hover:bg-brand-400 active:scale-95"
          >
            {en ? "See the packages" : "Se pakkerne"}
          </a>
        </div>
      </section>

      <main className="relative z-20 bg-[#07060b]">
        <BundleGrid
          locale={locale}
          ids={FEST_LADDER_IDS}
          eyebrow={en ? "By guest count" : "Efter antal gæster"}
          title={en ? "Party packages" : "Festpakker"}
          subtitle={
            en
              ? "Speakers, bass and a light bar with coloured lamps and a centre effect. The same packages whether it is a birthday or a company party."
              : "Højtalere, bas og en lysbar med farvede lamper og centereffekt. De samme pakker, uanset om det er en fødselsdag eller en firmafest."
          }
        />
        <BundleGrid
          locale={locale}
          sectionId="anledning"
          ids={LYD_LEJLIGHEDSPAKKER}
          eyebrow={en ? "For the occasion" : "Til anledningen"}
          title={en ? "Packages built for the occasion" : "Pakker til anledningen"}
          subtitle={
            en
              ? "Battery sound with lights where there is no socket, a quieter setup for the dinner, and the seasonal packages."
              : "Batterilyd med lys, hvor der ikke er en stikkontakt, en roligere opstilling til middagen, og sæsonens pakker."
          }
        />
        <BundleGrid
          locale={locale}
          sectionId="dj"
          ids={DJ_PAKKER}
          eyebrow={en ? "With a DJ controller" : "Med DJ-pult"}
          title={en ? "DJ packages" : "DJ-pakker"}
          subtitle={
            en
              ? "The all-in-one DJ system with sound and a light bar sized to the party."
              : "All-in-one DJ-pulten med lyd og lysbar i størrelse efter festen."
          }
        />

        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
            <h2 className="mb-2 text-2xl font-bold">{en ? "Only sound, or only light?" : "Kun lyd eller kun lys?"}</h2>
            <p className="mb-6 max-w-2xl text-sm text-white/60">
              {en
                ? "The same equipment can be rented on its own, with microphones, mixers and fog as add-ons."
                : "Det samme udstyr kan lejes hver for sig, med mikrofoner, mixere og røg som tilvalg."}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={localizedHref("/lydanlaeg", locale)} className="rounded-full bg-brand-500 px-6 py-3 font-semibold text-black transition hover:bg-brand-400">
                {en ? "Sound" : "Lyd"}
              </Link>
              <Link href={localizedHref("/festlys", locale)} className="rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-brand-500/40 hover:text-white">
                {en ? "Lights & effects" : "Lys & effekter"}
              </Link>
            </div>
          </div>
        </section>

        <GoogleReviews locale={locale} />
        <Footer locale={locale} />
      </main>
    </>
  );
}
