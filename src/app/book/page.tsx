"use client";

import { useEffect } from "react";
import { bookHref } from "@/lib/bookUrl";

/** /book er alias — send til forsiden med kurv-drawer. */
export default function BookPage() {
  useEffect(() => {
    const product = new URLSearchParams(window.location.search).get("product");
    window.location.replace(bookHref(product, "da"));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#07060b] text-white/50">
      Åbner booking…
    </main>
  );
}
