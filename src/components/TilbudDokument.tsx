"use client";

/**
 * Selve tilbuddet, som kunden ser det — og som kollegaen ser det i admin,
 * mens han bygger det. Samme komponent begge steder, så forhåndsvisningen
 * aldrig kan drive fra det, kunden får.
 *
 * Tre sider i A4-format: forsiden med stemningsbilledet, brevet med
 * udstyrslisten og priserne, og inspirationen med QR-koden til kurven.
 * Priserne slås op i kataloget her — de står aldrig skrevet på tilbuddet.
 */

import { useMemo } from "react";
import QrKode from "./QrKode";
import { thumbSrcSet, THUMB_IMAGE_SIZES } from "@/lib/imageSrcSet";
import {
  SITE_URL,
  STANDARD_INSPIRATION,
  erUdloebet,
  prissaet,
  standardIntro,
  tilbudBookSti,
  type KatalogLike,
  type Tilbud,
  type TilbudBillede,
} from "@/lib/tilbud";

type Locale = "da" | "en";

const TEKST = {
  da: {
    tilbud: "Tilbud",
    nr: "Tilbud nr.",
    til: "Til",
    dato: "Dato",
    sted: "Sted",
    gaester: "Gæster",
    gyldig: "Gælder til",
    udarbejdet: "Udarbejdet",
    af: "af",
    udstyr: "Udstyr og ydelser",
    vare: "Vare",
    antal: "Antal",
    stkPris: "Pris",
    beloeb: "Beløb",
    timer: "timer",
    time: "time",
    stk: "stk.",
    subtotal: "Subtotal",
    rabat: "Rabat",
    total: "I alt inkl. moms",
    moms: "Heraf moms",
    inspiration: "Sådan kan det se ud",
    inspirationTekst: "Billeder fra vores udstyr i brug. Lyset og opsætningen tilpasses jeres lokale.",
    inspirationAi: "Billeder mærket Illustration er lavet til jer ud fra fotos af præcis det udstyr, tilbuddet rummer.",
    illustration: "Illustration",
    forloeb: "Sådan foregår det",
    trin: [
      ["Book og betal", "Scan koden eller tryk på knappen. Udstyret er reserveret, når I har betalt."],
      ["Vi leverer", "Vi kører ud, sætter op og laver lydprøve, når det er valgt på tilbuddet."],
      ["I fester", "Alt er testet og klar. Ring, hvis der er noget undervejs."],
      ["Vi henter", "Vi pakker sammen igen, eller I afleverer det hos os."],
    ],
    bookTitel: "Book og betal på to minutter",
    bookTekst: "Hele tilbuddet ligger klar i kurven. I kan rette antal eller lægge mere til, før I betaler.",
    bookKnap: "Book og betal",
    scan: "Scan med telefonen",
    kontakt: "Jeres kontaktperson",
    vilkaar: "Lejevilkår",
    prisNote: "Alle priser er inkl. 25 % moms og gælder for hele lejeperioden.",
    udloebet: "Tilbuddet er udløbet. Ring til os, så laver vi et nyt med dagens priser og ledighed.",
    booket: "Tilbuddet er booket. Tak!",
    side: "Side",
    tomt: "Læg udstyr i tilbuddet fra shoppen til venstre.",
    udgaaet: "Udgået vare",
  },
  en: {
    tilbud: "Offer",
    nr: "Offer no.",
    til: "For",
    dato: "Date",
    sted: "Venue",
    gaester: "Guests",
    gyldig: "Valid until",
    udarbejdet: "Prepared",
    af: "by",
    udstyr: "Equipment and services",
    vare: "Item",
    antal: "Qty",
    stkPris: "Price",
    beloeb: "Amount",
    timer: "hours",
    time: "hour",
    stk: "pcs",
    subtotal: "Subtotal",
    rabat: "Discount",
    total: "Total incl. VAT",
    moms: "Of which VAT",
    inspiration: "What it can look like",
    inspirationTekst: "Photos of our equipment in use. Lighting and setup are adapted to your venue.",
    inspirationAi: "Pictures marked Illustration were made for you from photos of exactly the equipment in this offer.",
    illustration: "Illustration",
    forloeb: "How it works",
    trin: [
      ["Book and pay", "Scan the code or press the button. The equipment is reserved once you have paid."],
      ["We deliver", "We drive out, set up and run a sound check, when it is part of the offer."],
      ["You celebrate", "Everything is tested and ready. Call us if anything comes up."],
      ["We collect", "We pack it all up again, or you return it to us."],
    ],
    bookTitel: "Book and pay in two minutes",
    bookTekst: "The whole offer is waiting in your cart. You can change quantities or add more before you pay.",
    bookKnap: "Book and pay",
    scan: "Scan with your phone",
    kontakt: "Your contact",
    vilkaar: "Rental terms",
    prisNote: "All prices include 25% Danish VAT and cover the whole rental period.",
    udloebet: "This offer has expired. Give us a call and we will make a new one with today's prices and availability.",
    booket: "This offer has been booked. Thank you!",
    side: "Page",
    tomt: "Add equipment to the offer from the shop on the left.",
    udgaaet: "Discontinued item",
  },
} as const;

