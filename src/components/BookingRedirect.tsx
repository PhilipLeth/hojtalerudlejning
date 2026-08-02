"use client";

import { useEffect } from "react";

/**
 * Legacy support: old links used /book?product=ID or /#book.
 * Redirect once to the dedicated /book page — works in all browsers.
 */
export default function BookingRedirect({ locale = "da" }: { locale?: "da" | "en" }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const product = params.get("product");
    const wantsBook = window.location.hash === "#book" || !!product;
    if (!wantsBook) return;

    const base = locale === "en" ? "/en/book" : "/book";
    const target = product
      ? `${base}?product=${encodeURIComponent(product)}`
      : base;
    window.location.replace(target);
  }, [locale]);

  return null;
}
