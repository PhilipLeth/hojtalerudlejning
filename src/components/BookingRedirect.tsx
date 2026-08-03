"use client";

import { useEffect } from "react";
import { bookHref } from "@/lib/bookUrl";

/**
 * Legacy /book?product=ID → forsiden med drawer (/?product=ID#book).
 * Draweren bor i layout; /book er kun alias for gamle links.
 */
export default function BookingRedirect({ locale = "da" }: { locale?: "da" | "en" }) {
  useEffect(() => {
    const path = window.location.pathname;
    if (path !== "/book" && path !== "/en/book") return;

    const product = new URLSearchParams(window.location.search).get("product");
    window.location.replace(bookHref(product, locale));
  }, [locale]);

  return null;
}
