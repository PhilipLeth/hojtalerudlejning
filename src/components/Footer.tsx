"use client";

import { useState } from "react";
import Link from "next/link";
import { type Locale } from "@/lib/i18n";
import PhoneLink from "@/components/PhoneLink";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { CompanyBlock, CompanyEmail, CompanyEmailLink } from "@/components/CompanyInfo";
import { formatDateLine, formatOneLine, openDays, otherLine, upcomingExceptions } from "@/lib/openingHours";
import { socialEntries } from "@/lib/socials";
import { localizedHref } from "@/lib/enPages";

/**
 * Åbningstiderne i footeren. Tiderne kommer fra /admin/indstillinger, så de kan
 * rettes uden deploy, fx når julen ligger skævt.
 */
function OpeningHoursLine({ locale }: { locale: Locale }) {
  const { hours } = useSiteSettings();
  const iDag = new Date().toISOString().slice(0, 10);
  // Kun de kommende, en særlig åbning i marts hjælper ingen i august
  const særlige = upcomingExceptions(hours, iDag, 60);
  if (openDays(hours).length === 0 && særlige.length === 0) return null;

  return (
    <>
      {openDays(hours).length > 0 && (
        <p className="mt-3 text-white/50">
          <span className="font-medium text-white/70">
            {locale === "da" ? "Åbningstider" : "Opening hours"}:
          </span>{" "}
          {formatOneLine(hours, locale)}
        </p>
      )}
      {særlige.map((e) => (
        <p key={e.date} className="mt-1 text-brand-400">
          {formatDateLine(hours, e.date, locale)}
          {e.note ? ` · ${e.note}` : ""}
        </p>
      ))}
      {otherLine(hours, locale) && (
        <p className="mt-1 text-xs text-white/30">{otherLine(hours, locale)}</p>
      )}
    </>
  );
}

/**
 * Sociale profiler, sat i /admin/indstillinger, vises kun når de findes.
 * Samme links står som sameAs i LocalBusiness-markup'en, så Google kan koble
 * profilerne og sitet sammen.
 */
function SocialLine() {
  const { socials } = useSiteSettings();
  const links = socialEntries(socials);
  if (links.length === 0) return null;
  return (
    <p className="mt-3 space-x-3">
      {links.map((l) => (
        <a
          key={l.id}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-white/50 underline-offset-4 transition hover:text-brand-400 hover:underline"
        >
          {l.label}
        </a>
      ))}
    </p>
  );
}

function NewsletterForm({ locale }: { locale: Locale }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  const label = locale === "da" ? "Få tilbud og nyheder" : "Get deals and news";
  const placeholder = locale === "da" ? "Din email" : "Your email";
  const btnText = locale === "da" ? "Tilmeld" : "Subscribe";
  const doneText = locale === "da" ? "Tak! Du er tilmeldt." : "Thanks! You're subscribed.";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setStatus("done");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return <p className="text-brand-400 text-sm mt-4">{doneText}</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex gap-2 justify-center max-w-xs mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="flex-1 rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-brand-400/50"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-black hover:bg-brand-400 transition disabled:opacity-50"
      >
        {status === "loading" ? "..." : btnText}
      </button>
    </form>
  );
}

/* ───── Footerens spalter ─────
 *
 * Footeren var én lang midterstillet kolonne: firma, tider, telefon, seks
 * links, og nederst tre "forældreløse" landingssider, der ikke måtte forsvinde.
 * Den kunne ikke læses, og den var sitets eneste sted med plads til de
 * indgange, menuen bevidst ikke har (menuen er en vej ind, ikke et katalog).
 *
 * Nu står den i fire spalter med data: hvem vi er, hvad vi har, hvad du skal
 * holde, og det praktiske. Det giver samtidig hver eneste side et internt link
 * til alle kategorisider — /festlyd, /lydudstyr og /kobenhavn er
 * annoncelandingssider, som ellers blev crawlet som blindgyder.
 */

interface FooterLink {
  href: string;
  da: string;
  en: string;
}

interface FooterColumn {
  da: string;
  en: string;
  links: FooterLink[];
}

