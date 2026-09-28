import Link from "next/link";
import CategoryProductGrid from "@/components/CategoryProductGrid";
import GoogleReviews from "@/components/GoogleReviews";
import Footer from "@/components/Footer";
import { localizedHref } from "@/lib/enPages";
import type { Locale } from "@/lib/i18n";

/**
 * Tilbehør: de små ting, der får anlægget til at virke.
 *
 * Kom til 28. sept 2026, da topmenuen blev en produktshop med fire indgange:
 * Lyd, Lys & effekter, Lyd- og lyspakker og Tilbehør. Afsnittene følger
 * prisarket — 1.5 mikrofoner, 1.6 tilbehør til lyd, DJ-stativerne fra 1.4,
 * væskerne fra 2.5 og strøm fra afsnit 4. Pausede varer falder selv ud i
 * gitteret, så listen må gerne nævne dem.
 */
const AFSNIT: { id: string; da: string; en: string; tekstDa: string; tekstEn: string; ids: string[]; side?: string }[] = [
  {
    id: "mikrofoner",
    da: "Mikrofoner",
    en: "Microphones",
    tekstDa: "Én eller to mikrofoner går direkte i højtaleren. Skal flere tale samtidig, så tag en mixer med.",
    tekstEn: "One or two microphones plug straight into the speaker. If several people speak at once, add a mixer.",
    ids: ["mikrofon", "headset", "mikrofon_kabel", "haandholdt_mikrofon_pro", "mikrofonstativ"],
    side: "/lej-mikrofon",
  },
  {
    id: "lyd",
    da: "Til lyden",
    en: "For the sound",
    tekstDa: "Mere bas, højtalerne op i hovedhøjde, eller en mixer til flere mikrofoner og en DJ.",
    tekstEn: "More bass, the speakers up at head height, or a mixer for several mics and a DJ.",
    ids: ["subwoofer", "stativer", "stativ_enkelt", "mixer_stor", "monitor", "x_stativ", "dj_stativ"],
  },
  {
    id: "vaesker",
    da: "Væsker og stativer",
    en: "Fluids and stands",
    tekstDa: "Ekstra væske til røg-, sne- og sæbeboblemaskinen, og et stativ, der løfter lyset over gæsterne.",
    tekstEn: "Extra fluid for the fog, snow and bubble machines, and a stand that lifts the lights above the guests.",
    ids: ["roegvaeske", "snevaeske", "boblevaeske", "lysstativ"],
  },
  {
    id: "stroem",
    da: "Strøm og forlængerledninger",
    en: "Power and extension leads",
    tekstDa: "Står teltet 20 meter fra stikkontakten, er det her, der mangler.",
    tekstEn: "When the tent is 20 metres from the socket, this is what is missing.",
    ids: ["kabeltromle", "kabeltromle_jord", "stikdaase", "stikdaase_jord", "omformer_udendors"],
  },
];

export default function TilbehoerSide({ locale = "da" }: { locale?: Locale }) {
  const en = locale === "en";
  return (
    <main className="bg-white text-slate-900">
      <section className="mx-auto max-w-6xl px-5 py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-brand-600">
          {en ? "Accessories · Copenhagen" : "Tilbehør · København"}
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-bold sm:text-6xl">
          {en ? "Accessory rental: microphones, stands and cables." : "Lej tilbehør: mikrofoner, stativer og kabler."}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          {en
            ? "The small things that make the setup work. Rent them on their own or add them to a speaker or light package. Every price covers up to five days, VAT included."
            : "De små ting, der får anlægget til at virke. Lej dem for sig, eller læg dem oven i en højtaler- eller lyspakke. Alle priser gælder op til fem dages leje, inklusive moms."}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {AFSNIT.map((a) => (
            <a key={a.id} href={`#${a.id}`} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-brand-600 transition hover:border-brand-500">
              {en ? a.en : a.da}
            </a>
          ))}
        </div>
      </section>
      {AFSNIT.map((a) => (
        <section key={a.id} id={a.id} className="mx-auto max-w-6xl scroll-mt-24 px-5 pb-16">
          <div className="mb-2 flex flex-wrap items-baseline gap-3">
            <h2 className="text-3xl font-bold">{en ? a.en : a.da}</h2>
            {a.side && (
              <Link href={localizedHref(a.side, locale)} className="text-sm font-semibold text-brand-600">
                {en ? "More about microphones →" : "Mere om mikrofoner →"}
              </Link>
            )}
          </div>
          <p className="mb-10 max-w-xl text-slate-500">{en ? a.tekstEn : a.tekstDa}</p>
          <CategoryProductGrid tone="light" locale={locale} cols={4} items={a.ids.map((id) => ({ id }))} />
        </section>
      ))}
      <GoogleReviews locale={locale} />
      <Footer locale={locale} />
    </main>
  );
}
