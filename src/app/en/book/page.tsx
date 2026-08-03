"use client";

import { useEffect } from "react";
import { bookHref } from "@/lib/bookUrl";

/** /en/book er alias — send til /en med kurv-drawer. */
export default function BookPageEn() {
  useEffect(() => {
    const product = new URLSearchParams(window.location.search).get("product");
    window.location.replace(bookHref(product, "en"));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07060b] text-white/50">
      Opening booking…
    </main>
  );
}