/** Katalogets indgange. localizedHref beholder den danske sti, hvis siden ikke findes på engelsk. */
const SPALTER: FooterColumn[] = [
  {
    da: "Lyd, lys & AV",
    en: "Sound, light & AV",
    links: [
      { href: "/lej-hojtaler", da: "Højtalere og pakker", en: "Speakers and packages" },
      { href: "/lydanlaeg", da: "Anlæg efter antal gæster", en: "Systems by guest count" },
      { href: "/festlys", da: "Festlys og effekter", en: "Party lights and effects" },
      { href: "/roeg", da: "Røg og low fog", en: "Fog and low fog" },
      { href: "/lej-mikrofon", da: "Mikrofoner", en: "Microphones" },
      { href: "/dj-pult", da: "DJ-pulte", en: "DJ booths" },
      { href: "/av-udstyr", da: "Skærme og karaoke", en: "Screens and karaoke" },
    ],
  },
  {
    da: "Til din anledning",
    en: "For your occasion",
    links: [
      { href: "/bryllup", da: "Bryllup", en: "Weddings" },
      { href: "/firmafestpakke", da: "Firmafest", en: "Company parties" },
      { href: "/foedselsdag", da: "Fødselsdag", en: "Birthdays" },
      { href: "/konfirmation", da: "Konfirmation", en: "Confirmations" },
      { href: "/havefest", da: "Havefest", en: "Garden parties" },
      { href: "/julefrokost", da: "Julefrokost", en: "Christmas lunches" },
      { href: "/nytaar", da: "Nytår", en: "New Year" },
      { href: "/eventloesninger", da: "Alle anledninger", en: "All occasions" },
    ],
  },
  {
    da: "Praktisk",
    en: "Practical",
    links: [
      { href: "/priser", da: "Priser", en: "Prices" },
      { href: "/levering", da: "Levering og afhentning", en: "Delivery and collection" },
      { href: "/lejevilkaar", da: "Lejevilkår", en: "Rental terms" },
      { href: "/kontakt", da: "Kontakt", en: "Contact" },
      { href: "/om", da: "Om os", en: "About us" },
      { href: "/blog", da: "Guides og blog", en: "Guides and blog" },
      { href: "/privatlivspolitik", da: "Privatlivspolitik", en: "Privacy policy" },
    ],
  },
];

/**
 * Sider, der kun findes på ét sprog, og som ingen menu linker til.
 *
 * De danske er annoncelandingssider; de engelske er kategorisider, som skal
 * kunne findes på "party light rental copenhagen" og lignende. Uden et link
 * herfra står de uden intern linkværdi — se generate-sitemap.py's advarsel om
 * forældreløse sider.
 */
const EKSTRA_DA: FooterLink[] = [
  { href: "/festlyd", da: "Lyd til fest", en: "Sound for parties" },
  { href: "/lydudstyr", da: "PA-anlæg og lydudstyr", en: "PA systems" },
  { href: "/kobenhavn", da: "Højtalerudlejning i København", en: "Speaker rental Copenhagen" },
  { href: "/cases", da: "Opstillinger vi har sat", en: "Setups we have run" },
];

const EKSTRA_EN: FooterLink[] = [
  { href: "/en/festlys", da: "Festlys", en: "Party light rental" },
  { href: "/en/lysshow", da: "Lysshow", en: "Light show packages" },
  { href: "/en/lej-mikrofon", da: "Mikrofoner", en: "Microphone rental" },
  { href: "/en/lyspakker", da: "Lysbarer", en: "Light bars" },
  { href: "/en/cases", da: "Opstillinger", en: "Setups we have run" },
];

function Spalte({ column, locale }: { column: FooterColumn; locale: Locale }) {
  return (
    <div>
      <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/70">
        {locale === "en" ? column.en : column.da}
      </h3>
      <ul className="space-y-2">
        {column.links.map((l) => (
          <li key={l.href}>
            <Link
              href={localizedHref(l.href, locale)}
              className="text-white/45 transition hover:text-brand-400"
            >
              {locale === "en" ? l.en : l.da}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer({ locale = "da" }: { locale?: Locale }) {
  const en = locale === "en";
  const newsletterLabel = en ? "Get deals and news" : "Få tilbud og nyheder";
  const ekstra = en ? EKSTRA_EN : EKSTRA_DA;

  return (
    <footer className="relative z-20 border-t border-white/5 bg-[#07060b] px-4 py-14 text-sm text-white/40">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
        {/* Spalte 1: hvem vi er og hvordan man får fat i os */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/70">
            {en ? "Lejhøjtaler.dk" : "Lejhøjtaler.dk"}
          </h3>
          <CompanyBlock />
          <p className="mt-3 flex flex-col gap-1.5">
            <PhoneLink
              className="inline-flex items-center gap-1.5 font-semibold text-brand-400 transition hover:text-brand-300"
              prefix={en ? "Call" : "Ring"}
            />
            <CompanyEmailLink className="inline-flex items-center gap-1.5 font-semibold text-brand-400 transition hover:text-brand-300">
              <>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-10 6L2 7" />
                </svg>
                <CompanyEmail />
              </>
            </CompanyEmailLink>
          </p>
          <div className="mt-3 text-white/45">
            <OpeningHoursLine locale={locale} />
          </div>
          <SocialLine />
        </div>

        {SPALTER.map((c) => (
          <Spalte key={c.da} column={c} locale={locale} />
        ))}
      </div>

      {/*
        Sider uden en plads i menuen, som bevidst er en vej ind og ikke et
        katalog. De danske er annoncelandingssider, de engelske er
        kategorisider — begge stod uden ét eneste indgående link og blev
        crawlet som blindgyder.
      */}
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/5 pt-6">
        <p className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/30">
          {ekstra.map((l) => (
            <Link key={l.href} href={l.href} className="transition hover:text-brand-400">
              {en ? l.en : l.da}
            </Link>
          ))}
        </p>
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-6 border-t border-white/5 pt-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="sm:max-w-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-white/70">{newsletterLabel}</p>
          <NewsletterForm locale={locale} />
        </div>
        <p className="text-xs text-white/30">&copy; {new Date().getFullYear()} Lejhøjtaler.dk</p>
      </div>
    </footer>
  );
}
