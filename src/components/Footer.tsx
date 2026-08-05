"use client";

import { useState } from "react";
import Link from "next/link";
import { type Locale, t } from "@/lib/i18n";

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
      <p className="font-medium text-white/50">Scharling Studio</p>
      <p className="mt-1">Halvtolv 9, 1. th &middot; 1436 København K</p>
      <p className="mt-1">CVR 40994904</p>
      <p className="mt-3">
        <a href="tel:+4531132852" className="inline-flex items-center gap-1.5 font-semibold text-brand-400 hover:text-brand-300 transition">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="shrink-0">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {locale === "da" ? "Ring" : "Call"} 31 13 28 52
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
      <p className="mt-5 text-white/40 text-xs">{newsletterLabel}</p>
      <NewsletterForm locale={locale} />
      <p className="mt-6">&copy; {new Date().getFullYear()} Lejhøjtaler.dk</p>
    </footer>
  );
}
