"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_CATEGORIES } from "@/lib/products";
import PhoneLink from "@/components/PhoneLink";
import { danskSti, hasEnglish, localizedHref } from "@/lib/enPages";

/**
 * Menuens faste tekster.
 *
 * Menuen var hårdkodet på dansk og lå i root-layoutet, så den fulgte med på
 * hver eneste /en-side: 26 danske links på en engelsk side. Sproget udledes af
 * stien som i SiteHeader — menuen er ét træ, der renderes begge steder, og et
 * prop kunne ikke nå den gennem layoutet.
 */
const COPY = {
  da: {
    open: "Åben menu",
    close: "Luk menu",
    proTitle: "Større arrangement?",
    proText: "Firmafest, bryllup eller event — skriv til os, så får I et samlet tilbud.",
    proCta: "Send forespørgsel →",
    contact: "Kontakt",
    about: "Om os",
    blog: "Blog",
    terms: "Lejevilkår",
    otherLang: "English",
    book: "Book nu",
    call: "Ring",
  },
  en: {
    open: "Open menu",
    close: "Close menu",
    proTitle: "A larger event?",
    proText: "Company party, wedding or event — write to us and we will put together one quote.",
    proCta: "Send an enquiry →",
    contact: "Contact",
    about: "About us",
    blog: "Blog",
    terms: "Rental terms",
    otherLang: "Dansk",
    book: "Book now",
    call: "Call",
  },
} as const;

export default function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const locale = pathname?.startsWith("/en") ? "en" : "da";
  const c = COPY[locale];
  /**
   * Sprogskifteren bliver på den side, man står på.
   *
   * Før pegede den altid på /en, så en engelsk kunde på /en/festlys blev sendt
   * til forsiden i stedet for til /festlys — og vejen tilbage til dansk fandtes
   * slet ikke.
   *
   * Findes parret ikke, går knappen til den anden udgaves FORSIDE — begge veje.
   * Ikke gennem localizedHref: den falder tilbage til den danske sti, og så ville
   * "English" på /mixer pege på /mixer, et link til den side man står på. Og
   * ikke blindt til danskSti() den anden vej: /en/blog/<slug> har ikke en dansk
   * side på samme sti, fordi blogindlæggenes slug bærer sit eget sprogs søgeord.
   */
  const daSti = danskSti(pathname ?? "/");
  const andetSprog = !hasEnglish(daSti)
    ? locale === "en"
      ? "/"
      : "/en"
    : locale === "en"
      ? daSti
      : localizedHref(daSti, "en");
  const nav = (sti: string) => localizedHref(sti, locale);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Burger button - fixed top right, below TopBar */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-12 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 backdrop-blur-md border border-white/10 transition hover:bg-black/80"
        aria-label={open ? c.close : c.open}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Menu panel */}
      <nav
        className={`fixed top-0 right-0 z-40 h-full w-80 max-w-[85vw] transform bg-[#0d0d14]/95 backdrop-blur-xl border-l border-white/5 transition-transform duration-300 ease-out overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="px-6 pt-20 pb-8">
          {/* Home link */}
          <Link
            href={locale === "en" ? "/en" : "/"}
            onClick={() => setOpen(false)}
            className="mb-6 block text-lg font-bold text-brand-400 transition hover:text-brand-300"
          >
            Lejhøjtaler.dk
          </Link>

          {/* Pro-request øverst: firmafest, bryllup og større events skal kunne
              komme direkte til os uden at gå gennem det almindelige bookingflow */}
          <Link
            href={`${nav("/kontakt")}?emne=erhverv`}
            onClick={() => setOpen(false)}
            className="mb-7 block rounded-2xl border border-brand-500/30 bg-brand-500/[0.07] p-4 transition hover:border-brand-500/60 hover:bg-brand-500/[0.12]"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-brand-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
                <path d="M4 4h16v12H5.17L4 17.17V4z" />
              </svg>
              {c.proTitle}
            </span>
            <span className="mt-1 block text-sm text-white/55">{c.proText}</span>
            <span className="mt-2 inline-block text-xs font-semibold text-white/70">{c.proCta}</span>
          </Link>

          {NAV_CATEGORIES.map((section) => (
            <div key={section.id} className="mb-6">
              <Link
                href={nav(section.href)}
                onClick={() => setOpen(false)}
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-white/30 transition hover:text-brand-400"
              >
                {locale === "en" ? section.title_en : section.title}
              </Link>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={nav(link.href)}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
                    >
                      {locale === "en" ? link.label_en : link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Bottom links */}
          <div className="mt-8 border-t border-white/5 pt-6 space-y-1">
            <Link href={nav("/kontakt")} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
              {c.contact}
            </Link>
            <Link href={nav("/om")} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
              {c.about}
            </Link>
            <Link href={nav("/blog")} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
              {c.blog}
            </Link>
            <Link href={nav("/lejevilkaar")} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
              {c.terms}
            </Link>
            <Link href={andetSprog} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2 text-sm text-white/50 transition hover:bg-white/5 hover:text-white">
              {c.otherLang}
            </Link>
          </div>

          {/* CTA */}
          <a
            href={locale === "en" ? "/en#book" : "/#book"}
            onClick={() => setOpen(false)}
            className="mt-8 block rounded-full bg-brand-500 px-6 py-3 text-center font-semibold text-black transition hover:bg-brand-400"
          >
            {c.book}
          </a>

          {/* Phone */}
          <PhoneLink
            className="mt-4 block text-center text-sm text-white/40 transition hover:text-brand-400"
            prefix={c.call}
          />
        </div>
      </nav>
    </>
  );
}
