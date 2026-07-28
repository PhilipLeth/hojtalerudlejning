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
      <p className="mt-4 flex items-center justify-center gap-4">
        <Link href={s.aboutHref} className="text-white/40 hover:text-brand-400 transition underline underline-offset-2">
          {s.about}
        </Link>
        <Link href={s.blogHref} className="text-white/40 hover:text-brand-400 transition underline underline-offset-2">
          {s.blog}
        </Link>
        <Link href={s.termsHref} className="text-white/40 hover:text-brand-400 transition underline underline-offset-2">
          {s.terms}
        </Link>
      </p>
      <p className="mt-5 text-white/40 text-xs">{newsletterLabel}</p>
      <NewsletterForm locale={locale} />
      <p className="mt-6">&copy; {new Date().getFullYear()} Lejhøjtaler.dk</p>
    </footer>
  );
}
