"use client";

import { useEffect } from "react";
import { bookHref } from "@/lib/bookUrl";

/**
 * Legacy-komponent. Checkout er en fuld side på /book, ikke en drawer.
 * BookingDrawer i layoutet sender #book og /?product= derhen.
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
