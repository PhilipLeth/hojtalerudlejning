"use client";

import { useState } from "react";
import Link from "next/link";
import { type Locale, t } from "@/lib/i18n";
import PhoneLink from "@/components/PhoneLink";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { CompanyBlock, CompanyEmail, CompanyEmailLink } from "@/components/CompanyInfo";
import { formatDateLine, formatOneLine, openDays, otherLine, upcomingExceptions } from "@/lib/openingHours";
import { socialEntries } from "@/lib/socials";

/**
 * Åbningstiderne i footeren. Tiderne kommer fra /admin/indstillinger, så de kan
 * rettes uden deploy — fx når julen ligger skævt.
 */
function OpeningHoursLine({ locale }: { locale: Locale }) {
  const { hours } = useSiteSettings();
  const iDag = new Date().toISOString().slice(0, 10);
  // Kun de kommende — en særlig åbning i marts hjælper ingen i august
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
 * Sociale profiler — sat i /admin/indstillinger, vises kun når de findes.
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

export default function Footer({ locale = "da" }: { locale?: Locale }) {
  const s = t[locale].footer;
  const newsletterLabel = locale === "da" ? "Få tilbud og nyheder" : "Get deals and news";
  return (
    <footer className="relative z-20 border-t border-white/5 bg-[#07060b] px-4 py-12 text-center text-sm text-white/30">
      <CompanyBlock />
      <OpeningHoursLine locale={locale} />
      <SocialLine />
      <p className="mt-3">
        <PhoneLink
          className="inline-flex items-center gap-1.5 font-semibold text-brand-400 hover:text-brand-300 transition"
          prefix={locale === "da" ? "Ring" : "Call"}
        />
        {" · "}
        <CompanyEmailLink className="inline-flex items-center gap-1.5 font-semibold text-brand-400 hover:text-brand-300 transition">
          <>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 6L2 7" />
            </svg>
            <CompanyEmail />
          </>
        </CompanyEmailLink>
        {" · "}
        <a href="/kontakt" className="font-semibold text-brand-400 hover:text-brand-300 transition">
          {locale === "da" ? "Kontakt" : "Contact"}
        </a>
      </p>
      <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <Link href={s.aboutHref} className="text-white/40 hover:text-brand-400 transition underline underline-offset-2">
          {s.about}
        </Link>
        <Link href={s.blogHref} className="text-white/40 hover:text-brand-400 transition underline underline-offset-2">
          {s.blog}
        </Link>
        <Link href={s.termsHref} className="text-white/40 hover:text-brand-400 transition underline underline-offset-2">
          {s.terms}
        </Link>
        <Link href={s.privacyHref} className="text-white/40 hover:text-brand-400 transition underline underline-offset-2">
          {s.privacy}
        </Link>
      </p>
      {/*
        Indgange der ellers står forældreløse. /festlyd, /lydudstyr og
        /kobenhavn er landingssider for Google Ads, men ingen side på sitet
        linkede til dem — de blev crawlet som blindgyder uden intern linkværdi.
        De hører ikke hjemme i menuen, som bevidst er en vej ind og ikke et
        katalog; footeren er stedet, hvor de kan stå uden at støje.
        De engelske kategorisider har samme problem: /en/festlys, /en/lysshow og
        /en/lej-mikrofon står uden ét eneste indgående link, fordi menuen og
        forsiden kun kender pakkerne. Listen er ikke en oversættelse af den
        danske — de tre danske annoncelandingssider findes ikke på engelsk, og
        de engelske kategorisider er dem, der skal findes på "party light
        rental copenhagen" og "microphone rental copenhagen". /en/lyspakker kom
        til i samme omgang som /lyspakker og har samme problem.
      */}
      {locale === "da" ? (
        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
          <Link href="/festlyd" className="text-white/30 hover:text-brand-400 transition">
            Lyd til fest
          </Link>
          <Link href="/lydudstyr" className="text-white/30 hover:text-brand-400 transition">
            PA-anlæg &amp; lydudstyr
          </Link>
          <Link href="/kobenhavn" className="text-white/30 hover:text-brand-400 transition">
            Højtalerudlejning i København
          </Link>
        </p>
      ) : (
        <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
          <Link href="/en/festlys" className="text-white/30 hover:text-brand-400 transition">
            Party light rental
          </Link>
          <Link href="/en/lysshow" className="text-white/30 hover:text-brand-400 transition">
            Light show packages
          </Link>
          <Link href="/en/lej-mikrofon" className="text-white/30 hover:text-brand-400 transition">
            Microphone rental
          </Link>
          <Link href="/en/lyspakker" className="text-white/30 hover:text-brand-400 transition">
            Light packages
          </Link>
        </p>
      )}

      <p className="mt-5 text-white/40 text-xs">{newsletterLabel}</p>
      <NewsletterForm locale={locale} />
      <p className="mt-6">&copy; {new Date().getFullYear()} Lejhøjtaler.dk</p>
    </footer>
  );
}
