"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { DELIVERY_ONE_WAY, MAX_RENTAL_DAYS } from "@/lib/productFaq";
import { formaterRating, GOOGLE_PROFIL_URL } from "@/lib/googleReviews";
import { useGoogleReviews } from "@/lib/useGoogleReviews";
import type { Locale } from "@/lib/i18n";

/* Løfterne i båndet — hver med sit eget ikon */
const ICONS = {
  truck: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  calendar: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  ),
  stars: (
    <span className="flex shrink-0 gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5 fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.176 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.063 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
        </svg>
      ))}
    </span>
  ),
  wallet: (
    <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
    </svg>
  ),
} as const;

/**
 * Båndet øverst — løfterne roterer på mobil og står side om side på desktop.
 *
 * Sidste plads er Google-ratingen: fem små stjerner og "5,0 på Google", der
 * linker til profilen. Den kommer fra /api/anmeldelser ligesom sektionen på
 * forsiden, og står der kun når Google har givet os et tal.
 *
 * Teksterne lå kun på dansk, og båndet kommer fra root-layoutet, så en engelsk
 * kunde mødte "Levering i hele København fra 495 kr" som det første på siden.
 * Beløbet er leveringsprisen fra productFaq.ts, ikke et tal skrevet i hånden.
 */
const USPS: Record<
  Locale,
  Array<{ icon: keyof typeof ICONS; text: string; href?: string; ekstern?: boolean }>
> = {
  da: [
    { icon: "truck", text: `Levering i hele København fra ${DELIVERY_ONE_WAY} kr` },
    { icon: "calendar", text: `Op til ${MAX_RENTAL_DAYS} dage, samme pris` },
    { icon: "wallet", text: "Sikker onlinebetaling" },
  ],
  en: [
    { icon: "truck", text: `Delivery across Copenhagen from ${DELIVERY_ONE_WAY} DKK` },
    { icon: "calendar", text: `Up to ${MAX_RENTAL_DAYS} days, same price` },
    { icon: "wallet", text: "Secure online payment" },
  ],
};

export default function TopBar() {
  const pathname = usePathname();
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const isAdmin = pathname?.startsWith("/admin");
  const locale: Locale = pathname?.startsWith("/en") ? "en" : "da";
  // Samme kald som anmeldelsessektionen — hooken deler svaret mellem dem
  const { data } = useGoogleReviews(locale, !isAdmin);

  // Ratingen står kun i båndet, når Google faktisk har givet os en. Vi skriver
  // aldrig fem stjerner, som vi ikke har fået.
  const usps = data.rating
    ? [
        ...USPS[locale],
        {
          icon: "stars" as const,
          text:
            locale === "en"
              ? `${formaterRating(data.rating, locale)} on Google`
              : `${formaterRating(data.rating, locale)} på Google`,
          href: data.url || GOOGLE_PROFIL_URL,
          ekstern: true,
        },
      ]
    : USPS[locale];

  useEffect(() => {
    if (isAdmin) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % usps.length);
        setVisible(true);
      }, 300);
    }, 4000);
    return () => clearInterval(interval);
  }, [isAdmin, usps.length]);

  if (isAdmin) return null;

  const current = usps[index % usps.length];

  return (
    <div className="fixed top-0 left-0 right-0 z-40 bg-brand-500 px-4 py-2 text-sm font-semibold text-black">
      {/* Mobile: rotér én USP ad gangen med tilhørende ikon */}
      <div className="md:hidden">
        <span
          className={`flex items-center justify-center gap-2 transition-all duration-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          }`}
        >
          {ICONS[current.icon]}
          {current.href ? (
            <a
              href={current.href}
              {...(("ekstern" in current && current.ekstern)
                ? { target: "_blank", rel: "noopener noreferrer nofollow" }
                : {})}
              className="underline-offset-2 hover:underline"
            >
              {current.text}
            </a>
          ) : (
            current.text
          )}
        </span>
      </div>

      {/* Desktop: alle løfter side om side */}
      <div className="hidden md:flex items-center justify-center gap-6 lg:gap-10">
        {usps.map((u) =>
          u.href ? (
            <a
              key={u.text}
              href={u.href}
              {...(("ekstern" in u && u.ekstern)
                ? { target: "_blank", rel: "noopener noreferrer nofollow" }
                : {})}
              className="flex items-center gap-2 underline-offset-2 transition hover:underline"
            >
              {ICONS[u.icon]}
              {u.text}
            </a>
          ) : (
            <span key={u.text} className="flex items-center gap-2">
              {ICONS[u.icon]}
              {u.text}
            </span>
          )
        )}
      </div>
    </div>
  );
}
