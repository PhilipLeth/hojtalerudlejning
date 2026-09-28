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
 * Lyd, Lys & effekter, Lyd- og lyspakker og Tilbehør. Mikrofoner, mixer, sub
 * og monitor stod her først, men de er lyd og står på /lydanlaeg (Philip:
 * "Du skal vise alt fra mixere til mics på Lyd"). Her er resten: lys- og
 * DJ-stativer, væskerne fra 2.5 og strøm fra afsnit 4.
 */
const AFSNIT: { id: string; da: string; en: string; tekstDa: string; tekstEn: string; ids: string[] }[] = [
  {
    id: "stativer",
    da: "Stativer",
    en: "Stands",
    tekstDa: "Et stativ, der løfter lyset over gæsterne, og stativer til DJ-pulten.",
    tekstEn: "A stand that lifts the lights above the guests, and stands for the DJ controller.",
    ids: ["lysstativ", "x_stativ", "dj_stativ"],
  },
  {
    id: "vaesker",
    da: "Væsker",
    en: "Fluids",
    tekstDa: "Ekstra væske til røg-, sne- og sæbeboblemaskinen.",
    tekstEn: "Extra fluid for the fog, snow and bubble machines.",
    ids: ["roegvaeske", "snevaeske", "boblevaeske"],
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
          {en ? "Accessory rental: stands, fluids and power." : "Lej tilbehør: stativer, væsker og strøm."}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600">
          {en
            ? "The small things that make the setup work. Microphones, mixers and subs are under Sound. Every price covers up to five days, VAT included."
            : "De små ting, der får opstillingen til at virke. Mikrofoner, mixer og sub finder du under Lyd. Alle priser gælder op til fem dages leje, inklusive moms."}
        </p>
        <p className="mt-3 text-sm">
          <Link href={localizedHref("/lydanlaeg", locale) + "#udstyr"} className="font-semibold text-brand-600">
            {en ? "Microphones, mixer, sub and monitor →" : "Mikrofoner, mixer, sub og monitor →"}
          </Link>
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
