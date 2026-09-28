import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { localizedHref } from "@/lib/enPages";

/**
 * Valgguiden på /festlys.
 *
 * Kategorisiden var et gitter af produktkort og ikke andet, og annoncerne
 * sender de bredeste lys-søgninger herind: "fest lys", "diskolys til fest",
 * "lej diskokugle", "lys til festtelt". Den, der søger sådan, har ikke valgt
 * endnu — hun skal vide hvilket lys der passer til hendes fest, før et
 * produktkort betyder noget. Fire situationer med et svar hver, og et link
 * videre til den side, der faktisk handler om det.
 */
const VALG = [
  {
    sti: "/diskolys",
    da: {
      h: "Diskolys til fest",
      p: "Farvede stråler, der bevæger sig i takt til musikken. Det er det lys, folk mener, når de siger, at der skal være fest — og det virker bedst med lidt røg i luften, så strålerne kan ses.",
      cta: "Se diskolys",
    },
    en: {
      h: "Disco lights for a party",
      p: "Coloured beams that move with the music. This is the lighting people mean when they say the room should feel like a party — and it works best with a little fog in the air so the beams show.",
      cta: "See disco lighting",
    },
  },
  {
    sti: "/discokugle",
    da: {
      h: "Lej diskokugle",
      p: "Klassikeren, der aldrig fejler: spejlkuglen med motor og spot. Fås i 30 og 40 cm. Den fylder loftet med prikker uden at overdøve resten af lokalet, og den passer lige så godt til bryllup som til fødselsdag.",
      cta: "Lej en diskokugle",
    },
    en: {
      h: "Rent a disco ball",
      p: "The classic that never fails: a mirror ball with motor and spotlight, in 30 and 40 cm. It fills the ceiling with dots without taking over the room, and it suits a wedding as well as a birthday.",
      cta: "Rent a disco ball",
    },
  },
  {
    sti: "/festtelt-lys",
    da: {
      h: "Lys til festtelt og havefest",
      p: "Udendørs skal lyset både kunne ses og kunne tåle en aften i det fri. Lyskæder langs teltdugen giver det varme lys, og uplights sætter farve på stolper og hæk, når det bliver mørkt.",
      cta: "Se lys til festtelt",
    },
    en: {
      h: "Lighting for a marquee or garden party",
      p: "Outdoors the lighting has to be visible and survive an evening outside. String lights along the marquee give the warm glow, and uplights put colour on poles and hedges once it gets dark.",
      cta: "See marquee lighting",
    },
  },
  {
    sti: "/stemningslys",
    da: {
      h: "Stemningslys til middagen",
      p: "Skal der spises og snakkes først, vil du ikke have strobelys hen over bordet. Uplights i en rolig farve langs væggene løfter rummet, og så kan diskolyset tændes, når bordene bliver ryddet.",
      cta: "Se stemningslys",
    },
    en: {
      h: "Mood lighting for the dinner",
      p: "If people are eating and talking first, you do not want strobes across the table. Uplights in a calm colour along the walls lift the room, and the disco lighting can come on once the tables are cleared.",
      cta: "See mood lighting",
    },
  },
] as const;

export default function LysValg({ locale = "da" }: { locale?: Locale }) {
  const en = locale === "en";
  return (
    <section className="mx-auto max-w-4xl px-4 pb-12 sm:pb-24">
      <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl">
        {en ? "Which lighting suits your party?" : "Hvilket lys til fest skal du vælge?"}
      </h2>
      <p className="mx-auto mb-10 max-w-2xl text-center text-white/50">
        {en
          ? "Four situations we get asked about every week. Find the one that looks like your party."
          : "Fire situationer vi bliver spurgt om hver uge. Find den, der ligner din fest."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {VALG.map((v) => {
          const t = en ? v.en : v.da;
          return (
            <div key={v.sti} className="glass rounded-2xl p-6">
              <h3 className="mb-2 text-xl font-bold text-white">{t.h}</h3>
              <p className="mb-4 text-white/50">{t.p}</p>
              <Link
                href={localizedHref(v.sti, locale)}
                className="font-semibold text-brand-400 transition hover:text-brand-300"
              >
                {t.cta} →
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