export function kr(beloeb: number, locale: Locale): string {
  const tal = beloeb.toLocaleString(locale === "en" ? "en-GB" : "da-DK");
  return locale === "en" ? `DKK ${tal}` : `${tal} kr`;
}

export function dagTekst(iso: string | undefined, locale: Locale, medAar = true): string {
  if (!iso) return "";
  const d = new Date(`${iso}T12:00:00Z`);
  return d.toLocaleDateString(locale === "en" ? "en-GB" : "da-DK", {
    weekday: medAar ? undefined : "short",
    day: "numeric",
    month: "long",
    ...(medAar ? { year: "numeric" } : {}),
    timeZone: "UTC",
  });
}

export function periodeTekst(t: Pick<Tilbud, "fra" | "til">, locale: Locale): string {
  if (!t.fra) return "";
  if (!t.til || t.til === t.fra) return dagTekst(t.fra, locale);
  return `${dagTekst(t.fra, locale, false)} – ${dagTekst(t.til, locale)}`;
}

function Ordmaerke({ lys = false }: { lys?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold normal-case tracking-tight ${lys ? "text-[#fff]" : "text-[#0b0a10]"}`}>
      <img src="/icon.svg" width={24} height={24} alt="" className="rounded-[3px]" />
      LejHøjtaler.dk
    </span>
  );
}

function Sidehoved({ t, side, locale }: { t: Pick<Tilbud, "nr">; side: number; locale: Locale }) {
  const s = TEKST[locale];
  return (
    <div className="flex items-center justify-between border-b border-[#e7e8ee] pb-4 text-[11px] uppercase tracking-[0.14em] text-[#7a7f8c]">
      <Ordmaerke />
      <span>
        {s.nr} {t.nr || "—"} · {s.side} {side}/3
      </span>
    </div>
  );
}

/** Gitteret tilpasser sig antallet, så ét eller to billeder ikke står i et hul */
function BilledGitter({ billeder, etiket }: { billeder: TilbudBillede[]; etiket: string }) {
  const n = billeder.length;
  const felt = (b: TilbudBillede, klasse: string, stil?: React.CSSProperties) => (
    <div key={b.src} className={`relative overflow-hidden rounded-lg bg-[#f4f5f8] ${klasse}`} style={stil}>
      <img src={b.src} alt="" loading="lazy" className="h-full w-full object-cover" />
      {b.kilde === "ai" && (
        <span className="absolute bottom-2 left-2 rounded bg-[#0c0b12]/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#fff]">{etiket}</span>
      )}
    </div>
  );
  if (n === 1) return <div className="mt-5">{felt(billeder[0], "", { aspectRatio: "16 / 9" })}</div>;
  if (n === 2) return <div className="mt-5 grid grid-cols-2 gap-2.5">{billeder.map((b) => felt(b, "", { aspectRatio: "4 / 5" }))}</div>;
  if (n === 3)
    return (
      <div className="mt-5 grid grid-cols-3 grid-rows-2 gap-2.5" style={{ aspectRatio: "16 / 9" }}>
        {billeder.map((b, i) => felt(b, i === 0 ? "col-span-2 row-span-2" : ""))}
      </div>
    );
  if (n === 4) return <div className="mt-5 grid grid-cols-2 gap-2.5">{billeder.map((b) => felt(b, "", { aspectRatio: "4 / 3" }))}</div>;
  return <div className="mt-5 grid grid-cols-3 gap-2.5">{billeder.map((b) => felt(b, "", { aspectRatio: "1 / 1" }))}</div>;
}

export interface TilbudDokumentProps {
  tilbud: Omit<Tilbud, "note">;
  katalog: KatalogLike;
  /** Telefon og mail fra /admin/indstillinger */
  kontakt: { telefon: string; telefonHref: string; email: string; firma: string; cvr: string; adresse: string };
  /** I admin peger knappen ikke ud af siden */
  forhaandsvisning?: boolean;
}

export default function TilbudDokument({ tilbud: t, katalog, kontakt, forhaandsvisning }: TilbudDokumentProps) {
  const locale: Locale = t.locale === "en" ? "en" : "da";
  const s = TEKST[locale];
  const sum = useMemo(() => prissaet(t, katalog), [t, katalog]);
  const bookUrl = SITE_URL + tilbudBookSti(t.id || "eksempel", locale);
  const udloebet = !forhaandsvisning && erUdloebet(t) && t.status !== "booket";
  const intro = t.intro?.trim() || standardIntro(t, t.oprettetAf);

  // Inspiration: tilbuddets egne billeder (uploadet, fra kunden eller AI), og
  // ellers forsidens fotos af rigtige opstillinger
  const inspiration = useMemo(
    () => (t.billeder?.length ? t.billeder.slice(0, 6) : STANDARD_INSPIRATION.map((src) => ({ src, kilde: "site" as const }))),
    [t.billeder],
  );
  const harAi = inspiration.some((b) => b.kilde === "ai");

  const fakta: Array<[string, string]> = (
    [
      [s.dato, periodeTekst(t, locale)],
      [s.sted, t.sted ?? ""],
      [s.gaester, t.gaester ? String(t.gaester) : ""],
      [s.gyldig, dagTekst(t.gyldigTil, locale)],
    ] as Array<[string, string]>
  ).filter(([, v]) => v);

  const modtager = [t.kunde.navn, t.kunde.firma].filter(Boolean).join(" · ");

  return (
    <div className="tilbud-dokument mx-auto flex max-w-[820px] flex-col gap-8 text-[#11131a] print:max-w-none print:gap-0">
      {/* A4 i print: én sektion pr. ark, forsiden helt ud til kanten */}
      <style>{`@media print{@page{size:A4;margin:0}html,body{background:#fff!important}.tilbud-side{width:210mm;min-height:297mm;aspect-ratio:auto;break-after:page;-webkit-print-color-adjust:exact;print-color-adjust:exact}.tilbud-side:first-child{height:297mm}.tilbud-side:last-child{break-after:auto}}`}</style>
      {/* ── Side 1: forsiden ── */}
      <section className="tilbud-side relative aspect-[210/297] overflow-hidden rounded-sm bg-[#0c0b12] shadow-[0_20px_60px_-20px_rgba(10,12,30,0.45)] print:rounded-none print:shadow-none">
        <img src={t.forside} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,6,11,0.55)_0%,rgba(7,6,11,0.05)_32%,rgba(7,6,11,0.35)_58%,rgba(7,6,11,0.94)_100%)]" />
        <div className="relative flex h-full flex-col justify-between p-[7%] text-[#fff]">
          <div className="flex items-start justify-between">
            <Ordmaerke lys />
            <span className="text-right text-[11px] uppercase tracking-[0.18em] text-[#ffffffb3]">
              {locale === "en" ? "Sound · Light · Events" : "Lyd · Lys · Event"}
            </span>
          </div>
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#9db8ff]">
              {s.nr} {t.nr || "—"}
            </p>
            <h1 className="mt-3 max-w-[16ch] text-[clamp(28px,6.2vw,54px)] font-bold leading-[1.04] tracking-[-0.02em]">
              {t.titel || (locale === "en" ? "Sound and light for your event" : "Lyd og lys til jeres arrangement")}
            </h1>
            <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-4 border-t border-[#ffffff33] pt-5 text-[13px] sm:grid-cols-3">
              {modtager && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#ffffff80]">{s.til}</p>
                  <p className="mt-1 font-semibold">{modtager}</p>
                </div>
              )}
              {t.fra && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#ffffff80]">{s.dato}</p>
                  <p className="mt-1 font-semibold">{periodeTekst(t, locale)}</p>
                </div>
              )}
              {t.sted && (
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#ffffff80]">{s.sted}</p>
                  <p className="mt-1 font-semibold">{t.sted}</p>
                </div>
              )}
            </div>
            <p className="mt-6 text-[11px] text-[#ffffff80]">
              {s.udarbejdet} {dagTekst((t.opdateret || new Date().toISOString()).slice(0, 10), locale)}
              {t.oprettetAf ? ` ${s.af} ${t.oprettetAf}` : ""}
            </p>
          </div>
        </div>
      </section>

      {/* ── Side 2: brevet og udstyret ── */}
      <section className="tilbud-side flex aspect-[210/297] flex-col rounded-sm bg-white p-[6%] shadow-[0_20px_60px_-20px_rgba(10,12,30,0.35)] print:rounded-none print:shadow-none">
        <Sidehoved t={t} side={2} locale={locale} />

        {(udloebet || t.status === "booket") && (
          <p className={`mt-6 rounded-lg px-4 py-3 text-sm font-medium ${t.status === "booket" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
            {t.status === "booket" ? s.booket : s.udloebet}
          </p>
        )}

        <div className="mt-8 grid gap-8 sm:grid-cols-[1.35fr_1fr]">
          <p className="whitespace-pre-line text-[14.5px] leading-[1.7] text-[#2a2d38]">{intro}</p>
          {fakta.length > 0 && (
            <dl className="grid content-start gap-px self-start overflow-hidden rounded-xl bg-[#e7e8ee] text-[13px]">
              {fakta.map(([k, v]) => (
                <div key={k} className="bg-[#f7f8fb] px-4 py-3">
                  <dt className="text-[10px] uppercase tracking-[0.16em] text-[#7a7f8c]">{k}</dt>
                  <dd className="mt-0.5 font-semibold text-[#11131a]">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1249cf]">{s.udstyr}</h2>
        <div className="mt-3 border-t-2 border-[#11131a]">
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-[#e7e8ee] py-2 text-[10px] uppercase tracking-[0.14em] text-[#7a7f8c] sm:grid-cols-[1fr_70px_90px_100px]">
            <span>{s.vare}</span>
            <span className="text-right">{s.antal}</span>
            <span className="hidden text-right sm:block">{s.stkPris}</span>
            <span className="text-right">{s.beloeb}</span>
          </div>
          {sum.linjer.length === 0 && <p className="py-8 text-center text-sm text-[#9aa0ad]">{s.tomt}</p>}
          {sum.linjer.map((l) => {
            const v = l.vare;
            const enhed = v?.enhed === "timer" ? (l.antal === 1 ? s.time : s.timer) : s.stk;
            return (
              <div
                key={l.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 border-b border-[#eef0f4] py-3 sm:grid-cols-[1fr_70px_90px_100px]"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f4f5f8]">
                    {v?.billede ? (
                      <img src={v.billede} srcSet={thumbSrcSet(v.billede)} sizes={THUMB_IMAGE_SIZES} alt="" className="h-full w-full object-contain p-1" loading="lazy" />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9aa0ad" strokeWidth="1.8" aria-hidden="true">
                        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold">{v?.navn ?? s.udgaaet}</p>
                    {v?.beskrivelse && <p className="line-clamp-1 text-[12px] text-[#7a7f8c]">{v.beskrivelse}</p>}
                  </div>
                </div>
                <span className="whitespace-nowrap text-right text-[13px] tabular-nums text-[#2a2d38]">
                  {l.antal} {enhed}
                </span>
                <span className="hidden whitespace-nowrap text-right text-[13px] tabular-nums text-[#7a7f8c] sm:block">{v ? kr(v.pris, locale) : "—"}</span>
                <span className="whitespace-nowrap text-right text-[14px] font-semibold tabular-nums">{kr(l.beloeb, locale)}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <dl className="w-full max-w-[320px] space-y-1.5 text-[13px]">
            {sum.rabatBeloeb > 0 && (
              <>
                <div className="flex justify-between text-[#4a4f5c]">
                  <dt>{s.subtotal}</dt>
                  <dd className="tabular-nums">{kr(sum.subtotal, locale)}</dd>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <dt>
                    {s.rabat} ({t.rabat?.pct} %)
                  </dt>
                  <dd className="tabular-nums">−{kr(sum.rabatBeloeb, locale)}</dd>
                </div>
              </>
            )}
            <div className="flex items-baseline justify-between border-t-2 border-[#11131a] pt-3">
              <dt className="text-[12px] font-semibold uppercase tracking-[0.12em]">{s.total}</dt>
              <dd className="text-[26px] font-bold tabular-nums tracking-tight">{kr(sum.total, locale)}</dd>
            </div>
            <div className="flex justify-between text-[12px] text-[#7a7f8c]">
              <dt>{s.moms}</dt>
              <dd className="tabular-nums">{kr(sum.moms, locale)}</dd>
            </div>
          </dl>
        </div>
        <p className="mt-auto pt-10 text-[11px] text-[#9aa0ad]">{s.prisNote}</p>
      </section>

      {/* ── Side 3: inspiration og booking ── */}
      <section className="tilbud-side flex aspect-[210/297] flex-col rounded-sm bg-white p-[6%] shadow-[0_20px_60px_-20px_rgba(10,12,30,0.35)] print:rounded-none print:shadow-none">
        <Sidehoved t={t} side={3} locale={locale} />

        <h2 className="mt-8 text-[26px] font-bold tracking-[-0.01em]">{s.inspiration}</h2>
        <p className="mt-1 text-[13px] text-[#7a7f8c]">{harAi ? s.inspirationAi : s.inspirationTekst}</p>
        <BilledGitter billeder={inspiration} etiket={s.illustration} />

        <h2 className="mt-10 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1249cf]">{s.forloeb}</h2>
        <ol className="mt-4 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
          {s.trin.map(([titel, tekst], i) => (
            <li key={titel}>
              <span className="text-[28px] font-bold leading-none text-[#d5dcf0] tabular-nums">0{i + 1}</span>
              <p className="mt-2 text-[13.5px] font-semibold">{titel}</p>
              <p className="mt-1 text-[12px] leading-[1.55] text-[#6b7080]">{tekst}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid items-center gap-6 rounded-2xl bg-[#0c0b12] p-6 text-[#fff] sm:grid-cols-[auto_1fr] sm:p-7">
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-xl bg-white p-1.5">
              <QrKode value={bookUrl} size={132} label={s.scan} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#ffffff80]">{s.scan}</span>
          </div>
          <div>
            <p className="text-[22px] font-bold leading-tight">{s.bookTitel}</p>
            <p className="mt-2 text-[13px] leading-[1.6] text-[#ffffffa6]">{s.bookTekst}</p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <a
                href={forhaandsvisning ? undefined : tilbudBookSti(t.id, locale)}
                aria-disabled={forhaandsvisning || udloebet || t.status === "booket"}
                className={`inline-flex items-center gap-2 rounded-full bg-[#1249cf] px-6 py-3 text-[14px] font-bold text-[#fff] transition hover:bg-[#225cdb] print:hidden ${
                  udloebet || t.status === "booket" ? "pointer-events-none opacity-40" : ""
                }`}
              >
                {s.bookKnap} · {kr(sum.total, locale)}
                <span aria-hidden="true">→</span>
              </a>
              <span className="hidden text-[12px] text-[#ffffff99] print:inline">{bookUrl.replace(/^https:\/\//, "")}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto grid gap-6 border-t border-[#e7e8ee] pt-6 text-[12px] text-[#6b7080] sm:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#9aa0ad]">{s.kontakt}</p>
            <p className="mt-1 text-[14px] font-semibold text-[#11131a]">{t.oprettetAf || "Lejhøjtaler.dk"}</p>
            <p className="mt-0.5">
              <a href={kontakt.telefonHref} className="hover:text-[#1249cf]">{kontakt.telefon}</a> ·{" "}
              <a href={`mailto:${kontakt.email}`} className="hover:text-[#1249cf]">{kontakt.email}</a>
            </p>
          </div>
          <div className="sm:text-right">
            <p>{kontakt.firma} · CVR {kontakt.cvr}</p>
            <p>{kontakt.adresse}</p>
            <p className="mt-1">
              <a href={locale === "en" ? "/en/lejevilkaar" : "/lejevilkaar"} className="underline underline-offset-2 hover:text-[#1249cf]">{s.vilkaar}</a>
              {" · "}
              {s.gyldig} {dagTekst(t.gyldigTil, locale)}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
